// src/components/Menu.js
import React from 'react';
import { Link } from 'react-router-dom';
import { getAuth } from 'firebase/auth';

import OutboundLink from './OutboundLink';
import { REF_BY_PLACEMENT } from '../constants';

export default function Menu({ handleLogout }) {
  const auth = getAuth();

  return (
    <nav className="navigation" style={{ padding: '0.75rem 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to="/" className="nav-link" style={link}>Home</Link>
        <Link to="/calculator" className="nav-link" style={link}>Calculator</Link>
        <Link to="/stats" className="nav-link" style={link}>Stats</Link>
        <Link to="/historical" className="nav-link" style={link}>Historical Zyps</Link>
        <Link to="/about-zypto" className="nav-link" style={link}>Learn More</Link>
        <Link to="/about" className="nav-link" style={link}>About</Link>

        <OutboundLink
          href={REF_BY_PLACEMENT('nav_download_btn')}
          eventName="cta_click"
          eventParams={{ placement: 'nav_download_btn' }}
          className="nav-link"
          style={{ ...btn, marginLeft: '0.25rem' }}
        >
          Download Zypto App
        </OutboundLink>
      </div>

      {auth.currentUser && (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          <Link to="/data-input" className="nav-link" style={link}>Data Input</Link>
          <Link to="/dashboard" className="nav-link" style={link}>Dashboard</Link>
          <Link to="/analytics" className="nav-link" style={link}>Analytics</Link>
          <button onClick={handleLogout} className="nav-button" style={btn}>Log Out</button>
        </div>
      )}
    </nav>
  );
}

const link = { textDecoration: 'none' };
const btn = {
  padding: '0.45rem 0.8rem',
  borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.15)',
  background: 'rgba(255,255,255,0.06)',
  fontWeight: 600
};
