import { useEffect, useState } from 'react';
import { Landmark, Plus } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { EmptyState } from '../components/dashboard/EmptyState';
import { LoanFilters, EMPTY_LOAN_FILTERS } from '../components/loans/LoanFilters';
import type { LoanFilterState } from '../components/loans/LoanFilters';
import { LoanCard } from '../components/loans/LoanCard';
import type { RepaymentsState } from '../components/loans/LoanCard';
import { AddLoanPanel } from '../components/loans/AddLoanPanel';
import { RepayLoanModal } from '../components/loans/RepayLoanModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Toast } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';
import { useLoans } from '../hooks/useLoans';
import { api } from '../lib/api';
import type { Loan, LoanRepayment } from '../lib/api';
import { formatCurrency } from '../lib/format';

export function LoansPage() {
  const { user } = useAuth();
  const currency = user?.currency ?? 'PKR';

  const [filters, setFilters] = useState<LoanFilterState>(EMPTY_LOAN_FILTERS);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [repaymentsCache, setRepaymentsCache] = useState<Record<string, RepaymentsState>>({});
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [repayTarget, setRepayTarget] = useState<Loan | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Loan | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);

  const { loans, loading, error, refresh } = useLoans({
    status: filters.status === 'ALL' ? undefined : filters.status,
  });

  const hasActiveFilters = filters.status !== 'ALL';

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  function loadRepayments(loanId: string) {
    setRepaymentsCache((prev) => ({ ...prev, [loanId]: { status: 'loading' } }));
    api
      .getLoan(loanId)
      .then((res) => {
        setRepaymentsCache((prev) => ({
          ...prev,
          [loanId]: { status: 'loaded', repayments: res.loan.repayments },
        }));
      })
      .catch((err: unknown) => {
        setRepaymentsCache((prev) => ({
          ...prev,
          [loanId]: {
            status: 'error',
            message: err instanceof Error ? err.message : 'Failed to load repayment history',
          },
        }));
      });
  }

  function toggleExpand(loanId: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(loanId)) {
        next.delete(loanId);
      } else {
        next.add(loanId);
        if (!repaymentsCache[loanId]) {
          loadRepayments(loanId);
        }
      }
      return next;
    });
  }

  function handleCreated() {
    setShowAddPanel(false);
    refresh();
    setToast({ message: 'Loan added', variant: 'success' });
  }

  function handleRepaid(updatedLoan: Loan, repayment: LoanRepayment) {
    setRepayTarget(null);
    refresh();
    setRepaymentsCache((prev) => {
      const existing = prev[updatedLoan.id];
      if (existing?.status === 'loaded') {
        return {
          ...prev,
          [updatedLoan.id]: { status: 'loaded', repayments: [repayment, ...existing.repayments] },
        };
      }
      return prev;
    });
    setToast({
      message: updatedLoan.status === 'PAID_OFF' ? 'Repayment recorded — loan fully paid off' : 'Repayment recorded',
      variant: 'success',
    });
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await api.deleteLoan(deleteTarget.id);
      setDeleteTarget(null);
      refresh();
      setToast({ message: 'Loan deleted', variant: 'success' });
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete loan');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-zinc-100">Loans</h1>
            <p className="text-xs text-slate-500 dark:text-zinc-500 mt-0.5">Track balances, interest, and repayments.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddPanel(true)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-amber-600 dark:bg-amber-500 hover:bg-amber-700 dark:hover:bg-amber-400 px-4 py-2.5 rounded-lg transition-colors"
          >
            <Plus size={16} />
            Add Loan
          </button>
        </div>

        <LoanFilters filters={filters} onChange={setFilters} onClear={() => setFilters(EMPTY_LOAN_FILTERS)} />

        {loading ? (
          <div className="card card-lift p-5 flex items-center justify-center h-48 text-slate-500 dark:text-zinc-500 text-sm">
            Loading loans...
          </div>
        ) : error ? (
          <div className="card card-lift p-5 flex flex-col items-center justify-center h-48 text-center gap-2">
            <p className="text-sm font-medium text-slate-800 dark:text-zinc-200">Couldn't load loans</p>
            <p className="text-xs text-slate-500 dark:text-zinc-500">{error}</p>
          </div>
        ) : loans.length === 0 ? (
          hasActiveFilters ? (
            <div className="card card-lift p-5">
              <EmptyState
                icon={Landmark}
                title="No matching loans"
                description="Try a different status filter to see more results."
              />
            </div>
          ) : (
            <div className="card card-lift p-5">
              <div className="flex flex-col items-center justify-center text-center py-10 px-4">
                <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-500 mb-3">
                  <Landmark size={20} />
                </div>
                <p className="text-sm font-medium text-slate-800 dark:text-zinc-200">No loans yet</p>
                <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1 max-w-xs">
                  Add a loan to start tracking its balance and repayments.
                </p>
                <button
                  type="button"
                  onClick={() => setShowAddPanel(true)}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-500 hover:text-amber-800 dark:hover:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Add your first loan
                </button>
              </div>
            </div>
          )
        ) : (
          <div className="space-y-3">
            {loans.map((loan) => (
              <LoanCard
                key={loan.id}
                loan={loan}
                currency={currency}
                expanded={expandedIds.has(loan.id)}
                repaymentsState={repaymentsCache[loan.id] ?? { status: 'idle' }}
                onToggleExpand={() => toggleExpand(loan.id)}
                onRepay={() => setRepayTarget(loan)}
                onDelete={() => {
                  setDeleteError(null);
                  setDeleteTarget(loan);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {showAddPanel && (
        <AddLoanPanel currency={currency} onClose={() => setShowAddPanel(false)} onCreated={handleCreated} />
      )}

      {repayTarget && (
        <RepayLoanModal
          loan={repayTarget}
          currency={currency}
          onClose={() => setRepayTarget(null)}
          onRepaid={handleRepaid}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this loan?"
          description={`This will permanently remove the ${formatCurrency(deleteTarget.principal, currency)} principal loan. This action can't be undone.`}
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
