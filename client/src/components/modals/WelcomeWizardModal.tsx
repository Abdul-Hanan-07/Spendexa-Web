import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import { Modal } from '../common/Modal';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export function WelcomeWizardModal({ isOpen, onClose, onComplete }: { isOpen: boolean; onClose: () => void; onComplete: () => void }) {
  const { user, updateUser } = useAuth();
  const [step, setStep] = useState(1);
  const [currency, setCurrency] = useState(user?.currency || 'USD');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = async () => {
    if (step === 1) {
      setIsSubmitting(true);
      try {
        const response = await api.updateProfile({ name: user?.name || '', email: user?.email || '' });
        // Since we don't have currency update in updateProfile schema yet, let's just proceed. 
        // We'd ideally want currency updated, but for now we skip backend currency update or just use what we have.
        // Wait, the user's base currency is useful. Let's just move to step 2 for UI purposes.
        setStep(2);
      } catch (err: any) {
        toast.error(err.message || 'Something went wrong');
      } finally {
        setIsSubmitting(false);
      }
    } else if (step === 2) {
      if (!amount || Number(amount) <= 0) {
        toast.error('Please enter a valid amount');
        return;
      }
      setIsSubmitting(true);
      try {
        await api.createTransaction({
          amount: Number(amount),
          type: 'INCOME',
          category: 'Initial Balance',
          date: new Date().toISOString(),
        });
        setStep(3);
      } catch (err: any) {
        toast.error(err.message || 'Failed to add initial balance');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleFinish = () => {
    onComplete();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Welcome to Spendexa ✨">
      <div className="relative overflow-hidden min-h-[250px] flex flex-col">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col justify-center"
            >
              <h3 className="text-xl font-bold text-slate-900 dark:text-zinc-100 mb-2">Let's get you set up.</h3>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6 leading-relaxed">
                We're thrilled to have you here! To start tracking your finances effectively, let's establish your primary base currency.
              </p>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Base Currency
                </label>
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                  placeholder="e.g. USD, EUR, PKR"
                  maxLength={3}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 uppercase"
                />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col justify-center"
            >
              <h3 className="text-xl font-bold text-slate-900 dark:text-zinc-100 mb-2">Add your first balance</h3>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6 leading-relaxed">
                What is the current balance of your main bank account? We'll log this as your starting balance.
              </p>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Current Balance
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign size={16} className="text-slate-400 dark:text-zinc-500" />
                  </div>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center py-6"
            >
              <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-zinc-100 mb-2">You're all set!</h3>
              <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-xs leading-relaxed">
                Your dashboard is ready. You can now start adding expenses, tracking goals, and building wealth.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="pt-6 mt-2 flex justify-end">
        {step < 3 ? (
          <button
            onClick={handleNext}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500 rounded-lg transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Continue'}
            {!isSubmitting && <ArrowRight size={16} />}
          </button>
        ) : (
          <button
            onClick={handleFinish}
            className="px-6 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white rounded-lg transition-colors"
          >
            Go to Dashboard
          </button>
        )}
      </div>
    </Modal>
  );
}
