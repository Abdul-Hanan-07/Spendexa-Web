import { useState, useRef, useEffect } from 'react';
import { Menu, LogOut, Settings, User as UserIcon, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { formatFullDate } from '../../lib/format';
import { ThemeToggle } from '../common/ThemeToggle';

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const firstName = user?.name?.split(' ')[0] || 'User';
  const initials = user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      <div className="flex items-center gap-4 shrink-0">
        <ThemeToggle />
        
        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {initials}
            </div>
            <ChevronDown size={16} className="text-slate-500 dark:text-zinc-400 hidden sm:block" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800">
                <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 dark:text-zinc-500 truncate">{user?.email}</p>
              </div>
              <div className="p-2">
                <button
                  onClick={() => setDropdownOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors"
                >
                  <UserIcon size={16} className="text-slate-400 dark:text-zinc-500" />
                  My Profile
                </button>
                <button
                  onClick={() => setDropdownOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors"
                >
                  <Settings size={16} className="text-slate-400 dark:text-zinc-500" />
                  Settings
                </button>
                <div className="h-px bg-slate-100 dark:bg-zinc-800 my-1 mx-2" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <LogOut size={16} className="text-red-500 dark:text-red-400" />
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
