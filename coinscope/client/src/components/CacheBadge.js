import React from 'react';

// Surfaces the X-Cache header from our backend proxy so the engineering
// lesson (per-endpoint TTLs + inflight dedup + mock fallback) is visible.
const labelFor = (status) => {
  if (!status) return 'live';
  return String(status).toLowerCase();
};

const colorFor = (status) => {
  switch (String(status || '').toUpperCase()) {
    case 'HIT':
      return 'bg-brand-50 text-brand-700 border-brand-200';
    case 'INFLIGHT':
      return 'bg-gold-50 text-gold-700 border-gold-200';
    case 'MISS':
      return 'bg-slate-100 text-slate-600 border-slate-200';
    default:
      return 'bg-slate-50 text-slate-500 border-slate-200';
  }
};

const CacheBadge = ({ cache, className = '' }) => {
  if (!cache || (!cache.status && !cache.ttl)) return null;
  const label = labelFor(cache.status);
  const color = colorFor(cache.status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${color} ${className}`}
      title={`Cache: ${cache.status || 'live'} · TTL ${cache.ttl || '?'}s · source ${cache.source || 'live'}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden="true" />
      cache: {label}
      {cache.ttl ? <span className="opacity-70">· {cache.ttl}s</span> : null}
    </span>
  );
};

export default CacheBadge;
