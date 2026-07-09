import { PenLine, RefreshCw, Trash2 } from 'lucide-react';
import type { Investment } from '../../lib/api';
import { formatCurrency, formatDate, formatRelativeTime } from '../../lib/format';
import { INVESTMENT_TYPE_BADGE_CLASSES, INVESTMENT_TYPE_LABELS } from './investmentTypes';

const AUTO_PRICEABLE_TYPES = new Set(['PSX', 'CRYPTO']);

export function InvestmentTable({
  investments,
  currency,
  refreshingIds,
  onUpdateValue,
  onDelete,
  onRefreshPrice,
}: {
  investments: Investment[];
  currency: string;
  refreshingIds: Set<string>;
  onUpdateValue: (investment: Investment) => void;
  onDelete: (investment: Investment) => void;
  onRefreshPrice: (investment: Investment) => void;
}) {
  return (
    <>
      <div className="md:hidden divide-y divide-slate-200 dark:divide-zinc-800">
        {investments.map((inv) => {
          const amount = Number(inv.amount);
          const currentValue = Number(inv.currentValue);
          const units = Number(inv.units);
          const gainLoss = currentValue - amount;
          const isGain = gainLoss >= 0;
          return (
            <div key={inv.id} className="py-4 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-zinc-200 truncate">{inv.assetName}</p>
                  <span
                    className={`inline-block mt-1 text-xs font-medium px-2 py-1 rounded-md ${INVESTMENT_TYPE_BADGE_CLASSES[inv.type]}`}
                  >
                    {INVESTMENT_TYPE_LABELS[inv.type]}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
                    {formatCurrency(inv.currentValue, currency)}
                  </p>
                  <p className={`text-xs font-semibold ${isGain ? 'text-green-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {isGain ? '+' : '-'}
                    {formatCurrency(Math.abs(gainLoss), currency)}
                  </p>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-500">
                <span>{units > 0 ? `${units.toLocaleString('en-US', { maximumFractionDigits: 4 })} units · ` : ''}{formatDate(inv.purchaseDate)}</span>
                <span>Invested {formatCurrency(inv.amount, currency)}</span>
              </div>

              {AUTO_PRICEABLE_TYPES.has(inv.type) && inv.priceUpdatedAt && (
                <p className="mt-1 text-xs text-slate-400 dark:text-zinc-600">
                  Updated {formatRelativeTime(inv.priceUpdatedAt)}
                </p>
              )}

              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onUpdateValue(inv)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 min-h-11 text-xs font-semibold text-amber-700 dark:text-amber-500 bg-amber-500/10 active:bg-amber-500/20 rounded-lg transition-colors"
                >
                  <PenLine size={14} />
                  Update value
                </button>
                {AUTO_PRICEABLE_TYPES.has(inv.type) && (
                  <button
                    type="button"
                    onClick={() => onRefreshPrice(inv)}
                    disabled={refreshingIds.has(inv.id)}
                    aria-label={`Refresh price: ${inv.assetName}`}
                    className="w-11 h-11 shrink-0 flex items-center justify-center text-slate-400 dark:text-zinc-600 active:text-amber-700 dark:active:text-amber-500 rounded-lg active:bg-amber-500/10 transition-colors disabled:opacity-60"
                  >
                    <RefreshCw size={16} className={refreshingIds.has(inv.id) ? 'animate-spin' : ''} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onDelete(inv)}
                  aria-label={`Delete investment: ${inv.assetName}`}
                  className="w-11 h-11 shrink-0 flex items-center justify-center text-slate-400 dark:text-zinc-600 active:text-red-600 dark:active:text-red-400 rounded-lg active:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs font-medium text-slate-500 dark:text-zinc-500 border-b border-slate-200 dark:border-zinc-800">
            <th className="pb-3 pr-4 font-medium">Asset</th>
            <th className="pb-3 pr-4 font-medium">Type</th>
            <th className="pb-3 pr-4 font-medium text-right">Amount</th>
            <th className="pb-3 pr-4 font-medium text-right">Units</th>
            <th className="pb-3 pr-4 font-medium text-right">Current Value</th>
            <th className="pb-3 pr-4 font-medium text-right">Gain/Loss</th>
            <th className="pb-3 pr-4 font-medium">Purchase Date</th>
            <th className="pb-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
          {investments.map((inv) => {
            const amount = Number(inv.amount);
            const currentValue = Number(inv.currentValue);
            const units = Number(inv.units);
            const gainLoss = currentValue - amount;
            const isGain = gainLoss >= 0;
            return (
              <tr key={inv.id}>
                <td className="py-3.5 pr-4 font-medium text-slate-800 dark:text-zinc-200 whitespace-nowrap">{inv.assetName}</td>
                <td className="py-3.5 pr-4 whitespace-nowrap">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-md ${INVESTMENT_TYPE_BADGE_CLASSES[inv.type]}`}
                  >
                    {INVESTMENT_TYPE_LABELS[inv.type]}
                  </span>
                </td>
                <td className="py-3.5 pr-4 text-right text-slate-700 dark:text-zinc-300 whitespace-nowrap">
                  {formatCurrency(inv.amount, currency)}
                </td>
                <td className="py-3.5 pr-4 text-right text-slate-500 dark:text-zinc-400 whitespace-nowrap">
                  {units > 0 ? units.toLocaleString('en-US', { maximumFractionDigits: 4 }) : '—'}
                </td>
                <td className="py-3.5 pr-4 text-right text-slate-800 dark:text-zinc-200 font-medium whitespace-nowrap">
                  {formatCurrency(inv.currentValue, currency)}
                </td>
                <td
                  className={`py-3.5 pr-4 text-right font-semibold whitespace-nowrap ${
                    isGain ? 'text-green-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {isGain ? '+' : '-'}
                  {formatCurrency(Math.abs(gainLoss), currency)}
                </td>
                <td className="py-3.5 pr-4 text-slate-500 dark:text-zinc-500 whitespace-nowrap">
                  {formatDate(inv.purchaseDate)}
                  {AUTO_PRICEABLE_TYPES.has(inv.type) && inv.priceUpdatedAt && (
                    <p className="text-xs text-slate-400 dark:text-zinc-600 mt-0.5">
                      Updated {formatRelativeTime(inv.priceUpdatedAt)}
                    </p>
                  )}
                </td>
                <td className="py-3.5">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => onUpdateValue(inv)}
                      aria-label={`Update value: ${inv.assetName}`}
                      className="text-slate-500 dark:text-zinc-500 hover:text-amber-800 dark:hover:text-amber-500 p-1.5 rounded-lg hover:bg-amber-500/10 transition-colors"
                    >
                      <PenLine size={15} />
                    </button>
                    {AUTO_PRICEABLE_TYPES.has(inv.type) && (
                      <button
                        type="button"
                        onClick={() => onRefreshPrice(inv)}
                        disabled={refreshingIds.has(inv.id)}
                        aria-label={`Refresh price: ${inv.assetName}`}
                        className="text-slate-500 dark:text-zinc-500 hover:text-amber-800 dark:hover:text-amber-500 p-1.5 rounded-lg hover:bg-amber-500/10 transition-colors disabled:opacity-60"
                      >
                        <RefreshCw size={15} className={refreshingIds.has(inv.id) ? 'animate-spin' : ''} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onDelete(inv)}
                      aria-label={`Delete investment: ${inv.assetName}`}
                      className="text-slate-400 dark:text-zinc-600 hover:text-red-600 dark:hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </>
  );
}
