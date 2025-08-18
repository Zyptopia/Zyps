// src/pages/AboutZyptoPage.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import SeoHelmet from '../components/SeoHelmet';
import Breadcrumbs from '../components/Breadcrumbs';
import OutboundLink from '../components/OutboundLink';
import SourcesDrawer from '../components/SourcesDrawer';

import { REF_BY_PLACEMENT } from '../constants';
import { trackEvent } from '../analytics';
import { breadCrumbs, faqPage } from '../seo/structuredData';

import zyptoLogo from '../assets/zyptologo.png';

export default function AboutZyptoPage() {
  useEffect(() => { trackEvent('page_view', { page: 'about_zypto' }); }, []);
  const [showSources, setShowSources] = useState(false);

  const url = 'https://www.zyptopia.org/about-zypto';
  const jsonLd = [
    breadCrumbs([
      { name: 'Home', item: 'https://www.zyptopia.org/' },
      { name: 'Learn About Zypto', item: url }
    ]),
    faqPage([
      { q: 'Is Zypto the same as Zyptopia.org?', a: 'No. Zyptopia.org is an independent, community-run site. We track rewards and provide tools; we’re not affiliated with the Zypto company or app.' },
      { q: 'What are ZYPs?', a: 'ZYPs are in-app reward points. Inside the Zypto app, 1,000 ZYP equals USD $1 for eligible redemptions where available.' },
      { q: 'Do I need an account to use Zyptopia.org?', a: 'No. You can explore charts and calculators without signing up.' }
    ])
  ];

  // Official sources used throughout this page (no styling change; just more links)
  const sources = [
    { label: 'Zypto — Official site', href: 'https://zypto.com/' },
    { label: 'Zypto Help Center – Products & Services', href: 'https://help.zypto.com/en/collections/9417704-zypto-products-services' },
    { label: 'Rewards Hub (blog/overview)', href: 'https://zypto.com/blog/zypto-app/earn-without-limits-with-the-zypto-app-rewards-hub/' },
    { label: 'Zyptopia – in-app rewards hub', href: 'https://zypto.com/crypto-app/zyptopia/' },
    { label: 'MoneyGram – Crypto to Cash (Help Center)', href: 'https://help.zypto.com/en/collections/9417704-zypto-products-services' },
    { label: 'Global Physical Cards – FAQ', href: 'https://help.zypto.com/en/articles/9664862-global-physical-cards-usd-faq' },
    { label: 'Rewards Hub Levels (Help Center)', href: 'https://help.zypto.com/en/collections/9417704-zypto-products-services' }
  ];

  return (
    <>
      <SeoHelmet
        title="Learn About Zypto"
        description="Neutral overview of the Zypto wallet, ZYP rewards, and the optional Vault Key Card."
        canonical={url}
        jsonLd={jsonLd}
      />

      <div className="page-content" style={{ maxWidth: 1080, margin: '1.5rem auto', padding: '0 1rem' }}>
        <Breadcrumbs />

        {/* HERO — concise, no CTAs; centered note; logo hidden on mobile */}
        <section style={hero.wrap} className="about-zypto-hero">
          <div style={hero.copy} className="hero-copy">
            <h1 style={{ margin: 0 }}>Learn About Zypto</h1>
            <p style={hero.sub} className="hero-sub">
              Wallet to buy, swap and spend. ZYP reward points in-app. Optional Vault Key Card for tap-to-sign security.
            </p>
            <p style={hero.note} className="hero-note">
              Zyptopia.org is independent and community-run; not affiliated with the Zypto company.
              <br />
              <button
                onClick={() => { setShowSources(true); trackEvent('sources_open', { page: 'about_zypto' }); }}
                className="link-quiet"
                style={{ display: 'inline-block', marginTop: '.25rem', textDecoration: 'underline', background: 'transparent', border: 0, color: 'inherit', cursor: 'pointer' }}
              >
                Sources
              </button>
            </p>
          </div>

          {/* Zypto logo image (desktop only; hidden on mobile via CSS) */}
          <div style={hero.media} className="hero-media">
            <img
              src={zyptoLogo}
              alt="Zypto logo"
              style={{
                width: '100%',
                height: 'auto',
                maxWidth: 340,
                display: 'block',
                borderRadius: 14,
                border: '1px solid rgba(255,255,255,.1)',
                background: 'rgba(255,255,255,.02)',
                boxShadow: '0 10px 24px rgba(0,0,0,.28)',
                padding: '1rem'
              }}
            />
          </div>
        </section>

        {/* FEATURE STRIP */}
        <section style={{ margin: '1.2rem 0 1.4rem' }}>
          <div style={featureStrip} className="feature-strip">
            <Feature icon={<IconWallet />} title="Wallet app" desc="Buy, swap, spend and manage multi-chain assets." />
            <Feature icon={<IconStar />} title="ZYP rewards" desc="In-app points; explore trends on our charts." />
            <Feature icon={<IconShield />} title="Vault Key Card" desc="Tap-to-sign cold storage for app-created wallets." />
            <Feature icon={<IconCart />} title="Real-world usage" desc="Gift cards, cards, and bill pay (where supported)." />
          </div>
        </section>

        {/* ZYP REWARDS */}
        <section style={cardSection}>
          <h2 style={h2}>ZYP rewards</h2>
          <p style={muted}>
            ZYPs are the app’s reward points—separate from any tradable crypto. They don’t move between users. In the app,
            <strong> 1,000 ZYP equals $1 USD</strong> for supported redemptions. To earn, you hold <strong>$ZYPTO</strong> and join the
            in-app rewards hub called <em>Zyptopia</em>. Your level (based on how much $ZYPTO you hold) can boost daily rewards.
          </p>

          <div style={grid3} className="grid3">
            <Tile
              title="Gift cards"
              desc="Redeem and spend with popular brands inside the app. Availability varies by region."
              links={[
                { to: 'https://zypto.com/personal/gift-cards-crypto/', label: 'Gift cards info', outbound: true }
              ]}
            />
            <Tile
              title="Cards (virtual & physical)"
              desc="Use virtual or physical cards. Some 3-D Secure merchants aren’t supported; check the in-app docs."
              links={[
                { to: 'https://help.zypto.com/en/articles/9664862-global-physical-cards-usd-faq', label: 'Card FAQ', outbound: true }
              ]}
            />
            <Tile
              title="Bill payments"
              desc="Pay utilities, phones, and more where offered. Options differ by country."
              links={[
                { to: 'https://help.zypto.com/en/collections/9417704-zypto-products-services', label: 'Bill pay help', outbound: true }
              ]}
            />
          </div>

          <ul style={ul}>
            <li>Use <Link to="/">Daily Graph</Link> to see recent averages.</li>
            <li>Browse <Link to="/historical">Historical</Link> for a longer-term view.</li>
            <li>Try <Link to="/calculator">Calculators</Link> to model simple scenarios.</li>
          </ul>

          <p style={{ ...muted, marginTop: '.6rem' }}>
            Note: <strong>“Zyptopia” (in-app)</strong> is the rewards hub inside the Zypto app. <strong>Zyptopia.org</strong> is this independent site that visualises community data. Different things.
          </p>
        </section>

        {/* SAFETY / VKC CALLOUT */}
        <section style={cardSection}>
          <h2 style={h2}>Optional security: Vault Key Card</h2>
          <p style={muted}>
            VKC adds a physical tap-to-sign step and keeps keys offline between taps. A single card can secure up to three wallets you create in the app.
          </p>
          <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/vault-key-card" className="btn" style={btn}>About VKC</Link>
          </div>
        </section>

        {/* CASH IN / OUT NOTE */}
        <section style={cardSection}>
          <h2 style={h2}>Cash in / cash out</h2>
          <p style={muted}>
            Zypto connects to partner rails (like MoneyGram for USDC cash-in/out in supported regions) and other services. Exact options depend on your country and product tier.
          </p>
        </section>

        {/* FAQ */}
        <section style={cardSection}>
          <h2 style={h2}>FAQ</h2>

          <details style={faq.details} onToggle={(e) => e.target.open && trackEvent('faq_open', { id: 'independence' })}>
            <summary style={faq.summary}>Is Zyptopia.org affiliated with Zypto or the in-app “Zyptopia”?</summary>
            <p style={faq.a}>
              No. Zyptopia.org is independent and community-run. “Zyptopia” inside the Zypto app is the official rewards hub where holders earn ZYPs.
            </p>
          </details>

          <details style={faq.details} onToggle={(e) => e.target.open && trackEvent('faq_open', { id: 'earn' })}>
            <summary style={faq.summary}>How do I earn ZYPs?</summary>
            <p style={faq.a}>
              Hold $ZYPTO and register in the app’s Zyptopia/Rewards Hub. Your level is based on your $ZYPTO and can boost daily rewards.
              Rewards vary and aren’t guaranteed.
            </p>
          </details>

          <details style={faq.details} onToggle={(e) => e.target.open && trackEvent('faq_open', { id: 'rate' })}>
            <summary style={faq.summary}>What’s the value of a ZYP?</summary>
            <p style={faq.a}>
              In-app, 1,000 ZYP = $1 USD for eligible redemptions. ZYPs are not a tradable token.
            </p>
          </details>

          <details style={faq.details} onToggle={(e) => e.target.open && trackEvent('faq_open', { id: 'transfer' })}>
            <summary style={faq.summary}>Can I transfer ZYPs to another user?</summary>
            <p style={faq.a}>
              No. ZYPs stay in your account and are used inside the app for supported redemptions.
            </p>
          </details>

          <details style={faq.details} onToggle={(e) => e.target.open && trackEvent('faq_open', { id: 'vkc' })}>
            <summary style={faq.summary}>How many wallets can one VKC secure?</summary>
            <p style={faq.a}>Up to three wallets you create in the app can be linked to a single card.</p>
          </details>

          <details style={faq.details} onToggle={(e) => e.target.open && trackEvent('faq_open', { id: '3ds' })}>
            <summary style={faq.summary}>Do Zypto cards work with every online store?</summary>
            <p style={faq.a}>
              Not every merchant is supported. Some that require 3-D Secure may not work. Always check the in-app docs and card FAQ for the latest coverage.
            </p>
          </details>
        </section>

        {/* CTA BAR — below FAQ (unchanged styling) */}
        <section style={cta.wrap}>
          <div>
            <h3 style={{ margin: 0 }}>Try the wallet, explore the data</h3>
            <p style={{ margin: '0.25rem 0 0', opacity: 0.85 }}>
              Start with the app, use our calculators/history to orient, and add VKC later if you want tap-to-sign security.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <OutboundLink
              href={REF_BY_PLACEMENT('about_zypto_bottom')}
              eventName="cta_click"
              eventParams={{ placement: 'about_zypto_bottom' }}
              className="btn btn-primary"
              style={btnPrimary}
            >
              Download Wallet
            </OutboundLink>
            <Link to="/calculator" className="btn" style={btn}>Open calculators</Link>
            <Link to="/vault-key-card" className="btn" style={btn}>About VKC</Link>
          </div>
        </section>
      </div>

      {/* Sources Drawer */}
      <SourcesDrawer
        open={showSources}
        onClose={() => { setShowSources(false); trackEvent('sources_close', { page: 'about_zypto' }); }}
        title="Official sources"
        items={sources}
      />

      {/* Responsive tweaks for mobile fluency */}
      <style>{`
        /* Hero stacks and hides image on mobile; center the note */
        @media (max-width: 900px){
          .about-zypto-hero { grid-template-columns: 1fr !important; padding: .75rem !important; }
          .about-zypto-hero .hero-media { display: none !important; }
          .about-zypto-hero .hero-note { text-align: center !important; }
        }

        /* Feature strip: 4 -> 2 -> 1 */
        @media (max-width: 1100px){
          .feature-strip { grid-template-columns: repeat(2, minmax(0,1fr)) !important; }
        }
        @media (max-width: 720px){
          .feature-strip { grid-template-columns: 1fr !important; }
        }

        /* Rewards tiles: 3 -> 2 -> 1; center link rows on small screens */
        @media (max-width: 1100px){
          .grid3 { grid-template-columns: repeat(2, minmax(0,1fr)) !important; }
        }
        @media (max-width: 720px){
          .grid3 { grid-template-columns: 1fr !important; }
          .tile-links { justify-content: center !important; }
        }
      `}</style>
    </>
  );
}

