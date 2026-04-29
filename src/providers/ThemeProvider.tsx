"use client";

import { useEffect } from "react";

type Theme = "dark" | "light";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const saved = localStorage.getItem("theme");
        const savedTheme: Theme | null = saved === "dark" || saved === "light" ? saved : null;

        const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const theme = savedTheme ?? (systemDark ? "dark" : "light");

        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(theme);
    }, []);

    return <>{children}</>;
}
