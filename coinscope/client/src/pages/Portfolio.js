import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';

import {
  fetchPortfolio,
  addHolding,
  updateHolding,
  deleteHolding,
} from '../api/portfolio';

import Button from '../components/Button';
import Card, { CardBody } from '../components/Card';
import Modal from '../components/Modal';
import HoldingForm from '../components/HoldingForm';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import PriceChange from '../components/PriceChange';
import StatCard from '../components/StatCard';
import { fmtPrice, fmtUsdCompact, fmtAmount } from '../utils/format';

const POLL = Number(process.env.REACT_APP_POLL_INTERVAL) || 30_000;

// Distinct, colorful palette for the allocation donut.
const PIE_COLORS = [
  '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444',
  '#06b6d4', '#22c55e', '#eab308', '#f97316', '#a855f7',
  '#0ea5e9', '#84cc16',
];

const Portfolio = () => {
  const queryClient = useQueryClient();
  const portfolioQ = useQuery({
    queryKey: ['portfolio'],
    queryFn: fetchPortfolio,
    refetchInterval: POLL,
  });

  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const addMut = useMutation({
    mutationFn: addHolding,
    onSuccess: () => {
      toast.success('Holding added');
      setAddOpen(false);
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
    onError: (e) => toast.error(e.message || 'Could not add holding'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, ...rest }) => updateHolding(id, rest),
    onSuccess: () => {
      toast.success('Holding updated');
      setEditing(null);
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
    onError: (e) => toast.error(e.message || 'Could not update holding'),
  });

  const deleteMut = useMutation({
    mutationFn: deleteHolding,
    onSuccess: () => {
      toast.success('Holding removed');
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
    onError: (e) => toast.error(e.message || 'Could not remove holding'),
  });

  const data = portfolioQ.data || { holdings: [], totals: { costBasis: 0, currentValue: 0, pnl: 0, pnlPercent: 0 } };
  const holdings = data.holdings || [];
  const totals = data.totals || { costBasis: 0, currentValue: 0, pnl: 0, pnlPercent: 0 };

  const allocation = useMemo(() => {
    if (!holdings.length || totals.currentValue <= 0) return [];
    return holdings
      .map((h) => ({
        name: h.symbol ? h.symbol.toUpperCase() : h.coinId,
        coinName: h.name || h.coinId,
        value: Math.max(0, h.currentValue),
      }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [holdings, totals.currentValue]);

  const onDelete = (h) => {
    if (window.confirm(`Remove your ${h.name || h.coinId} position?`)) {
      deleteMut.mutate(h.id);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Portfolio</h1>
          <p className="text-sm text-slate-500">
            Track positions and live P/L. Prices refresh every {Math.round(POLL / 1000)}s.
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>+ Add holding</Button>
      </header>

      {/* Totals + allocation */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <StatCard
          label="Current value"
          value={fmtUsdCompact(totals.currentValue)}
          sub={`across ${holdings.length} ${holdings.length === 1 ? 'position' : 'positions'}`}
          icon="$"
        />
        <StatCard
          label="Total P/L"
          value={fmtUsdCompact(totals.pnl)}
          change={totals.pnlPercent}
          icon={totals.pnl >= 0 ? '▲' : '▼'}
          accent={totals.pnl >= 0 ? 'brand' : 'gold'}
        />
        <StatCard
          label="Cost basis"
          value={fmtUsdCompact(totals.costBasis)}
          sub="what you paid in total"
          icon="∑"
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Allocation donut */}
        <Card className="lg:col-span-1">
          <div className="px-5 py-3 border-b border-slate-100">
            <h2 className="font-display font-semibold text-ink">Allocation</h2>
          </div>
          <CardBody>
            {allocation.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-sm text-slate-500">
                No allocation to show yet
              </div>
            ) : (
              <>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allocation}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        stroke="#fff"
                      >
                        {allocation.map((entry, idx) => (
                          <Cell key={entry.name} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: 10,
                          border: '1px solid #e2e8f0',
                          fontSize: 12,
                        }}
                        formatter={(v) => [fmtUsdCompact(v), 'Value']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {allocation.slice(0, 6).map((a, i) => {
                    const pct = totals.currentValue > 0 ? (a.value / totals.currentValue) * 100 : 0;
                    return (
                      <li key={a.name} className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-sm"
                          style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                        />
                        <span className="font-medium text-ink">{a.name}</span>
                        <span className="text-slate-500 text-xs truncate">{a.coinName}</span>
                        <span className="ml-auto text-slate-600 num">{pct.toFixed(1)}%</span>
                      </li>
                    );
                  })}
                  {allocation.length > 6 && (
                    <li className="text-xs text-slate-400">+ {allocation.length - 6} more</li>
                  )}
                </ul>
              </>
            )}
          </CardBody>
        </Card>

        {/* Holdings table */}
        <Card className="lg:col-span-2">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-display font-semibold text-ink">Holdings</h2>
            {portfolioQ.isFetching && !portfolioQ.isLoading && (
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse" />
                refreshing…
              </span>
            )}
          </div>

          {portfolioQ.isLoading ? (
            <div className="p-10 flex justify-center">
              <Spinner label="Loading your portfolio…" />
            </div>
          ) : portfolioQ.isError ? (
            <ErrorState
              message={portfolioQ.error && portfolioQ.error.message}
              onRetry={portfolioQ.refetch}
            />
          ) : holdings.length === 0 ? (
            <EmptyState
              title="No positions yet"
              message="Add your first holding to see live P/L computed against current market prices."
              icon="📊"
              action={<Button onClick={() => setAddOpen(true)}>+ Add your first holding</Button>}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-slate-500 bg-slate-50/60">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Coin</th>
                    <th className="px-4 py-3 text-right font-medium">Amount</th>
                    <th className="px-4 py-3 text-right font-medium hidden sm:table-cell">Avg buy</th>
                    <th className="px-4 py-3 text-right font-medium">Price</th>
                    <th className="px-4 py-3 text-right font-medium">Value</th>
                    <th className="px-4 py-3 text-right font-medium">P/L</th>
                    <th className="px-4 py-3 text-right font-medium hidden lg:table-cell">Bought</th>
                    <th className="px-3 py-3 text-right font-medium">·</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {holdings.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-4 py-3">
                        <Link to={`/coin/${h.coinId}`} className="flex items-center gap-3 group">
                          {h.image && (
                            <img
                              src={h.image}
                              alt=""
                              className="h-7 w-7 rounded-full bg-slate-100"
                              onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
                            />
                          )}
                          <div>
                            <div className="font-medium text-ink group-hover:text-brand-700 transition">
                              {h.name || h.coinId}
                            </div>
                            <div className="text-xs uppercase tracking-wide text-slate-400">
                              {h.symbol}
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right num">{fmtAmount(h.amount)}</td>
                      <td className="px-4 py-3 text-right hidden sm:table-cell num text-slate-700">
                        {fmtPrice(h.avgBuyPrice)}
                      </td>
                      <td className="px-4 py-3 text-right num">
                        {fmtPrice(h.currentPrice)}
                      </td>
                      <td className="px-4 py-3 text-right num font-medium">
                        {fmtUsdCompact(h.currentValue)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-col items-end gap-0.5">
                          <span
                            className={`num font-medium ${
                              h.pnl >= 0 ? 'text-emerald-700' : 'text-red-700'
                            }`}
                          >
                            {h.pnl >= 0 ? '+' : ''}
                            {fmtUsdCompact(h.pnl)}
                          </span>
                          <PriceChange value={h.pnlPercent} />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right hidden lg:table-cell text-slate-500 text-xs">
                        {h.buyDate ? dayjs(h.buyDate).format('MMM D, YYYY') : '—'}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setEditing(h)}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                            aria-label={`Edit ${h.name}`}
                            title="Edit"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M4 20h4l10-10-4-4L4 16v4z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(h)}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                            aria-label={`Remove ${h.name}`}
                            title="Remove"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </section>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add a holding"
      >
        <HoldingForm
          onSubmit={(payload) => addMut.mutate(payload)}
          onCancel={() => setAddOpen(false)}
          submitting={addMut.isLoading}
        />
      </Modal>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing ? `Edit ${editing.name || editing.coinId}` : 'Edit holding'}
      >
        {editing && (
          <HoldingForm
            initial={editing}
            onSubmit={(payload) => updateMut.mutate({ id: editing.id, ...payload })}
            onCancel={() => setEditing(null)}
            submitting={updateMut.isLoading}
          />
        )}
      </Modal>
    </div>
  );
};

export default Portfolio;