/* ====== Tiny UI helpers & styles ====== */
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
function Tile({ title, desc, links = [] }) {
  return (
    <div style={tile.card}>
      <div style={tile.title}>{title}</div>
      <div style={tile.desc}>{desc}</div>
      {links.length > 0 && (
        <div
          style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginTop: '.5rem' }}
          className="tile-links"
        >
          {links.map((l, i) =>
            l.outbound ? (
              <a key={i} className="btn" style={btn} href={l.to} target="_blank" rel="noopener noreferrer">{l.label}</a>
            ) : (
              <Link key={i} className="btn" style={btn} to={l.to}>{l.label}</Link>
            )
          )}
        </div>
      )}
    </div>
  );
}

/* Icons (inline SVGs) */
function IconWallet(){return(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="3" stroke="currentColor" opacity=".9"/><path d="M16 12h4" stroke="currentColor"/></svg>);}
function IconStar(){return(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6z" stroke="currentColor"/></svg>);}
function IconShield(){return(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3l7 3v6a7 7 0 0 1-7 7 7 7 0 0 1-7-7V6l7-3z" stroke="currentColor" opacity=".9"/><path d="M9 12l2 2 4-4" stroke="currentColor"/></svg>);}
function IconCart(){return(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="9" cy="19" r="1.5" stroke="currentColor"/><circle cx="17" cy="19" r="1.5" stroke="currentColor"/><path d="M3 5h2l2 10h10l2-7H7" stroke="currentColor"/></svg>);}

/* Style tokens */
const muted = { opacity: 0.85 };
const ul = { margin: '0.5rem 0 0 1.1rem' };

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
    gridTemplateColumns: '1.15fr .85fr',
    gap: '1.2rem',
    alignItems: 'center',
    padding: '1rem',
    borderRadius: 14,
    background: 'linear-gradient(135deg, rgba(255,255,255,.04), rgba(255,255,255,.02))',
    border: '1px solid rgba(255,255,255,.1)'
  },
  copy: { padding: '.4rem .2rem' },
  sub: { margin: '.35rem 0 .6rem', opacity: .9, fontSize: '1.05rem' },
  media: { maxWidth: 420, justifySelf: 'end', display: 'grid', placeItems: 'center' },
  note: { marginTop: '.35rem', opacity: .75, fontStyle: 'italic', fontSize: '.9rem', textAlign: 'center' }
};

const featureStrip = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0,1fr))',
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

const grid3 = {
  display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: '.6rem'
};
const tile = {
  card: {
    border: '1px solid rgba(255,255,255,.12)',
    borderRadius: 12,
    padding: '.8rem .9rem',
    background: 'rgba(255,255,255,.03)'
  },
  title: { fontWeight: 700, marginBottom: '.25rem' },
  desc: { opacity: .9 }
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
