"use client";

import { useEffect, useMemo, useState } from "react";
import { Menu, Search, CalendarDays, Clock3 } from "lucide-react";
import { motion } from "framer-motion";

import ThemeToggle from "@/components/ui/ThemeToggle";
import NotificationBell from "./NotificationBell";
import NotificationPanel from "./NotificationPanel";
import ProfileModal from "./ProfileModal";
import { useNotifications } from "@/hooks/useNotifications";

interface HeaderProps {
    onMenuClick: () => void;
}

interface User {
    name: string;
    email: string;
    image?: string;
}

/* -------------------------------------------------------------------------- */
/*                               Helper Methods                               */
/* -------------------------------------------------------------------------- */
const getInitials = (name: string): string => {
    const parts = name.trim().split(/\s+/);

    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

/* -------------------------------------------------------------------------- */
/*                              Date Time Widget                              */
/* -------------------------------------------------------------------------- */
function DateTimeWidget() {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const formatted = useMemo(
        () => ({
            time: currentTime.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            }),
            date: currentTime.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
            }),
        }),
        [currentTime]
    );

    return (
        <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="hidden xl:flex items-center gap-2 md:mr-6"
        >
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-linear-to-r from-emerald-50/90 to-green-50/80 dark:from-emerald-950/30 dark:to-green-950/20 px-3 py-2 backdrop-blur-xl">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Clock3 className="h-4 w-4" />
                </div>

                <div className="leading-none">
                    <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                        Current Time
                    </p>
                    <p className="mt-1 text-sm font-bold text-gray-900 dark:text-white">
                        {formatted.time}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-800/70 px-3 py-2 backdrop-blur-xl">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700 text-emerald-600 dark:text-emerald-400">
                    <CalendarDays className="h-4 w-4" />
                </div>

                <div className="leading-none">
                    <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                        Today
                    </p>
                    <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                        {formatted.date}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

/* -------------------------------------------------------------------------- */
/*                                   Header                                   */
/* -------------------------------------------------------------------------- */
export default function Header({ onMenuClick }: HeaderProps) {
    const {
        notifications,
        open,
        hasUnread,
        togglePanel,
        markAsRead,
        markAllAsRead,
    } = useNotifications();

    const [profileOpen, setProfileOpen] = useState(false);

    const user: User = {
        name: "Abdur Rahman",
        email: "admin@example.com",
        image: "",
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