import { PieChart as PieChartIcon } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { Transaction } from '../../lib/api';
import { buildExpenseBreakdown } from '../../lib/chartData';
import { formatCurrency } from '../../lib/format';
import { useTheme } from '../../context/ThemeContext';
import { getCategoricalColors, getChartChrome } from '../../lib/chartTheme';
import { EmptyState } from './EmptyState';

export function ExpenseBreakdownChart({
  transactions,
  currency,
}: {
  transactions: Transaction[];
  currency: string;
}) {
  const { theme } = useTheme();
  const COLORS = getCategoricalColors(theme);
  const chrome = getChartChrome(theme);
  const data = buildExpenseBreakdown(transactions);
  const total = data.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mb-1">Expense breakdown</h3>
      <p className="text-xs text-slate-500 dark:text-zinc-500 mb-4">By category, last 90 days</p>
      {data.length === 0 ? (
        <EmptyState
          icon={PieChartIcon}
          title="No expenses yet"
          description="Once you log some expenses, we'll break them down by category here."
        />
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-full sm:w-1/2 sm:shrink-0" style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="amount"
                  nameKey="category"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={2}
                  isAnimationActive={false}
                >
                  {data.map((entry, index) => (
                    <Cell key={entry.category} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: chrome.tooltipBg, border: `1px solid ${chrome.tooltipBorder}`, borderRadius: 8 }}
                  labelStyle={{ color: chrome.tooltipLabel }}
                  formatter={(value, name) => [formatCurrency(Number(value), currency), String(name)]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full sm:w-1/2 space-y-2">
            {data.slice(0, 6).map((entry, index) => (
              <div key={entry.category} className="flex items-center justify-between gap-2 text-xs">
                <span className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-slate-700 dark:text-zinc-300 truncate">{entry.category}</span>
                </span>
                <span className="text-slate-500 dark:text-zinc-500 shrink-0">
                  {total > 0 ? Math.round((entry.amount / total) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
