import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/geocircle',
  jwtSecret: process.env.JWT_SECRET || 'supersecret_jwt_key_geocircle_change_in_production_12345',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'supersecret_refresh_token_key_geocircle_change_in_production_67890',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  defaultTimezone: process.env.DEFAULT_TIMEZONE || 'Asia/Kolkata',
  maxAllowedAccuracy: parseFloat(process.env.MAX_ALLOWED_ACCURACY || '200000'),
  gamesModuleEnabled: process.env.GAMES_MODULE_ENABLED !== 'false',
  autoSeed: process.env.AUTO_SEED === 'true',
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  smtpFrom: process.env.SMTP_FROM || 'GeoCircle <noreply@geocircle.com>',
  adminEmail: process.env.DEFAULT_ADMIN_EMAIL || 'admin@geocircle.com',
  adminPass: process.env.DEFAULT_ADMIN_PASSWORD || 'admin@123'
};
