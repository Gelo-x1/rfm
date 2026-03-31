/**
 * Theme Context Hook
 * 
 * Provides dark/light theme functionality with:
 * - System preference detection
 * - Local storage persistence
 * - Smooth transitions
 * - Accessibility support
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Theme, ThemeContextType } from '@/types';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'rfm-nexus-theme';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({ children, defaultTheme = 'dark' }: ThemeProviderProps) {
  // Initialize theme from localStorage or system preference
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return defaultTheme;
    
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored && (stored === 'dark' || stored === 'light')) {
      return stored;
    }
    
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    
    return defaultTheme;
  });

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    
    // Store preference
    localStorage.setItem(STORAGE_KEY, theme);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        theme === 'dark' ? '#0A0F1F' : '#F9FAFB'
      );
    }
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't manually set a preference
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

/**
 * Hook to get current theme colors for charts/visualizations
 */
export function useThemeColors() {
  const { theme } = useTheme();
  
  return {
    isDark: theme === 'dark',
    colors: {
      bg: theme === 'dark' ? '#0F172A' : '#FFFFFF',
      text: theme === 'dark' ? '#E2E8F0' : '#0F172A',
      grid: theme === 'dark' ? '#1E293B' : '#E2E8F0',
      accent: theme === 'dark' ? '#00D9FF' : '#2563EB',
      accentGreen: theme === 'dark' ? '#00FF88' : '#10B981',
      accentRed: theme === 'dark' ? '#FF4757' : '#EF4444',
      accentAmber: theme === 'dark' ? '#FFD93D' : '#F59E0B',
      accentPurple: theme === 'dark' ? '#A855F7' : '#8B5CF6',
    },
    chartColors: theme === 'dark' 
      ? ['#00D9FF', '#00FF88', '#FF6B6B', '#FFD93D', '#A855F7', '#F472B6']
      : ['#2563EB', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899'],
  };
}

/**
 * Hook for theme-aware class names
 */
export function useThemeClass() {
  const { theme } = useTheme();
  
  return {
    themeClass: theme === 'dark' ? 'dark' : 'light',
    isDark: theme === 'dark',
    getClass: (darkClass: string, lightClass: string) => 
      theme === 'dark' ? darkClass : lightClass,
  };
}
