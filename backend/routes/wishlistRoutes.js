const express = require('express');
const { body, param } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require('../controllers/wishlistController');

const router = express.Router();

router.use(authenticate);

// GET /api/wishlist
router.get('/', getWishlist);

// POST /api/wishlist
router.post(
  '/',
  [body('productId').isInt({ min: 1 }).toInt()],
  validate,
  addToWishlist
);

// DELETE /api/wishlist/:productId
router.delete(
  '/:productId',
  [param('productId').isInt({ min: 1 }).toInt()],
  validate,
  removeFromWishlist
);

module.exports = router;
