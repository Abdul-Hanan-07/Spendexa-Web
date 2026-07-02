export function getTimeRemaining(deadline: string): { days: number; expired: boolean } {
  const now = new Date();
  const end = new Date(deadline);
  const diff = end.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return { days, expired: days < 0 };
}

export function formatTimeRemaining(deadline: string): string {
  const { days, expired } = getTimeRemaining(deadline);
  if (expired) return 'Deadline passed';
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  return `${days} days remaining`;
}
