const { pool } = require('../config/db');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');

// Whitelisted sortable columns to prevent SQL injection via ORDER BY
const SORTABLE_COLUMNS = {
  price_asc: 'p.price ASC',
  price_desc: 'p.price DESC',
  rating_desc: 'p.rating_avg DESC',
  newest: 'p.created_at DESC',
  name_asc: 'p.name ASC',
  relevance: null, // handled specially when a search term is present
};

/**
 * Builds and executes a paginated, filterable product listing query.
 *
 * Supported query params:
 *  - search: full-text search on name/description
 *  - category: category slug (includes subcategories)
 *  - brand: brand slug
 *  - minPrice / maxPrice
 *  - minRating
 *  - inStock: 'true' to only show stock_quantity > 0
 *  - sort: one of SORTABLE_COLUMNS keys
 *  - page / limit
 */
async function searchProducts(query) {
  const { page, limit, offset } = getPagination(query);

  const where = ['p.is_active = 1'];
  const params = {};

  // --- Category filter (also includes direct subcategories) ---
  if (query.category) {
    where.push(`(
      c.slug = :category
      OR c.parent_id = (SELECT id FROM categories WHERE slug = :category)
    )`);
    params.category = query.category;
  }

  // --- Brand filter ---
  if (query.brand) {
    where.push('b.slug = :brand');
    params.brand = query.brand;
  }

  // --- Price range ---
  if (query.minPrice) {
    where.push('p.price >= :minPrice');
    params.minPrice = parseFloat(query.minPrice);
  }
  if (query.maxPrice) {
    where.push('p.price <= :maxPrice');
    params.maxPrice = parseFloat(query.maxPrice);
  }

  // --- Rating filter ---
  if (query.minRating) {
    where.push('p.rating_avg >= :minRating');
    params.minRating = parseFloat(query.minRating);
  }

  // --- Stock filter ---
  if (query.inStock === 'true') {
    where.push('p.stock_quantity > 0');
  }

  // --- Full-text search ---
  let searchSelect = '';
  let searchOrder = '';
  if (query.search && query.search.trim().length > 0) {
    where.push('MATCH(p.name, p.description) AGAINST (:search IN NATURAL LANGUAGE MODE)');
    params.search = query.search.trim();
    searchSelect = ', MATCH(p.name, p.description) AGAINST (:search IN NATURAL LANGUAGE MODE) AS relevance';
    searchOrder = 'relevance DESC';
  }

  // --- Sorting ---
  let orderBy = 'p.created_at DESC';
  if (query.sort && SORTABLE_COLUMNS[query.sort]) {
    orderBy = SORTABLE_COLUMNS[query.sort];
  } else if (query.sort === 'relevance' && searchOrder) {
    orderBy = searchOrder;
  } else if (searchOrder) {
    // Default to relevance ordering when a search term is present
    orderBy = `${searchOrder}, p.created_at DESC`;
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const baseQuery = `
    FROM products p
    JOIN categories c ON c.id = p.category_id
    LEFT JOIN brands b ON b.id = p.brand_id
    ${whereClause}
  `;

  // Total count for pagination metadata
  const countSql = `SELECT COUNT(*) AS total ${baseQuery}`;
  const [countRows] = await pool.query(countSql, params);
  const total = countRows[0].total;

  // Main listing query
  const dataSql = `
    SELECT
      p.id, p.sku, p.name, p.slug, p.description,
      p.price, p.discount_price, p.stock_quantity,
      p.rating_avg, p.rating_count, p.thumbnail_url,
      p.created_at,
      c.id AS category_id, c.name AS category_name, c.slug AS category_slug,
      b.id AS brand_id, b.name AS brand_name, b.slug AS brand_slug
      ${searchSelect}
    ${baseQuery}
    ORDER BY ${orderBy}
    LIMIT :limit OFFSET :offset
  `;

  const [rows] = await pool.query(dataSql, { ...params, limit, offset });

  return {
    items: rows,
    pagination: buildPaginationMeta(page, limit, total),
  };
}

/**
 * Fetches a single product by id or slug, including images and attributes.
 */
async function getProductByIdOrSlug(idOrSlug) {
  const isNumeric = /^\d+$/.test(idOrSlug);

  const [productRows] = await pool.query(
    `
    SELECT
      p.*, c.name AS category_name, c.slug AS category_slug,
      b.name AS brand_name, b.slug AS brand_slug
    FROM products p
    JOIN categories c ON c.id = p.category_id
    LEFT JOIN brands b ON b.id = p.brand_id
    WHERE p.is_active = 1 AND ${isNumeric ? 'p.id = :idOrSlug' : 'p.slug = :idOrSlug'}
    LIMIT 1
    `,
    { idOrSlug }
  );

  if (productRows.length === 0) return null;
  const product = productRows[0];

  const [images] = await pool.query(
    `SELECT id, image_url, sort_order FROM product_images WHERE product_id = :id ORDER BY sort_order ASC`,
    { id: product.id }
  );

  const [attributes] = await pool.query(
    `SELECT attr_name, attr_value FROM product_attributes WHERE product_id = :id`,
    { id: product.id }
  );

  return { ...product, images, attributes };
}

/**
 * Returns the category tree (top-level categories with their children).
 */
async function getCategoryTree() {
  const [rows] = await pool.query(
    `SELECT id, name, slug, parent_id, description FROM categories ORDER BY parent_id IS NULL DESC, name ASC`
  );

  const byId = new Map(rows.map((r) => [r.id, { ...r, children: [] }]));
  const tree = [];

  for (const row of byId.values()) {
    if (row.parent_id) {
      const parent = byId.get(row.parent_id);
      if (parent) parent.children.push(row);
    } else {
      tree.push(row);
    }
  }

  return tree;
}

module.exports = { searchProducts, getProductByIdOrSlug, getCategoryTree, SORTABLE_COLUMNS };
