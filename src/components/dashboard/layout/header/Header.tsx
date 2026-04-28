"use client";

import { useMemo, useState } from "react";
import { Menu, Search } from "lucide-react";
import { motion } from "framer-motion";

import ThemeToggle from "@/components/ui/ThemeToggle";
import NotificationBell from "./NotificationBell";
import NotificationPanel from "./NotificationPanel";
import ProfileModal from "./ProfileModal";
import useNotifications from "@/hooks/useNotifications";
import DateTimeWidget from "./DateTimeWidget";
import getInitials from "@/lib/utils/string";

interface HeaderProps {
    onMenuClick: () => void;
}

interface User {
    name: string;
    email: string;
    image?: string;
}

export default function Header({ onMenuClick }: HeaderProps) {
    const { notifications, open, hasUnread, togglePanel, markAsRead, markAllAsRead } = useNotifications();
    const [profileOpen, setProfileOpen] = useState(false);

    const user: User = {
        name: "Abdur Rahman",
        email: "admin@example.com",
        image: ""
    };

    const initials = useMemo(() => getInitials(user.name), [user.name]);

    return (
        <>
            <header className="sticky top-0 z-30 h-18 border-b border-gray-200 bg-white/80 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/80">
                <div className="flex h-full items-center justify-between px-4 md:px-6">
                    {/* Left Section */}
                    <div className="flex flex-1 items-center gap-3">
                        <button
                            onClick={onMenuClick}
                            className="rounded-xl p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
                            aria-label="Open sidebar"
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        <div className="relative hidden w-full max-w-sm sm:block">
                            <div className="group relative">
                                {/* Glow Effect */}
                                <div className="absolute -inset-0.5 rounded-2xl bg-linear-to-r from-emerald-500/20 via-green-500/10 to-emerald-500/20 opacity-0 blur-lg transition duration-500 group-focus-within:opacity-100" />

                                {/* Search Icon */}
                                <Search className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors duration-300 group-focus-within:text-emerald-500 dark:text-gray-500 dark:group-focus-within:text-emerald-400" />

                                {/* Search Input */}
                                <input
                                    type="search"
                                    placeholder="Search orders, products..."
                                    aria-label="Search orders and products"
                                    className="relative w-full rounded-2xl border border-gray-200/80 bg-white/90 py-3 pl-12 pr-5 text-sm font-medium text-gray-900 shadow-sm backdrop-blur-xl transition-all duration-300 placeholder:text-gray-400 hover:border-emerald-200 hover:shadow-md focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none dark:border-gray-700/80 dark:bg-gray-800/80 dark:text-white dark:placeholder:text-gray-500 dark:hover:border-emerald-800 dark:focus:border-emerald-700"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-2 md:gap-3">
                        <DateTimeWidget />

                        <ThemeToggle />

                        <NotificationBell
                            hasUnread={hasUnread}
                            onClick={togglePanel}
                        />

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setProfileOpen(true)}
                            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500 to-green-600 font-semibold text-white shadow-lg shadow-emerald-500/25"
                            aria-label="Open profile"
                        >
                            {initials}
                        </motion.button>
                    </div>
                </div>
            </header>

            <NotificationPanel
                open={open}
                notifications={notifications}
                onClose={togglePanel}
                onRead={markAsRead}
                onMarkAllRead={markAllAsRead}
            />

            <ProfileModal
                open={profileOpen}
                onClose={() => setProfileOpen(false)}
                user={user}
            />
        </>
    );
}