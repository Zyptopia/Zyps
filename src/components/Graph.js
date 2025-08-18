// src/components/Graph.js
import React, { useEffect, useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Optional fallback fetch (only used if no props.data provided)
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

import OutboundLink from './OutboundLink';
import { REF_BY_PLACEMENT } from '../constants';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// ===== Subtle glow behind the main line
const outerGlow = {
  id: 'outerGlow',
  beforeDatasetsDraw(chart, _args, pluginOpts) {
    const idx = pluginOpts?.datasetIndex ?? 0; // glow the first dataset
    const meta = chart.getDatasetMeta(idx);
    if (!meta || !meta.dataset) return;
    const ds = chart.data.datasets[idx];
    const ctx = chart.ctx;
    ctx.save();
    ctx.shadowColor = pluginOpts?.color || 'rgba(0,255,200,.55)';
    ctx.shadowBlur = pluginOpts?.blur ?? 10;
    ctx.lineWidth = (pluginOpts?.lineWidth ?? 2.5);
    ctx.strokeStyle = ds.borderColor || '#00E7C6';
    meta.dataset.draw(ctx);
    ctx.restore();
  }
};

// Helpers
const dateAsc = (a, b) => new Date(a.date) - new Date(b.date);

function linearRegression(yVals) {
  const n = yVals.length;
  if (n < 2) return Array(n).fill(null);
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (let i = 0; i < n; i++) {
    const x = i;
    const y = yVals[i];
    if (y == null || Number.isNaN(y)) continue;
    sumX += x; sumY += y; sumXY += x * y; sumXX += x * x;
  }
  const denom = n * sumXX - sumX * sumX;
  if (denom === 0) return Array(n).fill(null);
  const m = (n * sumXY - sumX * sumY) / denom;
  const b = (sumY - m * sumX) / n;
  return Array.from({ length: n }, (_, i) => m * i + b);
}

function forecastNextDays(baseSeries, days = 7, window = 30) {
  const f = [];
  let rolling = baseSeries.slice(-window);
  if (rolling.length === 0) return f;
  for (let i = 0; i < days; i++) {
    const mean = rolling.reduce((a, b) => a + (b ?? 0), 0) / rolling.length;
    f.push(mean);
    rolling.shift(); rolling.push(mean);
  }
  return f;
}

function startDateFor(tf) {
  const now = new Date();
  const map = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
  if (!tf || tf === 'all' || !map[tf]) return new Date(0);
  const d = new Date(now);
  d.setDate(now.getDate() - map[tf]);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function Graph({
  data: propData,
  averageReward,           // legacy fallback (not needed if computedAverage exists)
  timeframe,               // '7d' | '30d' | '90d' | '1y' | 'all'
  onAverageChange          // callback to report visible-window average
}) {
  const [showAverage, setShowAverage] = useState(true);
  const [showCumulative, setShowCumulative] = useState(false);
  const [showTrendline, setShowTrendline] = useState(false);
  const [showForecast, setShowForecast] = useState(false);

  // If parent doesn't pass timeframe, react to a custom event.
  const [localTf, setLocalTf] = useState(timeframe || 'all');
  useEffect(() => { if (timeframe) setLocalTf(timeframe); }, [timeframe]);
  useEffect(() => {
    if (timeframe) return; // parent controls it
    const handler = (e) => { if (e?.detail?.timeframe) setLocalTf(e.detail.timeframe); };
    window.addEventListener('zyptopia:setTimeframe', handler);
    return () => window.removeEventListener('zyptopia:setTimeframe', handler);
  }, [timeframe]);

  // Fallback load if no data was provided via props
  const [fallbackData, setFallbackData] = useState([]);
  useEffect(() => {
    let mounted = true;
    async function load() {
      if (propData && propData.length) return;
      try {
        const snap = await getDocs(collection(db, 'rewards'));
        const docs = snap.docs.map(d => d.data());
        docs.sort(dateAsc);
        if (mounted) setFallbackData(docs);
      } catch { /* ignore */ }
    }
    load();
    return () => { mounted = false; };
  }, [propData]);

  const baseData = useMemo(() => {
    const src = (propData && propData.length) ? propData : fallbackData;
    return [...src].sort(dateAsc);
  }, [propData, fallbackData]);

  // Filter by timeframe
  const filteredData = useMemo(() => {
    const start = startDateFor(localTf);
    return baseData.filter(d => {
      const dt = new Date(d.date);
      dt.setHours(0, 0, 0, 0);
      return dt >= start;
    });
  }, [baseData, localTf]);

  const labels   = useMemo(() => filteredData.map(d => d.date), [filteredData]);
  const values   = useMemo(() => filteredData.map(d => Number(d.rewardPerToken) || 0), [filteredData]);

  const cumulative = useMemo(() => {
    let sum = 0; return values.map(v => (sum += v));
  }, [values]);

  const trendline  = useMemo(() => linearRegression(values), [values]);

  const forecast = useMemo(() => {
    const f = forecastNextDays(values, 7, 30);
    if (!f.length) return { labels: [], values: [] };
    const start = labels.length ? new Date(labels[labels.length - 1]) : new Date();
    const fLabels = [];
    for (let i = 1; i <= f.length; i++) {
      const d = new Date(start); d.setDate(d.getDate() + i);
      fLabels.push(d.toISOString().slice(0, 10));
    }
    return { labels: fLabels, values: f };
  }, [labels, values]);

  // Visible-window average
  const computedAverage = useMemo(() => {
    if (!values.length) return null;
    const sum = values.reduce((a, b) => a + (b ?? 0), 0);
    return sum / values.length;
  }, [values]);

  // Report average to parent + broadcast fallback custom event
  useEffect(() => {
    if (typeof onAverageChange === 'function') onAverageChange(computedAverage ?? null);
    if (computedAverage != null && Number.isFinite(computedAverage)) {
      window.dispatchEvent(new CustomEvent('zyptopia:avg', { detail: { value: computedAverage } }));
    }
  }, [computedAverage, onAverageChange]);

  const chartData = useMemo(() => {
    const ds = [];

    // Main series — brighter, more “fun”
    ds.push({
      label: 'Reward per 1,000,000 Zypto',
      data: values,
      borderColor: '#00E7C6',
      backgroundColor: 'rgba(0,231,198,0.16)',
      pointRadius: 0,
      borderWidth: 2.5,
      tension: 0.28,
      fill: true
    });

    const avgToDraw = computedAverage ?? averageReward;
    if (showAverage && avgToDraw != null && Number.isFinite(avgToDraw)) {
      ds.push({
        label: 'Average',
        data: values.map(() => avgToDraw),
        borderColor: '#FFD54F',
        borderDash: [6, 6],
        pointRadius: 0,
        fill: false,
        borderWidth: 2
      });
    }

    if (showCumulative) {
      ds.push({
        label: 'Cumulative',
        data: cumulative,
        borderColor: '#66BB6A',
        pointRadius: 0,
        fill: false,
        yAxisID: 'y2',
        borderWidth: 2
      });
    }

    if (showTrendline) {
      ds.push({
        label: 'Trendline',
        data: trendline,
        borderColor: '#B39DDB',
        borderDash: [12, 6],
        pointRadius: 0,
        fill: false,
        borderWidth: 2
      });
    }

    if (showForecast && forecast.values.length) {
      ds.push({
        label: '7-day Forecast',
        data: [...Array(values.length).fill(null), ...forecast.values],
        borderColor: '#26A69A',
        borderDash: [4, 4],
        pointRadius: 0,
        fill: false,
        borderWidth: 2
      });
    }

    const xLabels = [...labels, ...(showForecast ? forecast.labels : [])];
    return { labels: xLabels, datasets: ds };
  }, [
    labels, values, computedAverage, averageReward,
    cumulative, trendline, forecast,
    showAverage, showCumulative, showTrendline, showForecast
  ]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { boxWidth: 12, color: 'rgba(255,255,255,.9)' }
      },
      title: { display: false },
      tooltip: {
        backgroundColor: 'rgba(18,22,28,.95)',
        borderColor: 'rgba(255,255,255,.12)',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          label: (ctx) => {
            const v = ctx.parsed.y;
            return `${ctx.dataset.label}: ${Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
          }
        }
      },
      outerGlow: { color: 'rgba(0,255,200,.55)', blur: 10, lineWidth: 2.5, datasetIndex: 0 }
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          color: 'rgba(255,255,255,.85)',
          callback: (v) => Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })
        },
        grid: { color: 'rgba(255,255,255,0.06)' }
      },
      y2: showCumulative ? {
        position: 'right',
        grid: { drawOnChartArea: false },
        ticks: {
          color: 'rgba(255,255,255,.75)',
          callback: (v) => Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })
        }
      } : undefined,
      x: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: 'rgba(255,255,255,.75)', maxRotation: 0, autoSkip: true, maxTicksLimit: 12 }
      }
    },
    interaction: { intersect: false, mode: 'index' }
  }), [showCumulative]);

  return (
    <div className="graph-card" style={{ width: '100%' }}>
      {/* Toggles */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <input type="checkbox" checked={showAverage} onChange={(e) => setShowAverage(e.target.checked)} />
          <span>Average</span>
        </label>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <input type="checkbox" checked={showCumulative} onChange={(e) => setShowCumulative(e.target.checked)} />
          <span>Cumulative</span>
        </label>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <input type="checkbox" checked={showTrendline} onChange={(e) => setShowTrendline(e.target.checked)} />
          <span>Trendline</span>
        </label>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <input type="checkbox" checked={showForecast} onChange={(e) => setShowForecast(e.target.checked)} />
          <span>7-day Forecast</span>
        </label>
      </div>

      {/* Chart (responsive height) */}
      <div style={{ height: 'clamp(240px, 45vh, 380px)' }}>
        <Line data={chartData} options={options} plugins={[outerGlow]} />
      </div>

      {/* Gentle helper + CTA */}
      <div
        className="graph-cta"
        aria-live="polite"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          marginTop: '0.5rem',
          flexWrap: 'wrap',
          fontSize: '0.95rem',
          opacity: 0.95
        }}
      >
        <span>Data shown is real daily rewards tracked by the community.</span>
        <OutboundLink
          href={REF_BY_PLACEMENT('graph_footer')}
          eventName="cta_click"
          eventParams={{ placement: 'graph_footer' }}
          className="link-quiet"
          style={{ textDecoration: 'underline' }}
        >
          New here? See how to start earning →
        </OutboundLink>
      </div>
    </div>
  );
}
