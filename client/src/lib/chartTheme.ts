import type { Theme } from '../context/ThemeContext';

export function getChartChrome(theme: Theme) {
  return theme === 'dark'
    ? {
        grid: '#27272a',
        axis: '#71717a',
        tooltipBg: '#18181b',
        tooltipBorder: '#3f3f46',
        tooltipLabel: '#e4e4e7',
        cursorFill: 'rgba(255,255,255,0.03)',
      }
    : {
        grid: '#e2e8f0',
        axis: '#64748b',
        tooltipBg: '#ffffff',
        tooltipBorder: '#e2e8f0',
        tooltipLabel: '#0f172a',
        cursorFill: 'rgba(15,23,42,0.03)',
      };
}

export function getAccentLine(theme: Theme) {
  return theme === 'dark' ? '#F59E0B' : '#D97706';
}

// Amber-600 (#D97706) is used for the line/fill itself, which only needs to
// clear the 3:1 non-text UI-component bar. Tooltip item text sits on a solid
// white background and needs real 4.5:1 text contrast, so it uses amber-700.
export function getAccentText(theme: Theme) {
  return theme === 'dark' ? '#FBBF24' : '#B45309';
}

export function getCategoricalColors(theme: Theme) {
  return theme === 'dark'
    ? ['#F59E0B', '#14B8A6', '#6366F1', '#F43F5E', '#A855F7', '#84CC16']
    : ['#D97706', '#0D9488', '#4F46E5', '#E11D48', '#9333EA', '#65A30D'];
}
