// src/components/Footer.js
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { trackEvent } from '../analytics';

export default function Footer() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(getAuth());
      trackEvent('sign_out', {});
      navigate('/');
    } catch {}
  };

  return (
    <footer style={wrap}>
      <div style={inner}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', flexWrap: 'wrap' }}>
          <div style={{ fontWeight: 800 }}>Zyptopia.org</div>
          <div style={{ opacity: .8 }}>Independent, community-run. Not affiliated with Zypto. Not financial advice.</div>
        </div>

        <div style={linkRow}>
          <FooterLink to="/">Daily Graph</FooterLink>
          <FooterLink to="/historical">Historical</FooterLink>
          <FooterLink to="/calculator">Calculator</FooterLink>
          <FooterLink to="/get-started">Getting Started</FooterLink>
          <FooterLink to="/vault-key-card">VKC</FooterLink>
          <FooterLink to="/about-zypto">About Zypto</FooterLink>
          <FooterLink to="/faq">FAQ</FooterLink>

          {!user ? (
            <FooterLink to="/login">Login</FooterLink>
          ) : (
            <>
              <FooterLink to="/dashboard">Admin</FooterLink>
              <FooterLink to="/data-input">Data Input</FooterLink>
              <FooterLink to="/analytics">Analytics</FooterLink>
              <button
                onClick={handleSignOut}
                className="link-quiet"
                style={{ textDecoration: 'underline', background: 'transparent', border: 0, padding: 0, cursor: 'pointer' }}
              >
                Sign out
              </button>
            </>
          )}
        </div>

        <div style={ctaRow}>
          <Link to="/get-started" className="btn" style={btnSm} onClick={() => trackEvent('footer_click', { to: 'get_started' })}>
            Quick guide
          </Link>
          <a
            className="btn btn-primary"
            style={btnSmPrimary}
            href="https://ref.zypto.com/ZRxWOW84IOb"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('footer_click', { to: 'zypto_site' })}
          >
            Download app
          </a>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ to, children }) {
  return (
    <Link
      to={to}
      className="link-quiet"
      onClick={() => trackEvent('footer_nav', { to })}
      style={{ textDecoration: 'underline' }}
    >
      {children}
    </Link>
  );
}

const wrap   = { marginTop: '1.2rem', borderTop: '1px solid rgba(255,255,255,.08)', background: 'rgba(22,27,34,.7)' };
const inner  = { maxWidth: 1180, margin: '0 auto', padding: '.8rem .9rem', display: 'grid', gap: '.6rem' };
const linkRow= { display: 'flex', gap: '.9rem', flexWrap: 'wrap', alignItems: 'center' };
const ctaRow = { display: 'flex', gap: '.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' };
const btnSm  = { padding: '.38rem .7rem', borderRadius: 10, border: '1px solid rgba(255,255,255,.15)', background: 'rgba(255,255,255,.08)', fontWeight: 700 };
const btnSmPrimary = { ...btnSm, background: 'linear-gradient(180deg, rgba(0,255,200,.28), rgba(0,255,200,.18))', border: '1px solid rgba(0,255,200,.35)' };
