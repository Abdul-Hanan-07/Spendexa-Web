import { useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Transaction } from '../../lib/api';
import { buildIncomeVsExpense } from '../../lib/chartData';
import { formatCompactNumber, formatCurrency } from '../../lib/format';
import { useTheme } from '../../context/ThemeContext';
import { getChartChrome } from '../../lib/chartTheme';
import { EmptyState } from './EmptyState';

export function IncomeExpenseChart({
  transactions,
  currency,
}: {
  transactions: Transaction[];
  currency: string;
}) {
  const { theme } = useTheme();
  const chrome = getChartChrome(theme);
  const { label, income, expense } = useMemo(() => buildIncomeVsExpense(transactions), [transactions]);
  const data = useMemo(
    () => [
      { name: 'Income', value: income, fill: '#34d399' },
      { name: 'Expense', value: expense, fill: '#f87171' },
    ],
    [income, expense],
  );
  const isEmpty = income === 0 && expense === 0;

  return (
    <div className="card card-lift p-5">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mb-1">Income vs. expenses</h3>
      <p className="text-xs text-slate-500 dark:text-zinc-500 mb-4">{label}</p>
      {isEmpty ? (
        <EmptyState
          icon={BarChart3}
          title="No activity this month"
          description="Income and expenses for the current month will show up here."
        />
      ) : (
        <ResponsiveContainer width="100%" height={224}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={1}/>
                <stop offset="95%" stopColor="#34d399" stopOpacity={0.8}/>
              </linearGradient>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={1}/>
                <stop offset="95%" stopColor="#f87171" stopOpacity={0.8}/>
              </linearGradient>
            </defs>
            <CartesianGrid stroke={chrome.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" stroke={chrome.axis} fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              stroke={chrome.axis}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={48}
              tickFormatter={(v: number) => formatCompactNumber(v)}
            />
            <Tooltip
              contentStyle={{ background: chrome.tooltipBg, border: `1px solid ${chrome.tooltipBorder}`, borderRadius: 8, backdropFilter: 'blur(8px)' }}
              labelStyle={{ color: chrome.tooltipLabel }}
              itemStyle={{ color: chrome.tooltipLabel }}
              formatter={(value) => formatCurrency(Number(value), currency)}
              cursor={{ fill: chrome.cursorFill }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={600} animationEasing="ease-out">
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.name === 'Income' ? 'url(#colorIncome)' : 'url(#colorExpense)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
