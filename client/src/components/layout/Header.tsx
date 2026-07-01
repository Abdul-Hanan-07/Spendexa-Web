import { Menu, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { formatFullDate } from '../../lib/format';

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const firstName = user?.name?.split(' ')[0];

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 px-4 md:px-8 h-16 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={onMenuClick} className="md:hidden text-zinc-400 hover:text-zinc-200 shrink-0">
          <Menu size={22} />
        </button>
        <div className="min-w-0">
          <h1 className="text-base md:text-lg font-semibold text-zinc-100 truncate">
            Welcome back{firstName ? `, ${firstName}` : ''}
          </h1>
          <p className="text-xs text-zinc-500 hidden sm:block">{formatFullDate(new Date())}</p>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-zinc-100 px-3 py-2 rounded-lg hover:bg-zinc-800/60 transition-colors shrink-0"
      >
        <LogOut size={16} />
        <span className="hidden sm:inline">Log out</span>
      </button>
    </header>
  );
}
