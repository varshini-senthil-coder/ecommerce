const jwt = require('jsonwebtoken');
const { ApiError } = require('./errorHandler');
require('dotenv').config();

/**
 * Verifies the Bearer token and attaches req.user = { id, role }.
 * Use on routes that require authentication (cart, wishlist, orders).
 */
function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new ApiError(401, 'Missing or invalid Authorization header'));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch (err) {
    next(new ApiError(401, 'Invalid or expired token'));
  }
}

/**
 * Restrict a route to specific roles, e.g. authorize('admin')
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Forbidden: insufficient permissions'));
    }
    next();
  };
}

module.exports = { authenticate, authorize };
