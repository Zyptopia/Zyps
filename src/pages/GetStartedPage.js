// src/pages/GetStartedPage.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import SeoHelmet from '../components/SeoHelmet';
import Breadcrumbs from '../components/Breadcrumbs';
import OutboundLink from '../components/OutboundLink';
import SourcesDrawer from '../components/SourcesDrawer';

import { REF_BY_PLACEMENT } from '../constants';
import { trackEvent } from '../analytics';
import { breadCrumbs, faqPage, howTo } from '../seo/structuredData';

import promoImg from '../assets/vault-key-card-promo.png';

export default function GetStartedPage() {
  useEffect(() => { trackEvent('page_view', { page: 'get_started' }); }, []);
  const [showSources, setShowSources] = useState(false);

  const url = 'https://www.zyptopia.org/get-started';
  const jsonLd = [
    breadCrumbs([
      { name: 'Home', item: 'https://www.zyptopia.org/' },
      { name: 'Getting Started', item: url }
    ]),
    howTo({
      name: 'How to start with Zypto in a few minutes',
      steps: [
        { name: 'Download the wallet', text: 'Install the Zypto app from the official link and create a wallet.' },
        { name: 'Buy Zypto', text: 'Purchase Zypto in-app (where available) or transfer from another wallet so you can start earning daily rewards.' },
        { name: 'Track rewards', text: 'ZYPs are in-app points. Zypto states 1,000 ZYP equals USD $1 where available. Use Zyptopia to view daily history.' },
        { name: 'Add security (optional)', text: 'Consider the Vault Key Card for tap-to-sign cold storage on mobile.' }
      ]
    }),
    faqPage([
      { q: 'Do I need a Zyptopia account?', a: 'No. You can use the tools without signing in.' },
      { q: 'Are the calculations guaranteed?', a: 'No. They’re based on recent community averages and are for estimation only.' },
      { q: 'Is this financial advice?', a: 'No. Zyptopia.org is a community resource, not financial advice.' }
    ])
  ];

  const sources = [
    { label: 'Zypto — Official site', href: 'https://zypto.com/' },
    { label: 'Zypto Help Center', href: 'https://help.zypto.com/' }
  ];

  return (
    <>
      <SeoHelmet
        title="Getting Started"
        description="A short, neutral guide: download Zypto, buy Zypto, understand rewards, and optionally add Vault Key Card security."
        canonical={url}
        jsonLd={jsonLd}
      />

      <div className="page-content" style={{ maxWidth: 1080, margin: '1.5rem auto', padding: '0 1rem' }}>
        <Breadcrumbs />

        {/* HERO — no CTAs; centered note; image hidden on mobile */}
        <section style={hero.wrap} className="get-started-hero">
          <div style={hero.copy} className="hero-copy">
            <h1 style={{ margin: 0 }}>Getting Started</h1>
            <p style={hero.sub} className="hero-sub">
              Start in minutes: download the wallet, buy Zypto, and track daily rewards.
            </p>
            <p style={hero.note} className="hero-note">
              Zyptopia.org is independent and community-run. Nothing here is financial advice.
              <br />
              <button
                onClick={() => { setShowSources(true); trackEvent('sources_open', { page: 'get_started' }); }}
                className="link-quiet"
                style={{ display: 'inline-block', marginTop: '.25rem', textDecoration: 'underline', background: 'transparent', border: 0, color: 'inherit', cursor: 'pointer' }}
              >
                Sources
              </button>
            </p>
          </div>

          <div style={hero.media} className="hero-media">
            <div style={art.wrap} aria-hidden="true">
              <img
                src={promoImg}
                alt="Zypto wallet app and Vault Key Card"
                loading="lazy"
                decoding="async"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
          </div>
        </section>

        {/* QUICK CHOICES */}
        <section style={{ margin: '1.2rem 0 1.4rem' }}>
          <div style={choices.grid} className="choices-grid">
            <Choice
              icon={<IconDownload />}
              title="Just install the app"
              desc="Create a wallet and explore. If it’s not for you, remove it later—no commitment."
              cta={
                <OutboundLink
                  href={REF_BY_PLACEMENT('get_started_tile_download')}
                  eventName="cta_click"
                  eventParams={{ placement: 'get_started_tile_download' }}
                  className="btn"
                  style={btn}
                >
                  Download
                </OutboundLink>
              }
            />
            <Choice
              icon={<IconChart />}
              title="See current trends first"
              desc="Check recent daily averages and browse history before you decide."
              cta={
                <Link
                  to="/"
                  className="btn"
                  style={btn}
                  onClick={() => trackEvent('internal_nav', { to: 'home_graph_from_get_started' })}
                >
                  Open graph
                </Link>
              }
            />
            <Choice
              icon={<IconCalc />}
              title="Run quick estimates"
              desc="Estimate Zyps/day based on recent community averages."
              cta={<Link to="/calculator" className="btn" style={btn}>Open calculators</Link>}
            />
          </div>
        </section>

        {/* STEP TIMELINE */}
        <section style={cardSection}>
          <h2 style={h2}>Four simple steps</h2>
          <ol style={timeline.wrap} className="timeline">
            <Step n={1} title="Download the wallet" text="Install from the official link and create a wallet." />
            <Step n={2} title="Buy Zypto" text="Purchase in-app (where available) or transfer from another wallet so you can start earning rewards." />
            <Step n={3} title="Track rewards" text="ZYPs are points (1,000 ZYP = USD $1 in-app where available). Use Zyptopia to view daily history." />
            <Step n={4} title="Add security (optional)" text="Consider the Vault Key Card for tap-to-sign cold storage." />
          </ol>
        </section>

        {/* EXTRA TIPS */}
        <section style={cardSection}>
          <h2 style={h2}>Pro tips</h2>
          <ul style={ul}>
            <li>Try a small test transaction before moving larger values.</li>
            <li>Write down recovery phrases and store them securely offline.</li>
            <li>Use the Historical page’s “holdings” box to see per-day estimates for your amount.</li>
          </ul>
        </section>

        {/* CTA BAR */}
        <section style={cta.wrap}>
          <div>
            <h3 style={{ margin: 0 }}>Ready?</h3>
            <p style={{ margin: '0.25rem 0 0', opacity: 0.85 }}>
              You can always come back here to check averages or tweak assumptions.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap' }}>
            <OutboundLink
              href={REF_BY_PLACEMENT('get_started_bottom_download')}
              eventName="cta_click"
              eventParams={{ placement: 'get_started_bottom_download' }}
              className="btn btn-primary"
              style={btnPrimary}
            >
              Download Zypto
            </OutboundLink>
            <Link to="/historical" className="btn" style={btn}>See historical</Link>
            <Link to="/vault-key-card" className="btn" style={btn}>About VKC</Link>
            <Link to="/faq" className="btn" style={btn}>FAQ</Link>
          </div>
        </section>
      </div>

      {/* Sources Drawer */}
      <SourcesDrawer
        open={showSources}
        onClose={() => { setShowSources(false); trackEvent('sources_close', { page: 'get_started' }); }}
        title="Official sources"
        items={sources}
      />

      {/* Responsive tweaks (ONLY hero + card buttons) */}
      <style>{`
        /* Hero: stack and hide image on mobile */
        @media (max-width: 900px){
          .get-started-hero { grid-template-columns: 1fr !important; padding: .75rem !important; }
          .get-started-hero .hero-media { display: none !important; }
        }
        @media (max-width: 760px){
          .get-started-hero .hero-copy h1 { font-size: 1.28rem !important; }
          .get-started-hero .hero-sub { font-size: .96rem !important; margin: .35rem 0 .4rem !important; }
          .get-started-hero .hero-note { font-size: .88rem !important; margin-top: .35rem !important; }
        }

        /* Choices grid remains responsive from previous version */
        @media (max-width: 1100px){
          .choices-grid { grid-template-columns: repeat(2, minmax(0,1fr)) !important; }
        }
        @media (max-width: 720px){
          .choices-grid { grid-template-columns: 1fr !important; }
          /* Center the card header, text, and CTA button on mobile */
          .choice-head { justify-content: center !important; }
          .choice-text { text-align: center !important; }
          .choice-icon { margin: 0 auto !important; }
          .choice-cta { display: flex !important; justify-content: center !important; }
        }

        /* Timeline compaction on mobile (kept) */
        @media (max-width: 720px){
          .timeline li { grid-template-columns: 34px 1fr !important; }
        }
      `}</style>
    </>
  );
}

