import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div>© {new Date().getFullYear()} ShopHub. Built with React, Express & MySQL.</div>
      </div>
    </footer>
  );
}
