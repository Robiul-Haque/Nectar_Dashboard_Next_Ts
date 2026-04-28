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

                        <div className="relative hidden w-full max-w-md sm:block">
                            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                            <input
                                type="text"
                                placeholder="Search orders, products..."
                                className="w-full rounded-2xl border border-transparent bg-gray-100 py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-emerald-200 focus:ring-2 focus:ring-emerald-500/20 dark:bg-gray-800 dark:text-white dark:focus:border-emerald-800"
                            />
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