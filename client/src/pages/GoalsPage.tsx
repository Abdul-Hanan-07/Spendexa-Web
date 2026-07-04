import { useEffect, useState } from 'react';
import { Target, Plus } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { GoalCard } from '../components/goals/GoalCard';
import { AddGoalPanel } from '../components/goals/AddGoalPanel';
import { UpdateGoalProgressModal } from '../components/goals/UpdateGoalProgressModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Toast } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';
import { useGoals } from '../hooks/useGoals';
import { api } from '../lib/api';
import type { Goal } from '../lib/api';

export function GoalsPage() {
  const { user } = useAuth();
  const currency = user?.currency ?? 'PKR';

  const [showAddPanel, setShowAddPanel] = useState(false);
  const [updateProgressTarget, setUpdateProgressTarget] = useState<Goal | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Goal | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);

  const { goals, loading, error, refresh } = useGoals();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await api.deleteGoal(deleteTarget.id);
      setDeleteTarget(null);
      refresh();
      setToast({ message: 'Goal deleted', variant: 'success' });
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete goal');
    } finally {
      setDeleting(false);
    }
  }

  function handleCreated() {
    setShowAddPanel(false);
    refresh();
    setToast({ message: 'Goal added', variant: 'success' });
  }

  function handleProgressUpdated() {
    setUpdateProgressTarget(null);
    refresh();
    setToast({ message: 'Progress updated', variant: 'success' });
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-zinc-100">Goals</h1>
            <p className="text-xs text-slate-500 dark:text-zinc-500 mt-0.5">Track your financial targets.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddPanel(true)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-amber-600 dark:bg-amber-500 hover:bg-amber-700 dark:hover:bg-amber-400 px-4 py-2.5 rounded-lg transition-colors"
          >
            <Plus size={16} />
            Add Goal
          </button>
        </div>

        {loading ? (
          <div className="card card-lift p-5 flex items-center justify-center h-48 text-slate-500 dark:text-zinc-500 text-sm">
            Loading goals...
          </div>
        ) : error ? (
          <div className="card card-lift p-5 flex flex-col items-center justify-center h-48 text-center gap-2">
            <p className="text-sm font-medium text-slate-800 dark:text-zinc-200">Couldn't load goals</p>
            <p className="text-xs text-slate-500 dark:text-zinc-500">{error}</p>
          </div>
        ) : goals.length === 0 ? (
          <div className="card card-lift p-5">
            <div className="flex flex-col items-center justify-center text-center py-10 px-4">
              <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-500 mb-3">
                <Target size={20} />
              </div>
              <p className="text-sm font-medium text-slate-800 dark:text-zinc-200">No goals yet</p>
              <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1 max-w-xs">
                Create a goal to track progress toward your financial targets.
              </p>
              <button
                type="button"
                onClick={() => setShowAddPanel(true)}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-500 hover:text-amber-800 dark:hover:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg transition-colors"
              >
                Add your first goal
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                currency={currency}
                onUpdateProgress={() => setUpdateProgressTarget(goal)}
                onEdit={() => {
                  // TODO: Implement goal editing
                }}
                onDelete={() => {
                  setDeleteError(null);
                  setDeleteTarget(goal);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {showAddPanel && (
        <AddGoalPanel onClose={() => setShowAddPanel(false)} onCreated={handleCreated} />
      )}

      {updateProgressTarget && (
        <UpdateGoalProgressModal
          goal={updateProgressTarget}
          currency={currency}
          onClose={() => setUpdateProgressTarget(null)}
          onUpdated={handleProgressUpdated}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this goal?"
          description={`"${deleteTarget.name}" will be permanently deleted. This action can't be undone.`}
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
