"use client";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";
interface ThemeState {
  theme: Theme;
  mounted: boolean;
}

const ThemeContext = createContext<{ theme: Theme; toggle: () => void; mounted: boolean }>({
  theme: "light",
  toggle: () => {},
  mounted: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Always start at "light" + unmounted so server-rendered HTML and the
  // client's first render match exactly. The real preference is applied
  // in a single effect right after mount, in one setState call.
  const [state, setState] = useState<ThemeState>({ theme: "light", mounted: false });

  useEffect(() => {
    const stored = localStorage.getItem("unsaid-theme") as Theme | null;
    const preferred =
      stored ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: syncs theme from browser APIs on mount only, required to avoid SSR hydration mismatch
    setState({ theme: preferred, mounted: true });
  }, []);

  useEffect(() => {
    if (!state.mounted) return;
    document.documentElement.classList.toggle("dark", state.theme === "dark");
    localStorage.setItem("unsaid-theme", state.theme);
  }, [state.theme, state.mounted]);

  function toggle() {
    setState((s) => ({ ...s, theme: s.theme === "light" ? "dark" : "light" }));
  }

  return (
    <ThemeContext.Provider value={{ theme: state.theme, mounted: state.mounted, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
