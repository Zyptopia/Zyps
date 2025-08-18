// src/pages/AnalyticsPage.js
import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase';
import { collection, getDocs, orderBy, limit, query } from 'firebase/firestore';
import { trackEvent } from '../analytics';

const fmt = (n) => Number(n || 0).toLocaleString();
const toMillis = (ts) => (ts?.toMillis ? ts.toMillis() : (typeof ts === 'number' ? ts : Date.now()));
const dateKey = (ms) => new Date(ms).toISOString().slice(0, 10);
const safeLower = (v) => String(v ?? '').toLowerCase();
const entries = Object.entries;

/* ---------- Tiny tooltip (no deps) ---------- */
function InfoTip({ text }) {
  const [open, setOpen] = useState(false);
  return (
    <span style={{ position: 'relative', display: 'inline-block', marginLeft: 6 }}>
      <button
        type="button"
        aria-label="More info"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        style={{
          border: 'none',
          background: 'transparent',
          color: 'inherit',
          cursor: 'pointer',
          padding: 0,
          lineHeight: 1,
          fontWeight: 700
        }}
      >
        ⓘ
      </button>
      {open && (
        <div
          role="tooltip"
          style={{
            position: 'absolute',
            top: '1.4rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.9)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 8,
            padding: '.45rem .6rem',
            fontSize: '.85rem',
            maxWidth: 280,
            zIndex: 50,
            whiteSpace: 'normal',
            boxShadow: '0 6px 20px rgba(0,0,0,.35)'
          }}
        >
          {text}
        </div>
      )}
    </span>
  );
}

