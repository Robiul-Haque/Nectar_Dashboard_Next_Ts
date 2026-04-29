import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ThemeProvider from "@/providers/ThemeProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: "Dashboard | Nectar",
  description: "Admin dashboard for Nectar Organic Editorial",
  icons: { icon: "/favicon.ico" }
};

const themeInitializerScript = `
(() => {
  try {
    const saved = localStorage.getItem("theme");
    const theme = saved === "dark" || saved === "light"
      ? saved
      : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
  } catch {
    document.documentElement.classList.add("dark");
  }
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializerScript }} />
      </head>
      <body className="antialiased bg-gray-50 dark:bg-gray-950">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
