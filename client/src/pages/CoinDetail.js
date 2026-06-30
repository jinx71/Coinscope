import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';

import { fetchCoin, fetchChart } from '../api/coins';
import { fetchWatchlist, addToWatchlist, removeFromWatchlist } from '../api/watchlist';
import useAuth from '../hooks/useAuth';

import Button from '../components/Button';
import Card, { CardBody } from '../components/Card';
import Spinner from '../components/Spinner';
import ErrorState from '../components/ErrorState';
import CacheBadge from '../components/CacheBadge';
import PriceChange from '../components/PriceChange';
import { fmtPrice, fmtUsdCompact, fmtNumber } from '../utils/format';

const RANGES = [
  { label: '24h', days: 1, tickFmt: 'HH:mm' },
  { label: '7d', days: 7, tickFmt: 'MMM D' },
  { label: '30d', days: 30, tickFmt: 'MMM D' },
  { label: '90d', days: 90, tickFmt: 'MMM D' },
  { label: '1y', days: 365, tickFmt: 'MMM YYYY' },
];

const stripHtml = (html) => (html ? String(html).replace(/<[^>]+>/g, '').slice(0, 800) : '');

const CoinDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [range, setRange] = useState(RANGES[1]); // 7d default

  const coinQ = useQuery({ queryKey: ['coin', id], queryFn: () => fetchCoin(id) });
  const chartQ = useQuery({
    queryKey: ['chart', id, range.days],
    queryFn: () => fetchChart(id, range.days),
    keepPreviousData: true,
  });
  const watchQ = useQuery({
    queryKey: ['watchlist'],
    queryFn: fetchWatchlist,
    enabled: Boolean(user),
  });

  const coin = coinQ.data && coinQ.data.data;
  const md = coin && coin.market_data;
  const desc = coin && coin.description && stripHtml(coin.description.en);

  const watched = !!(
    watchQ.data &&
    watchQ.data.items &&
    watchQ.data.items.some((i) => i.coinId === id)
  );

  const toggleWatch = async () => {
    if (!user) return toast.info('Sign in to use the watchlist');
    try {
      if (watched) {
        await removeFromWatchlist(id);
        toast.success(`Removed ${coin.name} from watchlist`);
      } else {
        await addToWatchlist({
          coinId: id,
          symbol: coin.symbol,
          name: coin.name,
          image: coin.image && (coin.image.large || coin.image.small),
        });
        toast.success(`Added ${coin.name} to watchlist`);
      }
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    } catch (e) {
      toast.error(e.message || 'Watchlist update failed');
    }
  };

  const chartData = useMemo(() => {
    const prices = (chartQ.data && chartQ.data.data && chartQ.data.data.prices) || [];
    return prices.map(([t, v]) => ({ t, v: Number(v) }));
  }, [chartQ.data]);

  const positive =
    chartData.length > 1 && chartData[chartData.length - 1].v >= chartData[0].v;
  const lineColor = positive ? '#10b981' : '#ef4444';
  const fillId = positive ? 'fillBrand' : 'fillRed';

  if (coinQ.isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner label="Loading coin…" />
      </div>
    );
  }
  if (coinQ.isError) {
    return <ErrorState message={coinQ.error && coinQ.error.message} onRetry={coinQ.refetch} />;
  }
  if (!coin) return null;

  return (
    <div className="space-y-6">
      <Link to="/" className="text-sm text-slate-500 hover:text-ink inline-flex items-center gap-1">
        ← Back to markets
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          {coin.image && (
            <img
              src={coin.image.large || coin.image.small}
              alt=""
              className="h-14 w-14 rounded-full bg-white shadow-soft"
              onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
            />
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-3xl font-semibold text-ink">{coin.name}</h1>
              <span className="text-xs uppercase tracking-wide text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {coin.symbol}
              </span>
              {coin.market_cap_rank && (
                <span className="text-xs text-brand-700 bg-brand-50 px-2 py-0.5 rounded num">
                  Rank #{coin.market_cap_rank}
                </span>
              )}
            </div>
            <div className="mt-2 flex items-center gap-3">
              <span className="font-display text-3xl font-bold text-ink num">
                {fmtPrice(md && md.current_price && md.current_price.usd)}
              </span>
              <PriceChange value={md && md.price_change_percentage_24h} size="lg" />
            </div>
          </div>
        </div>

        <Button variant={watched ? 'gold' : 'secondary'} onClick={toggleWatch}>
          {watched ? '★ Watching' : '☆ Add to watchlist'}
        </Button>
      </div>

      {/* Chart */}
      <Card>
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <h2 className="font-display font-semibold text-ink">Price chart</h2>
            <CacheBadge cache={chartQ.data && chartQ.data.cache} />
          </div>
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            {RANGES.map((r) => (
              <button
                key={r.label}
                type="button"
                onClick={() => setRange(r)}
                className={`px-3 py-1 text-sm rounded-md transition ${
                  r.label === range.label
                    ? 'bg-white text-ink shadow-soft'
                    : 'text-slate-600 hover:text-ink'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
        <CardBody>
          {chartQ.isLoading && chartData.length === 0 ? (
            <div className="h-80 flex items-center justify-center">
              <Spinner label="Loading chart…" />
            </div>
          ) : chartQ.isError ? (
            <ErrorState message={chartQ.error && chartQ.error.message} onRetry={chartQ.refetch} />
          ) : chartData.length === 0 ? (
            <div className="h-80 flex items-center justify-center text-slate-500">
              No chart data available
            </div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillBrand" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="fillRed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#eef2f7" vertical={false} />
                  <XAxis
                    dataKey="t"
                    type="number"
                    domain={['dataMin', 'dataMax']}
                    tickFormatter={(t) => dayjs(t).format(range.tickFmt)}
                    minTickGap={48}
                    stroke="#94a3b8"
                    fontSize={11}
                  />
                  <YAxis
                    domain={['dataMin', 'dataMax']}
                    tickFormatter={(v) => fmtPrice(v)}
                    width={88}
                    stroke="#94a3b8"
                    fontSize={11}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 10,
                      border: '1px solid #e2e8f0',
                      fontSize: 12,
                      boxShadow: '0 4px 16px -2px rgba(15,23,42,0.08)',
                    }}
                    labelFormatter={(t) => dayjs(t).format('MMM D, YYYY HH:mm')}
                    formatter={(v) => [fmtPrice(v), 'Price']}
                  />
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke={lineColor}
                    strokeWidth={2}
                    fill={`url(#${fillId})`}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody>
            <p className="text-xs uppercase text-slate-500 tracking-wide">Market cap</p>
            <p className="mt-1 text-xl font-display font-semibold num">
              {fmtUsdCompact(md && md.market_cap && md.market_cap.usd)}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs uppercase text-slate-500 tracking-wide">24h volume</p>
            <p className="mt-1 text-xl font-display font-semibold num">
              {fmtUsdCompact(md && md.total_volume && md.total_volume.usd)}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs uppercase text-slate-500 tracking-wide">Circulating supply</p>
            <p className="mt-1 text-xl font-display font-semibold num">
              {fmtNumber(md && md.circulating_supply, 0)}{' '}
              <span className="text-sm text-slate-500 uppercase">{coin.symbol}</span>
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs uppercase text-slate-500 tracking-wide">24h high / low</p>
            <p className="mt-1 text-sm num">
              <span className="text-emerald-700 font-medium">
                {fmtPrice(md && md.high_24h && md.high_24h.usd)}
              </span>
              <span className="text-slate-400"> / </span>
              <span className="text-red-700 font-medium">
                {fmtPrice(md && md.low_24h && md.low_24h.usd)}
              </span>
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs uppercase text-slate-500 tracking-wide">All-time high</p>
            <p className="mt-1 text-xl font-display font-semibold num">
              {fmtPrice(md && md.ath && md.ath.usd)}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs uppercase text-slate-500 tracking-wide">Performance</p>
            <div className="mt-1.5 grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">24h</span>
                <PriceChange value={md && md.price_change_percentage_24h} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">7d</span>
                <PriceChange value={md && md.price_change_percentage_7d} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">30d</span>
                <PriceChange value={md && md.price_change_percentage_30d} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">1y</span>
                <PriceChange value={md && md.price_change_percentage_1y} />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* About */}
      {desc && (
        <Card>
          <div className="px-5 py-3 border-b border-slate-100">
            <h2 className="font-display font-semibold text-ink">About {coin.name}</h2>
          </div>
          <CardBody>
            <p className="text-sm text-slate-700 leading-relaxed">{desc}</p>
            {coin.links && coin.links.homepage && coin.links.homepage[0] && (
              <a
                href={coin.links.homepage[0]}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-4 text-sm text-brand-700 hover:text-brand-800 font-medium"
              >
                Official site →
              </a>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default CoinDetail;
