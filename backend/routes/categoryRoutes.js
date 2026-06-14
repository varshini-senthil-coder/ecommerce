const express = require('express');
const { listCategories } = require('../controllers/productController');

const router = express.Router();

// GET /api/categories -> full category tree
router.get('/', listCategories);

module.exports = router;
