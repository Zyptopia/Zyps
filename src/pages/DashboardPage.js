// src/pages/DashboardPage.js
import React from 'react';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  return (
    <div className="page-content" style={{ maxWidth: 800, margin: '1.5rem auto', padding: '0 1rem' }}>
      <h1>Dashboard</h1>
      <p style={{ opacity: 0.85 }}>
        Admin tools for Zyptopia.org. Use the links below to manage data and view analytics.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Link to="/data-input" className="btn" style={btn}>Data Input</Link>
        <Link to="/analytics" className="btn" style={btn}>Analytics</Link>
      </div>
    </div>
  );
}

const btn = {
  padding: '0.55rem 0.9rem',
  borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.15)',
  background: 'rgba(255,255,255,0.06)',
  fontWeight: 600,
  textDecoration: 'none',
  color: 'inherit'
};
