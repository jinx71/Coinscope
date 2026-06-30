import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchCoins } from '../api/coins';

const CoinSearch = ({ onSelect, autoFocus = false, placeholder = 'Search Bitcoin, Ethereum, …' }) => {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q || q.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await searchCoins(q.trim());
        setResults(Array.isArray(data && data.coins) ? data.coins.slice(0, 8) : []);
        setOpen(true);
      } catch (_) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => debounceRef.current && clearTimeout(debounceRef.current);
  }, [q]);

  // Close on outside click
  useEffect(() => {
    const onDoc = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const pick = (r) => {
    setOpen(false);
    setQ('');
    if (onSelect) {
      onSelect({
        coinId: r.id,
        symbol: (r.symbol || '').toString(),
        name: r.name,
        image: r.large || r.thumb,
      });
    } else {
      navigate(`/coin/${r.id}`);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" strokeLinecap="round" />
        </svg>
        <input
          autoFocus={autoFocus}
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => results.length && setOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
        />
      </div>
      {open && (results.length > 0 || loading) && (
        <ul className="absolute z-20 mt-2 w-full max-h-80 overflow-auto rounded-xl border border-slate-200 bg-white shadow-soft">
          {loading && <li className="px-3 py-2 text-sm text-slate-500">Searching…</li>}
          {!loading && results.length === 0 && (
            <li className="px-3 py-2 text-sm text-slate-500">No matches</li>
          )}
          {results.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => pick(r)}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-brand-50 text-left"
              >
                <img
                  src={r.thumb}
                  alt=""
                  className="h-6 w-6 rounded-full bg-slate-100"
                  onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
                />
                <span className="font-medium text-ink">{r.name}</span>
                <span className="text-xs uppercase text-slate-400">{r.symbol}</span>
                {r.market_cap_rank ? (
                  <span className="ml-auto text-xs text-slate-400 num">#{r.market_cap_rank}</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CoinSearch;
