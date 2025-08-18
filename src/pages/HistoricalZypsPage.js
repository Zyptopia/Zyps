// src/pages/HistoricalZypsPage.js
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SeoHelmet from '../components/SeoHelmet';
import Breadcrumbs from '../components/Breadcrumbs';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

import PromoBanner from '../components/PromoBanner';
import OutboundLink from '../components/OutboundLink';
import { REF_BY_PLACEMENT } from '../constants';
import { trackEvent } from '../analytics';
import { breadCrumbs } from '../seo/structuredData';

/* Helpers */
const byDateAsc = (a, b) => new Date(a.date) - new Date(b.date);
const fmt = (n, d = 2) =>
  Number.isFinite(n)
    ? Number(n).toLocaleString(undefined, { maximumFractionDigits: d, minimumFractionDigits: d })
    : '—';

function parseDateString(s) {
  if (!s) return null;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function HistoricalZypsPage() {
  useEffect(() => { trackEvent('page_view', { page: 'historical_zyps' }); }, []);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setLoadError('');
      try {
        const snap = await getDocs(collection(db, 'rewards'));
        const docs = snap.docs.map(d => d.data()).filter(Boolean);
        docs.sort(byDateAsc);
        if (mounted) setRows(docs);
      } catch (e) {
        if (mounted) setLoadError('Could not load rewards data.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  /* Filters & controls */
  const [startDate, setStartDate] = useState(''); // YYYY-MM-DD
  const [endDate, setEndDate] = useState('');     // YYYY-MM-DD

  const [customHoldings, setCustomHoldings] = useState('');
  const holdingsNum = parseFloat(customHoldings) || 0;
  const showEst = holdingsNum > 0;

  const [sortField, setSortField] = useState('date'); // 'date' | 'rewardPerToken' | 'est'
  const [sortDir, setSortDir] = useState('desc');     // 'asc' | 'desc'

  const requestSort = (field) => {
    setSortField((prev) => {
      if (prev === field) {
        setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortDir('desc');
      }
      return field;
    });
    trackEvent('historical_sort', { field, dir: sortField === field ? (sortDir === 'asc' ? 'desc' : 'asc') : 'desc' });
  };

  // If estimates are hidden, and we were sorting by 'est', fall back to 'date'
  useEffect(() => {
    if (!showEst && sortField === 'est') {
      setSortField('date');
      setSortDir('desc');
    }
  }, [showEst, sortField]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const resetAll = () => {
    setStartDate('');
    setEndDate('');
    setCustomHoldings('');
    setSortField('date');
    setSortDir('desc');
    setPageSize(10);
    setPage(1);
    trackEvent('historical_reset', {});
  };

  /* Derivations */
  const filtered = useMemo(() => {
    const sd = parseDateString(startDate);
    const ed = parseDateString(endDate);
    if (ed) ed.setHours(23, 59, 59, 999); // inclusive end

    let out = rows.filter(r => {
      const dt = new Date(r.date);
      dt.setHours(0, 0, 0, 0);
      if (sd && dt < sd) return false;
      if (ed && dt > ed) return false;
      return true;
    });

    // Attach estimate when holdings are set
    out = out.map((r) => ({
      ...r,
      _est: showEst ? (Number(r.rewardPerToken) || 0) * (holdingsNum / 1_000_000) : null,
    }));
    return out;
  }, [rows, startDate, endDate, showEst, holdingsNum]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const dir = sortDir === 'asc' ? 1 : -1;
    arr.sort((a, b) => {
      const av = sortField === 'date' ? new Date(a.date)
        : sortField === 'rewardPerToken' ? Number(a.rewardPerToken)
        : sortField === 'est' ? Number(a._est) : 0;
      const bv = sortField === 'date' ? new Date(b.date)
        : sortField === 'rewardPerToken' ? Number(b.rewardPerToken)
        : sortField === 'est' ? Number(b._est) : 0;
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
    return arr;
  }, [filtered, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const slice = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

  /* Accessible sortable header cell */
  const Th = ({ field, children, style, className }) => (
    <th
      onClick={() => requestSort(field)}
      className={className}
      style={{
        cursor: 'pointer',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        position: 'sticky',
        top: 0,
        background: 'rgba(20,20,24,0.9)',
        backdropFilter: 'blur(2px)',
        zIndex: 2,
        textAlign: field === 'date' ? 'left' : 'right',
        ...style
      }}
      aria-sort={sortField === field ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
      title="Click to sort"
    >
      {children}{' '}{sortField === field ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}
    </th>
  );

  const url = 'https://www.zyptopia.org/historical';
  const jsonLd = [
    breadCrumbs([
      { name: 'Home', item: 'https://www.zyptopia.org/' },
      { name: 'Historical Zyps', item: url }
    ])
  ];

  const colCount = showEst ? 3 : 2;

  return (
    <>
      <SeoHelmet
        title="Historical Zyps"
        description="Browse historical reward per 1,000,000 tokens. Filter by date range, sort, and optionally estimate Zyps/day for your holdings."
        canonical={url}
        jsonLd={jsonLd}
      />

      <div className="page-content" style={{ maxWidth: 980, margin: '1.5rem auto', padding: '0 1rem' }}>
        <Breadcrumbs />

        {/* Info note */}
        <section style={infoNote.wrap} aria-label="About historical data">
          <div><strong>Historical rewards</strong> per 1,000,000 tokens. Filter by date range and sort columns.</div>
          <div style={infoNote.sub}>$1 USD = 1,000 ZYP. Estimates optional — not financial advice.</div>
        </section>

        {/* Controls: Date range (row 1), then Holdings + Reset (row 2) */}
        <section style={controls.wrap}>
          <div style={controls.row}>
            <label style={{ display: 'grid', gap: '0.35rem' }}>
              <span style={controls.label}>Start date</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(1); trackEvent('historical_date_from', { date: e.target.value || null }); }}
                style={styles.input}
              />
            </label>

            <label style={{ display: 'grid', gap: '0.35rem' }}>
              <span style={controls.label}>End date</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPage(1); trackEvent('historical_date_to', { date: e.target.value || null }); }}
                style={styles.input}
              />
            </label>
          </div>

          <div style={controls.row2}>
            <label style={{ display: 'grid', gap: '0.35rem' }}>
              <span style={controls.label}>Your holdings (Zypto) <small style={{ opacity: 0.7 }}>(optional)</small></span>
              <input
                type="number"
                inputMode="decimal"
                value={customHoldings}
                onChange={(e) => { setCustomHoldings(e.target.value); setPage(1); trackEvent('historical_custom_holdings', { holdings: parseFloat(e.target.value) || 0 }); }}
                placeholder="e.g. 50,000"
                style={styles.input}
              />
            </label>

            <div style={{ alignSelf: 'end' }}>
              <button className="btn" style={styles.pgBtn} onClick={resetAll}>Reset filters</button>
            </div>
          </div>
        </section>

        {/* Estimation context line (keeps headers short) */}
        {showEst && (
          <div style={{ margin: '-.25rem 0 .5rem', opacity: .85, fontSize: '.92rem' }}>
            Estimates shown for <strong>{Number(holdingsNum).toLocaleString()}</strong> held.
          </div>
        )}

        {/* Data table */}
        {loadError && <div style={{ color: '#ff7676', marginBottom: '0.75rem' }}>{loadError}</div>}
        {loading && <div style={{ opacity: 0.85, marginBottom: '0.75rem' }}>Loading historical data…</div>}

        {!loading && (
          <div style={{ overflowX: 'hidden', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
            <table className="hzp-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <Th field="date" className="hzp-col-date" style={{ textAlign: 'left', padding: '0.55rem' }}>Date</Th>
                  <Th field="rewardPerToken" className="hzp-col-reward" style={{ padding: '0.55rem' }}>Reward/1M</Th>
                  {showEst && (
                    <Th field="est" className="hzp-col-est" style={{ padding: '0.55rem' }}>Est/day</Th>
                  )}
                </tr>
              </thead>
              <tbody>
                {slice.length === 0 && (
                  <tr>
                    <td colSpan={colCount} style={{ padding: '1rem', textAlign: 'center', opacity: 0.85 }}>
                      No rows match your filters.
                    </td>
                  </tr>
                )}
                {slice.map((r, idx) => (
                  <tr key={`${r.date}-${idx}`} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <td className="hzp-col-date" style={{ padding: '0.55rem', textAlign: 'left', whiteSpace: 'nowrap' }}>{r.date || '—'}</td>
                    <td className="hzp-col-reward" style={{ padding: '0.55rem', textAlign: 'right' }}>{fmt(r.rewardPerToken, 2)}</td>
                    {showEst && <td className="hzp-col-est" style={{ padding: '0.55rem', textAlign: 'right' }}>{fmt(r._est, 2)}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && (
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                style={{ padding: '0.45rem', borderRadius: 8 }}
              >
                <option value={10}>10</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>per page</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button className="btn" onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} style={styles.pgBtn}>Prev</button>
              <span style={{ alignSelf: 'center', opacity: 0.85 }}>
                Page {currentPage} / {Math.max(1, Math.ceil(sorted.length / pageSize))}
              </span>
              <button
                className="btn"
                onClick={() => setPage(Math.min(Math.max(1, Math.ceil(sorted.length / pageSize)), currentPage + 1))}
                disabled={currentPage >= Math.ceil(sorted.length / pageSize)}
                style={styles.pgBtn}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Promo then CTA bar at very bottom */}
        <div style={{ marginTop: '1rem' }}>
          <PromoBanner />
        </div>

        <section style={cta.wrap}>
          <div>
            <h3 style={{ margin: 0 }}>Explore more with Zyptopia tools</h3>
            <p style={{ margin: '0.25rem 0 0', opacity: 0.85 }}>
              Check today’s graph, run projections, and secure wallets with VKC.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap' }}>
            <OutboundLink
              href={REF_BY_PLACEMENT('historical_footer')}
              eventName="cta_click"
              eventParams={{ placement: 'historical_footer' }}
              className="btn btn-primary"
              style={btnPrimary}
            >
              Download Zypto Wallet
            </OutboundLink>
            <Link to="/calculator" className="btn" style={btn}>Open calculators</Link>
            <Link to="/vault-key-card" className="btn" style={btn}>Add VKC security</Link>
          </div>
        </section>
      </div>

      {/* Mobile width fixes: condensed headers, fixed table layout, smaller padding */}
      <style>{`
        @media (max-width: 680px){
          .hzp-table { table-layout: fixed; }
          .hzp-col-date   { width: 40%; }
          .hzp-col-reward { width: 30%; }
          .hzp-col-est    { width: 30%; }
          .hzp-table th, .hzp-table td { padding: 0.45rem !important; font-size: .92rem; }
        }
      `}</style>
    </>
  );
}

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

const controls = {
  wrap: {
    display: 'grid',
    gap: '.75rem',
    margin: '0 0 1rem 0'
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '.75rem'
  },
  row2: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: '.75rem',
    alignItems: 'end'
  },
  label: { opacity: .9, marginBottom: '.25rem', fontSize: '.95rem' }
};

const styles = {
  input: {
    padding: '0.55rem',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.04)',
    color: 'inherit'
  },
  pgBtn: {
    padding: '0.45rem 0.8rem',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.06)',
    fontWeight: 600
  }
};

/* CTA styles consistent with Calculator/Stats pages */
const btn = {
  padding: '0.55rem 0.9rem',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.15)',
  background: 'rgba(255,255,255,0.06)',
  fontWeight: 600
};
const btnPrimary = { ...btn, background: 'rgba(255,255,255,0.12)' };

const cta = {
  wrap: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: '.8rem', flexWrap: 'wrap',
    border: '1px solid rgba(255,255,255,.12)', borderRadius: 12, padding: '.75rem .9rem',
    background: 'linear-gradient(135deg, rgba(255,255,255,.04), rgba(255,255,255,.02))', margin: '1rem 0'
  }
};
