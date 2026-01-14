/**
 * Theme Context (disabled)
 * The app now runs in a single fixed dark theme.
 * This file remains as a harmless stub to avoid accidental imports breaking.
 */
import { createContext, useContext } from 'react';

const DEFAULT_THEME = { isDark: true, toggleTheme: () => {} };
const ThemeContext = createContext(DEFAULT_THEME);

export const ThemeProvider = ({ children }) => children;

export const useTheme = () => {
  return useContext(ThemeContext) ?? DEFAULT_THEME;
};

export default ThemeContext;
