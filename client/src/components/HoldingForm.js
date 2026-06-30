import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Button from './Button';
import CoinSearch from './CoinSearch';

// Used in Portfolio: pick a coin, then enter amount + buy price.
// `initial` lets us reuse this for editing an existing holding.
const HoldingForm = ({ onSubmit, onCancel, initial = null, submitting = false }) => {
  const [selected, setSelected] = useState(
    initial
      ? { coinId: initial.coinId, symbol: initial.symbol, name: initial.name, image: initial.image }
      : null
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      amount: initial ? initial.amount : '',
      avgBuyPrice: initial ? initial.avgBuyPrice : '',
      buyDate: initial && initial.buyDate ? new Date(initial.buyDate).toISOString().slice(0, 10) : '',
      notes: initial ? initial.notes || '' : '',
    },
  });

  const submit = (values) => {
    if (!selected && !initial) return;
    const payload = {
      ...(initial ? {} : selected),
      amount: Number(values.amount),
      avgBuyPrice: Number(values.avgBuyPrice),
      buyDate: values.buyDate ? new Date(values.buyDate).toISOString() : undefined,
      notes: values.notes || undefined,
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      {!initial && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Coin</label>
          {selected ? (
            <div className="flex items-center gap-3 rounded-xl border border-brand-200 bg-brand-50/60 px-3 py-2">
              {selected.image && (
                <img src={selected.image} alt="" className="h-7 w-7 rounded-full bg-white" />
              )}
              <div className="flex-1">
                <div className="font-medium text-ink">{selected.name}</div>
                <div className="text-xs uppercase text-slate-500 tracking-wide">{selected.symbol}</div>
              </div>
              <button
                type="button"
                className="text-sm text-slate-500 hover:text-ink"
                onClick={() => setSelected(null)}
              >
                Change
              </button>
            </div>
          ) : (
            <CoinSearch onSelect={setSelected} placeholder="Pick a coin to add…" />
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount</label>
          <input
            type="number"
            step="any"
            min="0"
            placeholder="0.50"
            {...register('amount', {
              required: 'Amount is required',
              validate: (v) => Number(v) > 0 || 'Must be greater than 0',
            })}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 num"
          />
          {errors.amount && <p className="text-xs text-red-600 mt-1">{errors.amount.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Average buy price (USD)
          </label>
          <input
            type="number"
            step="any"
            min="0"
            placeholder="30000"
            {...register('avgBuyPrice', {
              required: 'Buy price is required',
              validate: (v) => Number(v) >= 0 || 'Must be >= 0',
            })}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 num"
          />
          {errors.avgBuyPrice && <p className="text-xs text-red-600 mt-1">{errors.avgBuyPrice.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Buy date</label>
          <input
            type="date"
            {...register('buyDate')}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
          <input
            type="text"
            maxLength={280}
            placeholder="Optional"
            {...register('notes', { maxLength: { value: 280, message: 'Max 280 characters' } })}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
          />
          {errors.notes && <p className="text-xs text-red-600 mt-1">{errors.notes.message}</p>}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={!initial && !selected} loading={submitting}>
          {initial ? 'Save changes' : 'Add holding'}
        </Button>
      </div>
    </form>
  );
};

export default HoldingForm;
