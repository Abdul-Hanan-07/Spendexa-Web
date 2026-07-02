export const BUDGET_PROGRESS_COLORS = {
  safe: 'bg-green-600 dark:bg-emerald-500',
  warning: 'bg-yellow-600 dark:bg-yellow-500',
  danger: 'bg-red-600 dark:bg-red-500',
} as const;

export function getBudgetProgressColor(isNearLimit: boolean): string {
  return isNearLimit ? BUDGET_PROGRESS_COLORS.warning : BUDGET_PROGRESS_COLORS.safe;
}
