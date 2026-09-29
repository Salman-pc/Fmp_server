import { config } from '../config/env.js';

export const logger = {
  info: (message, meta = {}) => {
    console.log(`[INFO] [${new Date().toISOString()}] ${message}`, Object.keys(meta).length ? meta : '');
  },
  warn: (message, meta = {}) => {
    console.warn(`[WARN] [${new Date().toISOString()}] ${message}`, Object.keys(meta).length ? meta : '');
  },
  error: (message, error = {}) => {
    console.error(`[ERROR] [${new Date().toISOString()}] ${message}`, error.stack || error);
  },
  debug: (message, meta = {}) => {
    if (config.env === 'development') {
      console.log(`[DEBUG] [${new Date().toISOString()}] ${message}`, Object.keys(meta).length ? meta : '');
    }
  }
};
