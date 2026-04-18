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
            <header className="md:pe-6 h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800">

                <div className="flex items-center justify-between h-full px-4 md:px-6">

                    {/* LEFT */}
                    <div className="flex items-center gap-3 flex-1">

                        {/* Mobile Menu */}
                        <button
                            onClick={onMenuClick}
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        {/* Search */}
                        <div className="relative w-full max-w-md hidden sm:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search orders, products..."
                                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition"
                            />
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="flex items-center gap-2 md:gap-3">

                        {/* Theme */}
                        <ThemeToggle />

                        {/* Notification */}
                        <NotificationBell
                            hasUnread={hasUnread}
                            onClick={togglePanel}
                        />

                        {/* Profile */}
                        <div className="w-9 h-9 rounded-xl bg-linear-to-br from-emerald-500 to-green-600 text-white flex items-center justify-center font-semibold cursor-pointer">
                            AR
                        </div>
                    </div>
                </div>
            </header>

            {/* Notification Panel */}
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