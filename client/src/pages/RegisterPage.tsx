import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthCard } from '../components/AuthCard';

const inputClass =
  'w-full rounded-lg border border-slate-300 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800/50 px-3 py-2 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 outline-none focus:border-amber-500 dark:focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15 dark:focus:ring-amber-500/20 transition-all duration-200';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currency, setCurrency] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register({ name, email, password, currency: currency.trim() || undefined });
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard title="Create your account" subtitle="Start tracking your finances in minutes">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5">Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </div>
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
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5">Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5">
            Currency <span className="text-slate-500 dark:text-zinc-500 font-normal">(optional, default PKR)</span>
          </label>
          <input
            type="text"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            placeholder="PKR"
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
          {submitting ? <Loader2 size={18} className="animate-spin" /> : 'Sign up'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500 dark:text-zinc-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-amber-700 dark:text-amber-500 hover:text-amber-800 dark:hover:text-amber-400">
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}
