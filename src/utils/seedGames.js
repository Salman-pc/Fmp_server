import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { Game } from '../models/Game.js';

const initialGames = [
  {
    title: '🎯 Target Blitz',
    description: 'Test your reflexes! Tap fast-appearing targets within 15 seconds to score maximum points.',
    type: 'SINGLEPLAYER',
    maxPlayers: 1,
    enabled: true
  },
  {
    title: '🧠 Friend Trivia Quiz',
    description: 'Answer fun general knowledge & trivia questions against the clock to earn points.',
    type: 'SINGLEPLAYER',
    maxPlayers: 1,
    enabled: true
  },
  {
    title: '🃏 Memory Match',
    description: 'Flip cards and find all matching pairs in the fewest moves possible!',
    type: 'SINGLEPLAYER',
    maxPlayers: 1,
    enabled: true
  },
  {
    title: '🐍 Snake Run',
    description: 'Classic arcade snake! Navigate the grid, eat food dots, grow longer, and avoid walls.',
    type: 'SINGLEPLAYER',
    maxPlayers: 1,
    enabled: true
  },
  {
    title: '🎲 Dice Roller Blitz',
    description: 'Roll dice to score lucky combinations and top the friend group leaderboard!',
    type: 'MULTIPLAYER',
    maxPlayers: 4,
    enabled: true
  }
];

const seed = async () => {
  try {
    const mongoUri = config.mongoUri;
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for Seeding Games');

    for (const g of initialGames) {
      await Game.findOneAndUpdate(
        { title: g.title },
        { $set: g },
        { upsert: true, new: true }
      );
    }

    console.log('✅ 5 Minigames seeded successfully into database!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding Error:', err);
    process.exit(1);
  }
};

seed();
