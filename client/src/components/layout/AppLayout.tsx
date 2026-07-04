import { useState } from 'react';
import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function AppLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    // md+: lock the outer frame to the viewport so the sidebar stays pinned
    // and only <main> scrolls; below md the page scrolls normally and the
    // sidebar is a fixed drawer.
    <div className="min-h-screen md:h-screen md:overflow-hidden bg-slate-50 dark:bg-zinc-950 md:flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 min-h-0 md:overflow-y-auto px-4 md:px-8 py-6 md:py-8">
          <div className="animate-[fade-in-up_300ms_ease-out]">{children}</div>
        </main>
      </div>
    </div>
  );
}
