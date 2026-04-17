// src/app/dashboard/page.tsx
"use client";

import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion, Variants } from "framer-motion";
import Breadcrumb from "@/components/ui/Breadcrumb";

const data = [
    { name: "Mon", sales: 400 },
    { name: "Tue", sales: 300 },
    { name: "Wed", sales: 500 },
    { name: "Thu", sales: 700 },
    { name: "Fri", sales: 600 },
    { name: "Sat", sales: 200 },
    { name: "Sun", sales: 300 },
];

const pageVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.05 },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] },
    },
};

export default function DashboardPage() {
    return (
        <div className="w-full max-w-screen-2xl mx-auto space-y-4 mt-4">
            {/* Welcome Header - Compact */}
            <motion.div
                variants={pageVariants}
                initial="hidden"
                animate="show"
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2"
            >
                <div>
                    <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">
                        Welcome back, Admin!
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-0.5">
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

            {/* Stats Cards - More Compact */}
            <motion.div
                variants={pageVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
            >
                <Card title="TOTAL SALES" value="$12,840.50" extra="+12.5%" />
                <Card title="DAILY ORDERS" value="154" extra="+8.2%" />
                <Card title="NEW CUSTOMERS" value="42" extra="Stable" />
                <Card title="OUT OF STOCK" value="12 Items" danger />
            </motion.div>

            {/* Main Content Grid - Compact */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Sales Overview Chart */}
                <motion.div
                    variants={itemVariants}
                    className="xl:col-span-2 bg-white dark:bg-gray-900 rounded-3xl p-5 md:p-6 shadow-sm border border-gray-100 dark:border-gray-800"
                >
                    <div className="mb-5">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                            Sales Overview
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Revenue performance over the last 30 days
                        </p>
                    </div>

                    <div className="h-72 md:h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <XAxis
                                    dataKey="name"
                                    stroke="#9CA3AF"
                                    tickLine={false}
                                    axisLine={false}
                                    fontSize={12}
                                />
                                <Tooltip
                                    cursor={{ fill: "rgba(16, 185, 129, 0.1)" }}
                                    contentStyle={{
                                        backgroundColor: "#fff",
                                        border: "none",
                                        borderRadius: "10px",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                    }}
                                />
                                <Bar
                                    dataKey="sales"
                                    fill="#10b981"
                                    radius={[6, 6, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Popular Products - Compact */}
                <motion.div
                    variants={itemVariants}
                    className="bg-white dark:bg-gray-900 rounded-3xl p-5 md:p-6 shadow-sm border border-gray-100 dark:border-gray-800"
                >
                    <h3 className="font-semibold text-lg mb-5 text-gray-900 dark:text-white">
                        Popular Products
                    </h3>

                    <div className="space-y-5">
                        <Product
                            name="Organic Banana"
                            category="Fruit & Vegetables"
                            price="$4.99"
                            sold="142 sold this week"
                        />
                        <Product
                            name="Red Gala Apple"
                            category="Fruit & Vegetables"
                            price="$6.50"
                            sold="98 sold this week"
                        />
                        <Product
                            name="Hass Avocado"
                            category="Fruit & Vegetables"
                            price="$3.25"
                            sold="76 sold this week"
                        />
                    </div>

                    <button className="mt-6 w-full py-3 text-sm font-medium text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950 rounded-2xl transition-colors">
                        View Full Inventory →
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
            whileHover={{ y: -3 }}
            className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800"
        >
            <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">
                {title}
            </p>
            <h2 className={`text-2xl font-bold mt-1 ${danger ? "text-red-600 dark:text-red-500" : "text-gray-900 dark:text-white"}`}>
                {value}
            </h2>
            {extra && (
                <p className={`text-xs mt-2 font-medium ${danger ? "text-red-600" : "text-emerald-600 dark:text-emerald-400"}`}>
                    {extra}
                </p>
            )}
        </motion.div>
    );
}

/* ====================== Product Component ====================== */
function Product({
    name,
    category,
    price,
    sold
}: {
    name: string;
    category: string;
    price: string;
    sold: string;
}) {
    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ x: 4 }}
            className="flex justify-between items-start py-1 group cursor-pointer"
        >
            <div className="flex-1 pr-3">
                <p className="font-medium text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors text-[15px]">
                    {name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{category}</p>
                <p className="text-xs text-gray-500">{sold}</p>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                {price}
            </span>
        </motion.div>
    );
}