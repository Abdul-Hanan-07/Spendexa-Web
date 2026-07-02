import { Menu, LogOut, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { formatFullDate } from '../../lib/format';

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const firstName = user?.name?.split(' ')[0];

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 px-4 md:px-8 h-16 border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur">
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={onMenuClick} className="md:hidden text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 shrink-0">
          <Menu size={22} />
        </button>
        <div className="min-w-0">
          <h1 className="text-base md:text-lg font-semibold text-slate-900 dark:text-zinc-100 truncate">
            Welcome back{firstName ? `, ${firstName}` : ''}
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-500 hidden sm:block">{formatFullDate(new Date())}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 w-9 h-9 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800/60 transition-colors"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800/60 transition-colors"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Log out</span>
        </button>
      </div>
    </header>
  );
}
