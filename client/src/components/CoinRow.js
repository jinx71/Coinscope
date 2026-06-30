import React from 'react';
import { Link } from 'react-router-dom';
import PriceChange from './PriceChange';
import SparklineMini from './SparklineMini';
import { fmtPrice, fmtUsdCompact } from '../utils/format';

const CoinRow = ({ coin, onToggleWatch, watched = false }) => {
  const change7d = coin.price_change_percentage_7d_in_currency;
  const change24h = coin.price_change_percentage_24h_in_currency ?? coin.price_change_percentage_24h;
  const change1h = coin.price_change_percentage_1h_in_currency;
  const spark = coin.sparkline_in_7d && coin.sparkline_in_7d.price;

  return (
    <tr className="hover:bg-slate-50/60 transition">
      <td className="px-4 py-3 text-sm text-slate-500 num">{coin.market_cap_rank ?? '—'}</td>
      <td className="px-2 py-3">
        <Link to={`/coin/${coin.id}`} className="flex items-center gap-3 group">
          {coin.image ? (
            <img
              src={coin.image}
              alt=""
              className="h-7 w-7 rounded-full bg-slate-100"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.visibility = 'hidden';
              }}
            />
          ) : (
            <div className="h-7 w-7 rounded-full bg-slate-100" />
          )}
          <div>
            <div className="font-medium text-ink group-hover:text-brand-700 transition">
              {coin.name}
            </div>
            <div className="text-xs uppercase text-slate-400 tracking-wide">
              {coin.symbol}
            </div>
          </div>
        </Link>
      </td>
      <td className="px-4 py-3 text-right font-medium text-ink num">
        {fmtPrice(coin.current_price)}
      </td>
      <td className="px-4 py-3 text-right hidden md:table-cell">
        <PriceChange value={change1h} />
      </td>
      <td className="px-4 py-3 text-right">
        <PriceChange value={change24h} />
      </td>
      <td className="px-4 py-3 text-right hidden md:table-cell">
        <PriceChange value={change7d} />
      </td>
      <td className="px-4 py-3 text-right hidden lg:table-cell text-slate-700 num">
        {fmtUsdCompact(coin.market_cap)}
      </td>
      <td className="px-4 py-3 text-right hidden lg:table-cell text-slate-700 num">
        {fmtUsdCompact(coin.total_volume)}
      </td>
      <td className="px-2 py-3 hidden sm:table-cell">
        <SparklineMini data={spark} positive={(change7d ?? change24h ?? 0) >= 0} />
      </td>
      {onToggleWatch && (
        <td className="px-3 py-3 text-right">
          <button
            type="button"
            onClick={() =>
              onToggleWatch({
                coinId: coin.id,
                symbol: coin.symbol,
                name: coin.name,
                image: coin.image,
              })
            }
            className={`p-1.5 rounded-lg transition ${
              watched ? 'text-gold-500 hover:bg-gold-50' : 'text-slate-300 hover:text-gold-500 hover:bg-gold-50'
            }`}
            aria-label={watched ? `Remove ${coin.name} from watchlist` : `Add ${coin.name} to watchlist`}
            title={watched ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={watched ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
              <path d="M12 2.6l2.95 5.98 6.6.96-4.78 4.66 1.13 6.58L12 17.77 6.1 20.78l1.13-6.58L2.45 9.54l6.6-.96L12 2.6z" />
            </svg>
          </button>
        </td>
      )}
    </tr>
  );
};

export default CoinRow;
