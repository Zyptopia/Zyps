import React, { useState, useEffect } from 'react';
import { db } from '../firebase';  
import { collection, getDocs } from 'firebase/firestore';
import Graph from '../components/Graph'; 

const HomePage = () => {
  const [dateRange, setDateRange] = useState('7');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [averageReward, setAverageReward] = useState(0);
  const [zyptoOwned, setZyptoOwned] = useState('');
  const [calculatedRewards, setCalculatedRewards] = useState(0);
  const [yearlyRewards, setYearlyRewards] = useState(0); // State for yearly rewards
  const [dailyUSD, setDailyUSD] = useState(0); // State for daily rewards in USD
  const [yearlyUSD, setYearlyUSD] = useState(0); // State for yearly rewards in USD

  const handleDateRangeChange = (e) => {
    const selectedRange = e.target.value;
    setDateRange(selectedRange);
    if (selectedRange !== 'custom') {
      setStartDate('');
      setEndDate('');
    }
  };

  const getFilteredData = (rewardsData) => {
    const today = new Date();
    let rangeDate;

    if (dateRange === '7') {
      rangeDate = new Date(today.setDate(today.getDate() - 7));
    } else if (dateRange === '30') {
      rangeDate = new Date(today.setDate(today.getDate() - 30));
    } else if (dateRange === 'custom' && startDate && endDate) {
      rangeDate = { start: new Date(startDate), end: new Date(endDate) };
    } else {
      return rewardsData;
    }

    return rewardsData.filter((item) => {
      const itemDate = new Date(item.date);
      if (dateRange === 'custom') {
        return itemDate >= rangeDate.start && itemDate <= rangeDate.end;
      } else {
        return itemDate >= rangeDate;
      }
    });
  };

  const handleZyptoOwnedChange = (e) => {
    const input = e.target.value;
    setZyptoOwned(input);
    if (input && !isNaN(input)) {
      const dailyRewards = (input / 1000000) * averageReward;
      const yearlyRewards = dailyRewards * 365;
      
      // Calculate daily and yearly rewards in USD (1000 Zyps = 1 USD)
      const dailyUSD = dailyRewards / 1000;  // Convert Zyps to USD
      const yearlyUSD = yearlyRewards / 1000;  // Convert Zyps to USD

      setCalculatedRewards(dailyRewards);
      setYearlyRewards(yearlyRewards);
      setDailyUSD(dailyUSD);
      setYearlyUSD(yearlyUSD);
    } else {
      setCalculatedRewards(0);
      setYearlyRewards(0);
      setDailyUSD(0);
      setYearlyUSD(0);
    }
  };

  const handleAverageRewardChange = (newAverageReward) => {
    setAverageReward(newAverageReward);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rewardsCollection = collection(db, 'rewards');
        const snapshot = await getDocs(rewardsCollection);
        const rewardsData = snapshot.docs.map(doc => doc.data());

        const filteredData = getFilteredData(rewardsData);
        const formattedData = filteredData.map(doc => ({
          date: doc.date,
          rewardPerToken: doc.rewardPerToken
        }));

        setFilteredData(formattedData);

        const totalRewards = filteredData.reduce((sum, item) => sum + item.rewardPerToken, 0);
        const averageReward = (totalRewards / filteredData.length).toFixed(2);
        setAverageReward(averageReward);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, [dateRange, startDate, endDate]);

  return (
    <div className="page-content">
      <h1>Welcome to Zyptopia</h1>
      <select value={dateRange} onChange={handleDateRangeChange}>
        <option value="7">Last 7 Days</option>
        <option value="30">Last 30 Days</option>
        <option value="custom">Custom Range</option>
      </select>

      {dateRange === 'custom' && (
        <div>
          <label>Start Date:</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <label>End Date:</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      )}

      <Graph data={filteredData} onAverageRewardChange={handleAverageRewardChange} />

      <div className="earnings-calculator">
        <h2>$1 USD = 1,000 Zyps</h2>
        <p></p>
        <p></p><br></br>
        <h2>Earnings Calculator</h2>
        <br></br>
        <label htmlFor="zyptoOwned">Zypto Owned:</label>
        <input id="zyptoOwned" type="number" value={zyptoOwned} onChange={handleZyptoOwnedChange} placeholder="Enter amount of Zypto owned" />
        <div><br></br><strong>Average daily Zyp rewards: <span>{calculatedRewards ? `${calculatedRewards.toFixed(2)} Zyp` : '0 Zyps'}</span></strong></div>
        <div><br></br><strong>Daily average Zyp rewards in $USD: <span>{dailyUSD ? `$${dailyUSD.toFixed(2)}` : '$0.00'}</span></strong></div>
        <div><br></br><strong>Yearly average Zyp rewards: <span>{yearlyRewards ? `${yearlyRewards.toFixed(2)} Zyp` : '0 Zyps'}</span></strong></div>
        <div><br></br><strong>Yearly average Zyp rewards in $USD: <span>{yearlyUSD ? `$${yearlyUSD.toFixed(2)}` : '$0.00'}</span></strong></div>

        <br></br><small>*based on current daily average*</small>
      </div>
    </div>
  );
};

export default HomePage;
