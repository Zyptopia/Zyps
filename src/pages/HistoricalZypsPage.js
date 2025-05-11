// src/pages/HistoricalZypsPage.js

import React, { useState, useEffect, useMemo } from 'react';
import { db, logEvent } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import PromoBanner from '../components/PromoBanner';

export default function HistoricalZypsPage() {
  // Track page view
  useEffect(() => {
    logEvent('page_view', { page: 'historical_zyps' });
  }, []);

  const [history, setHistory]             = useState([]);
  const [searchTerm, setSearchTerm]       = useState('');
  const [sortField, setSortField]         = useState('date');
  const [sortAsc, setSortAsc]             = useState(true);
  const [pageSize, setPageSize]           = useState('10');
  const [currentPage, setCurrentPage]     = useState(1);
  const [customHoldings, setCustomHoldings] = useState('');

  // Fetch data once
  useEffect(() => {
    async function fetchHistory() {
      const snap = await getDocs(collection(db, 'rewards'));
      setHistory(snap.docs.map(doc => doc.data()));
    }
    fetchHistory();
  }, []);

  // Filter & sort
  const filteredSorted = useMemo(() => {
    let arr = history.filter(item =>
      item.date.includes(searchTerm) ||
      item.rewardPerToken.toString().includes(searchTerm)
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

  // Calculate user's Zyps
  const calcYourZyps = rewardPerMillion => {
    const h = Number(customHoldings);
    if (!h) return '—';
    const earned = (rewardPerMillion * h) / 1_000_000;
    return earned.toFixed(2);
  };

  // Styles
  const tableHeaderStyle = { cursor: 'pointer', borderBottom: '2px solid #888', padding: '.5rem' };
  const tableCellStyle   = { padding: '.5rem', borderBottom: '1px solid #ddd' };

  // Handlers with analytics
  const onSearch = val => {
    setSearchTerm(val);
    setCurrentPage(1);
    logEvent('historical_search', { term: val });
  };
  const onSort = field => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
      logEvent('historical_sort', { field, direction: sortAsc ? 'desc' : 'asc' });
    } else {
      setSortField(field);
      setSortAsc(true);
      logEvent('historical_sort', { field, direction: 'asc' });
    }
  };
  const onPageSize = val => {
    setPageSize(val);
    setCurrentPage(1);
    logEvent('historical_page_size', { size: val });
  };
  const onPageChange = page => {
    setCurrentPage(page);
    logEvent('historical_page_nav', { page });
  };
  const onHoldings = val => {
    setCustomHoldings(val);
    setCurrentPage(1);
    logEvent('historical_custom_holdings', { holdings: val });
  };

  return (
    <div className="page-content" style={{ maxWidth: 800, margin: '2rem auto', padding: '0 1rem' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>Historical Zyps</h1>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1rem',
        justifyContent: 'center'
      }}>
        <input
          type="text"
          placeholder="Search date or Zyps…"
          value={searchTerm}
          onChange={e => onSearch(e.target.value)}
          style={{ padding: '.5rem', borderRadius: 4, border: '1px solid #ccc', flex: '1 1 200px', minWidth: 150 }}
        />

        <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          Show:
          <select
            value={pageSize}
            onChange={e => onPageSize(e.target.value)}
            style={{ padding: '.5rem', borderRadius: 4, border: '1px solid #ccc' }}
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="All">All</option>
          </select>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          Your Zypto Tokens:
          <input
            type="number"
            value={customHoldings}
            onChange={e => onHoldings(e.target.value)}
            placeholder="e.g. 5000"
            style={{ padding: '.5rem', borderRadius: 4, border: '1px solid #ccc', width: 100 }}
          />
        </label>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
        <thead>
          <tr>
            <th
              style={tableHeaderStyle}
              onClick={() => onSort('date')}
            >
              Date {sortField === 'date' ? (sortAsc ? '▲' : '▼') : ''}
            </th>
            <th
              style={tableHeaderStyle}
              onClick={() => onSort('rewardPerToken')}
            >
              Zyps per 1M {sortField === 'rewardPerToken' ? (sortAsc ? '▲' : '▼') : ''}
            </th>
            <th style={tableHeaderStyle}>Your Zyps</th>
          </tr>
        </thead>
        <tbody>
          {paginated.map((row, idx) => (
            <tr key={idx}>
              <td style={tableCellStyle}>{row.date}</td>
              <td style={{ ...tableCellStyle, textAlign: 'right' }}>
                {row.rewardPerToken.toFixed(2)}
              </td>
              <td style={{ ...tableCellStyle, textAlign: 'right' }}>
                {calcYourZyps(row.rewardPerToken)}
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
          marginBottom: '2rem'
        }}>
          <button
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            style={{ padding: '.5rem 1rem' }}
          >
            Prev
          </button>
          <span>Page {currentPage} of {pageCount}</span>
          <button
            disabled={currentPage === pageCount}
            onClick={() => onPageChange(currentPage + 1)}
            style={{ padding: '.5rem 1rem' }}
          >
            Next
          </button>
        </div>
      )}

      {/* Promo Banner */}
      <PromoBanner />
    </div>
  );
}
