"use client";

import { useSyncExternalStore } from "react";

type Theme = "dark" | "light";

const THEME_CHANGE_EVENT = "theme_change";

function applyTheme(theme: Theme) {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
}

function getStoredTheme(): Theme | null {
    const saved = localStorage.getItem("theme");
    return saved === "dark" || saved === "light" ? saved : null;
}

function getThemeSnapshot(): Theme {
    if (typeof window === "undefined") {
        return "dark";
    }

    return getStoredTheme() ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
}

function subscribeTheme(onStoreChange: () => void) {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
        const theme = getThemeSnapshot();
        applyTheme(theme);
        onStoreChange();
    };

    window.addEventListener("storage", handleChange);
    window.addEventListener(THEME_CHANGE_EVENT, handleChange);
    mediaQuery.addEventListener("change", handleChange);

    return () => {
        window.removeEventListener("storage", handleChange);
        window.removeEventListener(THEME_CHANGE_EVENT, handleChange);
        mediaQuery.removeEventListener("change", handleChange);
    };
}

export function useTheme() {
    const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, () => "dark");

    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark";

        applyTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
    };

    return { theme, toggleTheme };
}
