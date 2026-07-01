import { Landmark, Target, TrendingUp, Wallet } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { SummaryCard } from '../components/dashboard/SummaryCard';
import { NetWorthChart } from '../components/dashboard/NetWorthChart';
import { ExpenseBreakdownChart } from '../components/dashboard/ExpenseBreakdownChart';
import { IncomeExpenseChart } from '../components/dashboard/IncomeExpenseChart';
import { InvestmentAllocationChart } from '../components/dashboard/InvestmentAllocationChart';
import { BudgetWidget } from '../components/dashboard/BudgetWidget';
import { GoalsWidget } from '../components/dashboard/GoalsWidget';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { useAuth } from '../context/AuthContext';
import { useDashboardData } from '../hooks/useDashboardData';
import { formatCurrency } from '../lib/format';

export function DashboardPage() {
  const { user } = useAuth();
  const { data, loading, error } = useDashboardData();
  const currency = user?.currency ?? 'PKR';

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64 text-zinc-500 text-sm">
          Loading your dashboard...
        </div>
      </AppLayout>
    );
  }

  if (error || !data) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-64 text-center gap-2">
          <p className="text-sm font-medium text-zinc-200">Couldn't load your dashboard</p>
          <p className="text-xs text-zinc-500">{error ?? 'Something went wrong'}</p>
        </div>
      </AppLayout>
    );
  }

  const { summary, transactions, recentTransactions, investments, loans, goals } = data;
  const netWorth = Number(summary.netWorth);
  const currentBalance = Number(summary.currentBalance);
  const totalLoanDebt = Number(summary.totalLoanDebt);
  const activeLoanCount = loans.filter((l) => l.status === 'ACTIVE').length;
  const hasInvestments = investments.length > 0;

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            label="Current Balance"
            value={formatCurrency(currentBalance, currency)}
            icon={Wallet}
            tone={currentBalance < 0 ? 'negative' : 'default'}
          />
          <SummaryCard
            label="Net Worth"
            value={formatCurrency(netWorth, currency)}
            icon={TrendingUp}
            tone={netWorth >= 0 ? 'positive' : 'negative'}
          />
          <SummaryCard
            label="Total Loan Debt"
            value={formatCurrency(totalLoanDebt, currency)}
            icon={Landmark}
            tone={totalLoanDebt > 0 ? 'warning' : 'default'}
            subtext={`${activeLoanCount} active loan${activeLoanCount === 1 ? '' : 's'}`}
          />
          <SummaryCard label="Active Goals" value={String(summary.goalCount)} icon={Target} />
        </div>

        {/* Balance trend */}
        <NetWorthChart transactions={transactions} currentBalance={currentBalance} currency={currency} />

        {/* Expense breakdown + income vs expense + investment allocation */}
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-5 ${hasInvestments ? 'xl:grid-cols-3' : ''}`}
        >
          <ExpenseBreakdownChart transactions={transactions} currency={currency} />
          <IncomeExpenseChart transactions={transactions} currency={currency} />
          {hasInvestments && (
            <InvestmentAllocationChart investments={investments} currency={currency} />
          )}
        </div>

        {/* Budget + Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <BudgetWidget budget={summary.activeBudget} currency={currency} />
          <GoalsWidget goals={goals} currency={currency} />
        </div>

        {/* Recent transactions */}
        <RecentTransactions transactions={recentTransactions} currency={currency} />
      </div>
    </AppLayout>
  );
}
