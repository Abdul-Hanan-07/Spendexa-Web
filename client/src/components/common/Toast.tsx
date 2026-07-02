import { AlertCircle, CheckCircle2 } from 'lucide-react';

export function Toast({
  message,
  variant = 'success',
}: {
  message: string;
  variant?: 'success' | 'error';
}) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm font-medium px-4 py-3 rounded-xl shadow-lg shadow-black/40">
      {variant === 'success' ? (
        <CheckCircle2 size={16} className="text-green-700 dark:text-emerald-400 shrink-0" />
      ) : (
        <AlertCircle size={16} className="text-red-600 dark:text-red-400 shrink-0" />
      )}
      {message}
    </div>
  );
}
