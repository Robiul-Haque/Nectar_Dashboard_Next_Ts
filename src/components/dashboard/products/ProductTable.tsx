"use client";

import { useMemo, useState } from "react";

type Product = {
    id: number;
    name: string;
    sku: string;
    category: string;
    stock: number;
    status: string;
    price: number;
    active: boolean;
};

/* ---------------- DUMMY DATA ---------------- */
const products: Product[] = [
    {
        id: 1,
        name: "Organic Heirloom Kale",
        sku: "LFG-001-KALE",
        category: "Leafy Greens",
        stock: 42,
        status: "Healthy",
        price: 3.49,
        active: true,
    },
    {
        id: 2,
        name: "Sweet Dutch Carrots",
        sku: "RVG-224-CART",
        category: "Root Veg",
        stock: 8,
        status: "Low Stock",
        price: 4.95,
        active: true,
    },
    {
        id: 3,
        name: "Honey-Drip Tomatoes",
        sku: "FRU-882-TOMT",
        category: "Fruits",
        stock: 124,
        status: "Stocked",
        price: 5.25,
        active: true,
    },
    {
        id: 4,
        name: "Grass-Fed Butter",
        sku: "DRY-551-BUTR",
        category: "Dairy",
        stock: 0,
        status: "Out of Stock",
        price: 8.15,
        active: false,
    },
    ...Array.from({ length: 16 }).map((_, i) => ({
        id: i + 5,
        name: "Fresh Product " + (i + 5),
        sku: "SKU-" + (i + 5),
        category: "General",
        stock: Math.floor(Math.random() * 100),
        status: "Healthy",
        price: Number((Math.random() * 10).toFixed(2)),
        active: Math.random() > 0.3,
    })),
];

export default function ProductTable({ filter }: { filter: string }) {
    const [page, setPage] = useState(1);
    const limit = 10;

    /* ---------------- FILTER ---------------- */
    const filtered = useMemo(() => {
        let data = [...products];

        switch (filter) {
            case "low":
                return data.filter((p) => p.stock > 0 && p.stock < 10);
            case "high":
                return data.filter((p) => p.stock >= 50);
            case "lowPrice":
                return [...data].sort((a, b) => a.price - b.price);
            case "highPrice":
                return [...data].sort((a, b) => b.price - a.price);
            case "active":
                return data.filter((p) => p.active);
            case "inactive":
                return data.filter((p) => !p.active);
            default:
                return data;
        }
    }, [filter]);

    /* ---------------- PAGINATION ---------------- */
    const totalPages = Math.ceil(filtered.length / limit);

    const paginated = useMemo(() => {
        return filtered.slice((page - 1) * limit, page * limit);
    }, [filtered, page]);

    return (
        <div className="w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">

            {/* TABLE */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">

                    {/* HEADER */}
                    <thead className="bg-gray-50 dark:bg-gray-950 text-gray-500 border-b dark:border-gray-800">
                        <tr>
                            <th className="p-4 w-10"></th>
                            <th className="p-4 text-left">PRODUCT</th>
                            <th className="p-4 text-left">CATEGORY</th>
                            <th className="p-4 text-left">STOCK LEVEL</th>
                            <th className="p-4 text-left">PRICE</th>
                            <th className="p-4 text-left">STATUS</th>
                            <th className="p-4 text-right">ACTIONS</th>
                        </tr>
                    </thead>

                    {/* BODY */}
                    <tbody>
                        {paginated.map((p) => (
                            <tr
                                key={p.id}
                                className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                            >
                                <td className="p-4"></td>

                                {/* PRODUCT */}
                                <td className="p-4 flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-gray-200" />
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {p.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            SKU: {p.sku}
                                        </p>
                                    </div>
                                </td>

                                {/* CATEGORY */}
                                <td className="p-4">
                                    <span className="px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-600">
                                        {p.category}
                                    </span>
                                </td>

                                {/* STOCK */}
                                <td className="p-4">
                                    <p className="text-sm font-medium">
                                        {p.stock} Units
                                    </p>

                                    <div className="w-32 h-1.5 bg-gray-200 rounded-full mt-1">
                                        <div
                                            style={{ width: `${Math.min(p.stock, 100)}%` }}
                                            className={`h-1.5 rounded-full ${p.stock === 0
                                                ? "bg-red-500"
                                                : p.stock < 10
                                                    ? "bg-orange-400"
                                                    : "bg-emerald-600"
                                                }`}
                                        />
                                    </div>

                                    <span
                                        className={`text-xs ml-1 ${p.stock === 0
                                            ? "text-red-500"
                                            : p.stock < 10
                                                ? "text-orange-500"
                                                : "text-emerald-600"
                                            }`}
                                    >
                                        {p.stock === 0
                                            ? "Out of Stock"
                                            : p.stock < 10
                                                ? "Low Stock"
                                                : "Healthy"}
                                    </span>
                                </td>

                                {/* PRICE */}
                                <td className="p-4 font-medium text-gray-900 dark:text-white">
                                    ${p.price} / ea
                                </td>

                                {/* STATUS */}
                                <td className="p-4">
                                    <span
                                        className={`flex items-center gap-2 ${p.active
                                            ? "text-emerald-600"
                                            : "text-gray-400"
                                            }`}
                                    >
                                        <span
                                            className={`w-2 h-2 rounded-full ${p.active
                                                ? "bg-emerald-600"
                                                : "bg-gray-400"
                                                }`}
                                        />
                                        {p.active ? "Active" : "Inactive"}
                                    </span>
                                </td>

                                {/* ACTIONS (UPGRADED) */}
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">

                                        <button className="px-3 py-1 text-xs rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition">
                                            View
                                        </button>

                                        <button className="px-3 py-1 text-xs rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition">
                                            Edit
                                        </button>

                                        <button className="px-3 py-1 text-xs rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition">
                                            Delete
                                        </button>

                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* PAGINATION (FUNCTIONAL + CLEAN) */}
            <div className="flex items-center justify-between p-4 text-sm text-gray-500">
                <span>
                    Page {page} of {totalPages}
                </span>

                <div className="flex items-center gap-2">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                        className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 disabled:opacity-40"
                    >
                        Prev
                    </button>

                    {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setPage(i + 1)}
                            className={`w-8 h-8 rounded-lg ${page === i + 1
                                ? "bg-emerald-600 text-white"
                                : "bg-gray-100 dark:bg-gray-800"
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}

                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => p + 1)}
                        className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}