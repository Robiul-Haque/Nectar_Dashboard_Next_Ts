"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, LabelList } from "recharts";
import { motion, Variants } from "framer-motion";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Link from "next/link";
import { useGetDashboardStatsQuery } from "@/redux/features/dashboard/dashboardApi";

const renderCustomBarLabel = (props: any) => {
    const { x, y, width, value, payload } = props;

    if (!payload) return null;

    return (
        <g>
            <text
                x={x + width / 2}
                y={y - 25}
                fill="currentColor"
                textAnchor="middle"
                className="text-[11px] font-bold fill-gray-900 dark:fill-white transition-all duration-300"
            >
                ${value?.toLocaleString() || '0'}
            </text>
            <text
                x={x + width / 2}
                y={y - 10}
                fill="currentColor"
                textAnchor="middle"
                className="text-[9px] font-semibold fill-gray-500 dark:fill-gray-400 opacity-80 uppercase tracking-tighter"
            >
                {payload.orders || 0} Orders
            </text>
        </g>
    );
};



const pageVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.05
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.23, 1, 0.32, 1]
        }
    }
};

function DashboardSkeleton() {
    return (
        <div className="w-full max-w-screen-2xl mx-auto space-y-5 animate-pulse">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800/50">
                <div>
                    <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg mb-2"></div>
                    <div className="h-4 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
                </div>
                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-42 bg-gray-200 dark:bg-gray-800 rounded-4xl"></div>)}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 h-125 bg-gray-200 dark:bg-gray-800 rounded-4xl"></div>
                <div className="h-125 bg-gray-200 dark:bg-gray-800 rounded-4xl"></div>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const [selectedTimeframe, setSelectedTimeframe] = useState<"weekly" | "monthly">("weekly");
    const { data: statsResponse, isLoading, isError } = useGetDashboardStatsQuery();

    const data = statsResponse?.data;

    const currentData = selectedTimeframe === "weekly" ? data?.salesOverview?.weekly?.map(d => ({
        name: d.day,
        revenue: d.revenue,
        orders: d.orders,
    })) || [] : data?.salesOverview?.monthly?.map(d => ({
        name: new Date(d.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        revenue: d.revenue,
        orders: d.orders,
    })) || [];

    const timeframeOptions = [
        { id: "weekly", label: "Weekly" },
        { id: "monthly", label: "Monthly" }
    ];

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    if (isError) {
        return (
            <div className="w-full h-[60vh] flex items-center justify-center">
                <p className="text-red-500 font-semibold">Failed to load dashboard data.</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-screen-2xl mx-auto space-y-5">
            {/* Welcome Header - Compact but Bold */}
            <motion.div
                variants={pageVariants}
                initial="hidden"
                animate="show"
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800/50"
            >
                <div>
                    <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">
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
                <Card title="TOTAL SALES" value={`$${data?.cards?.totalSales?.toLocaleString() || '0'}`} />
                <Card title="DAILY ORDERS" value={`${data?.cards?.dailyOrders?.toLocaleString() || '0'}`} />
                <Card title="NEW CUSTOMERS" value={`${data?.cards?.newCustomers?.toLocaleString() || '0'}`} />
                <Card title="OUT OF STOCK" value={`${data?.cards?.outOfStock?.toLocaleString() || '0'} Items`} danger />
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Sales Overview Chart */}
                <motion.div
                    variants={itemVariants}
                    className="xl:col-span-2 bg-white dark:bg-gray-900 rounded-4xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800"
                >
                    <div className="mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h3 className="font-semibold text-xl text-gray-900 dark:text-white">
                                        Sales Overview
                                    </h3>
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wider mt-1">
                                    Revenue Performance Tracking
                                </p>
                            </div>

                            <div className="hidden sm:block h-10 w-px bg-gray-200 dark:bg-gray-800" />

                            <div>
                                <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold mb-0.5">Total Revenue</p>
                                <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
                                    ${currentData.reduce((acc, item) => acc + item.revenue, 0).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        {/* Timeframe Selector */}
                        <div className="flex p-1.5 bg-gray-100 dark:bg-gray-800 rounded-2xl w-fit">
                            {timeframeOptions.map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => setSelectedTimeframe(option.id as "weekly" | "monthly")}
                                    className={`relative px-5 py-2 text-xs font-semibold transition-all duration-300 rounded-xl ${selectedTimeframe === option.id
                                        ? "text-emerald-700 dark:text-emerald-400"
                                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                        }`}
                                >
                                    {selectedTimeframe === option.id && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-white dark:bg-gray-700 rounded-xl shadow-md"
                                            transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                                        />
                                    )}
                                    <span className="relative z-10">{option.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-80 md:h-96">
                        {currentData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={currentData} margin={{ top: 40, right: 0, left: 0, bottom: 0 }}>
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
                                                const payloadData = payload[0].payload;

                                                return (
                                                    <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-emerald-500/10 rounded-2xl p-5 shadow-2xl shadow-emerald-500/10 min-w-50">
                                                        <div className="flex justify-between items-center mb-3">
                                                            <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">
                                                                {label}
                                                            </p>
                                                        </div>

                                                        <div className="space-y-3">
                                                            <div>
                                                                <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-tighter font-semibold mb-0.5">Revenue</p>
                                                                <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
                                                                    ${payloadData.revenue?.toLocaleString() || 0}
                                                                </p>
                                                            </div>

                                                            <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-800">
                                                                <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-tighter font-semibold">Orders</p>
                                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                                    {payloadData.orders || 0}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar
                                        dataKey="revenue"
                                        radius={[12, 12, 0, 0]}
                                        barSize={selectedTimeframe === 'weekly' ? 56 : 42}
                                        animationDuration={1000}
                                        animationEasing="cubic-bezier(0.25, 0.1, 0.25, 1)"
                                    >
                                        <LabelList
                                            dataKey="revenue"
                                            content={renderCustomBarLabel}
                                        />
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
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                                <svg className="w-12 h-12 mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <p className="font-medium text-sm">No sales data available</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Popular Products */}
                <motion.div
                    variants={itemVariants}
                    className="bg-white dark:bg-gray-900 rounded-4xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col"
                >
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-semibold text-xl text-gray-900 dark:text-white tracking-tight">
                            Popular Products
                        </h3>
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    </div>

                    <div className="space-y-6 flex-1">
                        {data?.popularProducts?.length ? (
                            data.popularProducts.map((product) => (
                                <Product
                                    key={product.productId}
                                    name={product.name}
                                    category="Product"
                                    price={`$${product.price?.toLocaleString()}`}
                                    sold={`${product.totalSold} sold`}
                                    icon={
                                        product.image ? (
                                            <img src={product.image} alt={product.name} className="h-full w-full object-cover rounded-2xl" />
                                        ) : (
                                            "📦"
                                        )
                                    }
                                />
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 py-12">
                                <svg className="w-10 h-10 mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                                <p className="font-medium text-sm">No products found</p>
                            </div>
                        )}
                    </div>

                    <Link
                        href="/dashboard/products"
                        className="group relative block mt-8 w-full py-4 text-center text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-500/10 transition-all duration-300 ease-out hover:bg-emerald-100 dark:hover:bg-emerald-900/40 hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-emerald-400/40 overflow-hidden"
                    >
                        View Full Inventory
                    </Link>
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
            className="group relative bg-white dark:bg-gray-900 p-7 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/5"
        >
            <div className={`absolute -right-10 -top-10 h-36 w-36 rounded-full blur-3xl transition-opacity duration-700 opacity-10 group-hover:opacity-30 ${danger ? "bg-red-500" : "bg-emerald-500"}`} />

            <div className="relative z-10">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
                    {title}
                </p>

                <h2
                    className={`text-3xl font-semibold tracking-tight ${danger ? "text-red-600 dark:text-red-500" : "text-gray-900 dark:text-white"}`}
                >
                    {value}
                </h2>

                {extra && (
                    <div className="mt-5 flex items-center gap-3">
                        <span
                            className={`inline-flex items-center rounded-xl px-3 py-1 text-xs font-semibold tracking-tight ${danger
                                ? "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400"
                                : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                                }`}
                        >
                            {extra}
                        </span>
                        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider opacity-80">
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
    icon: React.ReactNode | string;
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
                    <p className="font-medium text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors text-[15px] truncate tracking-tight">
                        {name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-tight mt-0.5">{category}</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1 uppercase tracking-tighter">{sold}</p>
                </div>
            </div>
            <div className="text-right">
                <span className="text-base font-medium text-gray-900 dark:text-white block tracking-tighter">
                    {price}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider">
                    UNIT
                </span>
            </div>
        </motion.div>
    );
}