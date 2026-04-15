"use client";
import { Menu, Search, Bell } from 'lucide-react';

interface HeaderProps {
    onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
    return (
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>

                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-600 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-xl">N</span>
                    </div>
                    <div>
                        <h1 className="font-semibold text-xl tracking-tight">Nectar Admin</h1>
                        <p className="text-xs text-gray-500 -mt-1">Organic Editorial</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 max-w-md mx-8 hidden md:block">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search orders, inventory..."
                        className="w-full bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-green-500 pl-10 py-2.5 rounded-2xl text-sm focus:outline-none"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-800">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium">Alex Rivers</p>
                        <p className="text-xs text-gray-500">Senior Admin</p>
                    </div>
                    <div className="w-9 h-9 bg-linear-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white font-semibold">
                        AR
                    </div>
                </div>
            </div>
        </header>
    );
}