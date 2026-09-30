import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { autoSeedData } from '../utils/seedData.js';
import { logger } from '../utils/logger.js';

const runSeed = async () => {
  try {
    await connectDB();
    logger.info('Seeding database with default demo accounts and initial meetings...');
    await autoSeedData(true);
    logger.info('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('Database seeding failed:', error);
    process.exit(1);
  }
};

runSeed();
