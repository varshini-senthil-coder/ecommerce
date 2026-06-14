const express = require('express');
const { body, param } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
} = require('../controllers/cartController');

const router = express.Router();

// All cart routes require authentication
router.use(authenticate);

// GET /api/cart
router.get('/', getCart);

// POST /api/cart
router.post(
  '/',
  [
    body('productId').isInt({ min: 1 }).toInt(),
    body('quantity').optional().isInt({ min: 1, max: 999 }).toInt(),
  ],
  validate,
  addToCart
);

// PUT /api/cart/:productId
router.put(
  '/:productId',
  [
    param('productId').isInt({ min: 1 }).toInt(),
    body('quantity').isInt({ min: 0, max: 999 }).toInt(),
  ],
  validate,
  updateCartItem
);

// DELETE /api/cart/:productId
router.delete(
  '/:productId',
  [param('productId').isInt({ min: 1 }).toInt()],
  validate,
  removeFromCart
);

module.exports = router;
