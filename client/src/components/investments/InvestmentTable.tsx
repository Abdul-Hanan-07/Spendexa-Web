import { PenLine, Trash2 } from 'lucide-react';
import type { Investment } from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/format';
import { INVESTMENT_TYPE_BADGE_CLASSES, INVESTMENT_TYPE_LABELS } from './investmentTypes';

export function InvestmentTable({
  investments,
  currency,
  onUpdateValue,
  onDelete,
}: {
  investments: Investment[];
  currency: string;
  onUpdateValue: (investment: Investment) => void;
  onDelete: (investment: Investment) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs font-medium text-zinc-500 border-b border-zinc-800">
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
        <tbody className="divide-y divide-zinc-800">
          {investments.map((inv) => {
            const amount = Number(inv.amount);
            const currentValue = Number(inv.currentValue);
            const units = Number(inv.units);
            const gainLoss = currentValue - amount;
            const isGain = gainLoss >= 0;
            return (
              <tr key={inv.id}>
                <td className="py-3.5 pr-4 font-medium text-zinc-200 whitespace-nowrap">{inv.assetName}</td>
                <td className="py-3.5 pr-4 whitespace-nowrap">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-md ${INVESTMENT_TYPE_BADGE_CLASSES[inv.type]}`}
                  >
                    {INVESTMENT_TYPE_LABELS[inv.type]}
                  </span>
                </td>
                <td className="py-3.5 pr-4 text-right text-zinc-300 whitespace-nowrap">
                  {formatCurrency(inv.amount, currency)}
                </td>
                <td className="py-3.5 pr-4 text-right text-zinc-400 whitespace-nowrap">
                  {units > 0 ? units.toLocaleString('en-US', { maximumFractionDigits: 4 }) : '—'}
                </td>
                <td className="py-3.5 pr-4 text-right text-zinc-200 font-medium whitespace-nowrap">
                  {formatCurrency(inv.currentValue, currency)}
                </td>
                <td
                  className={`py-3.5 pr-4 text-right font-semibold whitespace-nowrap ${
                    isGain ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {isGain ? '+' : '-'}
                  {formatCurrency(Math.abs(gainLoss), currency)}
                </td>
                <td className="py-3.5 pr-4 text-zinc-500 whitespace-nowrap">{formatDate(inv.purchaseDate)}</td>
                <td className="py-3.5">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => onUpdateValue(inv)}
                      aria-label={`Update value: ${inv.assetName}`}
                      className="text-zinc-500 hover:text-indigo-400 p-1.5 rounded-lg hover:bg-indigo-500/10 transition-colors"
                    >
                      <PenLine size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(inv)}
                      aria-label={`Delete investment: ${inv.assetName}`}
                      className="text-zinc-600 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
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
  );
}
