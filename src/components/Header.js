// src/components/Header.js
import React, { useEffect, useRef, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { trackEvent } from '../analytics';
import logo from '../assets/logo.png';

function MenuLink({ to, children, onClick }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
      onClick={(e) => {
        trackEvent('nav_click', { to });
        onClick?.(e);
      }}
      style={{ textDecoration: 'none', padding: '.42rem .6rem', borderRadius: 8 }}
    >
      {children}
    </NavLink>
  );
}

/** Desktop-only dropdown using <details>/<summary> */
function DesktopDropdown({ label, items }) {
  return (
    <details className="dd">
      <summary className="nav-link" style={{ listStyle: 'none', userSelect: 'none' }}>
        {label}
        <svg aria-hidden="true" width="12" height="12" viewBox="0 0 20 20" style={{ marginLeft: 6, opacity: .9 }}>
          <path d="M5 7l5 6 5-6H5z" fill="currentColor" />
        </svg>
      </summary>
      <div className="dd-menu">
        {items.map((it) => (
          <MenuLink key={it.to} to={it.to}>{it.label}</MenuLink>
        ))}
      </div>
    </details>
  );
}

/** Mobile full-screen sheet */
function MobileSheet({ open, onClose, groups }) {
  const ref = useRef(null);
  const loc = useLocation();

  useEffect(() => { onClose(); /* eslint-disable-next-line */ }, [loc.pathname]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    if (open) document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 2000,
        display: 'grid', placeItems: 'start stretch'
      }}
    >
      <div
        ref={ref}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'rgba(18,22,28,.98)',
          borderBottom: '1px solid rgba(255,255,255,.12)',
          padding: '0.9rem',
          width: '100%',
          boxShadow: '0 12px 28px rgba(0,0,0,.35)',
          animation: 'sheetDown .16s ease-out'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.25rem' }}>
          <div style={{ fontWeight: 900 }}>Menu</div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            style={{
              background: 'transparent', color: 'inherit', border: 0, padding: '.4rem .6rem',
              borderRadius: 8, cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        {groups.map((g) => (
          <div key={g.title} style={{ marginTop: '.4rem' }}>
            <div style={{ opacity: .85, fontSize: '.92rem', margin: '.25rem 0' }}>{g.title}</div>
            <div style={{ display: 'grid', gap: '.25rem' }}>
              {g.items.map((it) => (
                <MenuLink key={it.to} to={it.to} onClick={onClose}>{it.label}</MenuLink>
              ))}
            </div>
          </div>
        ))}

        <div style={{ marginTop: '.6rem', borderTop: '1px solid rgba(255,255,255,.08)', paddingTop: '.5rem' }}>
          <MenuLink to="/about" onClick={onClose}>About</MenuLink>
        </div>
      </div>
    </div>
  );
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const tools = [
    { to: '/',            label: 'Daily Graph' },
    { to: '/calculator',  label: 'Calculator' },
    { to: '/stats',       label: 'Stats' },        // <-- ADDED
    { to: '/historical',  label: 'Historical' },
  ];
  const learn = [
    { to: '/get-started',   label: 'Get Started' },
    { to: '/about-zypto',   label: 'About Zypto' },
    { to: '/vault-key-card',label: 'Vault Key Card' },
    { to: '/faq',           label: 'FAQ' },
  ];

  // Single-open + outside-click close for desktop dropdowns
  useEffect(() => {
    const onDocClick = (e) => {
      document.querySelectorAll('.dd[open]').forEach((d) => {
        if (!d.contains(e.target)) d.removeAttribute('open');
      });
    };
    const onToggle = (e) => {
      const el = e.target;
      if (!(el instanceof HTMLDetailsElement) || !el.classList.contains('dd')) return;
      if (el.open) {
        document.querySelectorAll('.dd[open]').forEach((d) => { if (d !== el) d.removeAttribute('open'); });
      }
    };
    document.addEventListener('click', onDocClick);
    document.addEventListener('toggle', onToggle, true);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('toggle', onToggle, true);
    };
  }, []);

  return (
    <header className="site-header" style={wrap}>
      <div className="header-container" style={inner}>
        {/* Logo = home */}
        <Link
          to="/"
          aria-label="Zyptopia.org — Home"
          onClick={() => trackEvent('nav_click', { to: 'home' })}
          style={{ display: 'inline-flex', alignItems: 'center' }}
        >
          <img
            src={logo}
            alt="Zyptopia.org"
            style={{ height: 'clamp(28px, 8vw, 60px)', width: 'auto', display: 'block', opacity: 0.95 }}
          />
        </Link>

        {/* Desktop nav */}
        <nav className="nav nav-desktop" role="navigation" style={nav}>
          <DesktopDropdown label="Tools" items={tools} />
          <DesktopDropdown label="Learn" items={learn} />
          <MenuLink to="/about">About</MenuLink>
        </nav>

        {/* Burger button */}
        <button
          className="hamburger"
          aria-label="Open menu"
          aria-controls="mobile-menu"
          aria-expanded={mobileOpen ? 'true' : 'false'}
          onClick={() => setMobileOpen(true)}
          style={burgerBtn}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Mobile sheet */}
      <MobileSheet
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        groups={[
          { title: 'Tools', items: tools },
          { title: 'Learn', items: learn }
        ]}
      />
    </header>
  );
}

/* Inline style objects */
const wrap = {
  position: 'sticky',
  top: 0,
  zIndex: 50,
  backdropFilter: 'saturate(180%) blur(8px)',
  background: 'rgba(22,27,34,.75)',
  borderBottom: '1px solid rgba(255,255,255,.08)'
};
const inner = {
  maxWidth: 1180,
  margin: '0 auto',
  padding: '.55rem .9rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '.6rem'
};
const nav = {
  display: 'flex',
  alignItems: 'center',
  gap: '.25rem'
};
const burgerBtn = {
  display: 'none',
  background: 'transparent',
  color: 'inherit',
  border: 0,
  padding: '.35rem .45rem',
  borderRadius: 8,
  cursor: 'pointer'
};
