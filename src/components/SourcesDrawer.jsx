// src/components/SourcesDrawer.jsx
import React, { useEffect } from 'react';

export default function SourcesDrawer({ open, onClose, title = 'Sources', items = [] }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div style={backdrop} onClick={onClose} />
      <aside style={sheet} role="dialog" aria-modal="true" aria-label={title}>
        <div style={header}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={closeBtn} aria-label="Close sources">×</button>
        </div>

        <ul style={list}>
          {items.map(({ label, href }, i) => (
            <li key={i} style={{ marginBottom: '.4rem' }}>
              <a href={href} target="_blank" rel="noopener noreferrer" style={link}>
                {label}
              </a>
            </li>
          ))}
        </ul>

        <div style={{ fontSize: '.9rem', opacity: .8, marginTop: '.6rem' }}>
          Availability varies by region and can change over time—check the Zypto app for current details.
        </div>
      </aside>
    </>
  );
}

/* ===== styles (inline to avoid new CSS files) ===== */
const backdrop = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 90
};
const sheet = {
  position: 'fixed', left: '50%', transform: 'translateX(-50%)',
  bottom: 12, width: 'min(720px, 92vw)', zIndex: 99,
  background: 'rgba(22,27,34,.98)', color: 'inherit',
  border: '1px solid rgba(255,255,255,.12)', borderRadius: 14,
  boxShadow: '0 20px 50px rgba(0,0,0,.55)',
  padding: '0.9rem 1rem'
};
const header = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.5rem'
};
const closeBtn = {
  border: '1px solid rgba(255,255,255,.15)', background: 'rgba(255,255,255,.06)',
  color: 'inherit', borderRadius: 8, width: 34, height: 34, cursor: 'pointer', fontSize: 18, lineHeight: 1
};
const list = { margin: 0, paddingLeft: '1rem' };
const link = { textDecoration: 'underline' };
