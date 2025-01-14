// ZypsEarningsCalculator.js
import React from 'react';
import EarningsCalculator from '../components/EarningsCalculator';

const ZypsEarningsCalculator = () => (
    <div className="page-content">
    <h1>Zyps Earnings Calculator</h1>
    <EarningsCalculator averageReward={15} /> {/* Example average reward */}
  </div>
);

export default ZypsEarningsCalculator;
