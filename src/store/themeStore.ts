import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "dark" | "light";

interface ThemeState {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "dark",
      toggle: () =>
        set((s) => {
          const next = s.theme === "dark" ? "light" : "dark";
          applyThemeToDOM(next);
          return { theme: next };
        }),
      setTheme: (t) => {
        applyThemeToDOM(t);
        set({ theme: t });
      },
    }),
    {
      name: "lumina-theme",
      onRehydrateStorage: () => (state) => {
        if (state?.theme) applyThemeToDOM(state.theme);
      },
    }
  )
);

function applyThemeToDOM(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}
