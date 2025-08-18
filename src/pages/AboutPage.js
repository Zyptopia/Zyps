// src/pages/AboutPage.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import SeoHelmet from '../components/SeoHelmet';
import Breadcrumbs from '../components/Breadcrumbs';
import OutboundLink from '../components/OutboundLink';
import { REF_BY_PLACEMENT } from '../constants';
import { trackEvent, setAnalyticsOptOut } from '../analytics';
import { breadCrumbs } from '../seo/structuredData';

// NEW: use site logo image in hero
import siteLogo from '../assets/logo.png';

export default function AboutPage() {
  useEffect(() => { trackEvent('page_view', { page: 'about' }); }, []);

  const [optedOut, setOptedOut] = useState(
    typeof window !== 'undefined' && localStorage.getItem('zyptopia_analytics_optout') === '1'
  );

  const handleOptToggle = () => {
    const next = !optedOut;
    setAnalyticsOptOut(next);
    setOptedOut(next);
    trackEvent('analytics_opt_toggle', { opted_out: next });
  };

  const url = 'https://www.zyptopia.org/about';
  const jsonLd = [
    breadCrumbs([
      { name: 'Home', item: 'https://www.zyptopia.org/' },
      { name: 'About Zyptopia', item: url }
    ])
  ];

  return (
    <>
      <SeoHelmet
        title="About Zyptopia.org – Independent Community Project"
        description="Zyptopia.org is an independent, community-run site for tracking Zypto reward history, calculators, and neutral guides."
        canonical={url}
        jsonLd={jsonLd}
      />

      <div className="page-content" style={{ maxWidth: 1080, margin: '1.5rem auto', padding: '0 1rem' }}>
        <Breadcrumbs />

        {/* HERO (mobile-friendly layout; image hidden on small screens) */}
        <section style={hero.wrap} className="about-zyptopia-hero">
          <div style={hero.copy}>
            <h1 style={{ margin: 0 }}>About Zyptopia</h1>
            <p style={hero.sub}>
              Independent, community-run tools to help you explore Zypto: daily rewards, historical data, calculators, guides—and no sign-ups.
            </p>
            <div style={hero.ctaRow} className="hero-cta">
              <Link to="/get-started" className="btn" style={btn}>Getting started</Link>
              <Link to="/calculator" className="btn" style={btn}>Open calculators</Link>
              <Link to="/faq" className="btn" style={btn}>FAQ</Link>
            </div>
            <p style={hero.note} className="hero-note">
              We’re not affiliated with the Zypto company. Nothing here is financial advice.
              <br />
              <span style={{ opacity: 0.85 }}>
                “Zyptopia” inside the Zypto app is their rewards hub. <strong>Zyptopia.org</strong> is this independent site.
              </span>
            </p>
          </div>
          <div style={hero.media} aria-hidden="true" className="hero-media">
            <div style={art.wrap}>
              <img
                src={siteLogo}
                alt="Zyptopia.org"
                loading="lazy"
                decoding="async"
                style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', padding: '1.2rem' }}
              />
            </div>
          </div>
        </section>

        {/* WHAT WE DO */}
        <section style={cardSection}>
          <h2 style={h2}>What we do</h2>
          <div style={grid3} className="what-grid">
            <Tile title="Track the data" desc="We publish community-tracked daily rewards per 1,000,000 tokens so you can see trends over time." />
            <Tile title="Simple calculators" desc="Estimate Zyps/day and rough ROI using recent averages. No logins required." />
            <Tile title="Neutral guides" desc="Short, no-hype pages that explain the basics and link to official resources." />
          </div>
          <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap', marginTop: '.7rem', justifyContent: 'center' }}>
            <Link to="/" className="btn" style={btn}>Open graph</Link>
            <Link to="/historical" className="btn" style={btn}>Browse historical</Link>
            <Link to="/get-started" className="btn" style={btn}>Read the guide</Link>
            <Link to="/faq" className="btn" style={btn}>FAQ</Link>
          </div>
        </section>

        {/* PRIVACY & ANALYTICS */}
        <section style={cardSection}>
          <h2 style={h2}>Privacy & analytics</h2>
          <p style={muted}>
            We use privacy-aware analytics to learn what helps visitors most. We respect <em>Do Not Track</em> and
            you can toggle analytics locally at any time.
          </p>
          <button
            className="btn"
            onClick={handleOptToggle}
            style={{
              padding: '0.55rem 0.9rem',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.15)',
              background: optedOut ? 'rgba(255, 102, 102, 0.2)' : 'rgba(255,255,255,0.06)',
              fontWeight: 600
            }}
          >
            {optedOut ? 'Enable analytics on this device' : 'Disable analytics on this device'}
          </button>
        </section>

        {/* CTA */}
        <section style={cta.wrap}>
          <div>
            <h3 style={{ margin: 0 }}>Want the easiest path?</h3>
            <p style={{ margin: '0.25rem 0 0', opacity: 0.85 }}>
              Install the wallet, explore the data, and add VKC later if you want tap-to-sign security.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap' }}>
            <OutboundLink
              href={REF_BY_PLACEMENT('about_footer')}
              eventName="cta_click"
              eventParams={{ placement: 'about_footer' }}
              className="btn btn-primary"
              style={btnPrimary}
            >
              Download Zypto
            </OutboundLink>
            <Link to="/vault-key-card" className="btn" style={btn}>Learn about VKC</Link>
            <Link to="/faq" className="btn" style={btn}>FAQ</Link>
          </div>
        </section>
      </div>

      {/* Responsive tweaks for fluent mobile layout */}
      <style>{`
        /* Hero stacks; hide image; center CTAs and note on small screens */
        @media (max-width: 900px){
          .about-zyptopia-hero { grid-template-columns: 1fr !important; }
          .about-zyptopia-hero .hero-media { display: none !important; }
          .about-zyptopia-hero .hero-cta { justify-content: center !important; }
          .about-zyptopia-hero .hero-note { text-align: center !important; }
        }

        /* What we do: 3 -> 2 -> 1 */
        @media (max-width: 1100px){
          .what-grid { grid-template-columns: repeat(2, minmax(0,1fr)) !important; }
        }
        @media (max-width: 720px){
          .what-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}

/* helpers */
function Tile({ title, desc }) {
  return (
    <div style={tile.card}>
      <div style={tile.title}>{title}</div>
      <div style={tile.desc}>{desc}</div>
    </div>
  );
}

const muted = { opacity: 0.85 };

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
  media: { maxWidth: 420, justifySelf: 'end' },
  ctaRow: { display: 'flex', gap: '.6rem', flexWrap: 'wrap' },
  note: { marginTop: '.35rem', opacity: .65, fontStyle: 'italic', fontSize: '.9rem' }
};
const art = {
  wrap: {
    width: '100%', aspectRatio: '300/220', borderRadius: 14,
    overflow: 'hidden', border: '1px solid rgba(255,255,255,.1)'
  }
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
