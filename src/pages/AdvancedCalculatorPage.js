// src/pages/AdvancedCalculatorPage.js
import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const AdvancedCalculatorPage = () => {
  // === ROI & APY state ===
  const [holdings, setHoldings] = useState('');
  const [avgBuyPrice, setAvgBuyPrice] = useState('');
  const [startDate, setStartDate] = useState('');
  const [loading, setLoading] = useState(false);

  const [dailyZyps, setDailyZyps] = useState(null);
  const [daysHeld, setDaysHeld] = useState(0);
  const [earnedUsd, setEarnedUsd] = useState(null);
  const [roiPercent, setRoiPercent] = useState(null);
  const [apyPercent, setApyPercent] = useState(null);

  const handleCalculate = async () => {
    if (!holdings || !avgBuyPrice || !startDate) return;
    setLoading(true);

    // Fetch rewards since startDate
    const rewardsRef = collection(db, 'rewards');
    const q           = query(rewardsRef, where('date', '>=', startDate));
    const snapshot   = await getDocs(q);
    const docs       = snapshot.docs.map(d => d.data());

    // Average rewardPerToken (Zyps per 1M tokens per day)
    const total  = docs.reduce((sum, d) => sum + (d.rewardPerToken || 0), 0);
    const count  = docs.length || 1;
    const avgR   = total / count;

    // Days held
    const today = new Date();
    const start = new Date(startDate);
    const days  = Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1;

    // Earnings calculations
    const daily       = (holdings / 1_000_000) * avgR;
    const totalZyps   = daily * days;
    const usdEarned   = totalZyps / 1000; // 1000 Zyps = $1
    const investedUsd = holdings * avgBuyPrice;
    const roi         = investedUsd ? (usdEarned / investedUsd) * 100 : 0;
    const apy         = days > 0 ? (roi * (365 / days)) : 0;

    // Update state
    setDailyZyps(daily.toFixed(2));
    setDaysHeld(days);
    setEarnedUsd(usdEarned.toFixed(2));
    setRoiPercent(roi.toFixed(2));
    setApyPercent(apy.toFixed(2));
    setLoading(false);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // === Historical Table state ===
  const [history, setHistory]         = useState([]);
  const [searchTerm, setSearchTerm]   = useState('');
  const [sortField, setSortField]     = useState('date');
  const [sortAsc, setSortAsc]         = useState(true);
  const [pageSize, setPageSize]       = useState('10');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    getDocs(collection(db, 'rewards')).then(snap => {
      setHistory(snap.docs.map(d => d.data()));
    });
  }, []);

  // Filter & sort
  const filteredSorted = useMemo(() => {
    let arr = history.filter(h =>
      h.date.includes(searchTerm) ||
      String(h.rewardPerToken).includes(searchTerm)
    );
    arr.sort((a, b) => {
      const cmp = sortField === 'date'
        ? new Date(a.date) - new Date(b.date)
        : a.rewardPerToken - b.rewardPerToken;
      return sortAsc ? cmp : -cmp;
    });
    return arr;
  }, [history, searchTerm, sortField, sortAsc]);

  // Pagination
  const paginated = useMemo(() => {
    if (pageSize === 'All') return filteredSorted;
    const size       = Number(pageSize);
    const startIndex = (currentPage - 1) * size;
    return filteredSorted.slice(startIndex, startIndex + size);
  }, [filteredSorted, pageSize, currentPage]);

  const pageCount = pageSize === 'All'
    ? 1
    : Math.ceil(filteredSorted.length / Number(pageSize));

  return (
    <div className="page-content" style={{ maxWidth: 700, margin: '0 auto' }}>
      <h1>Advanced Zyps ROI &amp; APY Calculator</h1>

      {/* ROI & APY */}
      <section style={{ marginTop: '2rem' }}>
        <h2>ROI &amp; APY</h2>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <input
            type="number" placeholder="Holdings"
            value={holdings} onChange={e => setHoldings(Number(e.target.value))}
          />
          <input
            type="number" placeholder="Avg Buy Price (USD)"
            value={avgBuyPrice} onChange={e => setAvgBuyPrice(Number(e.target.value))}
          />
          <input
            type="date" value={startDate}
            onChange={e => setStartDate(e.target.value)}
            max={todayStr}
          />
          <button onClick={handleCalculate} disabled={loading}
            style={{
              padding: '0.75rem',
              backgroundColor: '#00BFFF',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}>
            {loading ? 'Calculating…' : 'Compute ROI & APY'}
          </button>
        </div>
        {roiPercent !== null && (
          <div style={{ marginTop: '1rem', lineHeight: 1.5 }}>
            <p><strong>Days Held:</strong> {daysHeld} days</p>
            <p><strong>Daily Zyps:</strong> {dailyZyps}</p>
            <p><strong>Total USD Earned:</strong> ${earnedUsd}</p>
            <p><strong>ROI:</strong> {roiPercent}%</p>
            <p><strong>APY:</strong> {apyPercent}%</p>
          </div>
        )}
      </section>

      {/* Historical Table */}
      <section style={{ marginTop: '2rem' }}>
        <h2>Historical Zyps Table</h2>
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: '1rem', marginBottom: '1rem'
        }}>
          <input
            type="text"
            placeholder="Search date or Zyps…"
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            style={{ flex: 1 }}
          />
          <label>
            Show:
            <select
              value={pageSize}
              onChange={e => { setPageSize(e.target.value); setCurrentPage(1); }}
              style={{ marginLeft: '0.5rem' }}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="All">All</option>
            </select>
          </label>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th
                style={{ cursor: 'pointer', borderBottom: '1px solid #ccc' }}
                onClick={() => {
                  if (sortField === 'date') setSortAsc(!sortAsc);
                  else { setSortField('date'); setSortAsc(true); }
                }}
              >
                Date {sortField === 'date' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
              <th
                style={{ cursor: 'pointer', borderBottom: '1px solid #ccc' }}
                onClick={() => {
                  if (sortField === 'rewardPerToken') setSortAsc(!sortAsc);
                  else { setSortField('rewardPerToken'); setSortAsc(true); }
                }}
              >
                Zyps per 1M {sortField === 'rewardPerToken' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((row, i) => (
              <tr key={i}>
                <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>
                  {row.date}
                </td>
                <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>
                  {row.rewardPerToken.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {pageSize !== 'All' && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1rem',
            marginTop: '1rem'
          }}>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              Prev
            </button>
            <span>Page {currentPage} of {pageCount}</span>
            <button
              disabled={currentPage === pageCount}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdvancedCalculatorPage;
