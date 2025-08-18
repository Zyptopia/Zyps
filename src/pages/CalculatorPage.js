// src/pages/CalculatorPage.js
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import SeoHelmet from '../components/SeoHelmet';
import Breadcrumbs from '../components/Breadcrumbs';
import OutboundLink from '../components/OutboundLink';
import { REF_BY_PLACEMENT } from '../constants';
import { trackEvent } from '../analytics';
import { breadCrumbs } from '../seo/structuredData';

import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

// (hero image removed)

const USD_PER_ZYP = 1 / 1000; // 1,000 ZYP = $1

// Helpers
const dateAsc = (a, b) => new Date(a.date) - new Date(b.date);
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const fmt = (n, digits = 2) =>
  Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: digits });

function startDateFor(tf) {
  const now = new Date();
  const map = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
  if (!tf || tf === 'all' || !map[tf]) return new Date(0);
  const d = new Date(now);
  d.setDate(now.getDate() - map[tf]);
  d.setHours(0, 0, 0, 0);
  return d;
}
function percentile(arr, p) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const idx = clamp(Math.ceil((p / 100) * s.length) - 1, 0, s.length - 1);
  return s[idx];
}
function sevenDayBestWindow(values, labels) {
  if (values.length < 7) return { avg: 0, start: null };
  let best = -Infinity;
  let bestStart = 0;
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    const v = values[i] ?? 0;
    sum += v;
    if (i >= 7) sum -= values[i - 7] ?? 0;
    if (i >= 6) {
      const avg = sum / 7;
      if (avg > best) { best = avg; bestStart = i - 6; }
    }
  }
  return { avg: best, start: labels[bestStart] ?? null };
}
function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
function fmtDate(d) {
  if (!d) return '—';
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const da = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${da}`;
}

export default function CalculatorPage() {
  useEffect(() => { trackEvent('page_view', { page: 'calculator' }); }, []);

  // Inputs
  const [holdings, setHoldings] = useState(1_000_000); // Zypto tokens
  const [timeframe, setTimeframe] = useState('30d');    // default window
  const [extra, setExtra] = useState(0);                // "what if I add more" tokens

  // Scenario selector: cons | base | opt | g10 | g100 | g1000
  const [scenario, setScenario] = useState('opt');

  // Data load
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const snap = await getDocs(collection(db, 'rewards'));
        const docs = snap.docs.map(d => d.data()).filter(Boolean).sort(dateAsc);
        if (live) setRows(docs);
      } catch {
        /* ignore for now */
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => { live = false; };
  }, []);

  // Filter by timeframe
  const filtered = useMemo(() => {
    const start = startDateFor(timeframe);
    return rows.filter(r => {
      const dt = new Date(r.date);
      dt.setHours(0,0,0,0);
      return dt >= start;
    });
  }, [rows, timeframe]);

  const labels = useMemo(() => filtered.map(r => r.date), [filtered]);
  const values = useMemo(() => filtered.map(r => Number(r.rewardPerToken) || 0), [filtered]);

  // Averages
  const baseAvg = useMemo(() => {
    if (!values.length) return 0;
    const sum = values.reduce((a,b) => a + (b ?? 0), 0);
    return sum / values.length;
  }, [values]);

  const consAvg = useMemo(() => {
    if (!values.length) return 0;
    return Math.max(percentile(values, 25), baseAvg * 0.85);
  }, [values, baseAvg]);

  const optAvg = useMemo(() => {
    if (!values.length) return 0;
    return percentile(values, 75);
  }, [values]);

  const best7 = useMemo(() => sevenDayBestWindow(values, labels), [values, labels]);

  // Scenario per 1 million (growth derived from optimistic)
  const scenarioPer1M = useMemo(() => {
    switch (scenario) {
      case 'cons':  return consAvg;
      case 'base':  return baseAvg;
      case 'opt':   return optAvg;
      case 'g10':   return optAvg * 10;
      case 'g100':  return optAvg * 100;
      case 'g1000': return optAvg * 1000;
      default:      return optAvg;
    }
  }, [scenario, consAvg, baseAvg, optAvg]);

  const scenarioLabel = {
    cons:  'Conservative',
    base:  'Base average',
    opt:   'Optimistic',
    g10:   '10× activity',
    g100:  '100× activity',
    g1000: '1000× activity'
  }[scenario];

  const scenarioNote = {
    cons:  '25th percentile or 85% of base',
    base:  'Current average',
    opt:   '75th percentile',
    g10:   'Hypothetical scale-up (from optimistic)',
    g100:  'Hypothetical scale-up (from optimistic)',
    g1000: 'Hypothetical scale-up (from optimistic)'
  }[scenario];

  // Core calc for selected scenario
  const mult = holdings / 1_000_000;
  const extraMult = (holdings + extra) / 1_000_000;

  const dailySel   = scenarioPer1M * mult;
  const yearlySel  = dailySel * 365;

  const dailySelUSD  = dailySel * USD_PER_ZYP;
  const yearlySelUSD = yearlySel * USD_PER_ZYP;

  // Totals with extra, based on selected scenario
  const dailyCurrentZYP = scenarioPer1M * mult;
  const dailyWithExtraZYP = scenarioPer1M * extraMult;

  const dailyCurrentUSD = dailyCurrentZYP * USD_PER_ZYP;
  const dailyWithExtraUSD = dailyWithExtraZYP * USD_PER_ZYP;

  const deltaDailyZyp   = dailyWithExtraZYP - dailyCurrentZYP;
  const deltaYearlyZyp  = deltaDailyZyp * 365;
  const deltaDailyUSD   = dailyWithExtraUSD - dailyCurrentUSD;
  const deltaYearlyUSD  = deltaYearlyZyp * USD_PER_ZYP;

  const url = 'https://www.zyptopia.org/calculator';
  const jsonLd = [
    breadCrumbs([
      { name: 'Home', item: 'https://www.zyptopia.org/' },
      { name: 'Calculator', item: url }
    ])
  ];

  // Goal Seeker (uses selected scenario)
  const [goalUnit, setGoalUnit] = useState('usd'); // 'usd' | 'zyp'
  const [goalUsd, setGoalUsd] = useState(25);
  const [goalZyp, setGoalZyp] = useState(25000);

  const goalZypPerDay = goalUnit === 'usd' ? (goalUsd / USD_PER_ZYP) : goalZyp;
  const tokensNeededRaw = useMemo(() => {
    if (!scenarioPer1M) return 0;
    const millions = goalZypPerDay / scenarioPer1M;
    return millions * 1_000_000;
  }, [goalZypPerDay, scenarioPer1M]);
  const tokensNeeded = Math.ceil(tokensNeededRaw / 100_000) * 100_000;

  // Milestone Countdown (selected scenario)
  const [milestoneUsd, setMilestoneUsd] = useState(1000);
  const dailyUsd = dailySelUSD || 0;
  const daysToMilestone = dailyUsd > 0 ? Math.ceil(milestoneUsd / dailyUsd) : null;
  const milestoneDate = daysToMilestone != null ? addDays(new Date(), daysToMilestone) : null;

  return (
    <>
      <SeoHelmet
        title="Zyps Calculator"
        description="Estimate daily and yearly ZYP rewards by timeframe and scenario. Includes Goal Seeker and Milestone Countdown."
        canonical={url}
        jsonLd={jsonLd}
      />

      <div className="page-content" style={{ maxWidth: 1080, margin: '1.5rem auto', padding: '0 1rem' }}>
        <Breadcrumbs />

        {/* Compact page info (replaces large hero) */}
        <section style={infoNote.wrap} aria-label="About this calculator">
          <div><strong>How it works:</strong> Estimates from community-tracked daily averages. Choose timeframe and scenario.</div>
          <div style={infoNote.sub}>$1 USD = 1,000 ZYP. Estimates only — not financial advice.</div>
        </section>

        {/* TIMEFRAME + HOLDINGS */}
        <section style={cardSection}>
          <h2 style={h2}>Inputs</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.7rem' }}>
            <div>
              <div style={label}>Timeframe</div>
              <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
                {['7d', '30d', '90d', '1y', 'all'].map(tf => (
                  <button
                    key={tf}
                    className="btn"
                    onClick={() => setTimeframe(tf)}
                    style={{
                      ...btn,
                      ...(timeframe === tf
                        ? { background: 'rgba(0,231,198,.12)', boxShadow: '0 0 0 2px rgba(0,231,198,.18) inset' }
                        : null)
                    }}
                    aria-pressed={timeframe === tf ? 'true' : 'false'}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={label}>Zypto held</div>
              <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1000}
                  value={holdings}
                  onChange={(e) => setHoldings(Number(e.target.value || 0))}
                  style={input}
                  aria-label="Zypto tokens held"
                />
                {/* helper removed */}
              </div>
            </div>
          </div>

          {loading ? <p style={{ opacity: .85, marginTop: '.8rem' }}>Loading recent rewards…</p> : null}
        </section>

        {/* SCENARIO SELECTOR + SINGLE CARD */}
        <section style={cardSection}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '.75rem', flexWrap: 'wrap' }}>
            <h2 style={h2}>Projection</h2>

            {/* Condensed scenario switcher */}
            <div role="group" aria-label="Scenario" style={{ display: 'flex', gap: '.35rem', flexWrap: 'wrap' }}>
              {[
                { key: 'cons',  label: 'Conservative' },
                { key: 'base',  label: 'Base' },
                { key: 'opt',   label: 'Optimistic' },
                { key: 'g10',   label: '10×' },
                { key: 'g100',  label: '100×' },
                { key: 'g1000', label: '1000×' }
              ].map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setScenario(opt.key)}
                  className="btn"
                  style={{
                    padding: '.45rem .7rem',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,.15)',
                    background: scenario === opt.key ? 'rgba(0,231,198,.14)' : 'rgba(255,255,255,.06)',
                    fontWeight: 700
                  }}
                  aria-pressed={scenario === opt.key ? 'true' : 'false'}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Single, bold card for selected scenario */}
          <SingleProjCard
            title={scenarioLabel}
            note={scenarioNote}
            vDaily={dailySel}
            vYearly={yearlySel}
            emphasize
          />

          <div style={{ marginTop: '.6rem', fontSize: '.95rem', opacity: .9 }}>
            Selected avg per 1 million: {fmt(scenarioPer1M, 2)} ZYP/day.&nbsp;
            {best7.start ? (
              <span>
                Best 7-day streak in window: {fmt(best7.avg, 2)} ZYP/day starting {best7.start}.
              </span>
            ) : null}
          </div>
        </section>

        {/* MILESTONE COUNTDOWN — uses SELECTED scenario */}
        <section style={cardSection}>
          <h2 style={h2}>Milestone countdown</h2>
          <div style={{ display: 'grid', gap: '.6rem' }}>
            <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ opacity: .9 }}>How soon to reach</span>
              <div style={{ display: 'flex', gap: '.3rem', flexWrap: 'wrap' }}>
                {[100, 500, 1000, 5000].map(v => (
                  <button key={v} className="btn" onClick={() => setMilestoneUsd(v)} style={{ padding: '.3rem .55rem' }}>
                    ${v}
                  </button>
                ))}
              </div>
              <span style={{ opacity: .9 }}>or enter:</span>
              <input
                type="number"
                min={0}
                step={50}
                value={milestoneUsd}
                onChange={(e) => setMilestoneUsd(Number(e.target.value || 0))}
                style={input}
                aria-label="Milestone USD"
              />
            </div>

            <div style={grid2}>
              <Stat label="Daily (selected scenario)" value={`$${fmt(dailyUsd, 2)} / day`} />
              <Stat label="Days to reach" value={daysToMilestone != null ? `${daysToMilestone} day${daysToMilestone === 1 ? '' : 's'}` : '—'} />
              <Stat label="Target date" value={daysToMilestone != null ? fmtDate(milestoneDate) : '—'} />
              <Stat label="Yearly at this pace" value={`$${fmt(yearlySelUSD, 0)}`} />
            </div>
          </div>
        </section>

        {/* WHAT IF (uses SELECTED scenario) */}
        <section style={cardSection}>
          <h2 style={h2}>What if I add more?</h2>
          <div style={{ display: 'grid', gap: '.6rem' }}>
            <input
              type="range"
              min={0}
              max={5_000_000}
              step={100_000}
              value={extra}
              onChange={(e) => setExtra(Number(e.target.value || 0))}
              aria-label="Additional Zypto tokens"
              style={{ width: '100%' }}
            />
            {/* Explicit readout: extra and totals */}
            <div style={{ display: 'grid', gap: '.35rem' }}>
              <div><strong>Additional:</strong> {fmt(extra, 0)} tokens</div>
              <div style={{ opacity: .85 }}>New total: <strong>{fmt(holdings + extra, 0)}</strong> tokens</div>
            </div>

            {/* Current vs New (scenario-based) */}
            <div style={grid2}>
              <Stat label="Current daily ZYP" value={`${fmt(dailyCurrentZYP, 2)} ZYP`} />
              <Stat label="New daily ZYP" value={`${fmt(dailyWithExtraZYP, 2)} ZYP`} />
              <Stat label="Current daily USD" value={`$${fmt(dailyCurrentUSD, 2)}`} />
              <Stat label="New daily USD" value={`$${fmt(dailyWithExtraUSD, 2)}`} />
            </div>

            {/* Deltas */}
            <div style={grid2}>
              <Stat label="Extra daily ZYP" value={`${fmt(deltaDailyZyp, 2)} ZYP`} />
              <Stat label="Extra yearly ZYP" value={`${fmt(deltaYearlyZyp, 0)} ZYP`} />
              <Stat label="Extra daily USD" value={`$${fmt(deltaDailyUSD, 2)}`} />
              <Stat label="Extra yearly USD" value={`$${fmt(deltaYearlyUSD, 0)} USD`} />
            </div>

            <p style={{ margin: 0, opacity: .8, fontSize: '.95rem' }}>
              Based on selected scenario: {scenarioLabel.toLowerCase()}.
            </p>
          </div>
        </section>

        {/* GOAL SEEKER — bottom (above CTA) */}
        <section style={cardSection}>
          <h2 style={h2}>Goal Seeker</h2>
          <div style={{ display: 'grid', gap: '.6rem' }}>
            {/* Unit toggle + chips */}
            <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ opacity: .9 }}>I want</span>
              <div role="group" aria-label="Goal units" style={{ display: 'inline-flex', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,.15)' }}>
                {[
                  { k: 'usd', label: '$ / day' },
                  { k: 'zyp', label: 'ZYP / day' }
                ].map(opt => (
                  <button
                    key={opt.k}
                    onClick={() => setGoalUnit(opt.k)}
                    className="btn"
                    style={{
                      padding: '.45rem .7rem',
                      background: goalUnit === opt.k ? 'rgba(0,231,198,.14)' : 'rgba(255,255,255,.04)',
                      border: 'none',
                      fontWeight: 700
                    }}
                    aria-pressed={goalUnit === opt.k ? 'true' : 'false'}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {goalUnit === 'usd' && (
                <div style={{ display: 'flex', gap: '.3rem', flexWrap: 'wrap' }}>
                  {[10, 25, 50, 100].map(v => (
                    <button key={v} className="btn" onClick={() => setGoalUsd(v)} style={{ padding: '.3rem .55rem' }}>
                      ${v}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {goalUnit === 'usd' ? (
                <>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={goalUsd}
                    onChange={(e) => setGoalUsd(Number(e.target.value || 0))}
                    style={input}
                    aria-label="Target USD per day"
                  />
                  <span style={{ opacity: .85 }}>/ day</span>
                </>
              ) : (
                <>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={goalZyp}
                    onChange={(e) => setGoalZyp(Number(e.target.value || 0))}
                    style={input}
                    aria-label="Target ZYP per day"
                  />
                  <span style={{ opacity: .85 }}>/ day in ZYP</span>
                </>
              )}
            </div>

            {/* Result (clean, mobile-first) */}
            <div className="goal-grid" style={gridGoal}>
              <GoalCard
                title="Based on selected scenario"
                note={scenarioLabel}
                tokensRequired={tokensNeeded}
                millions={tokensNeeded ? tokensNeeded / 1_000_000 : 0}
                holdings={holdings}
              />
            </div>
          </div>
        </section>

        {/* CTA BAR */}
        <section style={cta.wrap}>
          <div>
            <h3 style={{ margin: 0 }}>Ready to turn projections into progress?</h3>
            <p style={{ margin: '0.25rem 0 0', opacity: 0.85 }}>
              Install the wallet in minutes. Come back anytime to check averages and plan next steps.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap' }}>
            <OutboundLink
              href={REF_BY_PLACEMENT('calc_footer')}
              eventName="cta_click"
              eventParams={{ placement: 'calc_footer' }}
              className="btn btn-primary"
              style={btnPrimary}
            >
              Download Zypto Wallet
            </OutboundLink>
            <Link to="/get-started" className="btn" style={btn}>Quick start guide</Link>
            <Link to="/vault-key-card" className="btn" style={btn}>Add VKC security</Link>
          </div>
        </section>
      </div>

      <style>{`
        @media (max-width: 900px){
          .calc-hero { grid-template-columns: 1fr !important; }
        }
        /* Goal Seeker: make result a single column on small screens */
        @media (max-width: 700px){
          .goal-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}

/* ==== compact single-card projection (emphasized) ==== */
function SingleProjCard({ title, note, vDaily, vYearly, emphasize = false }) {
  const usdDaily = vDaily * USD_PER_ZYP;
  const usdYear  = vYearly * USD_PER_ZYP;
  return (
    <div style={{
      border: '1px solid rgba(255,255,255,.12)',
      borderRadius: 12,
      padding: '.9rem 1rem',
      background: emphasize ? 'rgba(0,231,198,.08)' : 'rgba(255,255,255,.03)'
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '.6rem' }}>
        <div style={{ fontWeight: 900 }}>{title}</div>
        <div style={{ opacity: .8, fontSize: '.9rem' }}>{note}</div>
      </div>

      <div style={{ marginTop: '.45rem', display: 'grid', gap: '.25rem' }}>
        <div><strong>Daily:</strong> {fmt(vDaily, 2)} ZYP <span style={{ opacity: .85 }}>(${fmt(usdDaily, 2)})</span></div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '.4rem' }}>
          <strong>Yearly:</strong>
          <span>{fmt(vYearly, 0)} ZYP</span>
          <span style={{ opacity: .85 }}>(</span>
          <span style={{ fontWeight: 900, fontSize: '1.05rem' }}>${fmt(usdYear, 0)}</span>
          <span style={{ opacity: .85 }}>)</span>
        </div>
      </div>
    </div>
  );
}

