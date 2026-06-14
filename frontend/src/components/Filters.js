import React, { useEffect, useState } from 'react';
import { fetchCategories } from '../services/api';

/**
 * Sidebar with category tree, brand, price range, and rating filters.
 * Controlled via the parent's `filters` state and `onChange` callback.
 */
export default function Filters({ filters, onChange, onClear }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories()
      .then((res) => setCategories(res.data || []))
      .catch(() => setCategories([]));
  }, []);

  const update = (key, value) => onChange({ ...filters, [key]: value });

  const renderCategoryNode = (cat) => (
    <div key={cat.id}>
      <a
        className={filters.category === cat.slug ? 'active' : ''}
        onClick={() => update('category', filters.category === cat.slug ? '' : cat.slug)}
        style={{ cursor: 'pointer' }}
      >
        {cat.name}
      </a>
      {cat.children && cat.children.length > 0 && (
        <div className="children">{cat.children.map(renderCategoryNode)}</div>
      )}
    </div>
  );

  return (
    <aside className="filters">
      <h3>Filters</h3>

      <div className="filter-group">
        <label>Category</label>
        <div className="category-tree">{categories.map(renderCategoryNode)}</div>
      </div>

      <div className="filter-group">
        <label>Price Range ($)</label>
        <div className="price-range">
          <input
            type="number"
            placeholder="Min"
            min="0"
            value={filters.minPrice || ''}
            onChange={(e) => update('minPrice', e.target.value)}
          />
          <input
            type="number"
            placeholder="Max"
            min="0"
            value={filters.maxPrice || ''}
            onChange={(e) => update('maxPrice', e.target.value)}
          />
        </div>
      </div>

      <div className="filter-group">
        <label>Minimum Rating</label>
        <select value={filters.minRating || ''} onChange={(e) => update('minRating', e.target.value)}>
          <option value="">Any rating</option>
          <option value="4">4★ & up</option>
          <option value="3">3★ & up</option>
          <option value="2">2★ & up</option>
          <option value="1">1★ & up</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Availability</label>
        <select value={filters.inStock || ''} onChange={(e) => update('inStock', e.target.value)}>
          <option value="">All items</option>
          <option value="true">In stock only</option>
        </select>
      </div>

      <button className="clear-filters" onClick={onClear}>
        Clear all filters
      </button>
    </aside>
  );
}
