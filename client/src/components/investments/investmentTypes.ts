import type { InvestmentType } from '../../lib/api';

export const INVESTMENT_TYPES: InvestmentType[] = ['PSX', 'CRYPTO', 'REAL_ESTATE', 'METAL'];

export const INVESTMENT_TYPE_LABELS: Record<InvestmentType, string> = {
  PSX: 'PSX Stocks',
  CRYPTO: 'Crypto',
  REAL_ESTATE: 'Real Estate',
  METAL: 'Metals',
};

export const INVESTMENT_TYPE_BADGE_CLASSES: Record<InvestmentType, string> = {
  PSX: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  CRYPTO: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  REAL_ESTATE: 'bg-sky-500/10 text-sky-700 dark:text-sky-400',
  METAL: 'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400',
};
