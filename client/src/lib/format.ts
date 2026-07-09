export function formatCurrency(value: string | number, currency = 'PKR'): string {
  const num = typeof value === 'string' ? Number(value) : value;
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(num);
  } catch {
    return `${currency} ${num.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  }
}

export function formatCompactNumber(value: string | number): string {
  const num = typeof value === 'string' ? Number(value) : value;
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(num);
}

export function formatDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatShortDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatFullDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatRelativeTime(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return formatDate(date);
}
