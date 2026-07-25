import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "../store/theme.store";

export default function ThemeButton() {
    const { isDark, toggleTheme } = useThemeStore();

    return (
        <button
            onClick={toggleTheme}
            dir="ltr"
            aria-label="Toggle theme"
            className={`relative flex h-8 w-16 items-center rounded-full p-1 transition-colors duration-300 ${isDark ? "bg-slate-800" : "bg-yellow-400"
                }`}
        >
            <div
                className={`absolute top-1 left-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md transition-transform duration-300 ${isDark ? "translate-x-8" : "translate-x-0"
                    }`}
            >
                {isDark ? (
                    <Moon size={16} className="text-slate-700" />
                ) : (
                    <Sun size={16} className="text-yellow-500" />
                )}
            </div>
        </button>
    );
}