function GoalCard({ title, note, tokensRequired /* millions kept for calc only */, millions, holdings = 0 }) {
  const shortfall = Math.max(tokensRequired - (holdings || 0), 0);
  const surplus = Math.max((holdings || 0) - tokensRequired, 0);
  return (
    <div style={{
      border: '1px solid rgba(255,255,255,.12)',
      borderRadius: 12,
      padding: '.85rem .95rem',
      background: 'rgba(0,231,198,.05)'
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ fontWeight: 900 }}>{title}</div>
        <div style={{ opacity: .85, fontSize: '.9rem' }}>{note}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '.4rem' }}>
        <div>Tokens needed</div>
        <div style={{ fontWeight: 900, fontSize: '1.05rem' }}>{fmt(tokensRequired, 0)}</div>
      </div>
      {/* concise, useful helper instead of Tip */}
      {shortfall > 0 ? (
        <div style={{ marginTop: '.35rem', opacity: .9 }}>
          Shortfall vs current: <strong>{fmt(shortfall, 0)}</strong> tokens
        </div>
      ) : (
        <div style={{ marginTop: '.35rem', opacity: .9 }}>
          You&apos;re exceeding this goal by <strong>{fmt(surplus, 0)}</strong> tokens
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{
      border: '1px solid rgba(255,255,255,.12)',
      borderRadius: 12,
      padding: '.75rem .85rem',
      background: 'rgba(255,255,255,.03)'
    }}>
      <div style={{ opacity: .85, fontSize: '.9rem' }}>{label}</div>
      <div style={{ fontWeight: 800, marginTop: '.15rem' }}>{value}</div>
    </div>
  );
}

