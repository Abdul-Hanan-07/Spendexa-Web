import { useAuth } from '../../context/AuthContext';
import { useDashboardData } from '../../hooks/useDashboardData';
import { formatCurrency, formatFullDate } from '../../lib/format';
import { Modal } from '../common/Modal';

export function ProfileModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const { data } = useDashboardData();

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const netWorth = data ? Number(data.summary.netWorth) : 0;
  const currency = user.currency ?? 'PKR';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="My Profile">
      <div className="flex flex-col items-center mb-8 relative">
        <div className="absolute inset-0 top-4 h-24 w-24 mx-auto bg-amber-500/30 blur-2xl rounded-full" />
        <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-white font-bold text-4xl shadow-[0_0_0_4px_rgba(245,158,11,0.2)] mb-4 ring-1 ring-white/20">
          {initials}
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-zinc-100">{user.name}</h3>
        <p className="text-sm text-slate-500 dark:text-zinc-400">{user.email}</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl">
          <div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mb-1">Total Net Worth</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-zinc-100">
              {formatCurrency(netWorth, currency)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 dark:text-zinc-400 mb-1">Base Currency</p>
            <p className="text-sm font-medium text-slate-700 dark:text-zinc-300">{currency}</p>
          </div>
        </div>

        <div className="flex justify-between items-center px-2 py-1">
          <span className="text-xs text-slate-500 dark:text-zinc-500">Member since</span>
          <span className="text-xs font-medium text-slate-700 dark:text-zinc-300">
            {formatFullDate(new Date(user.createdAt))}
          </span>
        </div>
      </div>
    </Modal>
  );
}
