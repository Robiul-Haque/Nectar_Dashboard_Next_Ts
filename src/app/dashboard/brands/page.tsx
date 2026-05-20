"use client";

import BrandTable from "@/components/dashboard/brands/BrandTable";

export default function BrandsPage() {
    return (
        <section className="w-full space-y-6">

            {/* HEADER */}
            <div className="flex justify-between items-center mt-6">
                <div>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider mb-1">
                        Catalog Management
                    </p>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                        Brands
                    </h1>
                </div>
            </div>

            {/* TABLE */}
            <BrandTable />
        </section>
    );
}
