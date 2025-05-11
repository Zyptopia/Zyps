import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { db, logEvent } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import Graph from '../components/Graph';
import PromoBanner from '../components/PromoBanner';

const HomePage = () => {
  const [dateRange, setDateRange]         = useState('7');
  const [startDate, setStartDate]         = useState('');
  const [endDate, setEndDate]             = useState('');
  const [filteredData, setFilteredData]   = useState([]);
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
        {/* ensure correct scaling on mobile */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Zyptopia – Track & Calculate Daily Zyp Rewards</title>
        <meta
          name="description"
          content="Zyptopia is a free, community-driven platform for Zypto token holders to track daily Zyp rewards, visualize trends, and calculate earnings in Zyps and USD."
        />
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

        {/* Timeframe selector - now stacks on narrow screens */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          justifyContent: 'center',
          marginBottom: '1rem'
        }}>
          <label style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            Timeframe:
            <select
              value={dateRange}
              onChange={e => handleRangeChange(e.target.value)}
              style={{ marginTop: '0.5rem' }}
            >
              <option value="7">Last 7 Entries</option>
              <option value="30">Last 30 Entries</option>
              <option value="90">Last 90 Entries</option>
              <option value="365">Last 365 Entries</option>
              <option value="custom">Custom Range</option>
            </select>
          </label>

          {dateRange === 'custom' && (
            <>
              <label style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                Start:
                <input
                  type="date"
                  value={startDate}
                  onChange={e => handleStartDate(e.target.value)}
                  style={{ marginTop: '0.5rem' }}
                />
              </label>
              <label style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                End:
                <input
                  type="date"
                  value={endDate}
                  onChange={e => handleEndDate(e.target.value)}
                  style={{ marginTop: '0.5rem' }}
                />
              </label>
            </>
          )}
        </div>

        <Graph data={filteredData} averageReward={averageReward} />

        {/* Promo Banner placed below the graph for seamless integration */}
        <PromoBanner />
      </div>
    </>
  );
};

export default HomePage;
