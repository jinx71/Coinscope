import React from 'react';

const Footer = () => (
  <footer className="mt-auto py-8 border-t border-slate-200 bg-white/60">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
      <p className="text-xs text-slate-500">
        © {new Date().getFullYear()} CoinScope. Prices via CoinGecko (proxied + cached).
        Not financial advice.
      </p>
      <p className="text-xs text-slate-500">
        Built with MERN · React {React.version} · Tailwind · Recharts
      </p>
    </div>
  </footer>
);

export default Footer;
