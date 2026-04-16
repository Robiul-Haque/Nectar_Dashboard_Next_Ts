"use client";

import { Bell } from "lucide-react";
import { motion } from "framer-motion";

export default function NotificationBell({
    hasUnread,
    onClick,
}: {
    hasUnread: boolean;
    onClick: () => void;
}) {
    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="relative p-2 rounded-xl transition"
        >
            <motion.div
                animate={
                    hasUnread
                        ? {
                            color: "#22c55e",
                            filter:
                                "drop-shadow(0 0 6px rgba(34,197,94,0.6))",
                        }
                        : { color: "#6b7280" }
                }
                transition={{ duration: 0.3 }}
            >
                <Bell className="w-5 h-5" />
            </motion.div>

            {/* RED DOT */}
            {hasUnread && (
                <motion.span
                    className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{
                        repeat: Infinity,
                        duration: 1.2,
                    }}
                />
            )}
        </motion.button>
    );
}