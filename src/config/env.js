import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/geocircle',
  jwtSecret: process.env.JWT_SECRET || 'supersecret_jwt_key_geocircle_change_in_production_12345',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  defaultTimezone: process.env.DEFAULT_TIMEZONE || 'Asia/Kolkata',
  maxAllowedAccuracy: parseFloat(process.env.MAX_ALLOWED_ACCURACY || '500'),
  gamesModuleEnabled: process.env.GAMES_MODULE_ENABLED !== 'false'
};
