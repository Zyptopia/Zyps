// src/components/PromoBanner.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import OutboundLink from './OutboundLink';
import { REF_BY_PLACEMENT } from '../constants';
import promoImg from '../assets/vault-key-card-promo.png';

/** Hook: true when viewport <= 560px */
function useIsMobile(threshold = 560) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= threshold : false
  );
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia(`(max-width: ${threshold}px)`);
    const handler = (e) => setIsMobile(e.matches);
    handler(mq);
    mq.addEventListener ? mq.addEventListener('change', handler) : mq.addListener(handler);
    return () => {
      mq.removeEventListener ? mq.removeEventListener('change', handler) : mq.removeListener(handler);
    };
  }, [threshold]);
  return isMobile;
}

export default function PromoBanner() {
  const isMobile = useIsMobile(560);
  return (
    <aside className="promo-banner" style={wrap} role="region" aria-label="Zypto promo">
      {isMobile ? <MobilePromo /> : <DesktopPromo />}
    </aside>
  );
}

/* ---------------- Desktop / Tablet ---------------- */
function DesktopPromo() {
  return (
    <div style={grid}>
      {/* Image */}
      <div style={imgWrap}>
        <img
          src={promoImg}
          alt="Zypto Wallet & Vault Key Card"
          style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 12 }}
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* Copy + actions */}
      <div>
        <div style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '.25rem' }}>
          Zypto Wallet &amp; Vault Key Card
        </div>
        <div style={{ opacity: .9, marginBottom: '.6rem' }}>
          Two ways to start: manage crypto with the wallet, add tap-to-sign security with the VKC.
        </div>

        {/* Equal-height tiles; buttons bottom-aligned and hug text */}
        <div style={cards}>
          <div style={card}>
            <div style={title}>Zypto Wallet</div>
            <div style={desc}>Buy, swap, spend, and track daily ZYP rewards in-app.</div>
            <div style={{ flexGrow: 1 }} />
            <OutboundLink
              className="btn btn-primary"
              style={btnPrimary}
              href={REF_BY_PLACEMENT('promo_wallet')}
              eventName="promo_click"
              eventParams={{ product: 'wallet' }}
            >
              Download Wallet
            </OutboundLink>
          </div>

          <div style={card}>
            <div style={title}>Vault Key Card</div>
            <div style={desc}>Tap-to-sign, mobile-first cold storage for up to 3 app-created wallets.</div>
            <div style={{ flexGrow: 1 }} />
            <Link to="/vault-key-card" className="btn" style={btnGhost}>
              Learn about VKC
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Condensed Mobile (image on LEFT) ---------------- */
function MobilePromo() {
  return (
    <div style={mWrap}>
      <div style={{ gridArea: 'title', fontWeight: 900, fontSize: '1rem' }}>
        Zypto Wallet &amp; Vault Key Card
      </div>

      <div style={{ gridArea: 'image' }}>
        <img
          src={promoImg}
          alt=""
          aria-hidden="true"
          style={{ width: '100%', height: 'auto', display: 'block', maxHeight: 100, objectFit: 'contain', borderRadius: 8 }}
          loading="lazy"
        />
      </div>

      <div style={{ gridArea: 'copy', opacity: .9, fontSize: '.95rem' }}>
        Start with the Wallet or add VKC security — quick setup.
      </div>

      <div style={{ gridArea: 'actions', display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
        <OutboundLink
          className="btn btn-primary"
          style={btnPrimary}
          href={REF_BY_PLACEMENT('promo_wallet')}
          eventName="promo_click"
          eventParams={{ product: 'wallet' }}
        >
          Download Wallet
        </OutboundLink>

        <Link to="/vault-key-card" className="btn" style={btnGhost}>
          Learn about VKC
        </Link>
      </div>
    </div>
  );
}

/* ===== Shared styles ===== */
const wrap = {
  border: '1px solid rgba(255,255,255,.08)',
  borderRadius: 14,
  padding: '.9rem',
  background: 'rgba(255,255,255,.03)',
  margin: '1rem 0 0'
};

/* Desktop */
const grid = {
  display: 'grid',
  gridTemplateColumns: 'minmax(140px, 220px) 1fr',
  gap: '.9rem',
  alignItems: 'center'
};
const imgWrap = { alignSelf: 'center' };

const cards = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0,1fr))',
  gap: '.6rem',
  alignItems: 'stretch'
};
const card = {
  border: '1px solid rgba(255,255,255,.1)',
  borderRadius: 12,
  padding: '.85rem',
  background: 'rgba(255,255,255,.02)',
  display: 'grid',
  gridTemplateRows: 'auto auto 1fr auto',
  minHeight: 0
};
const title = { fontWeight: 800, marginBottom: '.25rem' };
const desc  = { opacity: .9, marginTop: '.15rem' };

const btnBase = {
  padding: '.5rem .85rem',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,.15)',
  fontWeight: 800,
  lineHeight: 1.2,
  letterSpacing: 0,
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 'auto',
  maxWidth: '100%',
  justifySelf: 'start'
};
const btnPrimary = { ...btnBase, background: 'linear-gradient(180deg, rgba(0,255,200,.28), rgba(0,255,200,.18))' };
const btnGhost   = { ...btnBase, background: 'rgba(255,255,255,.06)' };

/* Condensed mobile — IMAGE ON LEFT */
const mWrap = {
  display: 'grid',
  gridTemplateAreas: `
    "title   title"
    "image   copy"
    "image   actions"
  `,
  gridTemplateColumns: '96px 1fr', // image on the left
  gap: '.6rem',
  alignItems: 'center'
};
