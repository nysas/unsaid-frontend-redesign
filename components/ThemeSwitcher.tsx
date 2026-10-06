"use client";
import { useTheme } from "@/components/ThemeProvider";

export default function ThemeSwitcher() {
  const { theme, toggle, mounted } = useTheme();
  const isDark = mounted && theme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      suppressHydrationWarning
      className="relative flex h-7 w-14 items-center rounded-full border border-border-strong bg-surface-sunken px-1 transition-colors duration-300"
    >
      <span
        suppressHydrationWarning
        className={`flex h-5 w-5 items-center justify-center rounded-full bg-forest text-[10px] text-cta-text transition-transform duration-300 ease-out ${
          isDark ? "translate-x-7" : "translate-x-0"
        }`}
      >
        {isDark ? "\u263E" : "\u2600"}
      </span>
    </button>
  );
}
