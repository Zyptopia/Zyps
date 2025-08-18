// src/pages/VaultKeyCardPage.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import SeoHelmet from '../components/SeoHelmet';
import Breadcrumbs from '../components/Breadcrumbs';
import OutboundLink from '../components/OutboundLink';
import SourcesDrawer from '../components/SourcesDrawer';

import { REF_BY_PLACEMENT } from '../constants';
import { trackEvent } from '../analytics';
import { breadCrumbs, faqPage } from '../seo/structuredData';

import cardImage from '../assets/vault-key-card-promo.png';

export default function VaultKeyCardPage() {
  useEffect(() => { trackEvent('page_view', { page: 'vault_key_card' }); }, []);
  const [showSources, setShowSources] = useState(false);

  const url = 'https://www.zyptopia.org/vault-key-card';
  const jsonLd = [
    breadCrumbs([
      { name: 'Home', item: 'https://www.zyptopia.org/' },
      { name: 'Vault Key Card', item: url }
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Vault Key Card',
      brand: { '@type': 'Brand', name: 'Zypto' },
      description: 'Tap-to-sign, mobile-first cold storage accessory for wallets you create in the Zypto app (up to three wallets per card).'
    },
    faqPage([
      { q: 'Does VKC replace seed backup?', a: 'No. Keep your recovery phrase written and stored securely. VKC adds tap-to-sign and keeps keys offline between uses.' },
      { q: 'How many wallets can I use on one VKC?', a: 'Up to three Zypto app-created wallets per card.' },
      { q: 'Is VKC battery powered?', a: 'No. It uses NFC, so there are no batteries or cables. You tap the card to your phone to sign.' }
    ])
  ];

  const sources = [
    { label: 'Vault Key Card — info', href: 'https://zypto.com/' },
    { label: 'Zypto Help Center', href: 'https://help.zypto.com/' }
  ];

  return (
    <>
      <SeoHelmet
        title="Vault Key Card"
        description="Tap-to-sign, mobile-first cold storage for wallets you create in the Zypto app."
        canonical={url}
        jsonLd={jsonLd}
      />

      <div className="page-content" style={{ maxWidth: 1080, margin: '1.5rem auto', padding: '0 1rem' }}>
        <Breadcrumbs />

        {/* HERO — concise; no CTAs; image hidden on mobile */}
        <section style={hero.wrap} className="vkc-hero-grid">
          <div style={hero.copy}>
            <h1 style={{ margin: 0 }}>Vault Key Card</h1>
            <p style={hero.sub}>Tap-to-sign cold storage for wallets you create in the Zypto app.</p>
            <p style={hero.note} className="hero-note">
              Zyptopia.org is independent and community-run. Nothing here is financial advice.
              <br />
              <button
                onClick={() => { setShowSources(true); trackEvent('sources_open', { page: 'vkc' }); }}
                className="link-quiet"
                style={{ marginTop: '.25rem', textDecoration: 'underline', background: 'transparent', border: 0, color: 'inherit', cursor: 'pointer' }}
              >
                Sources
              </button>
            </p>
          </div>
          <div style={hero.media} className="hero-media">
            <img
              src={cardImage}
              alt="Vault Key Card"
              style={{ width: '100%', height: 'auto', borderRadius: 14, boxShadow: '0 10px 30px rgba(0,0,0,0.35)' }}
            />
          </div>
        </section>

        {/* FEATURES */}
        <section style={{ margin: '1.2rem 0 1.4rem' }}>
          <div style={featureStrip} className="feature-strip">
            <Feature icon={<IconNfc />} title="Tap-to-sign (NFC)" desc="Approve transactions with a physical tap." />
            <Feature icon={<IconShield />} title="Keys stay offline" desc="Cold-storage posture between uses." />
            <Feature icon={<IconWallets />} title="Up to 3 wallets" desc="Secure multiple app-created wallets on one card." />
          </div>
        </section>

        {/* TIMELINE */}
        <section style={cardSection}>
          <h2 style={h2}>How it works</h2>
          <ol style={timeline.wrap}>
            <Step n={1} title="Create wallet in the Zypto app" text="Download Zypto and create a new wallet." />
            <Step n={2} title="Link it to your VKC" text="From the app, add a Vault Key Card and pair it to your wallet." />
            <Step n={3} title="Tap to confirm" text="When signing a transaction, you’ll be prompted to tap the card to your phone." />
          </ol>
        </section>

        {/* COMPARISON */}
        <section style={cardSection}>
          <h2 style={h2}>VKC vs. software-only</h2>
          <div style={compare.grid} className="compare-grid">
            <div style={compare.col}>
              <h3 style={compare.h3}>With VKC</h3>
              <ul style={compare.ul}>
                <li>Keys offline between uses</li>
                <li>Physical intent (tap) reduces accidental signs</li>
                <li>No cables or batteries</li>
              </ul>
            </div>
            <div style={compare.col}>
              <h3 style={compare.h3}>Software-only</h3>
              <ul style={compare.ul}>
                <li>Keys live on device</li>
                <li>No physical confirmation step</li>
                <li>Fewer moving parts, but less separation</li>
              </ul>
            </div>
          </div>
        </section>

        {/* WHY */}
        <section style={cardSection}>
          <h2 style={h2}>Why people use it</h2>
          <div style={benefits.grid} className="benefits-grid">
            <Benefit bullet="Reduce exposure of keys on a daily-use phone" />
            <Benefit bullet="Add a physical ‘are-you-sure?’ step to signing" />
            <Benefit bullet="Portable: card fits in a wallet; no charging" />
          </div>
        </section>

        {/* FAQ */}
        <section style={cardSection}>
          <h2 style={h2}>FAQ</h2>
          <details style={faq.details} onToggle={(e) => e.target.open && trackEvent('faq_open', { id: 'seed' })}>
            <summary style={faq.summary}>Does VKC replace seed backup?</summary>
            <p style={faq.a}>No. Keep your recovery phrase written and stored securely. VKC adds tap-to-sign and keeps keys offline between uses.</p>
          </details>
          <details style={faq.details} onToggle={(e) => e.target.open && trackEvent('faq_open', { id: 'wallets' })}>
            <summary style={faq.summary}>How many wallets can I use on one VKC?</summary>
            <p style={faq.a}>Up to three Zypto app-created wallets per card.</p>
          </details>
          <details style={faq.details} onToggle={(e) => e.target.open && trackEvent('faq_open', { id: 'battery' })}>
            <summary style={faq.summary}>Is VKC battery powered?</summary>
            <p style={faq.a}>No. VKC uses NFC, so there are no batteries or cables. You tap the card to your phone to sign.</p>
          </details>
        </section>

        {/* CTA BAR — below FAQ */}
        <section style={cta.wrap}>
          <div>
            <h3 style={{ margin: 0 }}>Ready to try it?</h3>
            <p style={{ margin: '0.25rem 0 0', opacity: 0.85 }}>Start in the Zypto app. You can add a VKC later from inside the app.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <OutboundLink
              href={REF_BY_PLACEMENT('vkc_bottom_download')}
              eventName="cta_click"
              eventParams={{ placement: 'vkc_bottom_download' }}
              className="btn btn-primary"
              style={btnPrimary}
            >
              Download Zypto
            </OutboundLink>
            <Link to="/about-zypto#vkc" className="btn" style={btn}>Learn more about VKC</Link>
            <Link to="/faq" className="btn" style={btn}>FAQ</Link>
          </div>
        </section>
      </div>

      {/* Sources Drawer */}
      <SourcesDrawer
        open={showSources}
        onClose={() => { setShowSources(false); trackEvent('sources_close', { page: 'vkc' }); }}
        title="Official sources"
        items={sources}
      />

      {/* Responsive tweaks */}
      <style>{`
        /* Hero stacks; hide image on small and center the note */
        @media (max-width: 860px) {
          .vkc-hero-grid { grid-template-columns: 1fr !important; }
          .vkc-hero-grid .hero-media { display: none !important; }
          .vkc-hero-grid .hero-note { text-align: center !important; }
        }
        /* Features: 3 -> 2 -> 1 */
        @media (max-width: 1100px){
          .feature-strip { grid-template-columns: repeat(2, minmax(0,1fr)) !important; }
        }
        @media (max-width: 720px){
          .feature-strip { grid-template-columns: 1fr !important; }
        }
        /* Compare grid: 2 -> 1 */
        @media (max-width: 860px){
          .compare-grid { grid-template-columns: 1fr !important; }
        }
        /* Benefits: 3 -> 2 -> 1 */
        @media (max-width: 1020px){
          .benefits-grid { grid-template-columns: repeat(2, minmax(0,1fr)) !important; }
        }
        @media (max-width: 680px){
          .benefits-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}

/* Tiny presentational helpers */
function Feature({ icon, title, desc }) {
  return (
    <div style={feature.card}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '.55rem' }}>
        <div style={feature.icon}>{icon}</div>
        <div>
          <div style={feature.title}>{title}</div>
          <div style={feature.desc}>{desc}</div>
        </div>
      </div>
    </div>
  );
}
function Step({ n, title, text }) {
  return (
    <li style={timeline.item}>
      <div style={timeline.badge}>{n}</div>
      <div>
        <div style={timeline.title}>{title}</div>
        <div style={{ opacity: .9 }}>{text}</div>
      </div>
    </li>
  );
}
function Benefit({ bullet }) {
  return (
    <div style={benefits.item}>
      <IconCheck />
      <span>{bullet}</span>
    </div>
  );
}

/* Icons */
function IconNfc(){ return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" opacity=".9"/><path d="M9 9v6M12 9v6M15 9v6" stroke="currentColor" opacity=".9"/></svg>); }
function IconShield(){ return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3l7 3v6a7 7 0 0 1-7 7 7 7 0 0 1-7-7V6l7-3z" stroke="currentColor" opacity=".9"/><path d="M9 12l2 2 4-4" stroke="currentColor" /></svg>); }
function IconWallets(){ return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="5" y="7" width="14" height="10" rx="2" stroke="currentColor" opacity=".9"/><path d="M16.5 12.5h2m-9-6l7 0" stroke="currentColor" /></svg>); }
function IconCheck(){ return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2"/></svg>); }

/* Styles */
const btn = {
  padding: '0.55rem 0.9rem',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.15)',
  background: 'rgba(255,255,255,0.06)',
  fontWeight: 600
};
const btnPrimary = { ...btn, background: 'rgba(255,255,255,0.12)' };

const hero = {
  wrap: {
    display: 'grid',
    gridTemplateColumns: '1.1fr .9fr',
    gap: '1.2rem',
    alignItems: 'center',
    padding: '1rem',
    borderRadius: 14,
    background: 'linear-gradient(135deg, rgba(255,255,255,.04), rgba(255,255,255,.02))',
    border: '1px solid rgba(255,255,255,.1)'
  },
  copy: { padding: '.4rem .2rem' },
  sub: { margin: '.35rem 0 .6rem', opacity: .9, fontSize: '1.05rem' },
  media: { maxWidth: 420, justifySelf: 'end' },
  note: { marginTop: '.35rem', opacity: .75, fontStyle: 'italic', fontSize: '.9rem', textAlign: 'center' }
};

const featureStrip = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0,1fr))',
  gap: '.7rem'
};

const feature = {
  card: {
    border: '1px solid rgba(255,255,255,.12)',
    borderRadius: 12,
    padding: '.7rem .8rem',
    background: 'rgba(255,255,255,.03)'
  },
  icon: {
    width: 38, height: 38, display: 'grid', placeItems: 'center',
    borderRadius: 10, border: '1px solid rgba(255,255,255,.18)', background: 'rgba(255,255,255,.05)'
  },
  title: { fontWeight: 700 },
  desc: { opacity: .9 }
};

const cardSection = {
  border: '1px solid rgba(255,255,255,.1)',
  borderRadius: 12,
  padding: '1rem',
  background: 'rgba(255,255,255,.03)',
  margin: '1rem 0'
};
const h2 = { margin: 0, marginBottom: '.5rem' };

const timeline = {
  wrap: { listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '.85rem' },
  item: { display: 'grid', gridTemplateColumns: '38px 1fr', gap: '.7rem', alignItems: 'start' },
  badge: {
    width: 38, height: 38, borderRadius: '50%', display: 'grid', placeItems: 'center',
    border: '1px solid rgba(255,255,255,.2)', background: 'rgba(255,255,255,.06)', fontWeight: 700
  },
  title: { fontWeight: 700, marginBottom: '.15rem' }
};

const compare = {
  grid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: '.75rem' },
  col: { border: '1px solid rgba(255,255,255,.12)', borderRadius: 12, padding: '.8rem .9rem', background: 'rgba(255,255,255,.03)' },
  h3: { margin: 0, marginBottom: '.4rem' },
  ul: { margin: 0, paddingLeft: '1.1rem' }
};

const benefits = {
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: '.6rem' },
  item: {
    display: 'flex', alignItems: 'center', gap: '.45rem',
    border: '1px solid rgba(255,255,255,.12)', borderRadius: 10, padding: '.55rem .7rem', background: 'rgba(255,255,255,.03)'
  }
};

const cta = {
  wrap: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: '.8rem', flexWrap: 'wrap',
    border: '1px solid rgba(255,255,255,.12)', borderRadius: 12, padding: '.75rem .9rem',
    background: 'linear-gradient(135deg, rgba(255,255,255,.04), rgba(255,255,255,.02))', margin: '1rem 0'
  }
};

const faq = {
  details: {
    border: '1px solid rgba(255,255,255,.12)',
    borderRadius: 10,
    padding: '.6rem .75rem',
    background: 'rgba(255,255,255,.03)',
    marginBottom: '.5rem'
  },
  summary: {
    cursor: 'pointer',
    fontWeight: 600,
    outline: 'none',
    listStyle: 'none'
  },
  a: { margin: '.45rem 0 0', opacity: 0.9 }
};
