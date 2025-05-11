// src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { db, logEvent } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import Graph from '../components/Graph';
import PromoBanner from '../components/PromoBanner';

const HomePage = () => {
  const [dateRange, setDateRange]       = useState('7');
  const [startDate, setStartDate]       = useState('');
  const [endDate, setEndDate]           = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [averageReward, setAverageReward] = useState(0);

  // track page view
  useEffect(() => {
    logEvent('page_view', { page: 'home' });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rewardsCollection = collection(db, 'rewards');
        const snapshot = await getDocs(rewardsCollection);
        const allData = snapshot.docs.map(doc => doc.data());

        // sort all data by date ascending
        const sortedData = allData.sort((a, b) => new Date(a.date) - new Date(b.date));
        let result = [];

        if (dateRange === 'custom' && startDate && endDate) {
          const s = new Date(startDate);
          const e = new Date(endDate);
          result = sortedData.filter(item => {
            const d = new Date(item.date);
            return d >= s && d <= e;
          });
        } else {
          // numeric range: last N entries
          const days = Number(dateRange);
          result = sortedData.slice(-days);
        }

        // calculate average
        const total = result.reduce((sum, item) => sum + item.rewardPerToken, 0);
        setFilteredData(result);
        setAverageReward(result.length ? total / result.length : 0);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [dateRange, startDate, endDate]);

  const handleRangeChange = (value) => {
    setDateRange(value);
    logEvent('home_timeframe_change', { timeframe: value });
    if (value !== 'custom') {
      setStartDate('');
      setEndDate('');
    }
  };

  const handleStartDate = (value) => {
    setStartDate(value);
    logEvent('home_custom_start', { date: value });
  };

  const handleEndDate = (value) => {
    setEndDate(value);
    logEvent('home_custom_end', { date: value });
  };

  return (
    <>
      <Helmet>
        <title>Zyptopia – Track & Calculate Daily Zyp Rewards</title>
        <meta
          name="description"
          content="Zyptopia is a free, community-driven platform for Zypto token holders to track daily Zyp rewards, visualize trends, and calculate earnings in Zyps and USD."
        />
        {/* ensure proper mobile scaling */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Open Graph */}
        <meta property="og:title" content="Zyptopia – Daily Zyp Rewards Tracker" />
        <meta
          property="og:description"
          content="Visualize your Zypto token rewards with our interactive graph and calculator—powered by community data."
        />
        <meta property="og:url" content="https://www.zyptopia.org/" />
        <meta
          property="og:image"
          content="https://www.zyptopia.org/assets/og-image.png"
        />
      </Helmet>

      <div className="page-content">
        <h1>Welcome to Zyptopia</h1>

        <div style={{ margin: '1rem 0' }}>
          <label>
            Timeframe:&nbsp;
            <select
              value={dateRange}
              onChange={e => handleRangeChange(e.target.value)}
            >
              <option value="7">Last 7 Entries</option>
              <option value="30">Last 30 Entries</option>
              <option value="90">Last 90 Entries</option>
              <option value="365">Last 365 Entries</option>
              <option value="custom">Custom Range</option>
            </select>
          </label>
        </div>

        {dateRange === 'custom' && (
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ marginRight: '1rem' }}>
              Start:&nbsp;
              <input
                type="date"
                value={startDate}
                onChange={e => handleStartDate(e.target.value)}
              />
            </label>
            <label>
              End:&nbsp;
              <input
                type="date"
                value={endDate}
                onChange={e => handleEndDate(e.target.value)}
              />
            </label>
          </div>
        )}

        <Graph data={filteredData} averageReward={averageReward} />

        {/* Promo Banner placed below the graph for seamless integration */}
        <PromoBanner />
      </div>
    </>
  );
};

export default HomePage;
