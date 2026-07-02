import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { Investment } from '../../lib/api';
import { buildInvestmentAllocation } from '../../lib/chartData';
import { formatCurrency } from '../../lib/format';

const TYPE_LABELS: Record<string, string> = {
  PSX: 'PSX Stocks',
  CRYPTO: 'Crypto',
  REAL_ESTATE: 'Real Estate',
  METAL: 'Metals',
};

const COLORS = ['#F59E0B', '#14B8A6', '#6366F1', '#F43F5E'];

export function InvestmentAllocationChart({
  investments,
  currency,
}: {
  investments: Investment[];
  currency: string;
}) {
  const data = buildInvestmentAllocation(investments);
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-zinc-100 mb-1">Investment allocation</h3>
      <p className="text-xs text-zinc-500 mb-4">By asset type</p>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="w-full sm:w-1/2 sm:shrink-0" style={{ height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="type"
                innerRadius={52}
                outerRadius={78}
                paddingAngle={2}
                isAnimationActive={false}
              >
                {data.map((entry, index) => (
                  <Cell key={entry.type} fill={COLORS[index % COLORS.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8 }}
                labelStyle={{ color: '#e4e4e7' }}
                formatter={(value, _name, entry) => [
                  formatCurrency(Number(value), currency),
                  TYPE_LABELS[String(entry.payload?.type)] ?? String(entry.payload?.type),
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full sm:w-1/2 space-y-2">
          {data.map((entry, index) => (
            <div key={entry.type} className="flex items-center justify-between gap-2 text-xs">
              <span className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-zinc-300 truncate">{TYPE_LABELS[entry.type] ?? entry.type}</span>
              </span>
              <span className="text-zinc-500 shrink-0">
                {total > 0 ? Math.round((entry.value / total) * 100) : 0}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
