"use client";

export default function ProductFilters() {
    return (
        <div className="w-full flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">

            {/* LEFT */}
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                <button className="px-4 py-1.5 bg-white dark:bg-gray-900 text-emerald-600 rounded-lg text-sm font-medium shadow-sm">
                    All Items
                </button>
                <button className="px-4 py-1.5 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white">
                    Low Stock
                </button>
                <button className="px-4 py-1.5 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white">
                    Out of Stock
                </button>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-3 flex-wrap">
                <select className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm outline-none">
                    <option>All Categories</option>
                    <option>Leafy Greens</option>
                    <option>Fruits</option>
                </select>

                <span className="text-sm text-gray-500">Bulk Actions:</span>

                <button className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm">
                    Status
                </button>

                <button className="px-3 py-2 rounded-xl bg-red-100 text-red-600 text-sm">
                    Delete
                </button>
            </div>
        </div>
    );
}