import React from 'react';
import { Link } from 'react-router-dom';
import { getAuth } from 'firebase/auth';

export default function Menu({ handleLogout }) {
  const auth = getAuth();

  return (
    <nav className="navigation" style={{ textAlign: 'center' }}>
      {/* Primary navigation links */}
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/calculator" className="nav-link">Calculator</Link>
        <Link to="/historical" className="nav-link">Historical Zyps</Link>
        <Link to="/about-zypto" className="nav-link">Learn More</Link>
        <Link to="/about" className="nav-link">About</Link>
      </div>

      {/* Download button below menu */}
      <div style={{ marginTop: '0.75rem' }}>
        <a
          href="https://ref.zypto.com/ZRxWOW84IOb"
          target="_blank"
          rel="noopener noreferrer"
          className="nav-link"
          style={{ fontWeight: 'bold' }}
        >
          Download Zypto App
        </a>
      </div>

      {/* Authenticated user links */}
      {auth.currentUser && (
        <div style={{ marginTop: '0.5rem' }}>
          <Link to="/data-input" className="nav-link">Data Input</Link>
          <button onClick={handleLogout} className="nav-button">Log Out</button>
        </div>
      )}
    </nav>
  );
}
