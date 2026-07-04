import { AppLayout } from '../components/layout/AppLayout';
import { Info, Shield, Target, TrendingUp, Wallet, LayoutDashboard } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export function AboutPage() {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100">About Spendexa</h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2">
            Your personal command center for total financial clarity.
          </p>
        </div>

        <div className="card p-6 space-y-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Info className="text-amber-500" size={20} />
            Why do you need this?
          </h2>
          <p className="text-sm text-slate-700 dark:text-zinc-300 leading-relaxed">
            Managing money can be overwhelming when it's scattered across multiple bank accounts, spreadsheets, and mental notes. Spendexa brings everything into one unified dashboard. By tracking every transaction, investment, and loan, you stop guessing where your money went and start directing where it goes next.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FeatureCard 
            icon={LayoutDashboard}
            title="Complete Visibility"
            desc="See your net worth, current balance, and spending trends at a single glance. No more logging into five different banking apps."
          />
          <FeatureCard 
            icon={Target}
            title="Goal Tracking"
            desc="Set ambitious financial targets. Whether it's a new car, a vacation, or an emergency fund, track your progress visually."
          />
          <FeatureCard 
            icon={Wallet}
            title="Strict Budgeting"
            desc="Assign your money a job. Create limits for different categories and get warned before you overspend."
          />
          <FeatureCard 
            icon={TrendingUp}
            title="Investment Portfolio"
            desc="Track your stocks, crypto, real estate, and metals. Watch your money grow and understand your asset allocation."
          />
        </div>

        <div className="card p-6 border-l-4 border-l-amber-500 mt-8">
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2 mb-2">
            <Shield className="text-amber-500" size={18} />
            Privacy & Security
          </h2>
          <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
            Your financial data is sensitive. Spendexa uses industry-standard encryption, secure HTTP-only cookies for authentication, and strict database isolation to ensure that your numbers stay strictly yours.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: LucideIcon, title: string, desc: string }) {
  return (
    <div className="card p-5 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-500 mb-4">
        <Icon size={20} />
      </div>
      <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">{desc}</p>
    </div>
  );
}
