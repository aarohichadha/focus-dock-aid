import { useState, useEffect, useCallback } from 'react';
import { Theme } from '@/types';
import { storage } from '@/utils/storage';

export const useTheme = () => {
  const [theme, setThemeState] = useState<Theme>(() => storage.getTheme());

  useEffect(() => {
    // Apply theme class to document
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    storage.setTheme(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [theme, setTheme]);

  return { theme, setTheme, toggleTheme };
};
