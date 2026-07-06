import { Modal } from '../common/Modal';
import { formatCurrency, formatDate } from '../../lib/format';
import type { ReportPreview } from '../../lib/api';

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg px-3 py-2.5">
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-zinc-500">{label}</p>
      <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mt-0.5">{value}</p>
    </div>
  );
}

function SampleSection({
  title,
  shown,
  total,
  children,
}: {
  title: string;
  shown: number;
  total: number;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">{title}</h3>
        {total > 0 && (
          <span className="text-[11px] text-slate-500 dark:text-zinc-500">
            Showing {shown} of {total}
          </span>
        )}
      </div>
      {total === 0 ? (
        <p className="text-xs text-slate-500 dark:text-zinc-500">No records.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-zinc-800">
          <table className="w-full text-xs">{children}</table>
        </div>
      )}
    </div>
  );
}

const th = 'text-left font-semibold text-amber-800 dark:text-amber-500 bg-amber-500/10 px-3 py-2';
const td = 'px-3 py-2 border-t border-slate-100 dark:border-zinc-800 text-slate-700 dark:text-zinc-300';

export function ReportPreviewModal({
  isOpen,
  onClose,
  loading,
  error,
  data,
}: {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  error: string | null;
  data: ReportPreview | null;
}) {
  const currency = data?.user.currency ?? 'PKR';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Excel Report Preview" widthClassName="max-w-4xl">
      {loading ? (
        <div className="flex items-center justify-center h-40 text-sm text-slate-500 dark:text-zinc-500">
          Generating preview…
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-40 text-sm text-red-600 dark:text-red-400">{error}</div>
      ) : !data ? null : (
        <div className="space-y-6">
          <p className="text-xs text-slate-500 dark:text-zinc-500">
            Period: <span className="font-medium text-slate-800 dark:text-zinc-200">{data.period}</span> &middot;
            Prepared for {data.user.name}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatTile label="Current Balance" value={formatCurrency(data.summary.currentBalance, currency)} />
            <StatTile label="Net Worth" value={formatCurrency(data.summary.netWorth, currency)} />
            <StatTile label="Total Loan Debt" value={formatCurrency(data.summary.totalLoanDebt, currency)} />
            <StatTile label="Active Goals" value={String(data.summary.activeGoalCount)} />
            <StatTile label="Budget Planned" value={formatCurrency(data.summary.totalBudgetPlanned, currency)} />
            <StatTile label="Budget Remaining" value={formatCurrency(data.summary.totalBudgetRemaining, currency)} />
            <StatTile
              label="Investment Portfolio"
              value={formatCurrency(data.summary.investmentPortfolioValue, currency)}
            />
            <StatTile
              label="Income vs Expense"
              value={`${formatCurrency(data.summary.totalIncome, currency)} / ${formatCurrency(data.summary.totalExpense, currency)}`}
            />
          </div>

          <SampleSection title="Transactions" shown={data.samples.transactions.length} total={data.counts.transactions}>
            <thead>
              <tr>
                <th className={th}>Date</th>
                <th className={th}>Type</th>
                <th className={th}>Category</th>
                <th className={th}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.samples.transactions.map((tx) => (
                <tr key={tx.id}>
                  <td className={td}>{formatDate(tx.date)}</td>
                  <td className={td}>{tx.type === 'INCOME' ? 'Income' : 'Expense'}</td>
                  <td className={td}>{tx.category}</td>
                  <td className={td}>{formatCurrency(tx.amount, currency)}</td>
                </tr>
              ))}
            </tbody>
          </SampleSection>

          <SampleSection title="Investments" shown={data.samples.investments.length} total={data.counts.investments}>
            <thead>
              <tr>
                <th className={th}>Type</th>
                <th className={th}>Asset</th>
                <th className={th}>Invested</th>
                <th className={th}>Current Value</th>
                <th className={th}>Gain/Loss</th>
              </tr>
            </thead>
            <tbody>
              {data.samples.investments.map((inv) => (
                <tr key={inv.id}>
                  <td className={td}>{inv.type}</td>
                  <td className={td}>{inv.assetName}</td>
                  <td className={td}>{formatCurrency(inv.amount, currency)}</td>
                  <td className={td}>{formatCurrency(inv.currentValue, currency)}</td>
                  <td className={td}>{formatCurrency(inv.gainLoss, currency)}</td>
                </tr>
              ))}
            </tbody>
          </SampleSection>

          <SampleSection title="Loans" shown={data.samples.loans.length} total={data.counts.loans}>
            <thead>
              <tr>
                <th className={th}>Loan</th>
                <th className={th}>Principal</th>
                <th className={th}>Remaining</th>
                <th className={th}>Status</th>
                <th className={th}>Repayments</th>
              </tr>
            </thead>
            <tbody>
              {data.samples.loans.map((loan) => (
                <tr key={loan.id}>
                  <td className={td}>{loan.label}</td>
                  <td className={td}>{formatCurrency(loan.principal, currency)}</td>
                  <td className={td}>{formatCurrency(loan.remainingAmount, currency)}</td>
                  <td className={td}>{loan.status === 'PAID_OFF' ? 'Paid off' : 'Active'}</td>
                  <td className={td}>{loan.repayments.length}</td>
                </tr>
              ))}
            </tbody>
          </SampleSection>

          <SampleSection title="Budgets" shown={data.samples.budgets.length} total={data.counts.budgets}>
            <thead>
              <tr>
                <th className={th}>Name</th>
                <th className={th}>Planned</th>
                <th className={th}>Remaining</th>
                <th className={th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.samples.budgets.map((budget) => (
                <tr key={budget.id}>
                  <td className={td}>{budget.name}</td>
                  <td className={td}>{formatCurrency(budget.startAmount, currency)}</td>
                  <td className={td}>{formatCurrency(budget.remainingAmount, currency)}</td>
                  <td className={td}>{budget.active ? 'Active' : 'Inactive'}</td>
                </tr>
              ))}
            </tbody>
          </SampleSection>

          <SampleSection title="Goals" shown={data.samples.goals.length} total={data.counts.goals}>
            <thead>
              <tr>
                <th className={th}>Name</th>
                <th className={th}>Target</th>
                <th className={th}>Current</th>
                <th className={th}>Progress</th>
                <th className={th}>Deadline</th>
              </tr>
            </thead>
            <tbody>
              {data.samples.goals.map((goal) => (
                <tr key={goal.id}>
                  <td className={td}>{goal.name}</td>
                  <td className={td}>{formatCurrency(goal.targetAmount, currency)}</td>
                  <td className={td}>{formatCurrency(goal.currentAmount, currency)}</td>
                  <td className={td}>{goal.progress.toFixed(0)}%</td>
                  <td className={td}>{formatDate(goal.deadline)}</td>
                </tr>
              ))}
            </tbody>
          </SampleSection>
        </div>
      )}
    </Modal>
  );
}
