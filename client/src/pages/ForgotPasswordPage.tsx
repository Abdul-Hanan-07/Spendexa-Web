import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, MailCheck } from 'lucide-react';
import { api } from '../lib/api';
import { AuthCard } from '../components/AuthCard';

const inputClass =
  'w-full rounded-lg border border-slate-300 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800/50 px-3 py-2 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 outline-none shadow-inner shadow-slate-900/5 dark:shadow-black/30 focus:border-amber-500 dark:focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 dark:focus:ring-amber-500/25 focus:shadow-[0_0_16px_-2px_rgba(245,158,11,0.45)] transition-all duration-200';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await api.forgotPassword({ email });
      setMessage(res.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  if (message) {
    return (
      <AuthCard title="Check your email">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-500">
            <MailCheck size={22} />
          </div>
          <p className="text-sm text-slate-600 dark:text-zinc-400">{message}</p>
          <Link
            to="/login"
            className="text-sm font-medium text-amber-700 dark:text-amber-500 hover:text-amber-800 dark:hover:text-amber-400"
          >
            Back to login
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Forgot your password?" subtitle="Enter your email and we'll send you a reset link">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          {submitting ? <Loader2 size={18} className="animate-spin" /> : 'Send reset link'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500 dark:text-zinc-500">
        Remembered it?{' '}
        <Link to="/login" className="font-medium text-amber-700 dark:text-amber-500 hover:text-amber-800 dark:hover:text-amber-400">
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}
