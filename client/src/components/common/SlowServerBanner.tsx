import { useSyncExternalStore } from 'react';
import { Loader2 } from 'lucide-react';
import { getIsServerSlow, subscribeSlowRequest } from '../../lib/slowRequestTracker';

export function SlowServerBanner() {
  const isSlow = useSyncExternalStore(subscribeSlowRequest, getIsServerSlow);

  if (!isSlow) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-50 flex justify-center px-4 pt-3 pointer-events-none animate-[fade-in-up_200ms_ease-out]">
      <div className="pointer-events-auto flex items-center gap-2.5 bg-amber-50 dark:bg-zinc-900 border border-amber-300 dark:border-amber-500/40 text-amber-900 dark:text-amber-200 text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg shadow-amber-900/10 dark:shadow-black/40">
        <Loader2 size={16} className="animate-spin shrink-0 text-amber-600 dark:text-amber-500" />
        Waking up the server — this may take up to a minute.
      </div>
    </div>
  );
}
