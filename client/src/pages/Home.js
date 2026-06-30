import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

import { fetchMarkets, fetchTrending, fetchGlobal } from '../api/coins';
import { fetchWatchlist, addToWatchlist, removeFromWatchlist } from '../api/watchlist';
import useAuth from '../hooks/useAuth';

import CoinRow from '../components/CoinRow';
import CacheBadge from '../components/CacheBadge';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import StatCard from '../components/StatCard';
import CoinSearch from '../components/CoinSearch';
import { fmtUsdCompact } from '../utils/format';

const POLL = Number(process.env.REACT_APP_POLL_INTERVAL) || 30_000;

const Home = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const perPage = 50;

  const marketsQ = useQuery({
    queryKey: ['markets', page, perPage],
    queryFn: () => fetchMarkets({ page, perPage }),
    refetchInterval: POLL,
    keepPreviousData: true,
  });
  const trendingQ = useQuery({ queryKey: ['trending'], queryFn: fetchTrending });
  const globalQ = useQuery({ queryKey: ['global'], queryFn: fetchGlobal, refetchInterval: POLL });
  const watchQ = useQuery({
    queryKey: ['watchlist'],
    queryFn: fetchWatchlist,
    enabled: Boolean(user),
  });

  const watchedSet = new Set((watchQ.data && watchQ.data.items ? watchQ.data.items : []).map((i) => i.coinId));

  const onToggleWatch = async (coin) => {
    if (!user) {
      toast.info('Sign in to save coins to your watchlist.');
      return;
    }
    try {
      if (watchedSet.has(coin.coinId)) {
        await removeFromWatchlist(coin.coinId);
        toast.success(`Removed ${coin.name} from watchlist`);
      } else {
        await addToWatchlist(coin);
        toast.success(`Added ${coin.name} to watchlist`);
      }
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    } catch (e) {
      toast.error(e.message || 'Could not update watchlist');
    }
  };

  const markets = (marketsQ.data && marketsQ.data.data) || [];
  const marketsCache = marketsQ.data && marketsQ.data.cache;
  const global = globalQ.data && globalQ.data.data && globalQ.data.data.data;
  const trending = (trendingQ.data && trendingQ.data.data && trendingQ.data.data.coins) || [];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="rounded-xl bg-brand-gradient text-white shadow-soft px-6 py-7 sm:px-8 sm:py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold">
              Live crypto markets
            </h1>
            <p className="mt-1 text-sm/relaxed text-white/85 max-w-xl">
              Real-time prices from CoinGecko, proxied through our Express backend
              with per-endpoint caching. Track favorites and your P/L.
            </p>
          </div>
          <div className="md:w-96">
            <CoinSearch />
          </div>
        </div>
      </section>

      {/* Global stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {globalQ.isLoading ? (
          [0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-white border border-slate-200/70 shadow-soft p-4">
              <div className="skeleton h-4 w-24 mb-3" />
              <div className="skeleton h-6 w-32 mb-2" />
              <div className="skeleton h-3 w-16" />
            </div>
          ))
        ) : globalQ.isError ? (
          <div className="sm:col-span-2 lg:col-span-4">
            <ErrorState message={globalQ.error && globalQ.error.message} onRetry={globalQ.refetch} />
          </div>
        ) : global ? (
          <>
            <StatCard
              label="Total market cap"
              value={fmtUsdCompact(global.total_market_cap && global.total_market_cap.usd)}
              change={global.market_cap_change_percentage_24h_usd}
              icon="₿"
            />
            <StatCard
              label="24h volume"
              value={fmtUsdCompact(global.total_volume && global.total_volume.usd)}
              sub="across all markets"
              icon="⟳"
            />
            <StatCard
              label="BTC dominance"
              value={`${(global.market_cap_percentage && global.market_cap_percentage.btc
                ? global.market_cap_percentage.btc
                : 0
              ).toFixed(1)}%`}
              sub={`ETH ${(global.market_cap_percentage && global.market_cap_percentage.eth
                ? global.market_cap_percentage.eth
                : 0
              ).toFixed(1)}%`}
              icon="◎"
              accent="gold"
            />
            <StatCard
              label="Active coins"
              value={(global.active_cryptocurrencies || 0).toLocaleString()}
              sub={`${(global.markets || 0).toLocaleString()} markets`}
              icon="✦"
              accent="gold"
            />
          </>
        ) : null}
      </section>

      {/* Trending strip */}
      <section className="rounded-xl bg-white border border-slate-200/70 shadow-soft">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-display font-semibold text-ink flex items-center gap-2">
            🔥 Trending
            <span className="text-xs font-normal text-slate-400">(last 24h)</span>
          </h2>
          <CacheBadge cache={trendingQ.data && trendingQ.data.cache} />
        </div>
        <div className="px-4 py-3">
          {trendingQ.isLoading ? (
            <div className="flex gap-3 overflow-hidden">
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="skeleton h-9 w-32 shrink-0" />
              ))}
            </div>
          ) : trending.length === 0 ? (
            <EmptyState title="No trending data" />
          ) : (
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {trending.map((t, i) => (
                <Link
                  key={t.item.id}
                  to={`/coin/${t.item.id}`}
                  className="flex items-center gap-2 shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm hover:border-brand-300 hover:bg-brand-50 transition"
                >
                  <span className="text-slate-400 num text-xs">#{i + 1}</span>
                  <img
                    src={t.item.thumb}
                    alt=""
                    className="h-5 w-5 rounded-full bg-slate-100"
                    onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
                  />
                  <span className="font-medium text-ink">{t.item.name}</span>
                  <span className="uppercase text-xs text-slate-400">{t.item.symbol}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Markets table */}
      <section className="rounded-xl bg-white border border-slate-200/70 shadow-soft">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h2 className="font-display font-semibold text-ink">Markets</h2>
            <CacheBadge cache={marketsCache} />
            {marketsQ.isFetching && !marketsQ.isLoading && (
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse" />
                refreshing…
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500">
            Auto-refresh every {Math.round(POLL / 1000)}s
          </div>
        </div>

        {marketsQ.isLoading && markets.length === 0 ? (
          <div className="p-6 space-y-3">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="skeleton h-10 w-full" />
            ))}
          </div>
        ) : marketsQ.isError ? (
          <ErrorState message={marketsQ.error && marketsQ.error.message} onRetry={marketsQ.refetch} />
        ) : markets.length === 0 ? (
          <EmptyState title="No markets" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-slate-500 bg-slate-50/60">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">#</th>
                  <th className="px-2 py-3 text-left font-medium">Coin</th>
                  <th className="px-4 py-3 text-right font-medium">Price</th>
                  <th className="px-4 py-3 text-right font-medium hidden md:table-cell">1h</th>
                  <th className="px-4 py-3 text-right font-medium">24h</th>
                  <th className="px-4 py-3 text-right font-medium hidden md:table-cell">7d</th>
                  <th className="px-4 py-3 text-right font-medium hidden lg:table-cell">Market Cap</th>
                  <th className="px-4 py-3 text-right font-medium hidden lg:table-cell">Volume (24h)</th>
                  <th className="px-2 py-3 text-left font-medium hidden sm:table-cell">7d trend</th>
                  <th className="px-3 py-3 text-right font-medium">★</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {markets.map((coin) => (
                  <CoinRow
                    key={coin.id}
                    coin={coin}
                    onToggleWatch={onToggleWatch}
                    watched={watchedSet.has(coin.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-sm">
          <span className="text-slate-500">
            Page {page} · {markets.length} coins
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || marketsQ.isFetching}
              className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-50 hover:bg-slate-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={markets.length < perPage || marketsQ.isFetching}
              className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-50 hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
