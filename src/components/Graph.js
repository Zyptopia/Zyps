import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Graph = ({ data }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Reward for 1,000,000 Tokens',
        data: [],
        borderColor: 'rgba(75,192,192,1)',
        fill: false,
      },
    ],
  });

  useEffect(() => {
    if (data.length > 0) {
      // Sort the data based on the date
      const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date (ascending)

      const labels = sortedData.map((item) => item.date);
      const rewardPerTokenData = sortedData.map((item) => item.rewardPerToken);

      setChartData({
        labels: labels,
        datasets: [
          {
            label: 'Reward for 1,000,000 Tokens',
            data: rewardPerTokenData,
            borderColor: 'rgba(75,192,192,1)',
            fill: false,
          },
        ],
      });
    }
  }, [data]);

  // Calculating total and average rewards for 1,000,000 tokens
  const totalRewards = data.reduce((sum, item) => sum + item.rewardPerToken, 0);
  const averageReward = (totalRewards / data.length).toFixed(2);

  return (
    <div>
      <h1>Average Reward per 1,000,000 Tokens: {averageReward}</h1>
      <Line data={chartData} />
    </div>
  );
};

export default Graph;
