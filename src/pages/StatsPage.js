// src/pages/StatsPage.js
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

// ===== constants =====
// USD_PER_ZYP kept if you want $ conversions later (we don't show $ by default here)
const USD_PER_ZYP = 1 / 1000;

// ===== utils =====
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
function sum(arr){ return arr.reduce((a,b)=>a + (b ?? 0), 0); }
function stdev(arr){
  if (!arr.length) return 0;
  const m = sum(arr)/arr.length;
  const v = arr.reduce((acc,x)=>acc + Math.pow((x ?? 0) - m, 2), 0) / arr.length;
  return Math.sqrt(v);
}

// ===== styles (consistent with Calculator) =====
const pageWrap = { maxWidth: 1080, margin: '1.5rem auto', padding: '0 1rem' };
const cardSection = {
  border: '1px solid rgba(255,255,255,.1)',
  borderRadius: 12,
  padding: '1rem',
  background: 'rgba(255,255,255,.03)',
  margin: '1rem 0'
};
const h2 = { margin: 0, marginBottom: '.5rem' };
const smallMuted = { opacity: .8, fontSize: '.9rem' };

const btn = {
  padding: '0.55rem 0.9rem',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.15)',
  background: 'rgba(255,255,255,0.06)',
  fontWeight: 600
};
const btnPrimary = { ...btn, background: 'rgba(255,255,255,0.12)' };

const grid3 = { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: '.6rem' };
const statCard = {
  border: '1px solid rgba(255,255,255,.12)',
  borderRadius: 12,
  padding: '.75rem .85rem',
  background: 'rgba(255,255,255,.03)'
};
const cta = {
  wrap: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: '.8rem', flexWrap: 'wrap',
    border: '1px solid rgba(255,255,255,.12)', borderRadius: 12, padding: '.75rem .9rem',
    background: 'linear-gradient(135deg, rgba(255,255,255,.04), rgba(255,255,255,.02))', margin: '1rem 0'
  }
};

// ===== table cell styles =====
const th = { textAlign: 'left', padding: '.55rem .6rem', borderBottom: '1px solid rgba(255,255,255,.12)', fontWeight: 700, fontSize: '.95rem' };
const thRight = { ...th, textAlign: 'right' };
const td = { padding: '.55rem .6rem', borderBottom: '1px solid rgba(255,255,255,.08)' };
const tdRight = { ...td, textAlign: 'right' };

