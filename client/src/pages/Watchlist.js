import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { fetchWatchlist, removeFromWatchlist } from '../api/watchlist';
import CoinRow from '../components/CoinRow';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import Button from '../components/Button';

const POLL = Number(process.env.REACT_APP_POLL_INTERVAL) || 30_000;

const Watchlist = () => {
  const queryClient = useQueryClient();
  const watchQ = useQuery({
    queryKey: ['watchlist'],
    queryFn: fetchWatchlist,
    refetchInterval: POLL,
  });

  const items = (watchQ.data && watchQ.data.items) || [];
  const markets = (watchQ.data && watchQ.data.markets) || [];

  // Preserve the user's saved order; align market rows accordingly.
  const orderedMarkets = items
    .map((it) => markets.find((m) => m.id === it.coinId))
    .filter(Boolean);

  const onToggleWatch = async (coin) => {
    try {
      await removeFromWatchlist(coin.coinId);
      toast.success(`Removed ${coin.name} from watchlist`);
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    } catch (e) {
      toast.error(e.message || 'Could not remove coin');
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Watchlist</h1>
          <p className="text-sm text-slate-500">
            Live prices for the coins you're following. Refreshes every {Math.round(POLL / 1000)}s.
          </p>
        </div>
        <Button as={Link} to="/" variant="secondary">
          Browse markets
        </Button>
      </header>

      <section className="rounded-xl bg-white border border-slate-200/70 shadow-soft">
        {watchQ.isLoading ? (
          <div className="p-12 flex justify-center">
            <Spinner label="Loading your watchlist…" />
          </div>
        ) : watchQ.isError ? (
          <ErrorState message={watchQ.error && watchQ.error.message} onRetry={watchQ.refetch} />
        ) : items.length === 0 ? (
          <EmptyState
            title="Your watchlist is empty"
            message="Tap the star next to any coin to start tracking it here."
            icon="★"
            action={
              <Button as={Link} to="/">
                Explore markets
              </Button>
            }
          />
        ) : orderedMarkets.length === 0 ? (
          <EmptyState
            title="No live data right now"
            message="Your saved coins couldn't be priced. Try again in a moment."
            action={<Button onClick={() => watchQ.refetch()}>Refresh</Button>}
          />
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
                {orderedMarkets.map((coin) => (
                  <CoinRow key={coin.id} coin={coin} onToggleWatch={onToggleWatch} watched={true} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default Watchlist;
