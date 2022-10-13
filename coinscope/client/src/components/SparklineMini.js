import React from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

const SparklineMini = ({ data, positive = true, width = 120, height = 36 }) => {
  if (!Array.isArray(data) || data.length < 2) {
    return <div className="h-9 w-[120px] skeleton" />;
  }
  const points = data.map((v, i) => ({ i, v: Number(v) }));
  const color = positive ? '#10b981' : '#ef4444';
  return (
    <div style={{ width, height }} aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          {/* Hidden axis just for auto-scaling */}
          <YAxis hide domain={['dataMin', 'dataMax']} />
          <Line
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.8}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SparklineMini;
