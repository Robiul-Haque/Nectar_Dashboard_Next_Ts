"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";
import { motion, Variants } from "framer-motion";
import Breadcrumb from "@/components/ui/Breadcrumb";

const timeframes: Record<string, { name: string; sales: number }[]> = {
    weekly: [
        { name: "Mon", sales: 420 },
        { name: "Tue", sales: 380 },
        { name: "Wed", sales: 520 },
        { name: "Thu", sales: 750 },
        { name: "Fri", sales: 610 },
        { name: "Sat", sales: 250 },
        { name: "Sun", sales: 400 }
    ],
    monthly: [
        { name: "Week 1", sales: 2400 },
        { name: "Week 2", sales: 3100 },
        { name: "Week 3", sales: 1800 },
        { name: "Week 4", sales: 4200 }
    ],
    "6months": [
        { name: "Jan", sales: 8400 },
        { name: "Feb", sales: 12100 },
        { name: "Mar", sales: 15800 },
        { name: "Apr", sales: 11200 },
        { name: "May", sales: 14500 },
        { name: "Jun", sales: 18900 }
    ],
    yearly: [
        { name: "2021", sales: 121000 },
        { name: "2022", sales: 158000 },
        { name: "2023", sales: 112000 },
        { name: "2024", sales: 145000 },
        { name: "2025", sales: 168000 }
    ]
};

const pageVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { 
            staggerChildren: 0.12, 
            delayChildren: 0.1 
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 25 },
    show: {
        opacity: 1,
        y: 0,
        transition: { 
            duration: 0.6, 
            ease: [0.22, 1, 0.36, 1] 
        }
    }
};

