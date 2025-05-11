import React, { useState, useEffect } from 'react';
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
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Graph = ({ data, averageReward }) => {
  // toggles
  const [showAverage, setShowAverage] = useState(true);
  const [showCumulative, setShowCumulative] = useState(false);
  const [showTrendline, setShowTrendline] = useState(false);
  const [showForecast, setShowForecast] = useState(false);

  // actual data series
  const [labels, setLabels] = useState([]);
  const [values, setValues] = useState([]);
  const [cumValues, setCumValues] = useState([]);
  const [trendline, setTrendline] = useState([]);

  // full data for forecast
  const [fullValues, setFullValues] = useState([]);
  const [fullDates, setFullDates] = useState([]);

  // forecast series
  const [forecastLabels, setForecastLabels] = useState([]);
  const [forecastData, setForecastData] = useState([]);

  // fetch full data once
  useEffect(() => {
    const fetchFull = async () => {
      const snap = await getDocs(collection(db, 'rewards'));
      const all = snap.docs.map(d => d.data());
      const sorted = all.sort((a, b) => new Date(a.date) - new Date(b.date));
      setFullDates(sorted.map(d => d.date));
      setFullValues(sorted.map(d => d.rewardPerToken));
    };
    fetchFull();
  }, []);

  // calculate actual series based on filtered data
  useEffect(() => {
    if (!data.length) return;
    const sorted = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
    const dates = sorted.map(d => d.date);
    const vals = sorted.map(d => d.rewardPerToken);
    setLabels(dates);
    setValues(vals);

    // cumulative
    let sum = 0;
    setCumValues(vals.map(v => (sum += v)));

    // trendline
    const n = vals.length;
    const x = vals.map((_, i) => i);
    const y = vals;
    const xMean = x.reduce((a, b) => a + b, 0) / n;
    const yMean = y.reduce((a, b) => a + b, 0) / n;
    let num = 0, den = 0;
    x.forEach((xi, i) => {
      num += (xi - xMean) * (y[i] - yMean);
      den += (xi - xMean) ** 2;
    });
    const slope = den ? num / den : 0;
    const intercept = yMean - slope * xMean;
    setTrendline(x.map(i => slope * i + intercept));
  }, [data]);

  // calculate forecast based on full 30-day rolling
  useEffect(() => {
    if (!fullValues.length) return;
    const n = fullValues.length;
    const lastDate = new Date(fullDates[n - 1]);
    const flabs = [];
    const fdata = [];
    // initial window: last 30 of fullValues
    const window = fullValues.slice(-30);
    let rolling = [...window];
    for (let i = 1; i <= 7; i++) {
      const avg = rolling.reduce((a, b) => a + b, 0) / rolling.length;
      fdata.push(avg);
      rolling.shift();
      rolling.push(avg);
      const d = new Date(lastDate);
      d.setDate(d.getDate() + i);
      flabs.push(d.toISOString().split('T')[0]);
    }
    setForecastLabels(flabs);
    setForecastData(fdata);
  }, [fullValues, fullDates]);

  const chartLabels = showForecast ? [...labels, ...forecastLabels] : labels;
  const pad = arr =>
    showForecast ? [...arr, ...Array(forecastLabels.length).fill(null)] : arr;

  const datasets = [
    { label: 'Daily Reward', data: pad(values), borderColor: 'rgba(75,192,192,1)', fill: false }
  ];
  if (showAverage)
    datasets.push({
      label: 'Average',
      data: pad(Array(values.length).fill(averageReward)),
      borderDash: [5, 5],
      borderColor: '#ffd700',
      fill: false
    });
  if (showCumulative)
    datasets.push({
      label: 'Cumulative',
      data: pad(cumValues),
      borderColor: '#00ff00',
      fill: false
    });
  if (showTrendline)
    datasets.push({
      label: 'Trendline',
      data: pad(trendline),
      borderDash: [10, 5],
      borderColor: '#ff6347',
      fill: false
    });
  if (showForecast)
    datasets.push({
      label: '7 Day Forecast',
      data: [...Array(values.length).fill(null), ...forecastData],
      borderColor: '#8888ff',
      borderDash: [2, 2],
      fill: false
    });

  const chartData = { labels: chartLabels, datasets };

  const options = {
    responsive: true,
    maintainAspectRatio: true,         // <-- let CSS wrapper control height
    interaction: { mode: 'index', intersect: false },
    plugins: {
      tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.formattedValue}` } },
      legend: { position: 'bottom' }
    },
    scales: { x: { ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 10 } } }
  };

  return (
    <div>
      {/* show average prominently */}
      <div style={{
        textAlign: 'center',
        marginBottom: '1rem',
        color: '#00BFFF',
        fontSize: '1.1rem',
        fontWeight: 'bold'
      }}>
        Average Daily Zyps: {averageReward.toFixed(2)}
      </div>

      {/* toggles */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <label><input type="checkbox" checked={showAverage} onChange={() => setShowAverage(!showAverage)} /> Average</label>
        <label><input type="checkbox" checked={showCumulative} onChange={() => setShowCumulative(!showCumulative)} /> Cumulative</label>
        <label><input type="checkbox" checked={showTrendline} onChange={() => setShowTrendline(!showTrendline)} /> Trendline</label>
        <label><input type="checkbox" checked={showForecast} onChange={() => setShowForecast(!showForecast)} /> 7 Day Forecast</label>
      </div>

      {/* fluid wrapper: always full width, keeps a 2:1 ratio */}
      <div style={{
        position: 'relative',
        width: '100%',
        paddingBottom: '50%',      // 50% = 2:1 aspect
        marginTop: '1rem',
        boxSizing: 'border-box'
      }}>
        <div style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '100%',
          height: '100%'
        }}>
          <Line data={chartData} options={options} />
        </div>
      </div>

      <div style={{
        backgroundColor: '#282c34',
        color: '#fff',
        padding: '1rem',
        borderRadius: 4,
        marginTop: '1rem',
        boxSizing: 'border-box'
      }}>
        <h3 style={{ margin: '0 0 .5rem' }}>Chart Overview</h3>
        <ul style={{ margin: 0, padding: 0, listStyle: 'disc inside', color: '#ccc' }}>
          <li><strong>Average</strong>: Shows a flat line of your average daily Zyps.</li>
          <li><strong>Cumulative</strong>: Displays the total Zyps you've earned over time.</li>
          <li><strong>Trendline</strong>: Draws a simple best-fit line to highlight the overall direction.</li>
          <li><strong>7 Day Forecast</strong>: Each day’s projection is computed from the previous 30 days’ average, rolling forward.</li>
        </ul>
      </div>
    </div>
  );
};

export default Graph;
