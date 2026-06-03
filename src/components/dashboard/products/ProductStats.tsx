"use client";

import { Package, AlertTriangle, Activity, DollarSign } from "lucide-react";
import { useGetProductStatsQuery } from "@/redux/features/product/productApi";

const colorMap: Record<string, { bg: string; icon: string; ring: string; accent: string }> = {
    emerald: {
        bg: "bg-emerald-50 dark:bg-emerald-950/40",
        icon: "text-emerald-600 dark:text-emerald-400",
        ring: "bg-emerald-500/10",
        accent: "text-emerald-600 dark:text-emerald-400",
    },
    amber: {
        bg: "bg-amber-50 dark:bg-amber-950/40",
        icon: "text-amber-600 dark:text-amber-400",
        ring: "bg-amber-500/10",
        accent: "text-amber-600 dark:text-amber-400",
    },
    blue: {
        bg: "bg-blue-50 dark:bg-blue-950/40",
        icon: "text-blue-600 dark:text-blue-400",
        ring: "bg-blue-500/10",
        accent: "text-blue-600 dark:text-blue-400",
    },
    violet: {
        bg: "bg-violet-50 dark:bg-violet-950/40",
        icon: "text-violet-600 dark:text-violet-400",
        ring: "bg-violet-500/10",
        accent: "text-violet-600 dark:text-violet-400",
    },
};

export default function ProductStats() {
    const { data, isLoading } = useGetProductStatsQuery();
    const stats = data?.data;

    const totalProducts = stats?.totalProducts ?? 0;
    const lowStockCount = stats?.lowStockAlerts?.total ?? 0;
    const outOfStockCount = stats?.lowStockAlerts?.outOfStock ?? 0;
    const stockHealth = stats?.stockHealth ?? 100;
    const totalValue = stats?.totalValuation ?? 0;

    const statsConfig = [
        {
            key: "total",
            title: "Total Products",
            value: totalProducts.toLocaleString(),
            sub: "Total unique items in catalog",
            icon: Package,
            color: "blue",
        },
        {
            key: "lowStock",
            title: "Low Stock Alerts",
            value: `${lowStockCount} items`,
            sub: `${outOfStockCount} items currently out of stock`,
            icon: AlertTriangle,
            color: "amber",
        },
        {
            key: "health",
            title: "Stock Health",
            value: `${stockHealth}%`,
            sub: "Products currently available",
            icon: Activity,
            color: "emerald",
        },
        {
            key: "value",
            title: "Total Valuation",
            value: `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            sub: "Stock value in inventory",
            icon: DollarSign,
            color: "violet",
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsConfig.map((item) => {
                const colors = colorMap[item.color];
                const Icon = item.icon;

                return (
                    <div
                        key={item.key}
                        className="relative p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden group hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-black/20 transition-all duration-300"
                    >
                        {/* Decorative background circle */}
                        <div
                            className={`absolute -top-10 -right-10 w-32 h-32 ${colors.ring} rounded-full transition-transform duration-500 group-hover:scale-110`}
                        />

                        <div className="relative flex items-start justify-between">
                            <div className="space-y-2">
                                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                                    {item.title}
                                </p>

                                {isLoading ? (
                                    <div className="h-8 w-20 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
                                ) : (
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {item.value}
                                    </h2>
                                )}

                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {item.sub}
                                </p>
                            </div>

                            <div
                                className={`w-11 h-11 rounded-xl ${colors.bg} flex items-center justify-center flex-shrink-0`}
                            >
                                <Icon className={`w-5 h-5 ${colors.icon}`} />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
