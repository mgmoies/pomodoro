import { useEffect } from 'react';
import useLocalStorage from './useLocalStorage';

export const THEMES = [
  {
    id: 'dark-newspaper',
    name: 'Dark Newspaper',
    dark: true,
    swatches: ['#161310', '#1E1A16', '#D7CBB5', '#A63B2E'],
  },
  {
    id: 'sepia-press',
    name: 'Sepia Press',
    dark: false,
    swatches: ['#E6DBC4', '#F0E7D2', '#1C1917', '#9C2A1E'],
  },
  {
    id: 'midnight-ink',
    name: 'Midnight Ink',
    dark: true,
    swatches: ['#0D1117', '#161B22', '#C9D1D9', '#58A6FF'],
  },
  {
    id: 'forest-type',
    name: 'Forest Type',
    dark: true,
    swatches: ['#0F1A0F', '#172117', '#C8D5B9', '#6AB04C'],
  },
  {
    id: 'rose-parchment',
    name: 'Rose & Parchment',
    dark: false,
    swatches: ['#FDF0F0', '#FFF5F5', '#2D1B1B', '#C0392B'],
  },
  {
    id: 'carbon',
    name: 'Carbon',
    dark: true,
    swatches: ['#0A0A0A', '#141414', '#F5F5F5', '#E5E5E5'],
  },
  {
    id: 'lavender-fields',
    name: 'Lavender Fields',
    dark: false,
    swatches: ['#F3F0FF', '#FAF8FF', '#1E1433', '#8B5AD3'],
  },
  {
    id: 'amber-terminal',
    name: 'Amber Terminal',
    dark: true,
    swatches: ['#0D0900', '#181100', '#FFB300', '#FF6D00'],
  },
  {
    id: 'ocean-depths',
    name: 'Ocean Depths',
    dark: true,
    swatches: ['#071E26', '#0D2B36', '#B2EBF2', '#00BCD4'],
  },
  {
    id: 'crimson-press',
    name: 'Crimson Press',
    dark: true,
    swatches: ['#150506', '#1F080A', '#F5C6C9', '#E53935'],
  },
];

export default function useTheme() {
  const [theme, setTheme] = useLocalStorage('pomodoro_theme', 'dark-newspaper');

  useEffect(() => {
    const root = window.document.documentElement;
    const themeData = THEMES.find(t => t.id === theme) || THEMES[0];

    root.setAttribute('data-theme', themeData.id);

    if (themeData.dark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return { theme, setTheme };
}
