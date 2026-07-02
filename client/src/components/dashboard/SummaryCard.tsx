import type { LucideIcon } from 'lucide-react';

type Tone = 'default' | 'positive' | 'negative' | 'warning';

const TONE_STYLES: Record<Tone, { icon: string; value: string }> = {
  default: { icon: 'bg-amber-500/10 text-amber-500', value: 'text-zinc-100' },
  positive: { icon: 'bg-emerald-500/10 text-emerald-400', value: 'text-emerald-400' },
  negative: { icon: 'bg-red-500/10 text-red-400', value: 'text-red-400' },
  warning: { icon: 'bg-yellow-500/10 text-yellow-400', value: 'text-yellow-400' },
};

export function SummaryCard({
  label,
  value,
  icon: Icon,
  tone = 'default',
  subtext,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: Tone;
  subtext?: string;
}) {
  const styles = TONE_STYLES[tone];
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-400">{label}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${styles.icon}`}>
          <Icon size={18} />
        </div>
      </div>
      <div>
        <p className={`text-2xl font-bold tracking-tight ${styles.value}`}>{value}</p>
        {subtext && <p className="text-xs text-zinc-500 mt-1">{subtext}</p>}
      </div>
    </div>
  );
}
