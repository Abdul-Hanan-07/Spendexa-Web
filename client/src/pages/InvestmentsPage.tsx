import { useEffect, useState } from 'react';
import { Plus, RefreshCw, TrendingUp } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { EmptyState } from '../components/dashboard/EmptyState';
import {
  InvestmentFilters,
  EMPTY_INVESTMENT_FILTERS,
} from '../components/investments/InvestmentFilters';
import type { InvestmentFilterState } from '../components/investments/InvestmentFilters';
import { InvestmentTable } from '../components/investments/InvestmentTable';
import { AddInvestmentPanel } from '../components/investments/AddInvestmentPanel';
import { UpdateValueModal } from '../components/investments/UpdateValueModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Toast } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';
import { useInvestments } from '../hooks/useInvestments';
import { api } from '../lib/api';
import type { Investment } from '../lib/api';

export function InvestmentsPage() {
  const { user } = useAuth();
  const currency = user?.currency ?? 'PKR';

  const [filters, setFilters] = useState<InvestmentFilterState>(EMPTY_INVESTMENT_FILTERS);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [updateTarget, setUpdateTarget] = useState<Investment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Investment | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);
  const [refreshingIds, setRefreshingIds] = useState<Set<string>>(new Set());
  const [refreshingAll, setRefreshingAll] = useState(false);

  const { investments, loading, error, refresh } = useInvestments({
    type: filters.type === 'ALL' ? undefined : filters.type,
  });

  const hasActiveFilters = filters.type !== 'ALL';

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  function handleCreated() {
    setShowAddPanel(false);
    refresh();
    setToast({ message: 'Investment added', variant: 'success' });
  }

  function handleUpdated() {
    setUpdateTarget(null);
    refresh();
    setToast({ message: 'Value updated', variant: 'success' });
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await api.deleteInvestment(deleteTarget.id);
      setDeleteTarget(null);
      refresh();
      setToast({ message: 'Investment deleted', variant: 'success' });
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete investment');
    } finally {
      setDeleting(false);
    }
  }

  async function handleRefreshOne(investment: Investment) {
    setRefreshingIds((prev) => new Set(prev).add(investment.id));
    try {
      await api.refreshInvestmentPrice(investment.id);
      refresh();
      setToast({ message: `${investment.assetName} price updated`, variant: 'success' });
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : 'Failed to refresh price', variant: 'error' });
    } finally {
      setRefreshingIds((prev) => {
        const next = new Set(prev);
        next.delete(investment.id);
        return next;
      });
    }
  }

  async function handleRefreshAll() {
    setRefreshingAll(true);
    try {
      const { results } = await api.refreshAllPrices();
      refresh();
      const succeeded = results.filter((r) => r.success).length;
      if (results.length === 0) {
        setToast({ message: 'No PSX or crypto holdings to refresh', variant: 'success' });
      } else if (succeeded === results.length) {
        setToast({ message: `Updated ${succeeded} of ${results.length} holdings`, variant: 'success' });
      } else {
        setToast({ message: `Updated ${succeeded} of ${results.length} holdings — some symbols couldn't be found`, variant: 'error' });
      }
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : 'Failed to refresh prices', variant: 'error' });
    } finally {
      setRefreshingAll(false);
    }
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-zinc-100">Investments</h1>
            <p className="text-xs text-slate-500 dark:text-zinc-500 mt-0.5">Track your portfolio across asset types.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefreshAll}
              disabled={refreshingAll}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 disabled:opacity-60 px-3.5 py-2.5 rounded-lg transition-colors"
            >
              <RefreshCw size={16} className={refreshingAll ? 'animate-spin' : ''} />
              {refreshingAll ? 'Refreshing…' : 'Refresh prices'}
            </button>
            <button
              type="button"
              onClick={() => setShowAddPanel(true)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-amber-600 dark:bg-amber-500 hover:bg-amber-700 dark:hover:bg-amber-400 px-4 py-2.5 rounded-lg transition-colors"
            >
              <Plus size={16} />
              Add Investment
            </button>
          </div>
        </div>

        <InvestmentFilters
          filters={filters}
          onChange={setFilters}
          onClear={() => setFilters(EMPTY_INVESTMENT_FILTERS)}
        />

        <p className="text-xs text-slate-500 dark:text-zinc-500">
          Prices may be delayed up to 15 minutes and are for informational tracking only.
        </p>

        <div className="card card-lift p-5">
          {loading ? (
            <div className="flex items-center justify-center h-48 text-slate-500 dark:text-zinc-500 text-sm">
              Loading investments...
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-48 text-center gap-2">
              <p className="text-sm font-medium text-slate-800 dark:text-zinc-200">Couldn't load investments</p>
              <p className="text-xs text-slate-500 dark:text-zinc-500">{error}</p>
            </div>
          ) : investments.length === 0 ? (
            hasActiveFilters ? (
              <EmptyState
                icon={TrendingUp}
                title="No matching investments"
                description="Try a different type filter to see more results."
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-10 px-4">
                <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-500 mb-3">
                  <TrendingUp size={20} />
                </div>
                <p className="text-sm font-medium text-slate-800 dark:text-zinc-200">No investments yet</p>
                <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1 max-w-xs">
                  Add your first investment to start tracking your portfolio.
                </p>
                <button
                  type="button"
                  onClick={() => setShowAddPanel(true)}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-500 hover:text-amber-800 dark:hover:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Add your first investment
                </button>
              </div>
            )
          ) : (
            <InvestmentTable
              investments={investments}
              currency={currency}
              refreshingIds={refreshingIds}
              onUpdateValue={setUpdateTarget}
              onRefreshPrice={handleRefreshOne}
              onDelete={(inv) => {
                setDeleteError(null);
                setDeleteTarget(inv);
              }}
            />
          )}
        </div>
      </div>

      {showAddPanel && (
        <AddInvestmentPanel onClose={() => setShowAddPanel(false)} onCreated={handleCreated} />
      )}

      {updateTarget && (
        <UpdateValueModal
          investment={updateTarget}
          onClose={() => setUpdateTarget(null)}
          onUpdated={handleUpdated}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this investment?"
          description={`This will permanently remove "${deleteTarget.assetName}" from your portfolio. This action can't be undone.`}
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
