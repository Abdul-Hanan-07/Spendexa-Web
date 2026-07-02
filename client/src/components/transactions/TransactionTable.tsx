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
          <div key={tx.id} className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-400 shrink-0">
                <Icon size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-zinc-200 truncate">{tx.category}</p>
                <p className="text-xs text-slate-500 dark:text-zinc-500">{formatDate(tx.date)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              <span
                className={`hidden sm:inline-flex text-xs font-medium px-2 py-1 rounded-md ${
                  isIncome ? 'bg-emerald-500/10 text-green-700 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'
                }`}
              >
                {isIncome ? 'Income' : 'Expense'}
              </span>
              <span
                className={`text-sm font-semibold w-20 sm:w-24 text-right ${
                  isIncome ? 'text-green-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                }`}
              >
                {isIncome ? '+' : '-'}
                {formatCurrency(tx.amount, currency)}
              </span>
              <button
                type="button"
                onClick={() => onDelete(tx)}
                aria-label={`Delete transaction: ${tx.category}`}
                className="text-slate-400 dark:text-zinc-600 hover:text-red-600 dark:hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
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
