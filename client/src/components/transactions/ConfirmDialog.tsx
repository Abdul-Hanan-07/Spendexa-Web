import { AlertTriangle } from 'lucide-react';

export function ConfirmDialog({
  title,
  description,
  confirmLabel = 'Delete',
  loading,
  error,
  onConfirm,
  onCancel,
}: {
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 mb-4">
          <AlertTriangle size={18} />
        </div>
        <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
        <p className="text-xs text-zinc-500 mt-1.5">{description}</p>
        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mt-3">
            {error}
          </p>
        )}
        <div className="flex items-center justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-medium text-zinc-400 hover:text-zinc-100 px-3.5 py-2 rounded-lg hover:bg-zinc-800/60 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 px-3.5 py-2 rounded-lg transition-colors"
          >
            {loading ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
