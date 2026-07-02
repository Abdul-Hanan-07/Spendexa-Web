import { Link } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, Receipt } from 'lucide-react';
import type { Transaction } from '../../lib/api';
import { formatCurrency, formatShortDate } from '../../lib/format';
import { EmptyState } from './EmptyState';
import { getCategoryIcon } from './categoryIcons';

export function RecentTransactions({
  transactions,
  currency,
}: {
  transactions: Transaction[];
  currency: string;
}) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Recent transactions</h3>
        <Link to="/transactions" className="text-xs font-medium text-amber-700 dark:text-amber-500 hover:text-amber-800 dark:hover:text-amber-400">
          View all
        </Link>
      </div>
      {transactions.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No transactions yet"
          description="Add your first transaction to start tracking your finances."
          actionLabel="Add your first transaction"
          actionTo="/transactions"
        />
      ) : (
        <div className="divide-y divide-slate-200 dark:divide-zinc-800">
          {transactions.slice(0, 8).map((tx) => {
            const Icon = getCategoryIcon(tx.category);
            const isIncome = tx.type === 'INCOME';
            return (
              <div key={tx.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-400 shrink-0">
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-zinc-200 truncate">{tx.category}</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-500">{formatShortDate(tx.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {isIncome ? (
                    <ArrowDownLeft size={14} className="text-green-700 dark:text-emerald-400" />
                  ) : (
                    <ArrowUpRight size={14} className="text-red-600 dark:text-red-400" />
                  )}
                  <span className={`text-sm font-semibold ${isIncome ? 'text-green-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {isIncome ? '+' : '-'}
                    {formatCurrency(tx.amount, currency)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
