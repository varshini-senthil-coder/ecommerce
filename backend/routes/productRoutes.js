const express = require('express');
const { query, param } = require('express-validator');
const { validate } = require('../middleware/validate');
const { listProducts, getProduct, listCategories } = require('../controllers/productController');

const router = express.Router();

/**
 * GET /api/products
 * Advanced search & filter:
 *   ?search=phone&category=smartphones&brand=apple
 *   &minPrice=100&maxPrice=1000&minRating=4&inStock=true
 *   &sort=price_asc&page=1&limit=20
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('minPrice').optional().isFloat({ min: 0 }),
    query('maxPrice').optional().isFloat({ min: 0 }),
    query('minRating').optional().isFloat({ min: 0, max: 5 }),
    query('inStock').optional().isIn(['true', 'false']),
    query('sort').optional().isIn(['price_asc', 'price_desc', 'rating_desc', 'newest', 'name_asc', 'relevance']),
    query('search').optional().isString().trim().isLength({ max: 200 }),
    query('category').optional().isString().trim().isLength({ max: 140 }),
    query('brand').optional().isString().trim().isLength({ max: 140 }),
  ],
  validate,
  listProducts
);

// GET /api/products/:idOrSlug
router.get(
  '/:idOrSlug',
  [param('idOrSlug').isString().trim().notEmpty().isLength({ max: 220 })],
  validate,
  getProduct
);

module.exports = router;
