import React from 'react';
import PriceChange from './PriceChange';

const StatCard = ({ label, value, sub, change, icon, accent = 'brand' }) => {
  const accentBg = accent === 'gold' ? 'bg-gold-50 text-gold-700' : 'bg-brand-50 text-brand-700';
  return (
    <div className="rounded-xl bg-white border border-slate-200/70 shadow-soft px-5 py-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-display font-semibold text-ink num truncate">{value}</p>
        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
          {change !== undefined && change !== null ? <PriceChange value={change} /> : null}
          {sub ? <span className="truncate">{sub}</span> : null}
        </div>
      </div>
      {icon ? (
        <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center font-display text-lg ${accentBg}`}>
          {icon}
        </div>
      ) : null}
    </div>
  );
};

export default StatCard;
