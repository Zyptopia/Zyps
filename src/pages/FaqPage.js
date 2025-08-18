// src/pages/FAQPage.js
import React, { useEffect } from 'react';
import SeoHelmet from '../components/SeoHelmet';
import Breadcrumbs from '../components/Breadcrumbs';
import { trackEvent } from '../analytics';
import { breadCrumbs, faqPage as faqLD } from '../seo/structuredData';

// Brand image
import siteLogo from '../assets/logo.png';

// Expanded, plain-spoken FAQ
const QA = [
  {
    q: 'What is Zyptopia.org?',
    a: 'An independent, community-run site. We publish community-tracked reward data and simple tools. We’re not the Zypto company and we’re not the in-app “Zyptopia” area.'
  },
  {
    q: 'What is “Zyptopia” in the Zypto app, and how is it different from Zyptopia.org?',
    a: 'Inside the Zypto app, “Zyptopia” (a.k.a. Rewards Hub) is where you see your level, perks and claim rewards. Zyptopia.org is separate — a public website with charts and calculators built by the community.'
  },
  {
    q: 'What are ZYPs?',
    a: 'ZYPs are in-app reward points — not a tradable token. In the app, 1,000 ZYP = USD $1 where redemptions are available.'
  },
  {
    q: 'Can I send ZYPs to other people or trade them?',
    a: 'No. ZYPs are not transferable between users and not tradable on exchanges.'
  },
  {
    q: 'How do daily rewards work?',
    a: 'Zypto allocates a share of fees to a daily pool. Rewards are then distributed among $ZYPTO holders who have registered their wallet in the app’s Zyptopia/Rewards Hub.'
  },
  {
    q: 'Do I need to hold $ZYPTO to earn ZYPs?',
    a: 'Yes. Rewards are distributed to wallets that hold $ZYPTO and are registered in the app’s Zyptopia/Rewards Hub.'
  },
  {
    q: 'Does holding $ZYPTO change my level or perks?',
    a: 'Yes. Holding $ZYPTO boosts your Rewards Hub base level, which can increase perks like cashback.'
  },
  {
    q: 'Where do I find Zyptopia / Rewards Hub in the app?',
    a: 'Open the Zypto app. On the main screen you’ll see “Rewards Hub” under your balances. Tap it to view level, perks, quests and claims.'
  },
  {
    q: 'How long do I have to claim daily rewards?',
    a: 'There’s a claim window — unclaimed rewards expire after a short period. Open the app’s Zyptopia/Rewards Hub and tap CLAIM to keep current.'
  },
  {
    q: 'Can I cash out or spend value from the app?',
    a: 'Spending options are in the Zypto ecosystem (cards, gift cards, bill pay, and cash-in/cash-out rails in supported regions). Availability varies by country and product tier.'
  },
  {
    q: 'Is anything here financial advice?',
    a: 'No. Nothing on Zyptopia.org is financial advice.'
  }
];

export default function FAQPage() {
  useEffect(() => { trackEvent('page_view', { page: 'faq' }); }, []);

  const url = 'https://www.zyptopia.org/faq';
  const jsonLd = [
    breadCrumbs([
      { name: 'Home', item: 'https://www.zyptopia.org/' },
      { name: 'FAQ', item: url }
    ]),
    faqLD(QA.map(({ q, a }) => ({ q, a })))
  ];

  return (
    <>
      <SeoHelmet
        title="FAQ – Zyptopia.org"
        description="Common questions about Zyptopia.org, ZYP rewards, and the in-app Zyptopia (Rewards Hub)."
        canonical={url}
        jsonLd={jsonLd}
      />

      <div className="page-content" style={{ maxWidth: 1080, margin: '1.5rem auto', padding: '0 1rem' }}>
        <Breadcrumbs />

        {/* HERO (kept light; mobile stacks nicely) */}
        <section style={hero.wrap} className="faq-hero">
          <div style={hero.copy}>
            <h1 style={{ margin: 0 }}>Frequently asked questions</h1>
            <p style={hero.sub}>Short, factual answers about the site, ZYPs, $ZYPTO, and the in-app Zyptopia.</p>
          </div>
          <div style={hero.media} aria-hidden="true">
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

        {/* Q&A list */}
        <section style={cardSection}>
          <div style={{ display: 'grid', gap: '.6rem' }}>
            {QA.map((item, i) => (
              <details key={i} style={qa.card} onToggle={(e) => e.target.open && trackEvent('faq_open', { i })}>
                <summary style={qa.sum}>{item.q}</summary>
                <div style={{ padding: '.45rem .6rem .6rem' }}>{item.a}</div>
              </details>
            ))}
          </div>
        </section>
      </div>

      <style>{`
        @media (max-width: 900px){
          .faq-hero { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}

/* tokens copied from your pages for consistency */
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
  media: { maxWidth: 420, justifySelf: 'end' }
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

const qa = {
  card: {
    border: '1px solid rgba(255,255,255,.12)',
    borderRadius: 12,
    background: 'rgba(255,255,255,.03)'
  },
  sum: { padding: '.55rem .6rem', cursor: 'pointer', userSelect: 'none', fontWeight: 700 }
};
