import { useState } from 'react';
import type { FormEvent } from 'react';
import { X } from 'lucide-react';
import { api } from '../../lib/api';
import type { Goal } from '../../lib/api';

const fieldClass =
  'w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50';

export function AddGoalPanel({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (goal: Goal) => void;
}) {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [deadline, setDeadline] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Goal name is required.');
      return;
    }

    const parsedTarget = Number(targetAmount);
    if (!targetAmount || Number.isNaN(parsedTarget) || parsedTarget <= 0) {
      setError('Enter a valid target amount greater than 0.');
      return;
    }

    const parsedCurrent = Number(currentAmount);
    if (Number.isNaN(parsedCurrent) || parsedCurrent < 0) {
      setError('Current amount must be 0 or more.');
      return;
    }

    if (!deadline) {
      setError('Pick a deadline date.');
      return;
    }

    if (new Date(deadline) <= new Date()) {
      setError('Deadline must be in the future.');
      return;
    }

    setSubmitting(true);
    try {
      const { goal } = await api.createGoal({
        name: name.trim(),
        targetAmount: parsedTarget,
        currentAmount: parsedCurrent,
        deadline: new Date(`${deadline}T00:00:00`).toISOString(),
      });
      onCreated(goal);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create goal');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative h-full w-full max-w-md bg-zinc-900 border-l border-zinc-800 flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 shrink-0">
          <h2 className="text-sm font-semibold text-zinc-100">Add goal</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-100 p-1.5 rounded-lg hover:bg-zinc-800/60 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            <div>
              <label htmlFor="name" className="text-xs font-medium text-zinc-400 mb-2 block">
                Goal name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Emergency fund"
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="targetAmount" className="text-xs font-medium text-zinc-400 mb-2 block">
                Target amount
              </label>
              <input
                id="targetAmount"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="0.00"
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="currentAmount" className="text-xs font-medium text-zinc-400 mb-2 block">
                Current amount (optional)
              </label>
              <input
                id="currentAmount"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                placeholder="0.00"
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="deadline" className="text-xs font-medium text-zinc-400 mb-2 block">
                Deadline
              </label>
              <input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className={`${fieldClass} [color-scheme:dark]`}
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 px-6 py-5 border-t border-zinc-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 text-sm font-medium text-zinc-400 hover:text-zinc-100 py-2.5 rounded-lg hover:bg-zinc-800/60 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-400 disabled:opacity-60 py-2.5 rounded-lg transition-colors"
            >
              {submitting ? 'Creating…' : 'Add goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
