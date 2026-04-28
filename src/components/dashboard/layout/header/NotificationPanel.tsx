"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Notification } from "@/types/notification";

export default function NotificationPanel({
    open,
    notifications,
    onClose,
    onRead,
    onMarkAllRead,
}: {
    open: boolean;
    notifications: Notification[];
    onClose: () => void;
    onRead: (id: string) => void;
    onMarkAllRead: () => void;
}) {
    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* BACKDROP */}
                    <motion.div
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-xs z-40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />

                    {/* PANEL */}
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                        className="fixed right-4 top-20 w-80 z-50 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden"
                    >
                        {/* HEADER */}
                        <div className="p-3 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                Notifications
                            </h3>

                            <button
                                onClick={onMarkAllRead}
                                className="text-xs text-green-600 hover:underline"
                            >
                                Mark all read
                            </button>
                        </div>

                        {/* LIST */}
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-6 text-center text-sm text-gray-500">
                                    No notifications
                                </div>
                            ) : (
                                notifications.map((n) => (
                                    <motion.div
                                        key={n.id}
                                        onClick={() => onRead(n.id)}
                                        whileHover={{ x: 4 }}
                                        className={`p-3 border-b cursor-pointer transition ${n.read
                                            ? "bg-transparent"
                                            : "bg-green-50 dark:bg-green-900/20"
                                            } border-gray-100 dark:border-gray-800`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                                {n.title}
                                            </h4>

                                            {!n.read && (
                                                <span className="w-2 h-2 bg-green-500 rounded-full mt-1" />
                                            )}
                                        </div>

                                        <p className="text-xs text-gray-500 mt-1">
                                            {n.message}
                                        </p>

                                        <p className="text-[10px] text-gray-400 mt-2">
                                            {n.createdAt}
                                        </p>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}