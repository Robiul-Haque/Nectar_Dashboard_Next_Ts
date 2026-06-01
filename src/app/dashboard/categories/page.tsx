"use client";

import CategoryStats from "@/components/dashboard/categories/CategoryStats";
import CategoryTable from "@/components/dashboard/categories/CategoryTable";

export default function CategoryPage() {
    return (
        <section className="w-full space-y-6">

            {/* HEADER */}
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Catalog Management
                    </p>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Product Categories
                    </h1>
                </div>
            </div>

            {/* STATS */}
            <CategoryStats />

            {/* TABLE */}
            <CategoryTable />
        </section>
    );
}