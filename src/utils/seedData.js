import { User } from '../models/User.js';
import { Meeting } from '../models/Meeting.js';
import { Game } from '../models/Game.js';
import { logger } from './logger.js';
import { config } from '../config/env.js';

export const autoSeedData = async (force = false) => {
  try {
    // 1. Minigames catalog seeding (ensures game hub has game options)
    const gameCount = await Game.countDocuments();
    if (gameCount === 0 || force) {
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
      logger.info('✅ Minigames catalog initialized');
    }

    // 2. Only seed demo users and test meetings if AUTO_SEED=true or force=true
    if (!config.autoSeed && !force) {
      return;
    }

    // Seed Default Admin from Environment Variables
    const adminEmail = config.adminEmail;
    const adminPass = config.adminPass;

    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        name: 'System Administrator',
        email: adminEmail,
        password: adminPass,
        role: 'ADMIN',
        isActive: true
      });
      logger.info(`✅ Default Admin user created: ${adminEmail}`);
    } else {
      admin.password = adminPass;
      await admin.save();
      logger.info(`✅ Default Admin password updated from env configuration`);
    }

    // Seed Default Active Meeting if none exists
    const existingMeeting = await Meeting.findOne({ status: 'ACTIVE' });
    if (!existingMeeting && admin) {
      await Meeting.create({
        title: 'Daily Friend Circle Meetup',
        description: 'Default meetup point for presence verification testing.',
        locationName: 'Lulu Mall, Kochi',
        location: {
          type: 'Point',
          coordinates: [76.3082, 10.0261]
        },
        radius: 100,
        checkInEnabled: true,
        scheduleType: 'EVERYDAY',
        isTimeWindowOptional: true,
        timezone: 'Asia/Kolkata',
        status: 'ACTIVE',
        createdBy: admin._id
      });
      logger.info('✅ Default Active Meeting created');
    }
  } catch (err) {
    logger.error('Error seeding database:', err);
  }
};
