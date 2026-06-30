import React from 'react';
import { fmtPct } from '../utils/format';

const PriceChange = ({ value, size = 'sm', showIcon = true, className = '' }) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return <span className="text-slate-400 num">—</span>;
  }
  const x = Number(value);
  const positive = x >= 0;
  const color = positive
    ? 'text-emerald-700 bg-emerald-50'
    : 'text-red-700 bg-red-50';
  const sz = size === 'lg' ? 'text-base px-2.5 py-1' : 'text-xs px-2 py-0.5';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md font-medium num ${color} ${sz} ${className}`}
    >
      {showIcon && (
        <span aria-hidden="true">{positive ? '▲' : '▼'}</span>
      )}
      {fmtPct(x)}
    </span>
  );
};

export default PriceChange;
