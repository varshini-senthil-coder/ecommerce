const { pool } = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');

// GET /api/wishlist
async function getWishlist(req, res, next) {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        w.id AS wishlist_item_id, w.created_at,
        p.id AS product_id, p.name, p.slug, p.price, p.discount_price,
        p.thumbnail_url, p.stock_quantity, p.rating_avg
      FROM wishlist_items w
      JOIN products p ON p.id = w.product_id
      WHERE w.user_id = :userId
      ORDER BY w.created_at DESC
      `,
      { userId: req.user.id }
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}

// POST /api/wishlist  { productId }
async function addToWishlist(req, res, next) {
  try {
    const { productId } = req.body;

    const [productRows] = await pool.query(
      'SELECT id FROM products WHERE id = :productId AND is_active = 1',
      { productId }
    );
    if (productRows.length === 0) throw new ApiError(404, 'Product not found');

    await pool.query(
      `INSERT INTO wishlist_items (user_id, product_id)
       VALUES (:userId, :productId)
       ON DUPLICATE KEY UPDATE user_id = user_id`, // no-op if already present
      { userId: req.user.id, productId }
    );

    res.status(201).json({ success: true, message: 'Item added to wishlist' });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/wishlist/:productId
async function removeFromWishlist(req, res, next) {
  try {
    const [result] = await pool.query(
      'DELETE FROM wishlist_items WHERE user_id = :userId AND product_id = :productId',
      { userId: req.user.id, productId: req.params.productId }
    );
    if (result.affectedRows === 0) throw new ApiError(404, 'Wishlist item not found');
    res.json({ success: true, message: 'Item removed from wishlist' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
