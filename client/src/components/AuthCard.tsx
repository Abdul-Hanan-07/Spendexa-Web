import type { ReactNode } from 'react';

export function AuthCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-amber-600 dark:bg-amber-500 flex items-center justify-center text-white font-bold text-sm">
            S
          </div>
          <span className="text-lg font-semibold text-slate-900 dark:text-zinc-100">Spendexa</span>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl shadow-black/20 border border-slate-200 dark:border-zinc-800 p-8">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-zinc-100 mb-6 text-center">{title}</h1>
          {children}
        </div>
      </div>
    </div>
  );
}
