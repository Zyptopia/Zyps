// src/components/Hero.js
import React from 'react';

export default function Hero({ kicker, title, subtitle, imageSrc, imageAlt = '', right = true, children }) {
  return (
    <section style={wrap}>
      <div style={grid(right)}>
        <div>
          {kicker ? <div style={kickerStyle}>{kicker}</div> : null}
          <h1 style={{ margin: '0 0 .3rem' }}>{title}</h1>
          {subtitle ? <p style={{ margin: 0, opacity: .9 }}>{subtitle}</p> : null}
          {children}
        </div>
        {imageSrc ? (
          <div style={{ alignSelf: 'center' }}>
            <img
              src={imageSrc}
              alt={imageAlt}
              loading="lazy"
              style={{ width: '100%', height: 'auto', maxWidth: 380, display: 'block', borderRadius: 14 }}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}

const wrap = {
  border: '1px solid rgba(255,255,255,.1)',
  borderRadius: 16,
  padding: '1rem',
  background: 'linear-gradient(135deg, rgba(255,255,255,.04), rgba(255,255,255,.02))',
  marginBottom: '1rem'
};
const grid = (right) => ({
  display: 'grid',
  gridTemplateColumns: right ? '1fr minmax(200px, 380px)' : 'minmax(200px, 380px) 1fr',
  gap: '1rem',
  alignItems: 'center'
});
const kickerStyle = { fontSize: '.9rem', opacity: .8, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: '.35rem' };