/* ===== small info note ===== */
const infoNote = {
  wrap: {
    border: '1px solid rgba(255,255,255,.12)',
    borderRadius: 12,
    padding: '.75rem .9rem',
    background: 'rgba(255,255,255,.03)',
    margin: '0 0 1rem 0',
    fontSize: '.95rem'
  },
  sub: { opacity: .8, marginTop: '.2rem' }
};

/* ===== style tokens (same as your project) ===== */
const btn = {
  padding: '0.55rem 0.9rem',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.15)',
  background: 'rgba(255,255,255,0.06)',
  fontWeight: 600
};
const btnPrimary = { ...btn, background: 'rgba(255,255,255,0.12)' };

const cardSection = {
  border: '1px solid rgba(255,255,255,.1)',
  borderRadius: 12,
  padding: '1rem',
  background: 'rgba(255,255,255,.03)',
  margin: '1rem 0'
};
const h2 = { margin: 0, marginBottom: '.5rem' };
const label = { fontSize: '.95rem', opacity: .85, marginBottom: '.3rem' };
const input = {
  width: '100%',
  background: 'rgba(255,255,255,.06)',
  border: '1px solid rgba(255,255,255,.15)',
  color: 'inherit',
  borderRadius: 10,
  padding: '.55rem .6rem',
  fontWeight: 600
};

const grid2 = { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: '.6rem' };
const gridGoal = { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: '.6rem' };

const cta = {
  wrap: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: '.8rem', flexWrap: 'wrap',
    border: '1px solid rgba(255,255,255,.12)', borderRadius: 12, padding: '.75rem .9rem',
    background: 'linear-gradient(135deg, rgba(255,255,255,.04), rgba(255,255,255,.02))', margin: '1rem 0'
  }
};
