import React from 'react';

export default function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages, hasPrevPage, hasNextPage } = pagination;

  // Show a small window of page numbers around the current page
  const pages = [];
  const windowSize = 2;
  for (let p = Math.max(1, page - windowSize); p <= Math.min(totalPages, page + windowSize); p++) {
    pages.push(p);
  }

  return (
    <div className="pagination">
      <button disabled={!hasPrevPage} onClick={() => onPageChange(page - 1)}>
        ‹ Prev
      </button>

      {pages[0] > 1 && <button onClick={() => onPageChange(1)}>1</button>}
      {pages[0] > 2 && <span>…</span>}

      {pages.map((p) => (
        <button key={p} className={p === page ? 'active' : ''} onClick={() => onPageChange(p)}>
          {p}
        </button>
      ))}

      {pages[pages.length - 1] < totalPages - 1 && <span>…</span>}
      {pages[pages.length - 1] < totalPages && (
        <button onClick={() => onPageChange(totalPages)}>{totalPages}</button>
      )}

      <button disabled={!hasNextPage} onClick={() => onPageChange(page + 1)}>
        Next ›
      </button>
    </div>
  );
}
