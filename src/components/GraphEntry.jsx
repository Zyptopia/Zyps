// src/components/GraphEntry.jsx
// Simple adapter so pages can talk to your graph in a consistent way.
import React, { useEffect } from 'react';
import Graph from './Graph'; // <-- your real chart

export default function GraphEntry({ timeframe, onAverageChange, ...rest }) {
  // Always broadcast timeframe via event too (for legacy listeners)
  useEffect(() => {
    if (!timeframe) return;
    window.dispatchEvent(new CustomEvent('zyptopia:setTimeframe', { detail: { timeframe } }));
  }, [timeframe]);

  return (
    <Graph
      {...rest}
      timeframe={timeframe}
      onAverageChange={onAverageChange}
    />
  );
}
