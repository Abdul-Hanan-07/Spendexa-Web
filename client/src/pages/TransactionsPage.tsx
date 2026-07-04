import { useEffect, useState } from 'react';
import { Plus, Receipt } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { EmptyState } from '../components/dashboard/EmptyState';
import { TransactionFilters, EMPTY_FILTERS } from '../components/transactions/TransactionFilters';
import type { TransactionFilterState } from '../components/transactions/TransactionFilters';
import { TransactionTable } from '../components/transactions/TransactionTable';
import { AddTransactionPanel } from '../components/transactions/AddTransactionPanel';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Toast } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../hooks/useTransactions';
import { api } from '../lib/api';
import type { Transaction } from '../lib/api';

function toApiFilters(filters: TransactionFilterState) {
  return {
    type: filters.type === 'ALL' ? undefined : filters.type,
    category: filters.category || undefined,
    startDate: filters.startDate ? new Date(`${filters.startDate}T00:00:00`).toISOString() : undefined,
    endDate: filters.endDate ? new Date(`${filters.endDate}T23:59:59`).toISOString() : undefined,
  };
}

export function TransactionsPage() {
  const { user } = useAuth();
  const currency = user?.currency ?? 'PKR';

  const [filters, setFilters] = useState<TransactionFilterState>(EMPTY_FILTERS);
  const [categories, setCategories] = useState<string[]>([]);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);

  const { transactions, loading, loadingMore, error, hasMore, loadMore, refresh } = useTransactions(
    toApiFilters(filters),
  );

  const hasActiveFilters =
    filters.type !== 'ALL' || filters.category !== '' || filters.startDate !== '' || filters.endDate !== '';

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  function loadCategories() {
    api
      .listTransactions({ limit: 100 })
      .then((res) => {
        const unique = Array.from(new Set(res.transactions.map((tx) => tx.category))).sort();
        setCategories(unique);
      })
      .catch(() => {
        // Non-critical: category filter just stays empty.
      });
  }

  function handleCreated() {
    setShowAddPanel(false);
    refresh();
    loadCategories();
    setToast({ message: 'Transaction added', variant: 'success' });
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await api.deleteTransaction(deleteTarget.id);
      setDeleteTarget(null);
      refresh();
      setToast({ message: 'Transaction deleted', variant: 'success' });
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete transaction');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-zinc-100">Transactions</h1>
            <p className="text-xs text-slate-500 dark:text-zinc-500 mt-0.5">Track and manage your income and expenses.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddPanel(true)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-amber-600 dark:bg-amber-500 hover:bg-amber-700 dark:hover:bg-amber-400 px-4 py-2.5 rounded-lg transition-colors"
          >
            <Plus size={16} />
            Add Transaction
          </button>
        </div>

        <TransactionFilters
          filters={filters}
          categories={categories}
          onChange={setFilters}
          onClear={() => setFilters(EMPTY_FILTERS)}
        />

        <div className="card card-lift p-5">
          {loading ? (
            <div className="flex items-center justify-center h-48 text-slate-500 dark:text-zinc-500 text-sm">
              Loading transactions...
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-48 text-center gap-2">
              <p className="text-sm font-medium text-slate-800 dark:text-zinc-200">Couldn't load transactions</p>
              <p className="text-xs text-slate-500 dark:text-zinc-500">{error}</p>
            </div>
          ) : transactions.length === 0 ? (
            hasActiveFilters ? (
              <EmptyState
                icon={Receipt}
                title="No matching transactions"
                description="Try adjusting or clearing your filters to see more results."
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-10 px-4">
                <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-500 mb-3">
                  <Receipt size={20} />
                </div>
                <p className="text-sm font-medium text-slate-800 dark:text-zinc-200">No transactions yet</p>
                <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1 max-w-xs">
                  Add your first transaction to start tracking your finances.
                </p>
                <button
                  type="button"
                  onClick={() => setShowAddPanel(true)}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-500 hover:text-amber-800 dark:hover:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Add your first transaction
                </button>
              </div>
            )
          ) : (
            <>
              <TransactionTable
                transactions={transactions}
                currency={currency}
                onDelete={(tx) => {
                  setDeleteError(null);
                  setDeleteTarget(tx);
                }}
              />
              {hasMore && (
                <div className="pt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="text-sm font-medium text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 disabled:opacity-60 px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800/60 transition-colors"
                  >
                    {loadingMore ? 'Loading…' : 'Load more'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showAddPanel && (
        <AddTransactionPanel onClose={() => setShowAddPanel(false)} onCreated={handleCreated} />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this transaction?"
          description={`This will permanently remove "${deleteTarget.category}" from your transactions. This action can't be undone.`}
          loading={deleting}
          error={deleteError}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {toast && <Toast message={toast.message} variant={toast.variant} />}
    </AppLayout>
  );
}
