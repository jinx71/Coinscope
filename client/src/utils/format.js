// Small, locale-aware formatting helpers for prices, market caps and percentages.

const usd0 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const usd2 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const usd6 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 6 });
const num0 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const num2 = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const fmtPrice = (n) => {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return '—';
  const x = Number(n);
  if (Math.abs(x) >= 1) return usd2.format(x);
  if (Math.abs(x) >= 0.01) return usd6.format(x);
  // Very small (sub-cent) prices — show up to 8 sig fig.
  return `$${x.toPrecision(4)}`;
};

export const fmtUsdShort = (n) => {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return '—';
  const x = Number(n);
  const abs = Math.abs(x);
  if (abs >= 1e12) return `${(x / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${(x / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${(x / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${(x / 1e3).toFixed(2)}K`;
  return usd0.format(x);
};

export const fmtUsdCompact = (n) => {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return '—';
  return `$${fmtUsdShort(n)}`;
};

export const fmtNumber = (n, decimals = 0) => {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return '—';
  return decimals === 2 ? num2.format(Number(n)) : num0.format(Number(n));
};

export const fmtPct = (n) => {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return '—';
  const x = Number(n);
  const sign = x > 0 ? '+' : '';
  return `${sign}${x.toFixed(2)}%`;
};

export const fmtAmount = (n) => {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return '—';
  const x = Number(n);
  if (Math.abs(x) >= 1) return num2.format(x);
  return x.toPrecision(4);
};
