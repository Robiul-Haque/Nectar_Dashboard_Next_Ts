"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

export function useTheme() {
    const [theme, setTheme] = useState<Theme>("dark");

    useEffect(() => {
        const saved = localStorage.getItem("theme") as Theme | null;

        if (saved) {
            applyTheme(saved);
            setTheme(saved);
        } else {
            const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            const systemTheme = systemDark ? "dark" : "light";

            applyTheme(systemTheme);
            setTheme(systemTheme);
        }
    }, []);

    const applyTheme = (theme: Theme) => {
        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(theme);
    };

    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark";

        applyTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        setTheme(newTheme);
    };

    return { theme, toggleTheme };
}