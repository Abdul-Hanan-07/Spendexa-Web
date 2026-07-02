import { useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Transaction } from '../../lib/api';
import { buildBalanceTrend } from '../../lib/chartData';
import { formatCompactNumber, formatCurrency } from '../../lib/format';

export function NetWorthChart({
  transactions,
  currentBalance,
  currency,
}: {
  transactions: Transaction[];
  currentBalance: number;
  currency: string;
}) {
  const [range, setRange] = useState<30 | 90>(30);
  const data = useMemo(
    () => buildBalanceTrend(transactions, currentBalance, range),
    [transactions, currentBalance, range],
  );

  const hasMovement = data.some((p) => p.balance !== data[0]?.balance);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100">Balance trend</h3>
          <p className="text-xs text-zinc-500">Running account balance</p>
        </div>
        <div className="flex items-center bg-zinc-800 rounded-lg p-1 text-xs font-medium">
          {([30, 90] as const).map((d) => (
            <button
              key={d}
              onClick={() => setRange(d)}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                range === d ? 'bg-amber-500 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>
      {!hasMovement ? (
        <div className="h-56 flex items-center justify-center text-sm text-zinc-500">
          Not enough activity yet to show a trend
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={224}>
          <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#71717a"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              minTickGap={30}
            />
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
              itemStyle={{ color: '#FBBF24' }}
              formatter={(value) => [formatCurrency(Number(value), currency), 'Balance']}
            />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="#F59E0B"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
