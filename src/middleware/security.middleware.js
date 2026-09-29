/**
 * Security Middleware: Protects against NoSQL Injection attacks ($gt, $ne, $where)
 * by recursively cleaning keys starting with '$' or '.' from request inputs.
 */
export const mongoSanitizeMiddleware = (req, res, next) => {
  const sanitize = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    const cleanObj = {};
    for (const key of Object.keys(obj)) {
      if (key.startsWith('$') || key.includes('.')) {
        continue; // Strip MongoDB operator injection keys
      }
      cleanObj[key] = sanitize(obj[key]);
    }
    return cleanObj;
  };

  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);

  next();
};

/**
 * Custom Security Headers Middleware
 */
export const customSecurityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
};
