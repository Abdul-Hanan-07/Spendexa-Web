import { useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Transaction } from '../../lib/api';
import { buildBalanceTrend } from '../../lib/chartData';
import { formatCompactNumber, formatCurrency } from '../../lib/format';
import { useTheme } from '../../context/ThemeContext';
import { getAccentLine, getAccentText, getChartChrome } from '../../lib/chartTheme';

export function NetWorthChart({
  transactions,
  currentBalance,
  currency,
}: {
  transactions: Transaction[];
  currentBalance: number;
  currency: string;
}) {
  const { theme } = useTheme();
  const chrome = getChartChrome(theme);
  const accentLine = getAccentLine(theme);
  const accentText = getAccentText(theme);
  const [range, setRange] = useState<7 | 30 | 90>(30);
  const data = useMemo(
    () => buildBalanceTrend(transactions, currentBalance, range),
    [transactions, currentBalance, range],
  );

  const hasMovement = data.some((p) => p.balance !== data[0]?.balance);

  return (
    <div className="card card-lift p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Balance trend</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-500">Running account balance</p>
        </div>
        <div className="flex items-center bg-slate-100 dark:bg-zinc-800 rounded-lg p-1 text-xs font-medium">
          {([7, 30, 90] as const).map((d) => (
            <button
              key={d}
              onClick={() => setRange(d)}
              className={`px-2.5 py-2 rounded-md transition-colors ${
                range === d ? 'bg-amber-600 dark:bg-amber-500 text-white' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>
      {!hasMovement ? (
        <div className="h-56 flex items-center justify-center text-sm text-slate-500 dark:text-zinc-500">
          Not enough activity yet to show a trend
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={224}>
          <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={chrome.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              stroke={chrome.axis}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              minTickGap={30}
            />
            <YAxis
              stroke={chrome.axis}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={48}
              tickFormatter={(v: number) => formatCompactNumber(v)}
            />
            <Tooltip
              contentStyle={{ background: chrome.tooltipBg, border: `1px solid ${chrome.tooltipBorder}`, borderRadius: 8 }}
              labelStyle={{ color: chrome.tooltipLabel }}
              itemStyle={{ color: accentText }}
              formatter={(value) => [formatCurrency(Number(value), currency), 'Balance']}
            />
            <Line
              type="monotone"
              dataKey="balance"
              stroke={accentLine}
              strokeWidth={2}
              dot={false}
              animationDuration={600}
              animationEasing="ease-out"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
