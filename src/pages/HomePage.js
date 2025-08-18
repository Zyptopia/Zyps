// src/pages/HomePage.js
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import SeoHelmet from '../components/SeoHelmet';
import Breadcrumbs from '../components/Breadcrumbs';
import OutboundLink from '../components/OutboundLink';
import ShareGraphButton from '../components/ShareGraphButton';
import GraphEntry from '../components/GraphEntry';
import PromoBanner from '../components/PromoBanner';

import { REF_BY_PLACEMENT } from '../constants';
import { trackEvent } from '../analytics';

export default function HomePage() {
  const [avgZyps, setAvgZyps] = useState(null);
  const [timeframe, setTimeframe] = useState('30d');

  useEffect(() => { trackEvent('page_view', { page: 'home' }); }, []);

  // pickup averages broadcasted by legacy charts
  useEffect(() => {
    const handler = (e) => { if (e?.detail && typeof e.detail.value === 'number') setAvgZyps(e.detail.value); };
    window.addEventListener('zyptopia:avg', handler);
    return () => window.removeEventListener('zyptopia:avg', handler);
  }, []);

  const avgDisplay = useMemo(() => {
    if (avgZyps == null || Number.isNaN(avgZyps)) return '—';
    return Number(avgZyps).toLocaleString(undefined, { maximumFractionDigits: 2 });
  }, [avgZyps]);

  const shareText = useMemo(() => {
    const label = labelForTimeframe(timeframe);
    const avg = (avgZyps == null || Number.isNaN(avgZyps)) ? '—' :
      `${Number(avgZyps).toLocaleString(undefined,{maximumFractionDigits:2})} ZYP / 1,000,000 tokens avg`;
    return `Daily Zypto rewards (${label}). Avg: ${avg}. Explore more at https://www.zyptopia.org #Zypto #ZYP #crypto`;
  }, [avgZyps, timeframe]);

  const url = 'https://www.zyptopia.org/';
  const desc = 'Zyptopia.org – independent, community-run tools for Zypto users: daily reward history, calculators, neutral guides, and VKC overview.';

  return (
    <>
      <SeoHelmet
        title="Zyptopia.org – Community data, calculators & guides for Zypto"
        description={desc}
        canonical={url}
        jsonLd={[{ '@context':'https://schema.org','@type':'WebSite', name:'Zyptopia.org', url }]}
      />

      <div className="page-content" style={{ maxWidth: 1180, margin: '1.2rem auto', padding: '0 1rem' }}>
        <Breadcrumbs />

        <section style={card}>
          <div style={sectionHeader}>
            <div>
              <h1 style={{ margin: 0, letterSpacing: 0.2 }}>
                <span style={spark}>✦</span> Daily rewards
              </h1>
              <p style={{ margin: '.25rem 0 0', opacity: 0.9 }}>
                Community-tracked “Zyps per 1,000,000 tokens” by day.
              </p>
            </div>
            <ShareGraphButton
              targetId="shareable-graph"
              filename={`zyptopia-graph-${timeframe}.png`}
              shareText={shareText}
            />
          </div>

          <div style={controlsRow}>
            <div style={metricPill}>
              <div style={{ fontSize: '.82rem', opacity: .85, marginBottom: 2 }}>Average Daily Zyps</div>
              <div style={{ fontWeight: 900, fontSize: '1.28rem' }}>{avgDisplay}</div>
              <div style={{ fontSize: '.82rem', opacity: .75 }}>for {labelForTimeframe(timeframe)}</div>
            </div>

            <TimeframeControl value={timeframe} onChange={(tf) => { setTimeframe(tf); trackEvent('timeframe_change', { tf }); }} />
          </div>

          {/* Graph */}
          <div id="shareable-graph" style={chartWrap}>
            <GraphEntry timeframe={timeframe} onAverageChange={setAvgZyps} />
          </div>

          {/* Promo between graph and CTAs */}
          <div style={{ marginTop: '.9rem' }}>
            <PromoBanner />
          </div>

          {/* CTA row — make the Download button neutral to avoid clashing with promo */}
          <div style={ctaRow}>
            <Link to="/historical" className="btn" style={btn}>See historical</Link>
            <Link to="/calculator" className="btn" style={btn}>Open calculators</Link>
            <Link to="/get-started" className="btn" style={btn}>Getting-started guide</Link>
            <OutboundLink
              href={REF_BY_PLACEMENT('home_top_download')}
              eventName="cta_click"
              eventParams={{ placement: 'home_top_download' }}
              className="btn"
              style={btn} // <- neutral, matches others
            >
              Download Zypto
            </OutboundLink>
          </div>
        </section>

        <p style={{ marginTop: '.8rem', opacity: 0.75, fontSize: '.92rem' }}>
          Zyptopia.org is independent and community-run. Nothing here is financial advice.
        </p>
      </div>
    </>
  );
}

/* helpers & styles */
function labelForTimeframe(tf) {
  switch (tf) {
    case '7d': return 'the last 7 days';
    case '30d': return 'the last 30 days';
    case '90d': return 'the last 90 days';
    case '1y': return 'the last year';
    case 'all': return 'all time';
    default: return 'the selected period';
  }
}

function TimeframeControl({ value, onChange }) {
  const options = [
    { id: '7d', label: '7d' }, { id: '30d', label: '30d' },
    { id: '90d', label: '90d' }, { id: '1y', label: '1y' }, { id: 'all', label: 'All' },
  ];
  return (
    <div style={segmented}>
      {options.map(opt => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={'seg-btn' + (value === opt.id ? ' is-active' : '')}
          style={{
            padding: '.46rem .72rem',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,.16)',
            background: value === opt.id ? 'rgba(0,255,200,.18)' : 'rgba(255,255,255,.05)',
            boxShadow: value === opt.id ? '0 0 0 2px rgba(0,255,200,.12) inset' : 'none',
            cursor: 'pointer',
            fontWeight: 800
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

const spark = { marginRight: '.35rem', filter: 'drop-shadow(0 0 6px rgba(0,255,200,.35))' };
const card = {
  border: '1px solid rgba(255,255,255,.1)',
  borderRadius: 18,
  padding: '1rem',
  background: 'linear-gradient(135deg, rgba(255,255,255,.04), rgba(255,255,255,.02))'
};
const sectionHeader = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '.8rem', flexWrap: 'wrap', marginBottom: '.6rem' };
const controlsRow  = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '.8rem', flexWrap: 'wrap', marginBottom: '.6rem' };
const metricPill   = { border: '1px solid rgba(0,255,200,.25)', borderRadius: 14, padding: '.6rem .85rem', background: 'rgba(0,255,200,.06)', minWidth: 220, boxShadow: '0 0 0 2px rgba(0,255,200,.08) inset' };
const segmented    = { display: 'flex', gap: '.45rem', flexWrap: 'wrap' };
const chartWrap    = { border: '1px solid rgba(255,255,255,.12)', borderRadius: 14, padding: '.6rem', minHeight: 280, background: 'rgba(255,255,255,.02)' };
const ctaRow       = { display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginTop: '.8rem' };
const btn          = { padding: '.5rem .85rem', borderRadius: 12, border: '1px solid rgba(255,255,255,.15)', background: 'rgba(255,255,255,.08)', fontWeight: 700 };
