const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Validation errors
  if (err.status === 400) {
    return res.status(400).json({
      error: 'Validation error',
      details: err.array ? err.array() : err.message
    });
  }

  // Not found errors
  if (err.status === 404) {
    return res.status(404).json({
      error: 'Resource not found'
    });
  }

  // Generic error response
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

module.exports = { errorHandler };
