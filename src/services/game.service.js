import { Game } from '../models/Game.js';
import { GameSession } from '../models/GameSession.js';
import { Achievement } from '../models/Achievement.js';
import { User } from '../models/User.js';
import { config } from '../config/env.js';

export const isGameModuleEnabled = () => {
  return config.gamesModuleEnabled;
};

export const createGame = async (gameData, creatorId) => {
  if (!isGameModuleEnabled()) {
    const error = new Error('Games module is currently disabled by administrator.');
    error.statusCode = 400;
    throw error;
  }
  return await Game.create({ ...gameData, createdBy: creatorId });
};

export const getAllGames = async () => {
  return await Game.find({ enabled: true }).sort({ createdAt: -1 }).lean();
};

export const joinGameSession = async (gameId, userId) => {
  if (!isGameModuleEnabled()) {
    const error = new Error('Games module is currently disabled.');
    error.statusCode = 400;
    throw error;
  }

  const game = await Game.findById(gameId);
  if (!game || !game.enabled) {
    const error = new Error('Game is unavailable.');
    error.statusCode = 404;
    throw error;
  }

  let session = await GameSession.findOne({ game: gameId, status: 'WAITING' });
  if (!session) {
    session = await GameSession.create({
      game: gameId,
      players: [{ user: userId, score: 0 }],
      status: 'WAITING',
      startedAt: new Date()
    });
  } else {
    const isPlayerInSession = session.players.some((p) => p.user.toString() === userId.toString());
    if (!isPlayerInSession) {
      if (session.players.length >= game.maxPlayers) {
        // Start full session & create a new waiting session
        session.status = 'IN_PROGRESS';
        await session.save();
        session = await GameSession.create({
          game: gameId,
          players: [{ user: userId, score: 0 }],
          status: 'WAITING',
          startedAt: new Date()
        });
      } else {
        session.players.push({ user: userId, score: 0 });
        if (session.players.length === game.maxPlayers) {
          session.status = 'IN_PROGRESS';
        }
        await session.save();
      }
    }
  }

  return session;
};

export const submitGameScore = async (sessionId, userId, points) => {
  if (!isGameModuleEnabled()) {
    const error = new Error('Games module is currently disabled.');
    error.statusCode = 400;
    throw error;
  }

  const session = await GameSession.findById(sessionId);
  if (!session) {
    const error = new Error('Game session not found.');
    error.statusCode = 404;
    throw error;
  }

  const player = session.players.find((p) => p.user.toString() === userId.toString());
  if (!player) {
    const error = new Error('Player is not in this game session.');
    error.statusCode = 400;
    throw error;
  }

  player.score += Math.max(0, points);
  await session.save();
  return session;
};

export const getLeaderboard = async () => {
  if (!isGameModuleEnabled()) {
    return [];
  }

  const pipeline = [
    { $unwind: '$players' },
    {
      $group: {
        _id: '$players.user',
        totalPoints: { $sum: '$players.score' },
        gamesPlayed: { $sum: 1 }
      }
    },
    { $sort: { totalPoints: -1 } },
    { $limit: 20 }
  ];

  const results = await GameSession.aggregate(pipeline);
  const populated = await Promise.all(
    results.map(async (res) => {
      const user = await User.findById(res._id).select('name email avatar').lean();
      return {
        user,
        totalPoints: res.totalPoints,
        gamesPlayed: res.gamesPlayed
      };
    })
  );

  return populated.filter((item) => item.user);
};
