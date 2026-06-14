const productService = require('../services/productService');
const { ApiError } = require('../middleware/errorHandler');

// GET /api/products
async function listProducts(req, res, next) {
  try {
    const result = await productService.searchProducts(req.query);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

// GET /api/products/:idOrSlug
async function getProduct(req, res, next) {
  try {
    const product = await productService.getProductByIdOrSlug(req.params.idOrSlug);
    if (!product) throw new ApiError(404, 'Product not found');
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
}

// GET /api/categories
async function listCategories(req, res, next) {
  try {
    const tree = await productService.getCategoryTree();
    res.json({ success: true, data: tree });
  } catch (err) {
    next(err);
  }
}

module.exports = { listProducts, getProduct, listCategories };
