import { createContext, useCallback, useContext, useEffect, useState, type PropsWithChildren } from 'react';

export type ThemeName = 'ocean' | 'midnight';

interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

const STORAGE_KEY = 'hydration-theme-v1';
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function readInitialTheme(): ThemeName {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const theme: ThemeName = stored === 'midnight' ? 'midnight' : 'ocean';
    document.documentElement.dataset.theme = theme;
    return theme;
  } catch {
    return 'ocean';
  }
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setThemeState] = useState<ThemeName>(readInitialTheme);
  const setTheme = useCallback((nextTheme: ThemeName) => {
    setThemeState(nextTheme);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = theme === 'midnight' ? 'dark' : 'light';

    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // A preferência continua ativa durante a sessão mesmo sem armazenamento local.
    }

    const background = window.getComputedStyle(root).getPropertyValue('--color-background').trim();
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', background);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider.');
  }
  return context;
}
