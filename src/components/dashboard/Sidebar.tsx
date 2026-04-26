"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingCart, Package, Tags, Users, Settings, LogOut, HandHelping } from "lucide-react";

const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
    { label: "Products", href: "/dashboard/products", icon: Package },
    { label: "Categories", href: "/dashboard/categories", icon: Tags },
    { label: "Customers", href: "/dashboard/customers", icon: Users },
    { label: "Support", href: "/dashboard/support", icon: HandHelping },
    // { label: "Settings", href: "/dashboard/settings", icon: Settings }
];

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
    const pathname = usePathname();

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-72 h-screen flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 z-50">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 bg-green-600 rounded-2xl flex items-center justify-center">
                            <span className="text-white font-bold text-2xl">N</span>
                        </div>
                        <div>
                            <h2 className="font-bold text-2xl tracking-tight">Nectar</h2>
                            <p className="text-xs text-green-600 font-medium">Organic Editorial</p>
                        </div>
                    </div>

                    <nav className="space-y-3">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${isActive
                                        ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400'
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                <div className="mt-auto p-6 border-t border-gray-200 dark:border-gray-800">
                    <button className="flex w-full items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-2xl text-sm font-medium">
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </aside>
            {/* Mobile Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 lg:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="p-6">
                    <nav className="space-y-5">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${isActive
                                        ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400'
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="pe-6 py-6 mt-6 border-t border-gray-200 dark:border-gray-800">
                        <button className="flex w-full items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-2xl text-sm font-medium">
                            <LogOut className="w-5 h-5" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}