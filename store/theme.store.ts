import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeStore {
    isDark: boolean;
    toggleTheme: () => void;
}

export const useThemeStore = create<ThemeStore>()(
    persist(
        (set) => ({
            isDark: false,

            toggleTheme: () =>
                set((state) => ({
                    isDark: !state.isDark,
                })),
        }),
        {
            name: "theme-storage",
        }
    )
);