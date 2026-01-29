"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { type Theme, getThemeById, themes } from "./themes";

interface ThemeContextValue {
  theme: Theme;
  themeId: string;
  setThemeId: (id: string) => void;
  themes: Theme[];
  hasChosenTheme: boolean;
  markThemeChosen: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "english-buddy-theme";
const CHOSEN_KEY = "english-buddy-theme-chosen";

function applyThemeToDOM(theme: Theme) {
  const root = document.documentElement;
  const c = theme.colors;
  root.style.setProperty("--color-primary", c.primary);
  root.style.setProperty("--color-primary-light", c.primaryLight);
  root.style.setProperty("--color-secondary", c.secondary);
  root.style.setProperty("--color-accent", c.accent);
  root.style.setProperty("--color-warning", c.warning);
  root.style.setProperty("--color-success", c.success);
  root.style.setProperty("--theme-bg", c.bg);
  root.style.setProperty("--theme-card-bg", c.cardBg);
  root.style.setProperty("--theme-text-primary", c.textPrimary);
  root.style.setProperty("--theme-text-secondary", c.textSecondary);
  root.style.setProperty("--theme-text-muted", c.textMuted);
  root.style.setProperty("--theme-border", c.border);
  root.style.setProperty("--theme-sidebar-bg", c.sidebarBg);
  root.style.setProperty("--theme-sidebar-border", c.sidebarBorder);
  root.style.setProperty("--theme-input-bg", c.inputBg);
  root.style.setProperty("--theme-input-border", c.inputBorder);

  document.body.style.backgroundColor = c.bg;
  document.body.style.color = c.textPrimary;

  if (theme.font) {
    document.body.style.fontFamily = theme.font;
  } else {
    document.body.style.fontFamily = "'Inter', system-ui, -apple-system, sans-serif";
  }

  if (theme.isDark) {
    document.documentElement.classList.add("dark-theme");
  } else {
    document.documentElement.classList.remove("dark-theme");
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState("default");
  const [hasChosenTheme, setHasChosenTheme] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const chosen = localStorage.getItem(CHOSEN_KEY);
    if (saved) setThemeIdState(saved);
    setHasChosenTheme(chosen === "true");
    setMounted(true);
  }, []);

  const theme = getThemeById(themeId);

  useEffect(() => {
    if (mounted) applyThemeToDOM(theme);
  }, [theme, mounted]);

  const setThemeId = useCallback((id: string) => {
    setThemeIdState(id);
    localStorage.setItem(STORAGE_KEY, id);
  }, []);

  const markThemeChosen = useCallback(() => {
    setHasChosenTheme(true);
    localStorage.setItem(CHOSEN_KEY, "true");
  }, []);

  if (!mounted) return null;

  return (
    <ThemeContext.Provider value={{ theme, themeId, setThemeId, themes, hasChosenTheme, markThemeChosen }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
