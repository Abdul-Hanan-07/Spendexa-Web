import type { Loan, LoanStatus } from '../../lib/api';

export const LOAN_STATUS_LABELS: Record<LoanStatus, string> = {
  ACTIVE: 'Active',
  PAID_OFF: 'Paid off',
};

export const LOAN_STATUS_BADGE_CLASSES: Record<LoanStatus, string> = {
  ACTIVE: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  PAID_OFF: 'bg-emerald-500/10 text-green-700 dark:text-emerald-400',
};

export function computeTotalToRepay(principal: number, interestRate: number): number {
  return principal + (principal * interestRate) / 100;
}

/**
 * remainingAmount is set to principal + interest exactly at creation and only ever
 * decreases via repayments, so a gap between it and the computed total is proof
 * a repayment happened — lets us gate delete without an extra fetch per loan.
 */
export function loanHasRepayments(loan: Loan): boolean {
  const total = computeTotalToRepay(Number(loan.principal), Number(loan.interestRate));
  return Number(loan.remainingAmount) < total - 0.005;
}
