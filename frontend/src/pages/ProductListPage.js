import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import Filters from '../components/Filters';
import Pagination from '../components/Pagination';

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Derive filter state from the URL so searches/filters are shareable & bookmarkable
  const filters = {
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minRating: searchParams.get('minRating') || '',
    inStock: searchParams.get('inStock') || '',
    sort: searchParams.get('sort') || 'newest',
    page: parseInt(searchParams.get('page'), 10) || 1,
  };

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '' && v != null));
    fetchProducts(params)
      .then((res) => {
        setProducts(res.items || []);
        setPagination(res.pagination);
      })
      .catch(() => setError('Failed to load products. Please try again.'))
      .finally(() => setLoading(false));
    
  }, [searchParams]);

  useEffect(() => {
    load();
  }, [load]);

  const handleFilterChange = (newFilters) => {
    const params = Object.fromEntries(
      Object.entries({ ...newFilters, page: 1 }).filter(([, v]) => v !== '' && v != null)
    );
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    const params = {};
    if (filters.search) params.search = filters.search;
    setSearchParams(params);
  };

  const handleSortChange = (e) => {
    handleFilterChange({ ...filters, sort: e.target.value });
  };

  const handlePageChange = (page) => {
    setSearchParams({ ...Object.fromEntries(searchParams), page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="catalog-layout">
      <Filters filters={filters} onChange={handleFilterChange} onClear={handleClearFilters} />

      <div>
        <div className="toolbar">
          <span className="result-count">
            {pagination ? `${pagination.total} results` : ''}
            {filters.search && ` for "${filters.search}"`}
          </span>
          <select value={filters.sort} onChange={handleSortChange}>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating_desc">Highest Rated</option>
            <option value="name_asc">Name: A-Z</option>
            {filters.search && <option value="relevance">Relevance</option>}
          </select>
        </div>

        {loading && <div className="loading">Loading products...</div>}
        {error && <div className="error-message">{error}</div>}

        {!loading && !error && products.length === 0 && (
          <div className="empty-state">
            <h3>No products found</h3>
            <p>Try adjusting your filters or search term.</p>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <>
            <div className="product-grid">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            <Pagination pagination={pagination} onPageChange={handlePageChange} />
          </>
        )}
      </div>
    </div>
  );
}
