import React, { useState, useEffect } from 'react';

const EarningsCalculator = ({ averageReward }) => {
  const [tokens, setTokens] = useState(0);  // State for tokens input
  const [earnings, setEarnings] = useState(0);  // State for calculated earnings

  const handleTokenChange = (e) => {
    const inputTokens = e.target.value;
    setTokens(inputTokens);  // Update tokens
    setEarnings(inputTokens * averageReward);  // Calculate earnings based on tokens and average reward
  };

  useEffect(() => {
    if (tokens > 0 && averageReward > 0) {
      setEarnings(tokens * averageReward);  // Recalculate earnings when tokens or averageReward changes
    }
  }, [tokens, averageReward]);

  return (
    <div>
      <h2>Earnings Calculator</h2>
      <input
        type="number"
        value={tokens}
        onChange={handleTokenChange}
        placeholder="Enter your token holdings"
      />
      <p>Estimated Earnings: {earnings.toFixed(2)} Zyps/day</p>
    </div>
  );
};

export default EarningsCalculator;
