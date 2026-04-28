"use client";

import { useState } from "react";

import Header from "@/components/dashboard/layout/header/Header";
import Sidebar from "@/components/dashboard/layout/sidebar/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
            {/* Main */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Header */}
                <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
                {/* Content */}
                <main className="flex-1 overflow-auto pt-16 p-4 md:p-6 lg:p-8">
                    {children}
                </main>
            </div>
            {/* Overlay */}
            {sidebarOpen && (<div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />)}
        </div>
    );
}