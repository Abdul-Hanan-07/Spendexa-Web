import { Trash2 } from 'lucide-react';
import type { Transaction } from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/format';
import { getCategoryIcon } from '../dashboard/categoryIcons';

export function TransactionTable({
  transactions,
  currency,
  onDelete,
}: {
  transactions: Transaction[];
  currency: string;
  onDelete: (transaction: Transaction) => void;
}) {
  return (
    <div className="divide-y divide-slate-200 dark:divide-zinc-800">
      {transactions.map((tx) => {
        const Icon = getCategoryIcon(tx.category);
        const isIncome = tx.type === 'INCOME';
        return (
          <div key={tx.id} className="flex items-center justify-between gap-4 py-3.5 px-4 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-500 shrink-0 group-hover:scale-110 transition-transform">
                <Icon size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-zinc-200 truncate">{tx.category}</p>
                <p className="text-xs text-slate-500 dark:text-zinc-500">{formatDate(tx.date)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              <span
                className={`hidden sm:inline-flex text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full ${
                  isIncome ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' : 'bg-rose-500/15 text-rose-700 dark:text-rose-400'
                }`}
              >
                {isIncome ? 'Income' : 'Expense'}
              </span>
              <span
                className={`text-sm font-semibold w-24 text-right ${
                  isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {isIncome ? '+' : '-'}
                {formatCurrency(tx.amount, currency)}
              </span>
              <button
                type="button"
                onClick={() => onDelete(tx)}
                aria-label={`Delete transaction: ${tx.category}`}
                className="w-11 h-11 shrink-0 flex items-center justify-center text-slate-400 dark:text-zinc-600 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
