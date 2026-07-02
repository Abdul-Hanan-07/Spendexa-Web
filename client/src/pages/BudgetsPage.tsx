import { useEffect, useState } from 'react';
import { Wallet, Plus } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { BudgetCard } from '../components/budgets/BudgetCard';
import { UpsertBudgetPanel } from '../components/budgets/UpsertBudgetPanel';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Toast } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';
import { useBudgets } from '../hooks/useBudgets';
import { api } from '../lib/api';
import type { Budget } from '../lib/api';
import { formatDate } from '../lib/format';

export function BudgetsPage() {
  const { user } = useAuth();
  const currency = user?.currency ?? 'PKR';

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<Budget | null>(null);
  const [deactivating, setDeactivating] = useState(false);
  const [deactivateError, setDeactivateError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);

  const { activeBudget, history, loading, error, refresh } = useBudgets();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  async function handleDeactivate() {
    if (!deactivateTarget) return;
    setDeactivating(true);
    setDeactivateError(null);
    try {
      await api.deactivateBudget(deactivateTarget.id);
      setDeactivateTarget(null);
      refresh();
      setToast({ message: 'Budget deactivated', variant: 'success' });
    } catch (err) {
      setDeactivateError(err instanceof Error ? err.message : 'Failed to deactivate budget');
    } finally {
      setDeactivating(false);
    }
  }

  function handleUpserted() {
    setShowPanel(false);
    setEditingBudget(null);
    refresh();
    setToast({ message: 'Budget saved', variant: 'success' });
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-zinc-100">Budgets</h1>
            <p className="text-xs text-slate-500 dark:text-zinc-500 mt-0.5">Set limits and track spending.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingBudget(null);
              setShowPanel(true);
            }}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-amber-600 dark:bg-amber-500 hover:bg-amber-700 dark:hover:bg-amber-400 px-4 py-2.5 rounded-lg transition-colors"
          >
            <Plus size={16} />
            {activeBudget ? 'Update Budget' : 'Create Budget'}
          </button>
        </div>

        {loading ? (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 flex items-center justify-center h-48 text-slate-500 dark:text-zinc-500 text-sm">
            Loading budgets...
          </div>
        ) : error ? (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col items-center justify-center h-48 text-center gap-2">
            <p className="text-sm font-medium text-slate-800 dark:text-zinc-200">Couldn't load budgets</p>
            <p className="text-xs text-slate-500 dark:text-zinc-500">{error}</p>
          </div>
        ) : !activeBudget ? (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5">
            <div className="flex flex-col items-center justify-center text-center py-10 px-4">
              <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-500 mb-3">
                <Wallet size={20} />
              </div>
              <p className="text-sm font-medium text-slate-800 dark:text-zinc-200">No budget yet</p>
              <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1 max-w-xs">Create a budget to set spending limits and track progress.</p>
              <button
                type="button"
                onClick={() => setShowPanel(true)}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-500 hover:text-amber-800 dark:hover:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg transition-colors"
              >
                Create your first budget
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h2 className="text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-3">Active budget</h2>
              <BudgetCard
                budget={activeBudget}
                currency={currency}
                expanded={expandedId === activeBudget.id}
                onToggleExpand={() => setExpandedId(expandedId === activeBudget.id ? null : activeBudget.id)}
                onEdit={() => {
                  setEditingBudget(activeBudget);
                  setShowPanel(true);
                }}
                onDeactivate={() => {
                  setDeactivateError(null);
                  setDeactivateTarget(activeBudget);
                }}
              />
            </div>

            {history.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-3">Previous budgets</h2>
                <div className="space-y-2">
                  {history.map(({ id, name, startDate, endDate }) => (
                    <div
                      key={id}
                      className="bg-slate-100 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/60 rounded-lg p-4 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-zinc-900/80 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-zinc-300">{name}</p>
                        {startDate && endDate && (
                          <p className="text-xs text-slate-500 dark:text-zinc-500 mt-0.5">
                            {formatDate(startDate)} – {formatDate(endDate)}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">Ended</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showPanel && (
        <UpsertBudgetPanel
          initialBudget={editingBudget || undefined}
          onClose={() => {
            setShowPanel(false);
            setEditingBudget(null);
          }}
          onUpserted={handleUpserted}
        />
      )}

      {deactivateTarget && (
        <ConfirmDialog
          title="Deactivate this budget?"
          description={`The "${deactivateTarget.name}" budget will be moved to history.`}
          loading={deactivating}
          error={deactivateError}
          confirmLabel="Deactivate"
          onConfirm={handleDeactivate}
          onCancel={() => setDeactivateTarget(null)}
        />
      )}

      {toast && <Toast message={toast.message} variant={toast.variant} />}
    </AppLayout>
  );
}
