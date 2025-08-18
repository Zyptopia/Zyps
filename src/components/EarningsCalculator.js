// src/components/EarningsCalculator.js
import React, { useEffect, useMemo, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

import OutboundLink from "./OutboundLink";
import { REF_BY_PLACEMENT } from "../constants";
import { trackEvent } from "../analytics";

// Helper to sort by date string "YYYY-MM-DD"
const byDateAsc = (a, b) => new Date(a.date) - new Date(b.date);

export default function EarningsCalculator() {
  const [tokens, setTokens] = useState("");
  const [priceUsd, setPriceUsd] = useState("");
  const [loading, setLoading] = useState(true);
  const [avgPer1M, setAvgPer1M] = useState(null); // average Zyps/day per 1,000,000 tokens
  const [sampleSize, setSampleSize] = useState(0);
  const [error, setError] = useState("");

  // Load recent rewards and compute average rewardPerToken (per 1,000,000 tokens)
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const snap = await getDocs(collection(db, "rewards"));
        const docs = snap.docs.map((d) => d.data()).filter(Boolean);
        docs.sort(byDateAsc);

        const N = 30;
        const recent = docs.slice(-N);
        const useSet = recent.length >= 10 ? recent : docs; // fallback if too few
        const vals = useSet
          .map((d) => Number(d.rewardPerToken))
          .filter((v) => Number.isFinite(v));

        const avg =
          vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;

        if (mounted) {
          setAvgPer1M(avg);
          setSampleSize(vals.length);
        }
      } catch (e) {
        if (mounted) setError("Could not load reward data.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const t = parseFloat(tokens) || 0;
  const p = parseFloat(priceUsd) || 0;

  // Scale average to the user's holdings
  const dailyZyps = useMemo(() => {
    if (!avgPer1M || t <= 0) return 0;
    const scale = t / 1_000_000; // data is per 1,000,000 tokens
    return avgPer1M * scale;
  }, [avgPer1M, t]);

  const dailyUsd = useMemo(() => (p ? dailyZyps * p : 0), [dailyZyps, p]);
  const monthlyZyps = useMemo(() => dailyZyps * 30, [dailyZyps]);
  const yearlyZyps = useMemo(() => dailyZyps * 365, [dailyZyps]);

  const onCalculate = () => {
    trackEvent("mini_calc_used", {
      tokens: t,
      price_usd: p || null,
      avg_per_1m: avgPer1M ?? null,
      sample: sampleSize,
    });
  };

  return (
    <div className="calc-card" style={styles.card}>
      <h2 style={{ margin: 0 }}>Earnings Calculator</h2>
      <p style={styles.muted}>
        Estimates use the{" "}
        {sampleSize > 0 ? (
          <>
            average of the last <strong>{sampleSize}</strong> days
          </>
        ) : (
          "latest available"
        )}{" "}
        of community-tracked rewards (per 1,000,000 tokens).
      </p>

      <div style={styles.grid}>
        <label style={styles.label}>
          Zypto held
          <input
            type="number"
            inputMode="decimal"
            value={tokens}
            onChange={(e) => setTokens(e.target.value)}
            placeholder="e.g. 10,000"
            style={styles.input}
          />
        </label>

        <label style={styles.label}>
          Price (USD) <small style={{ opacity: 0.7 }}>(optional)</small>
          <input
            type="number"
            inputMode="decimal"
            value={priceUsd}
            onChange={(e) => setPriceUsd(e.target.value)}
            placeholder="e.g. 0.025"
            style={styles.input}
          />
        </label>
      </div>

      <button className="btn btn-primary" style={styles.primaryBtn} onClick={onCalculate} disabled={loading}>
        {loading ? "Loading…" : "Calculate"}
      </button>

      {error && <div style={styles.error}>{error}</div>}

      {t > 0 && !loading && (
        <div className="calc-results" style={styles.results}>
          <div style={styles.row}>
            <div>Daily:</div>
            <div>
              {dailyZyps.toFixed(4)} Zyps{" "}
              {p ? <span style={styles.muted}>(≈ ${dailyUsd.toFixed(2)})</span> : null}
            </div>
          </div>
          <div style={styles.row}>
            <div>Monthly (30d):</div>
            <div>{monthlyZyps.toFixed(2)} Zyps</div>
          </div>
          <div style={styles.row}>
            <div>Yearly (365d):</div>
            <div>{yearlyZyps.toFixed(2)} Zyps</div>
          </div>

          <div className="calc-cta" style={styles.cta}>
            <span>Like these numbers? Make them yours.</span>
            <OutboundLink
              href={REF_BY_PLACEMENT("calculator_inline")}
              eventName="cta_click"
              eventParams={{
                placement: "calculator_inline",
                tokens: t,
                est_daily_zyps: Number(dailyZyps.toFixed(6)),
                sample: sampleSize,
              }}
              className="btn btn-secondary"
              style={styles.secondaryBtn}
            >
              Start earning Zyps
            </OutboundLink>
          </div>

          {avgPer1M != null && (
            <div style={styles.note}>
              <strong>Note:</strong> Current average ≈{" "}
              <strong>{avgPer1M.toFixed(4)}</strong> Zyps/day per 1,000,000 tokens.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    padding: "1rem",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 12,
    maxWidth: 720,
    margin: "0 auto",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "0.75rem",
    margin: "0.75rem 0",
  },
  label: { display: "grid", gap: "0.35rem", fontWeight: 500 },
  input: {
    width: "100%",
    padding: "0.6rem",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.04)",
    color: "inherit",
  },
  primaryBtn: {
    padding: "0.55rem 0.9rem",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.06)",
    fontWeight: 600,
  },
  results: { marginTop: "0.75rem", display: "grid", gap: "0.35rem" },
  row: { display: "flex", justifyContent: "space-between" },
  cta: {
    marginTop: "0.75rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  secondaryBtn: {
    padding: "0.5rem 0.8rem",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.08)",
    fontWeight: 600,
  },
  note: {
    marginTop: "0.5rem",
    fontSize: "0.9rem",
    opacity: 0.85,
  },
  muted: { opacity: 0.8 },
  error: {
    marginTop: "0.5rem",
    color: "#ff7676",
    fontSize: "0.95rem",
  },
};

// Mobile responsiveness (no CSS file needed)
const styleEl = typeof document !== "undefined" ? document.createElement("style") : null;
if (styleEl) {
  styleEl.innerHTML = `
    @media (max-width: 680px) {
      .calc-card .calc-grid { grid-template-columns: 1fr; }
    }
  `;
  document.head.appendChild(styleEl);
}
