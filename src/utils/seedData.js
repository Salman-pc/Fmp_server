import { User } from '../models/User.js';
import { Meeting } from '../models/Meeting.js';
import { Game } from '../models/Game.js';
import { logger } from './logger.js';

export const autoSeedData = async () => {
  try {
    // 1. Seed Default Admin
    let admin = await User.findOne({ email: 'admin@geocircle.com' });
    if (!admin) {
      admin = await User.create({
        name: 'System Administrator',
        email: 'admin@geocircle.com',
        password: 'admin123',
        role: 'ADMIN',
        isActive: true
      });
      logger.info('✅ Default Admin user created: admin@geocircle.com / admin123');
    }

    // 2. Seed Default Member User
    let user = await User.findOne({ email: 'user@geocircle.com' });
    if (!user) {
      user = await User.create({
        name: 'Salman',
        email: 'user@geocircle.com',
        password: 'user123',
        role: 'USER',
        isActive: true
      });
      logger.info('✅ Default Member user created: user@geocircle.com / user123');
    }

    // 3. Seed Default Active Meeting if none exists
    const existingMeeting = await Meeting.findOne({ status: 'ACTIVE' });
    if (!existingMeeting && admin) {
      await Meeting.create({
        title: 'Daily Friend Circle Meetup',
        description: 'Default meetup point for presence verification testing.',
        locationName: 'Lulu Mall, Kochi',
        location: {
          type: 'Point',
          coordinates: [76.3082, 10.0261] // [lon, lat]
        },
        radius: 100,
        checkInEnabled: true,
        scheduleType: 'EVERYDAY',
        isTimeWindowOptional: true,
        timezone: 'Asia/Kolkata',
        status: 'ACTIVE',
        createdBy: admin._id
      });
      logger.info('✅ Default Active Meeting created: Lulu Mall, Kochi');
    }

    // 4. Seed Minigames
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
        description: 'Multiplayer card match! Join a live session with friends and find matching pairs in real-time!',
        type: 'MULTIPLAYER',
        maxPlayers: 4,
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

    for (const g of initialGames) {
      await Game.findOneAndUpdate(
        { title: g.title },
        { $set: g },
        { upsert: true, new: true }
      );
    }
    logger.info('✅ Minigames updated & seeded into database');
  } catch (err) {
    logger.error('Error auto-seeding database:', err);
  }
};
