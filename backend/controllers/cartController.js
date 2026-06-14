const { pool } = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');

// GET /api/cart -> list current user's cart with product details + computed totals
async function getCart(req, res, next) {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        ci.id AS cart_item_id, ci.quantity,
        p.id AS product_id, p.name, p.slug, p.price, p.discount_price,
        p.thumbnail_url, p.stock_quantity
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      WHERE ci.user_id = :userId
      ORDER BY ci.created_at DESC
      `,
      { userId: req.user.id }
    );

    let subtotal = 0;
    const items = rows.map((r) => {
      const unitPrice = r.discount_price ?? r.price;
      const lineTotal = Number(unitPrice) * r.quantity;
      subtotal += lineTotal;
      return { ...r, unit_price: unitPrice, line_total: lineTotal };
    });

    res.json({
      success: true,
      data: { items, subtotal: Number(subtotal.toFixed(2)), itemCount: items.length },
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/cart  { productId, quantity }
async function addToCart(req, res, next) {
  try {
    const { productId, quantity = 1 } = req.body;

    const [productRows] = await pool.query(
      'SELECT id, stock_quantity FROM products WHERE id = :productId AND is_active = 1',
      { productId }
    );
    if (productRows.length === 0) throw new ApiError(404, 'Product not found');
    if (productRows[0].stock_quantity < quantity) {
      throw new ApiError(400, 'Insufficient stock for requested quantity');
    }

    await pool.query(
      `
      INSERT INTO cart_items (user_id, product_id, quantity)
      VALUES (:userId, :productId, :quantity)
      ON DUPLICATE KEY UPDATE quantity = quantity + :quantity
      `,
      { userId: req.user.id, productId, quantity }
    );

    res.status(201).json({ success: true, message: 'Item added to cart' });
  } catch (err) {
    next(err);
  }
}

// PUT /api/cart/:productId  { quantity }
async function updateCartItem(req, res, next) {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;

    if (quantity <= 0) {
      await pool.query('DELETE FROM cart_items WHERE user_id = :userId AND product_id = :productId', {
        userId: req.user.id,
        productId,
      });
      return res.json({ success: true, message: 'Item removed from cart' });
    }

    const [result] = await pool.query(
      'UPDATE cart_items SET quantity = :quantity WHERE user_id = :userId AND product_id = :productId',
      { quantity, userId: req.user.id, productId }
    );

    if (result.affectedRows === 0) throw new ApiError(404, 'Cart item not found');
    res.json({ success: true, message: 'Cart item updated' });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/cart/:productId
async function removeFromCart(req, res, next) {
  try {
    const [result] = await pool.query(
      'DELETE FROM cart_items WHERE user_id = :userId AND product_id = :productId',
      { userId: req.user.id, productId: req.params.productId }
    );
    if (result.affectedRows === 0) throw new ApiError(404, 'Cart item not found');
    res.json({ success: true, message: 'Item removed from cart' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getCart, addToCart, updateCartItem, removeFromCart };
