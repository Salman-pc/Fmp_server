export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params
    });
    req.body = parsed.body || req.body;
    req.query = parsed.query || req.query;
    req.params = parsed.params || req.params;
    next();
  } catch (error) {
    if (error.errors) {
      const issueMessages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join('; ');
      return res.status(400).json({
        success: false,
        message: `Validation failed: ${issueMessages}`,
        code: 'VALIDATION_ERROR',
        details: error.errors
      });
    }
    next(error);
  }
};
