import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { AuthCard } from '../components/AuthCard';

const inputClass =
  'w-full rounded-lg border border-slate-300 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800/50 px-3 py-2 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 outline-none shadow-inner shadow-slate-900/5 dark:shadow-black/30 focus:border-amber-500 dark:focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 dark:focus:ring-amber-500/25 focus:shadow-[0_0_16px_-2px_rgba(245,158,11,0.45)] transition-all duration-200';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    if (!token) {
      setError('This reset link is invalid or has expired. Please request a new one.');
      return;
    }

    setSubmitting(true);
    try {
      await api.resetPassword({ token, newPassword });
      setDone(true);
      toast.success('Password updated. Please log in.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <AuthCard title="Invalid reset link">
        <div className="flex flex-col items-center text-center gap-4">
          <p className="text-sm text-slate-600 dark:text-zinc-400">
            This password reset link is missing or malformed. Request a new one to continue.
          </p>
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-amber-700 dark:text-amber-500 hover:text-amber-800 dark:hover:text-amber-400"
          >
            Request a new reset link
          </Link>
        </div>
      </AuthCard>
    );
  }

  if (done) {
    return (
      <AuthCard title="Password updated">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-500">
            <CheckCircle2 size={22} />
          </div>
          <p className="text-sm text-slate-600 dark:text-zinc-400">
            Your password has been updated. Taking you to the login page...
          </p>
        </div>
      </AuthCard>
    );
  }

  const isExpiredOrInvalid = error?.toLowerCase().includes('invalid or has expired');

  return (
    <AuthCard title="Set a new password" subtitle="Choose a new password for your account">
      {isExpiredOrInvalid ? (
        <div className="flex flex-col items-center text-center gap-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-amber-700 dark:text-amber-500 hover:text-amber-800 dark:hover:text-amber-400"
          >
            Request a new reset link
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5">New password</label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5">Confirm new password</label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 animate-[error-in_200ms_ease-out]">{error}</p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-amber-600 dark:bg-amber-500 px-3 py-2.5 text-sm font-semibold text-white shadow-sm shadow-amber-600/20 hover:bg-amber-700 dark:hover:bg-amber-400 hover:shadow-md hover:shadow-amber-600/30 active:scale-[0.98] disabled:opacity-60 disabled:hover:shadow-sm disabled:active:scale-100 transition-all duration-150 flex items-center justify-center"
          >
            {submitting ? <Loader2 size={18} className="animate-spin" /> : 'Reset password'}
          </button>
        </form>
      )}
    </AuthCard>
  );
}