/* ====== UI helpers ====== */
function Choice({ icon, title, desc, cta }) {
  return (
    <div style={choice.card} className="choice-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '.55rem' }} className="choice-head">
        <div style={choice.icon} className="choice-icon">{icon}</div>
        <div className="choice-text">
          <div style={choice.title} className="choice-title">{title}</div>
          <div style={choice.desc} className="choice-desc">{desc}</div>
        </div>
      </div>
      <div className="choice-cta" style={{ marginTop: '.4rem' }}>{cta}</div>
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

/* Icons */
function IconDownload(){return(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3v12m0 0l-4-4m4 4l4-4" stroke="currentColor"/><path d="M4 19h16" stroke="currentColor"/></svg>);}
function IconChart(){return(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 19h16M6 16l3-4 3 2 6-7" stroke="currentColor"/></svg>);}
function IconCalc(){return(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor"/><path d="M8 8h8M8 12h3M8 16h3" stroke="currentColor"/></svg>);}

/* Style tokens (consistent) */
const btn = {
  padding: '0.55rem 0.9rem',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.15)',
  background: 'rgba(255,255,255,0.06)',
  fontWeight: 600
};
const btnPrimary = { ...btn, background: 'rgba(255,255,255,0.12)' };

/* Hero tokens */
const hero = {
  wrap: {
    display: 'grid',
    gridTemplateColumns: '1.15fr .85fr',
    gap: '1.1rem',
    alignItems: 'center',
    padding: '.9rem',
    borderRadius: 14,
    background: 'linear-gradient(135deg, rgba(255,255,255,.04), rgba(255,255,255,.02))',
    border: '1px solid rgba(255,255,255,.1)'
  },
  copy: { padding: '.25rem .15rem' },
  sub: { margin: '.35rem 0 .55rem', opacity: .9, fontSize: '1rem' },
  media: { maxWidth: 360, justifySelf: 'end', width: '100%' },
  note: { marginTop: '.4rem', opacity: .75, fontStyle: 'italic', fontSize: '.9rem', textAlign: 'center' }
};

const art = {
  wrap: {
    width: '100%',
    aspectRatio: '260/170',
    borderRadius: 12,
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,.1)'
  }
};

const choices = {
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: '.7rem' }
};
const choice = {
  card: {
    display: 'grid', gap: '.6rem',
    border: '1px solid rgba(255,255,255,.12)',
    borderRadius: 12,
    padding: '.8rem .9rem',
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
const ul = { margin: '0.5rem 0 0 1.1rem' };

const timeline = {
  wrap: { listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '.85rem' },
  item: { display: 'grid', gridTemplateColumns: '38px 1fr', gap: '.7rem', alignItems: 'start' },
  badge: {
    width: 38, height: 38, borderRadius: '50%', display: 'grid', placeItems: 'center',
    border: '1px solid rgba(255,255,255,.2)', background: 'rgba(255,255,255,.06)', fontWeight: 700
  },
  title: { fontWeight: 700, marginBottom: '.15rem' }
};

const cta = {
  wrap: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: '.8rem', flexWrap: 'wrap',
    border: '1px solid rgba(255,255,255,.12)', borderRadius: 12, padding: '.75rem .9rem',
    background: 'linear-gradient(135deg, rgba(255,255,255,.04), rgba(255,255,255,.02))', margin: '1rem 0'
  }
};
