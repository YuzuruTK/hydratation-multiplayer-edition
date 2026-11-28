import { createContext, useCallback, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { isThemeName, THEME_CONFIG, type ThemeName } from './themeConfig';

export type { ThemeName } from './themeConfig';

interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  config: (typeof THEME_CONFIG)[ThemeName];
}

const STORAGE_KEY = 'hydration-theme-v1';
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function readInitialTheme(): ThemeName {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const theme: ThemeName = isThemeName(stored) ? stored : 'ocean';
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
  const config = THEME_CONFIG[theme];

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = config.colorScheme;

    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // A preferência continua ativa durante a sessão mesmo sem armazenamento local.
    }

    const background = window.getComputedStyle(root).getPropertyValue('--color-background').trim();
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', background);
  }, [theme, config]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, config }}>
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
