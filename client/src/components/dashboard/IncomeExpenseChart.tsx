import { BarChart3 } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Transaction } from '../../lib/api';
import { buildIncomeVsExpense } from '../../lib/chartData';
import { formatCompactNumber, formatCurrency } from '../../lib/format';
import { EmptyState } from './EmptyState';

export function IncomeExpenseChart({
  transactions,
  currency,
}: {
  transactions: Transaction[];
  currency: string;
}) {
  const { label, income, expense } = buildIncomeVsExpense(transactions);
  const data = [
    { name: 'Income', value: income, fill: '#34d399' },
    { name: 'Expense', value: expense, fill: '#f87171' },
  ];
  const isEmpty = income === 0 && expense === 0;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-zinc-100 mb-1">Income vs. expenses</h3>
      <p className="text-xs text-zinc-500 mb-4">{label}</p>
      {isEmpty ? (
        <EmptyState
          icon={BarChart3}
          title="No activity this month"
          description="Income and expenses for the current month will show up here."
        />
      ) : (
        <ResponsiveContainer width="100%" height={224}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              stroke="#71717a"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={48}
              tickFormatter={(v: number) => formatCompactNumber(v)}
            />
            <Tooltip
              contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8 }}
              labelStyle={{ color: '#e4e4e7' }}
              formatter={(value) => formatCurrency(Number(value), currency)}
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} isAnimationActive={false}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
