// src/components/Breadcrumbs.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const parts = pathname.split('/').filter(Boolean);
  const crumbs = [['/', 'Home']].concat(
    parts.map((p, i) => {
      const url = '/' + parts.slice(0, i + 1).join('/');
      const name = p.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      return [url, name];
    })
  );

  return (
    <nav aria-label="Breadcrumb" style={{ margin: '0 0 0.75rem' }}>
      {crumbs.map(([url, name], i) => (
        <span key={url}>
          {i > 0 && <span style={{ opacity: 0.6 }}> / </span>}
          {i < crumbs.length - 1 ? <Link to={url}>{name}</Link> : <span>{name}</span>}
        </span>
      ))}
    </nav>
  );
}
