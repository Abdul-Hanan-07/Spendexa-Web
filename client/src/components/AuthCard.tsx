import type { ReactNode } from 'react';
import { LineChart, Target, Wallet } from 'lucide-react';
import { ThemeToggle } from './common/ThemeToggle';

const features = [
  { icon: LineChart, label: 'Track spending trends' },
  { icon: Wallet, label: 'Real-time net worth' },
  { icon: Target, label: 'Goal tracking' },
];

export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-zinc-950">
      <ThemeToggle className="fixed top-4 right-4 md:top-6 md:right-6 z-30" />

      {/* Brand panel */}
      <div className="hidden md:flex md:w-1/2 lg:w-5/12 relative overflow-hidden flex-col justify-between p-12 bg-gradient-to-br from-amber-50 via-white to-teal-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-black border-r border-slate-200 dark:border-zinc-800">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-28 -left-24 w-[26rem] h-[26rem] rounded-full bg-amber-300/35 dark:bg-amber-500/20 blur-3xl animate-[orb-drift-1_14s_ease-in-out_infinite]" />
          <div className="absolute top-1/4 -right-28 w-96 h-96 rounded-full bg-orange-300/25 dark:bg-orange-500/15 blur-3xl animate-[orb-drift-2_17s_ease-in-out_infinite]" />
          <div className="absolute -bottom-20 left-10 w-64 h-64 rounded-full bg-teal-300/20 dark:bg-teal-500/10 blur-3xl animate-[orb-drift-3_15s_ease-in-out_infinite]" />
        </div>

        <div className="relative z-10 animate-[fade-in-scale_500ms_ease-out]">
          <div className="flex items-center gap-2.5">
            <img src="/logo-tile.svg" alt="Spendexa" className="w-10 h-10 rounded-xl shadow-lg shadow-amber-600/30" />
            <span className="text-xl font-semibold text-slate-900 dark:text-zinc-100">Spendexa</span>
          </div>
        </div>

        <div className="relative z-10">
          <h2 className="text-3xl font-semibold text-slate-900 dark:text-zinc-100 leading-tight mb-4">
            Take control of
            <br />
            your finances
          </h2>
          <p className="text-slate-600 dark:text-zinc-400 mb-8 max-w-sm">
            Everything you need to track spending, grow your net worth, and hit your goals — in one place.
          </p>
          <ul className="space-y-3">
            {features.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-zinc-300"
              >
                <span className="w-8 h-8 rounded-lg bg-white/70 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-amber-600 dark:text-amber-500 shrink-0">
                  <Icon size={16} />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 text-xs text-slate-400 dark:text-zinc-600">
          &copy; {year} Spendexa. All rights reserved.
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="flex md:hidden items-center justify-center gap-2 mb-8 animate-[fade-in-scale_400ms_ease-out]">
            <img src="/logo-tile.svg" alt="Spendexa" className="w-8 h-8 rounded-lg" />
            <span className="text-lg font-semibold text-slate-900 dark:text-zinc-100">Spendexa</span>
          </div>

          <div className="relative animate-[fade-in-up_300ms_ease-out]">
            {/* Ambient glow */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[26rem] h-[26rem] rounded-full bg-amber-400/20 dark:bg-amber-500/25 blur-[90px] animate-[glow-pulse_7s_ease-in-out_infinite]" />

            {/* Gradient border wrapper */}
            <div className="relative rounded-2xl p-px bg-gradient-to-b from-amber-400/70 via-amber-500/15 to-transparent dark:from-amber-500/50 dark:via-amber-500/10 dark:to-transparent">
              <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl shadow-amber-900/10 dark:shadow-black/50 p-8">
                <h1 className={`text-xl font-semibold text-slate-900 dark:text-zinc-100 text-center ${subtitle ? 'mb-1' : 'mb-6'}`}>
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-sm text-slate-500 dark:text-zinc-500 text-center mb-6">{subtitle}</p>
                )}
                {children}
              </div>
            </div>
          </div>

          <footer className="mt-8 flex items-center justify-center gap-4 text-xs text-slate-400 dark:text-zinc-600">
            <span>&copy; {year} Spendexa</span>
            <a href="#" className="hover:text-slate-600 dark:hover:text-zinc-400 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-slate-600 dark:hover:text-zinc-400 transition-colors">
              Terms
            </a>
          </footer>
        </div>
      </div>
    </div>
  );
}
