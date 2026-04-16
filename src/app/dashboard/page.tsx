"use client";

import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, } from "recharts";
import { motion, Variants } from "framer-motion";

const data = [
    { name: "Mon", sales: 400 },
    { name: "Tue", sales: 300 },
    { name: "Wed", sales: 500 },
    { name: "Thu", sales: 700 },
    { name: "Fri", sales: 600 },
    { name: "Sat", sales: 200 },
    { name: "Sun", sales: 300 }
];


const pageVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.15
        }
    }
};

const itemVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 18,
        scale: 0.98,
        filter: "blur(6px)"
    },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        transition: {
            duration: 0.55,
            ease: [0.16, 1, 0.3, 1]
        }
    }
};

export default function DashboardPage() {
    return (
        <motion.div
            variants={pageVariants}
            initial="hidden"
            animate="show"
            className="w-full space-y-6"
        >
            {/* Header */}
            <motion.section variants={itemVariants}>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Welcome back, Admin!
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Here's what's happening at your dashboard today.
                </p>
            </motion.section>

            {/* Stats Cards */}
            <motion.section
                variants={pageVariants}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
            >
                <Card title="Total Sales" value="$12,840.50" extra="+12.5%" />
                <Card title="Daily Orders" value="154" extra="+8.2%" />
                <Card title="New Customers" value="42" extra="Stable" />
                <Card title="Out of Stock" value="12 Items" danger />
            </motion.section>

            {/* Main Grid */}
            <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Chart */}
                <motion.div
                    variants={itemVariants}
                    className="xl:col-span-2 bg-white dark:bg-gray-900 p-5 rounded-xl shadow-sm"
                >
                    <div className="mb-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            Sales Overview
                        </h3>
                        <p className="text-xs text-gray-500">
                            Revenue performance over 7 days
                        </p>
                    </div>

                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <XAxis dataKey="name" stroke="#888" />
                                <Tooltip />
                                <Bar
                                    dataKey="sales"
                                    radius={[6, 6, 0, 0]}
                                    className="fill-green-600 dark:fill-green-500"
                                    animationDuration={1200}
                                    animationEasing="ease-in-out"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Products */}
                <motion.div
                    variants={itemVariants}
                    className="bg-white dark:bg-gray-900 p-5 rounded-xl shadow-sm"
                >
                    <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">
                        Popular Products
                    </h3>

                    <motion.div className="space-y-4" variants={pageVariants}>
                        <Product name="Organic Banana" price="$4.99" sold="142 sold" />
                        <Product name="Red Apple" price="$6.50" sold="98 sold" />
                        <Product name="Hass Avocado" price="$3.25" sold="76 sold" />
                    </motion.div>
                </motion.div>
            </section>
        </motion.div>
    );
}

/* ---------------- Card Component (Optimized) ---------------- */

function Card({
    title,
    value,
    extra,
    danger,
}: {
    title: string;
    value: string;
    extra?: string;
    danger?: boolean;
}) {
    return (
        <motion.div
            variants={itemVariants}
            whileHover={{
                y: -6,
                scale: 1.02,
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="relative p-4 rounded-xl bg-white dark:bg-gray-900 shadow-sm overflow-hidden"
        >
            {/* glow */}
            <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl bg-green-500/20" />

            <p className="text-xs text-gray-500">{title}</p>

            <h2
                className={`text-xl font-bold mt-1 ${danger
                    ? "text-red-500"
                    : "text-gray-900 dark:text-white"
                    }`}
            >
                {value}
            </h2>

            {extra && (
                <p
                    className={`text-xs mt-1 ${danger ? "text-red-500" : "text-green-500"
                        }`}
                >
                    {extra}
                </p>
            )}
        </motion.div>
    );
}

/* ---------------- Product Component (Optimized) ---------------- */

function Product({
    name,
    price,
    sold,
}: {
    name: string;
    price: string;
    sold: string;
}) {
    return (
        <motion.div
            variants={itemVariants}
            whileHover={{
                x: 6,
            }}
            transition={{ type: "spring", stiffness: 240 }}
            className="flex justify-between items-center cursor-pointer"
        >
            <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {name}
                </p>
                <p className="text-xs text-gray-500">{sold}</p>
            </div>

            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {price}
            </span>
        </motion.div>
    );
}