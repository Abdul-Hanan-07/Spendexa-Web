import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedNumber } from '../common/AnimatedNumber';

type Tone = 'default' | 'positive' | 'negative' | 'warning';

const TONE_STYLES: Record<Tone, { icon: string; value: string }> = {
  default: { icon: 'bg-amber-500/10 text-amber-700 dark:text-amber-500', value: 'text-slate-900 dark:text-zinc-100' },
  positive: { icon: 'bg-emerald-500/10 text-green-700 dark:text-emerald-400', value: 'text-green-700 dark:text-emerald-400' },
  negative: { icon: 'bg-red-500/10 text-red-600 dark:text-red-400', value: 'text-red-600 dark:text-red-400' },
  warning: { icon: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400', value: 'text-yellow-700 dark:text-yellow-400' },
};

// Driven by the parent grid's staggerChildren; keep the distance small so the
// motion stays subtle.
const summaryCardVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export function SummaryCard({
  label,
  value,
  icon: Icon,
  tone = 'default',
  subtext,
  formatValue,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  tone?: Tone;
  subtext?: string;
  formatValue?: (value: number) => string;
}) {
  const styles = TONE_STYLES[tone];
  const format = formatValue ?? ((n: number) => String(Math.round(n)));

  return (
    <motion.div
      variants={summaryCardVariants}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="card card-lift p-5 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500 dark:text-zinc-400">{label}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${styles.icon}`}>
          <Icon size={18} />
        </div>
      </div>
      <div>
        <p className={`text-2xl font-bold tracking-tight ${styles.value}`}>
          <AnimatedNumber value={value} format={format} />
        </p>
        {subtext && <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">{subtext}</p>}
      </div>
    </motion.div>
  );
}