/* ---------- Inline sparkline ---------- */
function Sparkline({ points = [], width = 180, height = 34 }) {
  if (!points.length) return null;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = Math.max(1, max - min);
  const stepX = width / Math.max(1, points.length - 1);
  const path = points
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * height;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <path d={path} fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

/* ---------- Sortable table header ---------- */
function Th({ label, active, dir, onClick, style }) {
  return (
    <th
      onClick={onClick}
      style={{ cursor: 'pointer', userSelect: 'none', padding: '.5rem', whiteSpace: 'nowrap', ...style }}
      aria-sort={active ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      {label} {active ? (dir === 'asc' ? '▲' : '▼') : '↕'}
    </th>
  );
}

export default function AnalyticsPage() {
  const auth = getAuth();
  const user = auth.currentUser;

  // State
  const [range, setRange] = useState('30'); // '7' | '30' | '90' | 'all'
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState('');

  // Filters
  const [eventFilter, setEventFilter] = useState('all');
  const [textQuery, setTextQuery] = useState('');
  const [placementFilter, setPlacementFilter] = useState('');

  // Sorters
  const [sortByCTA, setSortByCTA] = useState({ field: 'clicks', dir: 'desc' });
  const [sortByNav, setSortByNav] = useState({ field: 'clicks', dir: 'desc' });
  const [sortLanding, setSortLanding] = useState({ field: 'views', dir: 'desc' });
  const [sortRef, setSortRef] = useState({ field: 'views', dir: 'desc' });
  const [sortUtm, setSortUtm] = useState({ field: 'views', dir: 'desc' });

  useEffect(() => { trackEvent('page_view', { page: 'admin_analytics' }); }, []);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!user) {
        if (mounted) { setRows([]); setLoading(false); setLoadErr(''); }
        return;
      }
      setLoading(true); setLoadErr('');
      try {
        const qy = query(collection(db, 'events'), orderBy('ts', 'desc'), limit(4000));
        const snap = await getDocs(qy);
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (mounted) setRows(docs);
      } catch (e) {
        if (mounted) setLoadErr('Failed to load analytics.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [user]);

  // Derived
  const knownEventNames = useMemo(() => ['all', ...Array.from(new Set(rows.map(r => r.name).filter(Boolean))).sort()], [rows]);

  const filteredByTime = useMemo(() => {
    if (!rows.length) return [];
    if (range === 'all') return rows;
    const days = Number(range);
    const cutoff = Date.now() - days * 86400_000;
    return rows.filter(r => toMillis(r.ts) >= cutoff);
  }, [rows, range]);

  const filtered = useMemo(() => {
    const q = safeLower(textQuery);
    return filteredByTime.filter(r => {
      if (eventFilter !== 'all' && r.name !== eventFilter) return false;
      if (placementFilter && r.name === 'cta_click') {
        const pl = r.params?.placement || '';
        if (!safeLower(pl).includes(safeLower(placementFilter))) return false;
      }
      if (q) {
        const hay = [
          r.name,
          JSON.stringify(r.params || {}),
          r.user,
          r.page,
          r.referrer
        ].map(safeLower).join(' ');
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [filteredByTime, eventFilter, placementFilter, textQuery]);

  const totals = useMemo(() => {
    const out = {
      all: filtered.length,
      byName: {},
      ctaByPlacement: {},
      internalNav: {},
      pageViewsByDay: {},
      pageViewsLanding: {},
      pageViewsReferrer: {},
      pageViewsUTM: { source: {}, medium: {}, campaign: {} },
      pageViewsWithRef: 0,
      pageViewsWithUTM: 0,
      pageViews: 0,
      searches: 0,
      calcUsed: 0,
      miniCalcUsed: 0,
    };

    for (const ev of filtered) {
      const name = ev.name || '(unknown)';
      out.byName[name] = (out.byName[name] || 0) + 1;

      if (name === 'cta_click') {
        const pl = ev.params?.placement || '(none)';
        out.ctaByPlacement[pl] = (out.ctaByPlacement[pl] || 0) + 1;
      }
      if (name === 'internal_nav') {
        const to = ev.params?.to || '(none)';
        out.internalNav[to] = (out.internalNav[to] || 0) + 1;
      }
      if (name === 'calculator_used') out.calcUsed += 1;
      if (name === 'mini_calc_used') out.miniCalcUsed += 1;
      if (name === 'historical_search') out.searches += 1;

      if (name === 'page_view') {
        out.pageViews += 1;
        const tms = toMillis(ev.ts);
        const dk = dateKey(tms);
        out.pageViewsByDay[dk] = (out.pageViewsByDay[dk] || 0) + 1;

        const landing = ev.params?.page || ev.page || ev.params?.path || '(unknown)';
        out.pageViewsLanding[landing] = (out.pageViewsLanding[landing] || 0) + 1;

        const ref = ev.params?.referrer || ev.referrer || '';
        if (ref) {
          out.pageViewsWithRef += 1;
          out.pageViewsReferrer[ref] = (out.pageViewsReferrer[ref] || 0) + 1;
        }

        const src = ev.params?.utm_source || ev.utm_source || '';
        const med = ev.params?.utm_medium || ev.utm_medium || '';
        const camp = ev.params?.utm_campaign || ev.utm_campaign || '';
        if (src || med || camp) out.pageViewsWithUTM += 1;
        if (src) out.pageViewsUTM.source[src] = (out.pageViewsUTM.source[src] || 0) + 1;
        if (med) out.pageViewsUTM.medium[med] = (out.pageViewsUTM.medium[med] || 0) + 1;
        if (camp) out.pageViewsUTM.campaign[camp] = (out.pageViewsUTM.campaign[camp] || 0) + 1;
      }
    }
    return out;
  }, [filtered]);

  const trafficSeries = useMemo(() => {
    const days = Object.keys(totals.pageViewsByDay).sort();
    return days.map(d => totals.pageViewsByDay[d]);
  }, [totals]);

  const sortPairs = (pairs, { field, dir }) => {
    const mult = dir === 'asc' ? 1 : -1;
    return [...pairs].sort((a, b) => {
      if (field === 'name') return a[0] < b[0] ? -1 * mult : a[0] > b[0] ? 1 * mult : 0;
      return (a[1] - b[1]) * mult;
    });
  };

  const copyFilteredCSV = () => {
    const headers = ['id', 'name', 'ts', 'params'];
    const lines = [headers.join(',')];
    filtered.forEach(ev => {
      const row = [
        JSON.stringify(ev.id ?? ''),
        JSON.stringify(ev.name ?? ''),
        JSON.stringify(ev.ts?.toDate ? ev.ts.toDate().toISOString() : ev.ts ?? ''),
        JSON.stringify(ev.params ?? {})
      ];
      lines.push(row.join(','));
    });
    navigator.clipboard.writeText(lines.join('\n'));
  };

  if (!user) {
    return (
      <div className="page-content" style={{ maxWidth: 1200, margin: '1.5rem auto', padding: '0 1rem' }}>
        You must be logged in.
      </div>
    );
  }

  // Coverage strings (clearer wording)
  const refCov = totals.pageViews ? Math.round((totals.pageViewsWithRef / totals.pageViews) * 100) : 0;
  const utmCov = totals.pageViews ? Math.round((totals.pageViewsWithUTM / totals.pageViews) * 100) : 0;

  return (
    <>
      <Helmet><title>Admin Analytics – Zyptopia</title></Helmet>

      <div className="page-content" style={{ maxWidth: 1200, margin: '1.5rem auto', padding: '0 1rem' }}>
        <h1 style={{ marginBottom: '0.75rem' }}>Admin Analytics</h1>

        {/* Controls */}
        <div style={{ marginBottom: '0.75rem', display: 'grid', gap: '.6rem', gridTemplateColumns: 'repeat(4, minmax(0,1fr))' }}>
          <label style={{ display: 'grid', gap: '.25rem' }}>
            <span>Range <InfoTip text="How far back to include events (only the latest 4000 are loaded from Firestore)." /></span>
            <select value={range} onChange={(e) => setRange(e.target.value)} style={{ padding: '0.45rem', borderRadius: 8 }}>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="all">All loaded</option>
            </select>
          </label>

          <label style={{ display: 'grid', gap: '.25rem' }}>
            <span>Event <InfoTip text="Filter to a specific event name (e.g., page_view, cta_click) or show all." /></span>
            <select value={eventFilter} onChange={(e) => setEventFilter(e.target.value)} style={{ padding: '0.45rem', borderRadius: 8 }}>
              {knownEventNames.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>

          <label style={{ display: 'grid', gap: '.25rem' }}>
            <span>Search <InfoTip text="Free-text search across event name, params, user, path, and referrer." /></span>
            <input value={textQuery} onChange={(e) => setTextQuery(e.target.value)} placeholder="e.g. calc, /historical, utm" style={{ padding: '0.45rem', borderRadius: 8 }} />
          </label>

          <label style={{ display: 'grid', gap: '.25rem' }}>
            <span>CTA placement <InfoTip text="Filter CTA clicks by params.placement (partial match). Try: home_top_download, calc_footer, etc." /></span>
            <input value={placementFilter} onChange={(e) => setPlacementFilter(e.target.value)} placeholder="home_top_download" style={{ padding: '0.45rem', borderRadius: 8 }} />
          </label>
        </div>

        {!loading && (
          <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center', marginBottom: '.75rem', flexWrap: 'wrap' }}>
            <span style={{ opacity: 0.85 }}>{fmt(filtered.length)} events in view</span>
            <button className="btn" onClick={copyFilteredCSV} style={{ padding: '.45rem .75rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', fontWeight: 600 }}>
              Copy filtered events (CSV)
            </button>
          </div>
        )}

        {loadErr && <div style={{ color: '#ff7676', marginBottom: '0.75rem' }}>{loadErr}</div>}
        {loading && <div style={{ opacity: 0.85, marginBottom: '0.75rem' }}>Loading…</div>}

        {/* Cards */}
        {!loading && (
          <div style={{ display: 'grid', gap: '.75rem', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', marginBottom: '.75rem' }}>
            <div style={styles.card}>
              <div style={{ opacity: .75 }}>Total events</div>
              <div style={styles.big}>{fmt(totals.all)}</div>
              <div style={{ marginTop: '.4rem', opacity: .8 }}><Sparkline points={trafficSeries} /></div>
            </div>

            <div style={styles.card}>
              <div style={{ opacity: .75 }}>
                Page views
                <InfoTip text="Count of page_view events in the current range." />
              </div>
              <div style={styles.big}>{fmt(totals.pageViews)}</div>
              <div style={{ fontSize: '.9rem', opacity: .9, marginTop: '.25rem', lineHeight: 1.35 }}>
                Referrer data on {refCov}% of page views
                <InfoTip text="Referrer coverage shows how often the browser sent a referrer (the previous site). Direct visits, some privacy settings, or apps may not provide a referrer." />
                <br />
                UTM tags on {utmCov}% of page views
                <InfoTip text="UTM coverage shows how many page views included utm_source/medium/campaign in the URL (useful for tracking marketing efforts)." />
              </div>
            </div>

            <div style={styles.card}>
              <div style={{ opacity: .75 }}>CTA clicks</div>
              <div style={styles.big}>{fmt(totals.byName['cta_click'] || 0)}</div>
              <div style={{ opacity: .85, marginTop: '.25rem' }}>
                Best placement: <strong>{entries(totals.ctaByPlacement).sort((a,b)=>b[1]-a[1])[0]?.[0] || '—'}</strong>
              </div>
            </div>

            <div style={styles.card}>
              <div style={{ opacity: .75 }}>
                Calculator uses <InfoTip text="“Full” = calculator_used, “Inline” = mini_calc_used." />
              </div>
              <div><strong>Full:</strong> {fmt(totals.calcUsed)} &nbsp; <strong>Inline:</strong> {fmt(totals.miniCalcUsed)}</div>
            </div>
          </div>
        )}

        {/* CTA by placement */}
        {!loading && (
          <div style={{ ...styles.card, marginBottom: '.75rem' }}>
            <h3 style={{ margin: 0 }}>
              CTA clicks by placement <InfoTip text="Grouped by params.placement on cta_click events. Click column headers to sort." />
            </h3>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <Th label="Placement" active={sortByCTA.field === 'name'} dir={sortByCTA.dir} onClick={() => setSortByCTA(s => ({ field: 'name', dir: s.field === 'name' && s.dir === 'asc' ? 'desc' : 'asc' }))} style={{ textAlign: 'left' }} />
                  <Th label="Clicks" active={sortByCTA.field === 'clicks'} dir={sortByCTA.dir} onClick={() => setSortByCTA(s => ({ field: 'clicks', dir: s.field === 'clicks' && s.dir === 'asc' ? 'desc' : 'asc' }))} style={{ textAlign: 'right' }} />
                </tr>
              </thead>
              <tbody>
                {sortPairs(entries(totals.ctaByPlacement), sortByCTA).map(([pl, n]) => (
                  <tr key={pl} style={styles.tr}>
                    <td style={{ padding: '.5rem' }}>{pl}</td>
                    <td style={{ padding: '.5rem', textAlign: 'right' }}>{fmt(n)}</td>
                  </tr>
                ))}
                {entries(totals.ctaByPlacement).length === 0 && (
                  <tr><td colSpan={2} style={styles.empty}>No CTA clicks yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Internal navigation */}
        {!loading && (
          <div style={{ ...styles.card, marginBottom: '.75rem' }}>
            <h3 style={{ margin: 0 }}>
              Internal navigation <InfoTip text="Counts of internal_nav events grouped by params.to. Click headers to sort." />
            </h3>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <Th label="Destination" active={sortByNav.field === 'name'} dir={sortByNav.dir} onClick={() => setSortByNav(s => ({ field: 'name', dir: s.field === 'name' && s.dir === 'asc' ? 'desc' : 'asc' }))} style={{ textAlign: 'left' }} />
                  <Th label="Clicks" active={sortByNav.field === 'clicks'} dir={sortByNav.dir} onClick={() => setSortByNav(s => ({ field: 'clicks', dir: s.field === 'clicks' && s.dir === 'asc' ? 'desc' : 'asc' }))} style={{ textAlign: 'right' }} />
                </tr>
              </thead>
              <tbody>
                {sortPairs(entries(totals.internalNav), sortByNav).map(([to, n]) => (
                  <tr key={to} style={styles.tr}>
                    <td style={{ padding: '.5rem' }}>{to}</td>
                    <td style={{ padding: '.5rem', textAlign: 'right' }}>{fmt(n)}</td>
                  </tr>
                ))}
                {entries(totals.internalNav).length === 0 && (
                  <tr><td colSpan={2} style={styles.empty}>No internal nav events yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* SEO insights */}
        {!loading && (
          <div style={{ display: 'grid', gap: '.75rem', gridTemplateColumns: '2fr 2fr 1.5fr' }}>
            {/* Landing pages */}
            <SEOBlock
              title="Top landing pages"
              tip="Grouped from page_view events using params.page/path/page."
              data={totals.pageViewsLanding}
              sort={sortLanding}
              setSort={setSortLanding}
              labelLeft="Page"
              labelRight="Views"
            />
            {/* Referrers */}
            <SEOBlock
              title="Top referrers"
              tip="From document.referrer or params.referrer (when present)."
              data={totals.pageViewsReferrer}
              sort={sortRef}
              setSort={setSortRef}
              labelLeft="Referrer"
              labelRight="Views"
            />
            {/* UTM sources */}
            <SEOBlock
              title="UTM sources"
              tip="utm_source on page_view URLs (when present). Medium and campaign counts are shown below."
              data={totals.pageViewsUTM.source}
              sort={sortUtm}
              setSort={setSortUtm}
              labelLeft="Source"
              labelRight="Views"
              footer={
                <div style={{ display: 'grid', gap: '.25rem', marginTop: '.6rem', fontSize: '.92rem', opacity: .85 }}>
                  <div><strong>UTM coverage:</strong> {utmCov}% of page views</div>
                  <div>Mediums tracked: {fmt(entries(totals.pageViewsUTM.medium).length)} • Campaigns tracked: {fmt(entries(totals.pageViewsUTM.campaign).length)}</div>
                </div>
              }
            />
          </div>
        )}

        {/* Recent events */}
        {!loading && (
          <div style={{ ...styles.card, marginTop: '.75rem' }}>
            <h3 style={{ margin: 0 }}>
              Recent events <InfoTip text="Most recent first after filters. Use the CSV button above to export this view." />
            </h3>
            <div style={{ maxHeight: 380, overflow: 'auto', marginTop: '.5rem', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace' }}>
              {filtered.slice(0, 400).map(ev => (
                <div key={ev.id} style={{ borderTop: '1px dashed rgba(255,255,255,0.12)', padding: '0.35rem 0' }}>
                  <div>
                    <strong>{ev.name}</strong>{' '}
                    <span style={{ opacity: 0.7 }}>
                      @ {ev.ts?.toDate ? ev.ts.toDate().toLocaleString() : '—'}
                    </span>
                  </div>
                  <div style={{ opacity: 0.9, fontSize: '.9rem' }}>
                    {JSON.stringify(ev.params || {}, null, 0)}
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <div style={{ opacity: 0.85 }}>No events yet for this view.</div>}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* -------- Small SEO table block -------- */
function SEOBlock({ title, tip, data, sort, setSort, labelLeft, labelRight, footer }) {
  const entriesArr = Object.entries(data || {});
  const sorted = useMemo(() => {
    const mult = sort.dir === 'asc' ? 1 : -1;
    return [...entriesArr].sort((a, b) => {
      if (sort.field === 'name') return a[0] < b[0] ? -1 * mult : a[0] > b[0] ? 1 * mult : 0;
      return (a[1] - b[1]) * mult;
    });
  }, [entriesArr, sort]);

  return (
    <div style={styles.card}>
      <h3 style={{ margin: 0 }}>
        {title} <InfoTip text={tip} />
      </h3>
      <table style={styles.table}>
        <thead>
          <tr style={styles.thead}>
            <Th
              label={labelLeft}
              active={sort.field === 'name'}
              dir={sort.dir}
              onClick={() => setSort(s => ({ field: 'name', dir: s.field === 'name' && s.dir === 'asc' ? 'desc' : 'asc' }))}
              style={{ textAlign: 'left' }}
            />
            <Th
              label={labelRight}
              active={sort.field === 'views'}
              dir={sort.dir}
              onClick={() => setSort(s => ({ field: 'views', dir: s.field === 'views' && s.dir === 'asc' ? 'desc' : 'asc' }))}
              style={{ textAlign: 'right' }}
            />
          </tr>
        </thead>
        <tbody>
          {sorted.map(([k, n]) => (
            <tr key={k} style={styles.tr}>
              <td style={{ padding: '.5rem' }}>{k}</td>
              <td style={{ padding: '.5rem', textAlign: 'right' }}>{fmt(n)}</td>
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr><td colSpan={2} style={styles.empty}>No data in range.</td></tr>
          )}
        </tbody>
      </table>
      {footer}
    </div>
  );
}

const styles = {
  card: {
    padding: '1rem',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    background: 'rgba(255,255,255,0.03)'
  },
  big: { fontSize: '1.5rem', fontWeight: 700 },
  table: { width: '100%', marginTop: '.5rem', borderCollapse: 'collapse' },
  thead: { background: 'rgba(255,255,255,0.04)' },
  tr: { borderTop: '1px solid rgba(255,255,255,0.06)' },
  empty: { padding: '.6rem', textAlign: 'center', opacity: 0.8 }
};
