"use client";

import { Menu, Search } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";
import NotificationBell from "./NotificationBell";
import NotificationPanel from "./NotificationPanel";
import { useNotifications } from "@/hooks/useNotifications";

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
    const { notifications, open, hasUnread, togglePanel, markAsRead, markAllAsRead } = useNotifications();

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800 transition-colors">

                {/* MAIN GRID (IMPORTANT FIX) */}
                <div className="grid grid-cols-3 items-center h-full px-4 md:px-6">

                    {/* LEFT */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onMenuClick}
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            <Menu />
                        </button>

                        {/* LOGO (RESTORED) */}
                        <div className="hidden sm:flex items-center gap-2">
                            <div className="w-8 h-8 bg-green-600 rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold">
                                    N
                                </span>
                            </div>

                            <div className="leading-tight">
                                <h1 className="font-semibold text-sm text-gray-900 dark:text-white">
                                    Nectar Admin
                                </h1>
                                <p className="text-[10px] text-gray-500">
                                    Organic Dashboard
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* CENTER (SEARCH FIXED PERFECTLY CENTERED) */}
                    <div className="flex justify-center">
                        <div className="relative w-full max-w-md hidden md:block">
                            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                            <input
                                placeholder="Search orders..."
                                className="w-full pl-10 pr-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-green-500"
                            />
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="flex items-center justify-end gap-3">
                        <ThemeToggle />

                        <NotificationBell
                            hasUnread={hasUnread}
                            onClick={togglePanel}
                        />

                        <div className="w-9 h-9 bg-green-600 rounded-xl text-white flex items-center justify-center">
                            AR
                        </div>
                    </div>

                </div>
            </header>

            {/* PANEL */}
            <NotificationPanel
                open={open}
                notifications={notifications}
                onClose={togglePanel}
                onRead={markAsRead}
                onMarkAllRead={markAllAsRead}
            />
        </>
    );
}