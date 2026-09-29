import * as gameService from '../services/game.service.js';

export const createGame = async (req, res, next) => {
  try {
    const game = await gameService.createGame(req.body, req.user._id);
    res.status(201).json({
      success: true,
      message: 'Game created successfully',
      data: { game }
    });
  } catch (error) {
    next(error);
  }
};

export const getGames = async (req, res, next) => {
  try {
    const games = await gameService.getAllGames();
    res.status(200).json({
      success: true,
      data: {
        enabled: gameService.isGameModuleEnabled(),
        games
      }
    });
  } catch (error) {
    next(error);
  }
};

export const joinGameSession = async (req, res, next) => {
  try {
    const session = await gameService.joinGameSession(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      message: 'Joined game session',
      data: { session }
    });
  } catch (error) {
    next(error);
  }
};

export const submitScore = async (req, res, next) => {
  try {
    const { sessionId, points } = req.body;
    const session = await gameService.submitGameScore(sessionId, req.user._id, points);
    res.status(200).json({
      success: true,
      message: 'Score recorded',
      data: { session }
    });
  } catch (error) {
    next(error);
  }
};

export const getLeaderboard = async (req, res, next) => {
  try {
    const leaderboard = await gameService.getLeaderboard();
    res.status(200).json({
      success: true,
      data: { leaderboard }
    });
  } catch (error) {
    next(error);
  }
};
