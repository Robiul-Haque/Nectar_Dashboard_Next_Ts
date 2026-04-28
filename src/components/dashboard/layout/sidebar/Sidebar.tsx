"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Tags,
    Users,
    LogOut,
    HandHelping,
    X,
    AlertTriangle,
} from "lucide-react";

const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
    { label: "Products", href: "/dashboard/products", icon: Package },
    { label: "Categories", href: "/dashboard/categories", icon: Tags },
    { label: "Customers", href: "/dashboard/customers", icon: Users },
    { label: "Support", href: "/dashboard/support", icon: HandHelping },
] as const;

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

interface LogoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

function LogoutModal({
    isOpen,
    onClose,
    onConfirm,
}: LogoutModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="fixed inset-0 z-100 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92, y: 20 }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: 0,
                            }}
                            exit={{
                                opacity: 0,
                                scale: 0.92,
                                y: 20,
                            }}
                            transition={{
                                duration: 0.3,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900"
                        >
                            {/* Top Gradient Bar */}
                            <div className="h-1.5 bg-linear-to-r from-red-500 via-rose-500 to-orange-500" />

                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute right-4 top-4 rounded-xl p-2 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                                aria-label="Close"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <div className="p-7">
                                {/* Icon */}
                                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-950/40">
                                    <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                                </div>

                                {/* Content */}
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Confirm Logout
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                                    Are you sure you want to log out of your account?
                                    You can sign back in anytime.
                                </p>

                                {/* Actions */}
                                <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                    <button
                                        onClick={onClose}
                                        className="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-50 active:scale-[0.98] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        onClick={onConfirm}
                                        className="inline-flex items-center justify-center rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition-all duration-200 hover:bg-red-700 active:scale-[0.98]"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Confirm Logout
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}

export default function Sidebar({
    isOpen,
    setIsOpen,
}: SidebarProps) {
    const pathname = usePathname();
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);

    const handleLogout = () => {
        // Future logout logic goes here
        console.log("Logout confirmed");
        setLogoutModalOpen(false);
    };

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-72 h-screen flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 z-50">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-600">
                            <span className="text-2xl font-bold text-white">N</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                                Nectar
                            </h2>
                            <p className="text-xs font-medium text-green-600">
                                Organic Editorial
                            </p>
                        </div>
                    </div>

                    <nav className="space-y-3">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300 ${isActive
                                        ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400"
                                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                                        }`}
                                >
                                    <Icon className="h-5 w-5" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="mt-auto border-t border-gray-200 p-6 dark:border-gray-800">
                    <button
                        onClick={() => setLogoutModalOpen(true)}
                        className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-red-600 transition-all duration-300 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                        <LogOut className="h-5 w-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r border-gray-200 bg-white transition-transform duration-300 dark:border-gray-800 dark:bg-gray-900 lg:hidden ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="p-6">
                    <nav className="space-y-3">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300 ${isActive
                                        ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400"
                                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                                        }`}
                                >
                                    <Icon className="h-5 w-5" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-800">
                        <button
                            onClick={() => setLogoutModalOpen(true)}
                            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-red-600 transition-all duration-300 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                            <LogOut className="h-5 w-5" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            <LogoutModal
                isOpen={logoutModalOpen}
                onClose={() => setLogoutModalOpen(false)}
                onConfirm={handleLogout}
            />
        </>
    );
}