"use client";

import { useMemo, useState } from "react";
import { Menu } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import ThemeToggle from "@/components/ui/ThemeToggle";
import NotificationBell from "./NotificationBell";
import NotificationPanel from "./NotificationPanel";
import ProfileModal from "./ProfileModal";
import useNotifications from "@/hooks/useNotifications";
import DateTimeWidget from "./DateTimeWidget";
import getInitials from "@/lib/utils/string";
import GlobalSearch from "./GlobalSearch";
import { useGetAdminProfileQuery } from "@/redux/features/user/userApi";

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

    const { data: profileResponse, isLoading } = useGetAdminProfileQuery();

    const user: User = useMemo(() => {
        const adminData = profileResponse?.data;
        return {
            name: adminData?.name || "Admin",
            email: adminData?.email || "",
            image: adminData?.avatar?.url || ""
        };
    }, [profileResponse]);

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

                        <div className="flex-1 max-w-sm">
                            <GlobalSearch />
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
                            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500 to-green-600 font-semibold text-white shadow-lg shadow-emerald-500/25 overflow-hidden"
                            aria-label="Open profile"
                        >
                            {isLoading ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : user.image ? (
                                <Image
                                    src={user.image}
                                    alt={user.name}
                                    width={40}
                                    height={40}
                                    className="h-full w-full object-cover animate-fade-in"
                                />
                            ) : (
                                initials
                            )}
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