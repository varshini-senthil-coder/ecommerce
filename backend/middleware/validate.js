const { validationResult } = require('express-validator');
const { ApiError } = require('./errorHandler');

/**
 * Runs after express-validator chains in a route.
 * If any validation failed, throws a 422 ApiError with details.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({
      field: e.path,
      message: e.msg,
    }));
    return next(new ApiError(422, 'Validation failed', formatted));
  }
  next();
}

module.exports = { validate };
