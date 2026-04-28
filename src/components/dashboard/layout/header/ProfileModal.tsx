"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Camera, Mail, User, Lock, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

interface UserProfile {
    name: string;
    email: string;
    image?: string;
}

interface ProfileModalProps {
    open: boolean;
    onClose: () => void;
    user: UserProfile;
}

export default function ProfileModal({
    open,
    onClose,
    user,
}: ProfileModalProps) {
    const [name, setName] = useState(user.name);
    const [password, setPassword] = useState("");

    useEffect(() => {
        if (open) {
            setName(user.name);
            setPassword("");
        }
    }, [open, user.name]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        if (open) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [open, onClose]);

    const initials = useMemo(() => {
        if (!user.name) return "U";

        const parts = user.name.trim().split(/\s+/);

        if (parts.length === 1) {
            return parts[0].slice(0, 2).toUpperCase();
        }

        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }, [user.name]);

    const handleSave = () => {
        console.log({
            name,
            password,
        });
        onClose();
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 24 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 24 }}
                        transition={{
                            duration: 0.28,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-lg rounded-3xl border border-gray-200/70 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl overflow-hidden"
                        >
                            {/* Header */}
                            <div className="relative px-6 py-5 border-b border-gray-200 dark:border-gray-800">
                                <button
                                    onClick={onClose}
                                    className="absolute right-4 top-4 p-2 rounded-xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Profile Settings
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Manage your profile information
                                </p>
                            </div>

                            {/* Body */}
                            <div className="p-6 space-y-6">
                                {/* Avatar */}
                                <div className="flex flex-col items-center">
                                    <div className="relative group">
                                        {user.image ? (
                                            <Image
                                                src={user.image}
                                                alt={user.name}
                                                width={104}
                                                height={104}
                                                className="w-26 h-26 rounded-3xl object-cover ring-4 ring-emerald-100 dark:ring-emerald-900/40"
                                            />
                                        ) : (
                                            <div className="w-26 h-26 rounded-3xl bg-linear-to-br from-emerald-500 to-green-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg">
                                                {initials}
                                            </div>
                                        )}

                                        <button className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105">
                                            <Camera className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                                        {user.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Administrator
                                    </p>
                                </div>

                                {/* Form */}
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Full Name
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="email"
                                                value={user.email}
                                                readOnly
                                                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Enter new password"
                                                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex flex-col sm:flex-row gap-3 justify-end px-6 py-5 border-t border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/50">
                                <button
                                    onClick={onClose}
                                    className="px-5 py-2.5 rounded-2xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleSave}
                                    className="px-6 py-2.5 rounded-2xl bg-linear-to-r from-emerald-500 to-green-600 text-white font-medium shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all duration-300"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}