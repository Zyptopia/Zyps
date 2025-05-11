// src/pages/CalculatorPage.js

import React, { useState, useEffect } from 'react';
import { db, logEvent } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import PromoBanner from '../components/PromoBanner';

export default function CalculatorPage() {
  // track page view
  useEffect(() => {
    logEvent('page_view', { page: 'calculator' });
  }, []);

  // Tab state: 'earnings' or 'roi'
  const [activeTab, setActiveTab] = useState('earnings');

  // ─── Zyps Earnings Calculator ─────────────────────────────────────────────
  const [averageReward, setAverageReward] = useState(0);
  const [zyptoEarn, setZyptoEarn] = useState('');
  const [dailyZyps, setDailyZyps] = useState('0.00');
  const [dailyUSD, setDailyUSD] = useState('0.00');
  const [yearlyZyps, setYearlyZyps] = useState('0.00');
  const [yearlyUSD, setYearlyUSD] = useState('0.00');

  useEffect(() => {
    async function fetchAverage() {
      const snap = await getDocs(collection(db, 'rewards'));
      const arr = snap.docs.map(d => d.data().rewardPerToken || 0);
      const avg = arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
      setAverageReward(avg);
    }
    fetchAverage();
  }, []);

  useEffect(() => {
    const amt = Number(zyptoEarn);
    if (amt > 0 && averageReward > 0) {
      const daily = (amt / 1_000_000) * averageReward;
      const yearly = daily * 365;
      setDailyZyps(daily.toFixed(2));
      setDailyUSD((daily / 1000).toFixed(2));
      setYearlyZyps(yearly.toFixed(2));
      setYearlyUSD((yearly / 1000).toFixed(2));
    } else {
      setDailyZyps('0.00');
      setDailyUSD('0.00');
      setYearlyZyps('0.00');
      setYearlyUSD('0.00');
    }
  }, [zyptoEarn, averageReward]);

  // ─── ROI & APY Calculator ─────────────────────────────────────────────────
  const [zyptoROI, setZyptoROI] = useState('');
  const [avgBuyPrice, setAvgBuyPrice] = useState('');
  const [startDate, setStartDate] = useState('');
  const [roi, setRoi] = useState(null);
  const [apy, setApy] = useState(null);

  const handleCalculateROI = () => {
    logEvent('calculator_compute', { tab: activeTab });
    const tokens = Number(zyptoROI);
    const price = Number(avgBuyPrice);
    if (!tokens || !price || !startDate) return;

    const today = new Date();
    const start = new Date(startDate);
    const daysHeld = Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1;

    const dailyZCalc = (tokens / 1_000_000) * averageReward;
    const dailyUsdCalc = dailyZCalc / 1000;
    const totalUSD = dailyUsdCalc * daysHeld;

    const invested = tokens * price;
    const roiVal = invested ? (totalUSD / invested) * 100 : 0;
    const apyVal = daysHeld > 0 ? (roiVal * (365 / daysHeld)) : 0;

    setRoi(roiVal.toFixed(2));
    setApy(apyVal.toFixed(2));
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Styles
  const tabButton = selected => ({
    flex: 1,
    padding: '0.75rem',
    cursor: 'pointer',
    backgroundColor: selected ? '#00BFFF' : '#1e1e1e',
    border: 'none',
    color: selected ? '#fff' : '#ccc',
    fontWeight: selected ? 'bold' : 'normal',
    borderRadius: '4px 4px 0 0',
    textAlign: 'center'
  });

  const cardStyle = {
    width: '100%',
    maxWidth: 400,
    border: '1px solid #444',
    borderTop: 'none',
    borderRadius: '0 4px 4px 4px',
    padding: '1.5rem',
    backgroundColor: '#282c34',
    color: '#fff',
    textAlign: 'center',
    marginBottom: '2rem'
  };

  const inputStyle = {
    width: '100%',
    padding: '.5rem',
    marginTop: '.25rem',
    borderRadius: 4,
    border: '1px solid #555',
    backgroundColor: '#1e1e1e',
    color: '#fff'
  };

  const resultBox = {
    backgroundColor: '#1e1e1e',
    padding: '1rem',
    borderRadius: 4,
    border: '1px solid #555',
    margin: '1rem auto',
    width: '100%',
    boxSizing: 'border-box',
    textAlign: 'left'
  };

  return (
    <div className="page-content" style={{ maxWidth: 700, margin: '2rem auto', padding: '0 1rem' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>All-in-One Zyps Calculators</h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1px' }}>
        <button
          style={tabButton(activeTab === 'earnings')}
          onClick={() => { setActiveTab('earnings'); logEvent('calculator_tab_switch', { to: 'earnings' }); }}
        >
          Earnings
        </button>
        <button
          style={tabButton(activeTab === 'roi')}
          onClick={() => { setActiveTab('roi'); logEvent('calculator_tab_switch', { to: 'roi' }); }}
        >
          ROI & APY
        </button>
      </div>

      {/* Earnings Tab Content */}
      {activeTab === 'earnings' && (
        <section style={cardStyle}>
          <h2>Zyps Earnings Calculator</h2>
          <p style={{ color: '#ccc' }}>Estimate daily and yearly Zyps & USD earnings based on holdings.</p>
          <label style={{ display: 'block', margin: '1rem auto', maxWidth: 200, textAlign: 'left' }}>
            Zypto Tokens Owned:
            <input
              type="number"
              value={zyptoEarn}
              onChange={e => setZyptoEarn(e.target.value)}
              placeholder="e.g. 5000"
              style={inputStyle}
            />
          </label>
          <div style={resultBox}>
            <p><strong>Average Daily Zyps:</strong> {dailyZyps}</p>
            <p><strong>Average Daily USD:</strong> ${dailyUSD}</p>
            <p><strong>Average Yearly Zyps:</strong> {yearlyZyps}</p>
            <p><strong>Average Yearly USD:</strong> ${yearlyUSD}</p>
          </div>
        </section>
      )}

      {/* ROI & APY Tab Content */}
      {activeTab === 'roi' && (
        <section style={cardStyle}>
          <h2>ROI & APY Calculator</h2>
          <p style={{ color: '#ccc' }}>Calculate ROI and annualized yield from Zyps earnings.</p>
          <label style={{ display: 'block', margin: '1rem auto', maxWidth: 200, textAlign: 'left' }}>
            Zypto Tokens Owned:
            <input
              type="number"
              value={zyptoROI}
              onChange={e => setZyptoROI(e.target.value)}
              placeholder="e.g. 5000"
              style={inputStyle}
            />
          </label>
          <label style={{ display: 'block', margin: '1rem auto', maxWidth: 200, textAlign: 'left' }}>
            Avg Buy Price (USD):
            <input
              type="number"
              value={avgBuyPrice}
              onChange={e => setAvgBuyPrice(e.target.value)}
              placeholder="e.g. 2.50"
              style={inputStyle}
            />
          </label>
          <label style={{ display: 'block', margin: '1rem auto', maxWidth: 200, textAlign: 'left' }}>
            Holding Start Date:
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              max={todayStr}
              style={inputStyle}
            />
          </label>
          <button
            onClick={handleCalculateROI}
            style={{
              padding: '.75rem',
              backgroundColor: '#00BFFF',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            Compute ROI & APY
          </button>
          {roi !== null && (
            <div style={resultBox}>
              <p><strong>ROI:</strong> {roi}%</p>
              <p><strong>APY:</strong> {apy}%</p>
            </div>
          )}
        </section>
      )}

      {/* Promo Banner */}
      <PromoBanner />
    </div>
  );
}
