require('dotenv').config();

const DEFAULT_PAGE_SIZE = parseInt(process.env.DEFAULT_PAGE_SIZE, 10) || 20;
const MAX_PAGE_SIZE = parseInt(process.env.MAX_PAGE_SIZE, 10) || 100;

/**
 * Normalizes page/limit query params and returns { page, limit, offset }.
 * Clamps limit to MAX_PAGE_SIZE to prevent abusive queries (e.g. ?limit=999999).
 */
function getPagination(query) {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  if (!Number.isFinite(page) || page < 1) page = 1;
  if (!Number.isFinite(limit) || limit < 1) limit = DEFAULT_PAGE_SIZE;
  if (limit > MAX_PAGE_SIZE) limit = MAX_PAGE_SIZE;

  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

/**
 * Builds a standard paginated response envelope.
 */
function buildPaginationMeta(page, limit, total) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 0,
    hasNextPage: page * limit < total,
    hasPrevPage: page > 1,
  };
}

module.exports = { getPagination, buildPaginationMeta, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE };
