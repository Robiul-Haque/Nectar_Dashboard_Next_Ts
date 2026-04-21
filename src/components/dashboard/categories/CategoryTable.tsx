"use client";

import { useState } from "react";
import { Pencil, Eye, Trash2 } from "lucide-react";

type Category = {
    id: number;
    name: string;
    description: string;
    count: number;
    active: boolean;
};

const categories: Category[] = [
    { id: 1, name: "Fresh Fruits", description: "Seasonal and tropical selections", count: 342, active: true },
    { id: 2, name: "Organic Vegetables", description: "Farm to table daily harvest", count: 281, active: true },
    { id: 3, name: "Dairy & Eggs", description: "Grass-fed and hormone free", count: 156, active: true },
    { id: 4, name: "Beverages", description: "Juices and drinks", count: 412, active: false },
    { id: 5, name: "Bakery", description: "Artisan breads", count: 114, active: true },
    { id: 6, name: "Frozen Foods", description: "Ready meals", count: 210, active: true },
    { id: 7, name: "Snacks", description: "Healthy snacks", count: 98, active: true },
    { id: 8, name: "Seafood", description: "Fresh seafood", count: 76, active: false },
    { id: 9, name: "Meat", description: "Premium meats", count: 188, active: true },
    { id: 10, name: "Drinks Mix", description: "Drink powders", count: 65, active: true },
];

export default function CategoryTable() {
    const [page, setPage] = useState(1);
    const limit = 5;

    const totalPages = Math.ceil(categories.length / limit);

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages) return;
        setPage(newPage);
    };

    const startIndex = (page - 1) * limit;
    const paginated = categories.slice(startIndex, startIndex + limit);

    const startItem = startIndex + 1;
    const endItem = Math.min(startIndex + limit, categories.length);

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">

            {/* TABLE */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">

                    {/* HEADER */}
                    <thead className="bg-gray-50 dark:bg-gray-950 text-gray-500 border-b dark:border-gray-800">
                        <tr>
                            <th className="p-4 text-left">CATEGORY</th>
                            <th className="p-4 text-left">PRODUCT COUNT</th>
                            <th className="p-4 text-left">STATUS</th>
                            <th className="p-4 text-right w-35">ACTIONS</th>
                        </tr>
                    </thead>

                    {/* BODY */}
                    <tbody>
                        {paginated.length > 0 ? (
                            paginated.map((c) => (
                                <tr
                                    key={c.id}
                                    className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                                >
                                    {/* CATEGORY */}
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-gray-200" />
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {c.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {c.description}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* COUNT */}
                                    <td className="p-4 text-gray-900 dark:text-white">
                                        {c.count} <span className="text-xs text-gray-500">items</span>
                                    </td>

                                    {/* STATUS */}
                                    <td className="p-4">
                                        <span
                                            className={`px-3 py-1 text-xs rounded-full ${c.active
                                                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                : "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                                                }`}
                                        >
                                            {c.active ? "Active" : "Inactive"}
                                        </span>
                                    </td>

                                    {/* ACTIONS */}
                                    <td className="p-4">
                                        <div className="flex justify-end gap-2">

                                            <button
                                                aria-label="View"
                                                className="p-2 rounded-lg text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all hover:scale-105 active:scale-95"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>

                                            <button
                                                aria-label="Edit"
                                                className="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all hover:scale-105 active:scale-95"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>

                                            <button
                                                aria-label="Delete"
                                                className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all hover:scale-105 active:scale-95"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>

                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="text-center py-10 text-gray-500">
                                    No categories found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* PAGINATION */}
            <div className="flex items-center justify-between p-4 text-sm text-gray-500 border-t dark:border-gray-800">

                <span>
                    Showing {startItem} to {endItem} of {categories.length}
                </span>

                <div className="flex items-center gap-2">

                    {/* PREV */}
                    <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                        className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                    >
                        Prev
                    </button>

                    {/* NUMBERS */}
                    {Array.from({ length: totalPages }).map((_, i) => {
                        const pageNumber = i + 1;

                        return (
                            <button
                                key={i}
                                onClick={() => handlePageChange(pageNumber)}
                                className={`w-8 h-8 rounded-lg ${page === pageNumber
                                    ? "bg-emerald-600 text-white"
                                    : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                                    }`}
                            >
                                {pageNumber}
                            </button>
                        );
                    })}

                    {/* NEXT */}
                    <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages}
                        className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                    >
                        Next
                    </button>

                </div>
            </div>
        </div>
    );
}