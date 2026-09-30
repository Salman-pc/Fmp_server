import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Meeting } from '../models/Meeting.js';
import { CheckIn } from '../models/CheckIn.js';
import { GameSession } from '../models/GameSession.js';
import { Achievement } from '../models/Achievement.js';
import { logger } from '../utils/logger.js';

const cleanTestData = async () => {
  try {
    await connectDB();
    logger.info('🧹 Cleaning up unwanted test data from database...');

    // 1. Remove demo users (admin@geocircle.com, user@geocircle.com)
    const userResult = await User.deleteMany({
      email: { $in: ['admin@geocircle.com', 'user@geocircle.com'] }
    });
    logger.info(`Deleted ${userResult.deletedCount} demo user accounts.`);

    // 2. Remove test meetings
    const meetingResult = await Meeting.deleteMany({
      $or: [
        { title: /Daily Friend Circle Meetup/i },
        { title: /Test/i },
        { description: /test/i }
      ]
    });
    logger.info(`Deleted ${meetingResult.deletedCount} test meetings.`);

    // 3. Remove test checkins
    const checkinResult = await CheckIn.deleteMany({});
    logger.info(`Cleared ${checkinResult.deletedCount} test check-ins.`);

    // 4. Remove test game sessions & achievements
    const sessionResult = await GameSession.deleteMany({});
    const achievementResult = await Achievement.deleteMany({});
    logger.info(`Cleared ${sessionResult.deletedCount} game sessions and ${achievementResult.deletedCount} achievements.`);

    logger.info('✨ Database cleanup finished successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Database cleanup failed:', error);
    process.exit(1);
  }
};

cleanTestData();
