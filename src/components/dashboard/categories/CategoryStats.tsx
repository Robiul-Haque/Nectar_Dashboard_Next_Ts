"use client";

import { useGetCategoryStatsQuery } from "@/redux/features/category/categoryApi";
import { LayoutGrid, Package, HeartPulse } from "lucide-react";

const statConfig = [
    {
        key: "totalCategories" as const,
        title: "Total Categories",
        icon: LayoutGrid,
        color: "emerald",
        format: (v: number) => v.toLocaleString(),
        sub: "All registered categories",
    },
    {
        key: "activeItems" as const,
        title: "Active Items",
        icon: Package,
        color: "blue",
        format: (v: number) => v.toLocaleString(),
        sub: "Across all categories",
    },
    {
        key: "stockHealth" as const,
        title: "Stock Health",
        icon: HeartPulse,
        color: "violet",
        format: (v: number) => `${v}%`,
        sub: "Overall health score",
    },
];

const colorMap: Record<string, { bg: string; icon: string; ring: string; accent: string }> = {
    emerald: {
        bg: "bg-emerald-50 dark:bg-emerald-950/40",
        icon: "text-emerald-600 dark:text-emerald-400",
        ring: "bg-emerald-500/10",
        accent: "text-emerald-600 dark:text-emerald-400",
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

export default function CategoryStats() {
    const { data, isLoading } = useGetCategoryStatsQuery();
    const stats = data?.data;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {statConfig.map((item) => {
                const colors = colorMap[item.color];
                const Icon = item.icon;
                const value = stats?.[item.key];

                return (
                    <div
                        key={item.key}
                        className="relative p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden group hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-black/20 transition-all duration-300"
                    >
                        {/* Decorative circle */}
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
                                        {value !== undefined ? item.format(value) : "—"}
                                    </h2>
                                )}

                                <p className={`text-xs font-medium ${colors.accent}`}>
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