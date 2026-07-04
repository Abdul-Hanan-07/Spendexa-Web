import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, TrendingUp, Landmark, Wallet, Target, X, Info } from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/investments', label: 'Investments', icon: TrendingUp },
  { to: '/loans', label: 'Loans', icon: Landmark },
  { to: '/budgets', label: 'Budgets', icon: Wallet },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/about', label: 'About', icon: Info },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={onClose} />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 flex flex-col transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:z-auto ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-200 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2">
            <img src="/logo-tile.svg" alt="Spendexa" className="w-7 h-7 rounded-lg" />
            <span className="font-semibold text-slate-900 dark:text-zinc-100">Spendexa</span>
          </div>
          <button onClick={onClose} className="md:hidden text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200">
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-500'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800/60'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