export default function DashboardPage() {
    const [selectedTimeframe, setSelectedTimeframe] = useState<keyof typeof timeframes>("weekly");

    const currentData = timeframes[selectedTimeframe];

    const timeframeOptions = [
        { id: "weekly", label: "Weekly" },
        { id: "monthly", label: "Monthly" },
        { id: "6months", label: "6 Months" },
        { id: "yearly", label: "Yearly" }
    ];

    return (
        <div className="w-full max-w-screen-2xl mx-auto space-y-6 mt-6 pb-12">
            {/* Welcome Header - Compact but Bold */}
            <motion.div
                variants={pageVariants}
                initial="hidden"
                animate="show"
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800/50"
            >
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                        Welcome back, Admin!
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-sm font-semibold mt-1">
                        Here's what's happening at Nectar today.
                    </p>
                </div>

                <Breadcrumb
                    items={[
                        { label: "Dashboard", href: "/dashboard" },
                        { label: "Overview" },
                    ]}
                />
            </motion.div>

            {/* Stats Cards - Added Bottom Margin */}
            <motion.div
                variants={pageVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8"
            >
                <Card title="TOTAL SALES" value="$12,840.50" extra="+12.5%" />
                <Card title="DAILY ORDERS" value="154" extra="+8.2%" />
                <Card title="NEW CUSTOMERS" value="42" extra="Stable" />
                <Card title="OUT OF STOCK" value="12 Items" danger />
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Sales Overview Chart */}
                <motion.div
                    variants={itemVariants}
                    className="xl:col-span-2 bg-white dark:bg-gray-900 rounded-[32px] p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800"
                >
                    <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div>
                            <h3 className="font-black text-xl text-gray-900 dark:text-white">
                                Sales Overview
                            </h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400 font-bold uppercase tracking-widest mt-1">
                                Revenue Performance Tracking
                            </p>
                        </div>

                        {/* Timeframe Selector */}
                        <div className="flex p-1.5 bg-gray-100 dark:bg-gray-800 rounded-2xl">
                            {timeframeOptions.map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => setSelectedTimeframe(option.id as any)}
                                    className={`relative px-5 py-2 text-xs font-black transition-all duration-300 rounded-xl ${selectedTimeframe === option.id
                                        ? "text-emerald-700 dark:text-emerald-400"
                                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                        }`}
                                >
                                    {selectedTimeframe === option.id && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-white dark:bg-gray-700 rounded-xl shadow-md"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <span className="relative z-10">{option.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-80 md:h-96">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={currentData}>
                                <defs>
                                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    vertical={false}
                                    strokeDasharray="3 3"
                                    stroke="#E5E7EB"
                                    className="dark:stroke-gray-800"
                                    opacity={0.4}
                                />
                                <XAxis
                                    dataKey="name"
                                    stroke="#6B7280"
                                    tickLine={false}
                                    axisLine={false}
                                    fontSize={12}
                                    dy={15}
                                    fontWeight={700}
                                />
                                <Tooltip
                                    cursor={{ fill: "rgba(16, 185, 129, 0.03)" }}
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            const val = payload[0].value as number;
                                            return (
                                                <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-emerald-500/10 rounded-2xl p-4 shadow-2xl shadow-emerald-500/10">
                                                    <p className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 font-black mb-1">
                                                        {label}
                                                    </p>
                                                    <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                                                        ${val.toLocaleString()}
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar
                                    dataKey="sales"
                                    radius={[10, 10, 0, 0]}
                                    // Increased Bar Width
                                    barSize={selectedTimeframe === 'weekly' ? 56 : 42}
                                >
                                    {currentData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill="url(#barGradient)"
                                            fillOpacity={index === currentData.length - 1 ? 1 : 0.45}
                                            style={{
                                                filter: index === currentData.length - 1 ? 'drop-shadow(0 8px 12px rgba(16, 185, 129, 0.3))' : 'none',
                                            }}
                                            className="transition-all duration-500 cursor-pointer"
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Popular Products */}
                <motion.div
                    variants={itemVariants}
                    className="bg-white dark:bg-gray-900 rounded-[32px] p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col"
                >
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-black text-xl text-gray-900 dark:text-white tracking-tight">
                            Popular Products
                        </h3>
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    </div>

                    <div className="space-y-6 flex-1">
                        <Product
                            name="Organic Banana"
                            category="Fruit & Vegetables"
                            price="$4.99"
                            sold="142 sold this week"
                            icon="🍌"
                        />
                        <Product
                            name="Red Gala Apple"
                            category="Fruit & Vegetables"
                            price="$6.50"
                            sold="98 sold this week"
                            icon="🍎"
                        />
                        <Product
                            name="Hass Avocado"
                            category="Fruit & Vegetables"
                            price="$3.25"
                            sold="76 sold this week"
                            icon="🥑"
                        />
                        <Product
                            name="Fresh Broccoli"
                            category="Vegetables"
                            price="$2.80"
                            sold="65 sold this week"
                            icon="🥦"
                        />
                    </div>

                    <button className="mt-8 w-full py-4 text-[11px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-2xl transition-all duration-300 active:scale-[0.98] border border-emerald-500/10">
                        View Full Inventory
                    </button>
                </motion.div>
            </div>
        </div>
    );
}

/* ====================== Card Component ====================== */
function Card({
    title,
    value,
    extra,
    danger
}: {
    title: string;
    value: string;
    extra?: string;
    danger?: boolean;
}) {
    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            className="group relative bg-white dark:bg-gray-900 p-7 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/5"
        >
            <div className={`absolute -right-10 -top-10 h-36 w-36 rounded-full blur-3xl transition-opacity duration-700 opacity-10 group-hover:opacity-30 ${danger ? "bg-red-500" : "bg-emerald-500"}`} />

            <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 dark:text-gray-400 mb-4">
                    {title}
                </p>

                <h2
                    className={`text-3xl font-black tracking-tight ${danger ? "text-red-600 dark:text-red-500" : "text-gray-900 dark:text-white"}`}
                >
                    {value}
                </h2>

                {extra && (
                    <div className="mt-5 flex items-center gap-3">
                        <span
                            className={`inline-flex items-center rounded-xl px-3 py-1 text-[10px] font-black tracking-tight ${danger
                                ? "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400"
                                : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                                }`}
                        >
                            {extra}
                        </span>
                        <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest opacity-80">
                            vs last month
                        </span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

/* ====================== Product Component ====================== */
function Product({
    name,
    category,
    price,
    sold,
    icon
}: {
    name: string;
    category: string;
    price: string;
    sold: string;
    icon: string;
}) {
    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ x: 8 }}
            className="flex justify-between items-center py-1 group cursor-pointer"
        >
            <div className="flex items-center gap-5 flex-1">
                <div className="h-14 w-14 rounded-2xl bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-sm">
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-black text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors text-[15px] truncate tracking-tight">
                        {name}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-tight mt-0.5">{category}</p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black mt-1 uppercase tracking-tighter">{sold}</p>
                </div>
            </div>
            <div className="text-right">
                <span className="text-base font-black text-gray-900 dark:text-white block tracking-tighter">
                    {price}
                </span>
                <span className="text-[9px] text-gray-500 dark:text-gray-400 uppercase font-black tracking-widest">
                    UNIT
                </span>
            </div>
        </motion.div>
    );
}