// ===== page =====
export default function StatsPage() {
  useEffect(() => { trackEvent('page_view', { page: 'stats' }); }, []);

  const url = 'https://www.zyptopia.org/stats';
  const jsonLd = [
    breadCrumbs([
      { name: 'Home', item: 'https://www.zyptopia.org/' },
      { name: 'Stats', item: url }
    ])
  ];

  // controls
  const [windowSel, setWindowSel] = useState('30d'); // 7d | 30d | 90d | 1y | all
  const [compareBase, setCompareBase] = useState('priorWindow'); // priorWindow | prior7d | prior30d
  const [showBreakdown, setShowBreakdown] = useState(false);

  // load
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let live = true;
    (async () => {
      try {
        setLoading(true);
        const snap = await getDocs(collection(db, 'rewards'));
        const docs = snap.docs.map(d => d.data()).filter(Boolean).sort(dateAsc);
        if (live) setRows(docs);
      } catch {
        // ignore
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => { live = false; };
  }, []);

  // filter by window
  const filtered = useMemo(() => {
    const start = startDateFor(windowSel);
    return rows.filter(r => {
      const dt = new Date(r.date);
      dt.setHours(0,0,0,0);
      return dt >= start;
    });
  }, [rows, windowSel]);

  const labels   = useMemo(() => filtered.map(r => r.date), [filtered]);
  // IMPORTANT: rewardPerToken is already "ZYP per day per 1M"
  const per1M    = useMemo(() => filtered.map(r => Number(r.rewardPerToken) || 0), [filtered]);

  // derived
  const avgPer1M   = useMemo(() => per1M.length ? sum(per1M) / per1M.length : 0, [per1M]);
  const medPer1M   = useMemo(() => {
    if (!per1M.length) return 0;
    const s = [...per1M].sort((a,b)=>a-b);
    const mid = Math.floor(s.length/2);
    return s.length % 2 ? s[mid] : (s[mid-1] + s[mid]) / 2;
  }, [per1M]);
  const p25Per1M   = useMemo(() => percentile(per1M, 25), [per1M]);
  const p75Per1M   = useMemo(() => percentile(per1M, 75), [per1M]);
  const totalPer1M = useMemo(() => sum(per1M), [per1M]);
  const nDays      = per1M.length;

  const bestDayIdx  = useMemo(() => {
    if (!per1M.length) return -1;
    let idx = 0, best = -Infinity;
    per1M.forEach((v,i) => { if (v > best) { best = v; idx = i; } });
    return idx;
  }, [per1M]);
  const bestDayVal  = bestDayIdx >= 0 ? per1M[bestDayIdx] : 0;
  const bestDayDate = bestDayIdx >= 0 ? labels[bestDayIdx] : null;

  const minDayIdx   = useMemo(() => {
    if (!per1M.length) return -1;
    let idx = 0, mn = Infinity;
    per1M.forEach((v,i) => { if (v < mn) { mn = v; idx = i; } });
    return idx;
  }, [per1M]);
  const minDayVal   = minDayIdx >= 0 ? per1M[minDayIdx] : 0;
  const minDayDate  = minDayIdx >= 0 ? labels[minDayIdx] : null;

  const best7 = useMemo(() => sevenDayBestWindow(per1M, labels), [per1M, labels]);

  const sdPer1M     = useMemo(() => stdev(per1M), [per1M]);
  const cvPct       = useMemo(() => (avgPer1M ? (sdPer1M / avgPer1M) * 100 : 0), [sdPer1M, avgPer1M]);

  // new diagnostics (details)
  const rolling7AvgPer1M = useMemo(() => {
    if (!per1M.length) return 0;
    const k = Math.min(7, per1M.length);
    return sum(per1M.slice(-k)) / k;
  }, [per1M]);
  const daysAboveMedian = useMemo(() => {
    if (!per1M.length) return { count: 0, pct: 0 };
    const count = per1M.filter(v => v > medPer1M).length;
    const pct = nDays ? (count / nDays) * 100 : 0;
    return { count, pct };
  }, [per1M, medPer1M, nDays]);

  // ----- comparison baseline helpers -----
  const startCurrent = useMemo(() => startDateFor(windowSel), [windowSel]);

  const prevAvg = useMemo(() => {
    if (!rows.length) return 0;

    const before = rows.filter(r => {
      const dt = new Date(r.date); dt.setHours(0,0,0,0);
      return dt < startCurrent;
    });

    const takeLast = (arr, n) => (n <= 0 ? [] : arr.slice(-n));
    const asPer1M = (arr) => arr.map(r => Number(r.rewardPerToken) || 0);
    const mean = (arr) => arr.length ? sum(arr)/arr.length : 0;

    if (compareBase === 'prior7d') {
      return mean(asPer1M(takeLast(before, 7)));
    }
    if (compareBase === 'prior30d') {
      return mean(asPer1M(takeLast(before, 30)));
    }
    // priorWindow (same length)
    if (windowSel === 'all') return 0;
    return mean(asPer1M(takeLast(before, nDays)));
  }, [rows, startCurrent, compareBase, windowSel, nDays]);

  const deltaAvgPct = useMemo(() => {
    const prev = prevAvg || 0;
    if (!prev) return null;
    return ((avgPer1M - prev) / prev) * 100;
  }, [avgPer1M, prevAvg]);

  // ----- records (top 3 best days in filtered window) -----
  const top3 = useMemo(() => {
    if (!per1M.length) return [];
    const arr = per1M.map((v,i) => ({ v, d: labels[i] }));
    arr.sort((a,b) => b.v - a.v);
    return arr.slice(0, 3);
  }, [per1M, labels]);

  return (
    <>
      <SeoHelmet
        title="Stats"
        description="Zyps distribution statistics by time window."
        canonical={'https://www.zyptopia.org/stats'}
        jsonLd={[
          breadCrumbs([
            { name: 'Home', item: 'https://www.zyptopia.org/' },
            { name: 'Stats', item: 'https://www.zyptopia.org/stats' }
          ])
        ]}
      />

      <div className="page-content" style={pageWrap}>
        <Breadcrumbs />

        {/* Controls */}
        <section style={cardSection} aria-live="polite">
          <h2 style={h2}>Window</h2>
          <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
            {['7d', '30d', '90d', '1y', 'all'].map(w => (
              <button
                key={w}
                onClick={() => setWindowSel(w)}
                className="btn"
                style={{
                  ...btn,
                  ...(windowSel === w
                    ? { background: 'rgba(0,231,198,.12)', boxShadow: '0 0 0 2px rgba(0,231,198,.18) inset' }
                    : null)
                }}
                aria-pressed={windowSel === w ? 'true' : 'false'}
              >
                {w}
              </button>
            ))}
          </div>

          <div style={{ marginTop: '.6rem' }}>
            <div style={{ ...smallMuted, marginBottom: '.25rem' }}>Compare vs</div>
            <div role="group" aria-label="Comparison baseline" style={{ display: 'flex', gap: '.35rem', flexWrap: 'wrap' }}>
              {[
                ['priorWindow','Prior window'],
                ['prior7d','Prior 7d'],
                ['prior30d','Prior 30d']
              ].map(([key,label]) => (
                <button
                  key={key}
                  onClick={() => setCompareBase(key)}
                  className="btn"
                  style={{
                    ...btn,
                    ...(compareBase === key
                      ? { background: 'rgba(0,231,198,.12)', boxShadow: '0 0 0 2px rgba(0,231,198,.18) inset' }
                      : null)
                  }}
                  aria-pressed={compareBase === key ? 'true' : 'false'}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {loading ? <p style={{ opacity: .85, marginTop: '.8rem' }}>Loading…</p> : null}
          <p style={{ marginTop: '.6rem', ...smallMuted }}>
            Based on the selected window. Values are estimates (per 1M tokens).
          </p>
        </section>

        {/* Key Stats */}
        <section style={cardSection}>
          <h2 style={h2}>Key stats</h2>
          <div className="stats-grid" style={grid3}>
            <StatCard
              label="Avg ZYP/day per 1M"
              value={fmt(avgPer1M, 2)}
              sub={deltaAvgPct == null ? undefined : `${deltaAvgPct >= 0 ? '▲' : '▼'} ${fmt(Math.abs(deltaAvgPct), 1)}% vs baseline`}
            />
            <StatCard
              label="Total ZYP (selected window)"
              value={fmt(totalPer1M, 0)}
              sub={`${nDays} day${nDays === 1 ? '' : 's'}`}
            />
            <StatCard
              label="Best day"
              value={fmt(bestDayVal, 2)}
              sub={bestDayDate ? `on ${bestDayDate}` : undefined}
            />
          </div>
          <div className="stats-grid" style={{ ...grid3, marginTop: '.6rem' }}>
            <StatCard
              label="Best 7-day streak (avg/day per 1M)"
              value={fmt(best7.avg, 2)}
              sub={best7.start ? `starting ${best7.start}` : undefined}
            />
            <StatCard label="Median ZYP/day per 1M" value={fmt(medPer1M, 2)} />
            <StatCard label="P75 ZYP/day per 1M" value={fmt(p75Per1M, 2)} sub={`P25: ${fmt(p25Per1M, 2)}`} />
          </div>
        </section>

        {/* Breakdown */}
        <section style={cardSection}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '.6rem', flexWrap: 'wrap' }}>
            <h2 style={h2}>Breakdown</h2>
            <button className="btn" style={btn} onClick={() => setShowBreakdown(v => !v)}>
              {showBreakdown ? 'Hide details' : 'Show details'}
            </button>
          </div>

          <div style={{ marginTop: '.5rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr>
                  <th style={th}>Metric</th>
                  <th style={thRight}>Value</th>
                  <th style={thRight}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {/* Visible by default (balanced) */}
                <Row name="Avg ZYP/day per 1M" value={fmt(avgPer1M, 2)} note={deltaAvgPct == null ? '—' : `${deltaAvgPct >= 0 ? '+' : '-'}${fmt(Math.abs(deltaAvgPct), 1)}% vs baseline`} />
                <Row name="Total ZYP (window · per 1M)" value={fmt(totalPer1M, 0)} note={`${nDays} day${nDays === 1 ? '' : 's'}`} />
                <Row name="Best day (per 1M)" value={fmt(bestDayVal, 2)} note={bestDayDate || '—'} />
                <Row name="Best 7-day streak (avg/day · per 1M)" value={fmt(best7.avg, 2)} note={best7.start ? `starting ${best7.start}` : '—'} />
                <Row name="Median ZYP/day per 1M" value={fmt(medPer1M, 2)} note="Middle of distribution" />
                <Row name="P25 / P75 (per 1M)" value={`${fmt(p25Per1M, 2)} / ${fmt(p75Per1M, 2)}`} note="Interquartile range" />

                {/* Details toggle — deeper diagnostics + requested rows */}
                {showBreakdown && (
                  <>
                    <Row name="Quietest day (per 1M)" value={fmt(minDayVal, 2)} note={minDayDate || '—'} />
                    <Row name="Rolling 7-day avg today (per 1M)" value={fmt(rolling7AvgPer1M, 2)} note={`Last ${Math.min(7, nDays)} days`} />
                    <Row name="Days above median" value={daysAboveMedian.count} note={`${fmt(daysAboveMedian.pct, 1)}% of window`} />
                    <Row name="Min / Max (per 1M)" value={`${fmt(Math.min(...per1M) || 0, 2)} / ${fmt(Math.max(...per1M) || 0, 2)}`} note="Range in window" />
                    <Row name="Std dev (per 1M)" value={fmt(sdPer1M, 2)} note={`Volatility · CV ${fmt(cvPct, 1)}%`} />
                    <Row name="Data points" value={nDays} note="Days in selected window" />
                  </>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Records: Top 3 best days */}
        <section style={cardSection}>
          <h2 style={h2}>Records</h2>
          {top3.length ? (
            <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
              {top3.map((r, i) => (
                <li key={i} style={{ margin: '.25rem 0' }}>
                  <strong>{fmt(r.v, 2)}</strong> ZYP/day per 1M <span style={smallMuted}>on {r.d}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ opacity: .85 }}>No data in this window.</p>
          )}
        </section>

        {/* CTA BAR (updated copy) */}
        <section style={cta.wrap}>
          <div>
            <h3 style={{ margin: 0 }}>Ready to turn stats into strategy?</h3>
            <p style={{ margin: '0.25rem 0 0', opacity: 0.85 }}>
              Install the wallet in minutes. Track daily rewards and plan your next move.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap' }}>
            <OutboundLink
              href={REF_BY_PLACEMENT('stats_footer')}
              eventName="cta_click"
              eventParams={{ placement: 'stats_footer' }}
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
          .stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}

// ===== small subcomponents =====
function StatCard({ label, value, sub }) {
  return (
    <div style={statCard}>
      <div style={{ opacity: .85, fontSize: '.9rem' }}>{label}</div>
      <div style={{ fontWeight: 900, fontSize: '1.2rem', marginTop: '.1rem' }}>{value}</div>
      {sub ? <div style={{ marginTop: '.1rem', opacity: .8, fontSize: '.9rem' }}>{sub}</div> : null}
    </div>
  );
}
function Row({ name, value, note }) {
  return (
    <tr>
      <td style={td}>{name}</td>
      <td style={tdRight}><strong>{value}</strong></td>
      <td style={tdRight}><span style={{ opacity: .85 }}>{note}</span></td>
    </tr>
  );
}
