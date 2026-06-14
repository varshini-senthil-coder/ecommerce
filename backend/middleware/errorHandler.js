/**
 * Central error handler. Any error passed via next(err) ends up here.
 * Keeps API responses consistent: { success: false, message, errors? }
 */
function errorHandler(err, req, res, next) {
  console.error(err);

  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    success: false,
    message,
    ...(err.errors ? { errors: err.errors } : {}),
  });
}

// 404 handler for unmatched routes
function notFound(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

// Simple custom error class for throwing with status codes
class ApiError extends Error {
  constructor(statusCode, message, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

module.exports = { errorHandler, notFound, ApiError };
