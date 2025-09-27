import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6366f1',
    secondary: '#8b5cf6',
    tertiary: '#06b6d4',
    surface: '#ffffff',
    background: '#f8fafc',
    error: '#ef4444',
    onPrimary: '#ffffff',
    onSecondary: '#ffffff',
    onSurface: '#1f2937',
    onBackground: '#1f2937',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#818cf8',
    secondary: '#a78bfa',
    tertiary: '#22d3ee',
    surface: '#1f2937',
    background: '#111827',
    error: '#f87171',
    onPrimary: '#000000',
    onSecondary: '#000000',
    onSurface: '#f9fafb',
    onBackground: '#f9fafb',
  },
};

export const theme = lightTheme;
