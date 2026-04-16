"use client";

import { useEffect } from "react";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const saved = localStorage.getItem("theme");

        if (saved) {
            document.documentElement.classList.add(saved);
        } else {
            const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            document.documentElement.classList.add(systemDark ? "dark" : "light");
        }
    }, []);

    return <>{children}</>;
}