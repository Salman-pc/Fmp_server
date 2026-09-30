import rateLimit from 'express-rate-limit';

export const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per 15 minutes
  message: {
    success: false,
    message: 'Too many requests from this IP address, please try again later.',
    code: 'GLOBAL_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Disabled rate limiting for auth per user request
export const authLimiter = (req, res, next) => next();

export const checkInLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 check-in attempts per minute
  message: {
    success: false,
    message: 'Too many check-in requests. Please wait a moment before trying again.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});
