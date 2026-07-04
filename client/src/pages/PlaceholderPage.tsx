import type { LucideIcon } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';

export function PlaceholderPage({ title, icon: Icon }: { title: string; icon: LucideIcon }) {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center text-center py-24 card">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-700 dark:text-amber-500 mb-4">
            <Icon size={22} />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-zinc-100">{title}</h2>
          <p className="text-sm text-slate-500 dark:text-zinc-500 mt-1">This page is coming soon.</p>
        </div>
      </div>
    </AppLayout>
  );
}
