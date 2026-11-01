/**
 * Theme Entrypoint & useTheme Hook
 */

import React, { createContext, useContext, useState, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { darkThemeColors, lightThemeColors } from './colors';
import { fontFamilies, fontSizes, lineHeights } from './typography';
import { spacing, borderRadius, hitSlop } from './spacing';

export type ThemeMode = 'dark' | 'light' | 'system';

export interface Theme {
  isDark: boolean;
  colors: typeof darkThemeColors;
  typography: {
    families: typeof fontFamilies;
    sizes: typeof fontSizes;
    lineHeights: typeof lineHeights;
  };
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  hitSlop: typeof hitSlop;
}

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark'); // Default to dark for programming context

  const isDark = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark';
    }
    return themeMode === 'dark';
  }, [themeMode, systemColorScheme]);

  const theme: Theme = useMemo(() => ({
    isDark,
    colors: isDark ? darkThemeColors : lightThemeColors,
    typography: {
      families: fontFamilies,
      sizes: fontSizes,
      lineHeights: lineHeights,
    },
    spacing,
    borderRadius,
    hitSlop,
  }), [isDark]);

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    // Graceful fallback if used outside provider
    const isDark = true;
    return {
      theme: {
        isDark,
        colors: darkThemeColors,
        typography: {
          families: fontFamilies,
          sizes: fontSizes,
          lineHeights: lineHeights,
        },
        spacing,
        borderRadius,
        hitSlop,
      },
      themeMode: 'dark',
      setThemeMode: () => {},
    };
  }
  return context;
}
