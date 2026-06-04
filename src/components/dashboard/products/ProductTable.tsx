"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Pencil, Trash2, Search, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Product } from "@/redux/features/product/productTypes";

interface ProductTableProps {
    products: Product[];
    onEdit: (product: Product) => void;
    onDelete: (product: Product) => void;
    onAddClick: () => void;
    isLoading?: boolean;
}

const FILTER_OPTIONS = [
    { label: "All", value: "all" },
    { label: "Low Stock", value: "low" },
    { label: "High Stock", value: "high" },
    { label: "Price: Low to High", value: "lowPrice" },
    { label: "Price: High to Low", value: "highPrice" },
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
];

export default function ProductTable({
    products,
    onEdit,
    onDelete,
    onAddClick,
    isLoading = false,
}: ProductTableProps) {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const limit = 10;

    /* ---------------- FILTER & SEARCH ---------------- */
    const filtered = useMemo(() => {
        let data = [...products];

        // 1. Search Query
        if (search?.trim() !== "") {
            const query = search.toLowerCase();
            data = data.filter(
                (p) =>
                    p.name?.toLowerCase().includes(query) ||
                    p.sku?.toLowerCase().includes(query) ||
                    p.category?.name?.toLowerCase().includes(query) ||
                    p.brand?.name?.toLowerCase().includes(query)
            );
        }

        // 2. Filter tabs
        switch (filter) {
            case "low":
                return data.filter((p) => p.stock > 0 && p.stock < 10);
            case "high":
                return data.filter((p) => p.stock >= 50);
            case "lowPrice":
                return [...data].sort((a, b) => {
                    const priceA = a.discountPrice ?? a.price;
                    const priceB = b.discountPrice ?? b.price;
                    return priceA - priceB;
                });
            case "highPrice":
                return [...data].sort((a, b) => {
                    const priceA = a.discountPrice ?? a.price;
                    const priceB = b.discountPrice ?? b.price;
                    return priceB - priceA;
                });
            case "active":
                return data.filter((p) => p.isActive);
            case "inactive":
                return data.filter((p) => !p.isActive);
            default:
                return data;
        }
    }, [products, search, filter]);

    /* ---------------- PAGINATION ---------------- */
    const totalPages = Math.ceil(filtered.length / limit);
    const paginated = useMemo(() => {
        return filtered.slice((page - 1) * limit, page * limit);
    }, [filtered, page]);

    const startItem = filtered.length > 0 ? (page - 1) * limit + 1 : 0;
    const endItem = Math.min(page * limit, filtered.length);

    return (
        <div className="space-y-6">
            {/* TOOLBAR */}
            <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 flex-1">
                    {/* Search */}
                    <div className="relative flex-1 md:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search products, SKU, category or brand..."
                            value={search}
                            onChange={(e) => {
                                  setSearch(e.target.value);
                                  setPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all dark:text-white"
                        />
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex flex-wrap gap-1 p-1 bg-gray-50 dark:bg-gray-800/60 rounded-xl overflow-x-auto">
                        {FILTER_OPTIONS.map((f) => (
                            <button
                                key={f.value}
                                onClick={() => {
                                    setFilter(f.value);
                                    setPage(1);
                                }}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                                    filter === f.value
                                        ? "bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 shadow-xs border border-gray-100 dark:border-gray-800"
                                        : "text-gray-500 hover:text-gray-900 dark:hover:text-white border border-transparent"
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={onAddClick}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-emerald-600/20 active:scale-95 whitespace-nowrap"
                >
                    <Plus className="w-4 h-4" />
                    Add Product
                </button>
            </div>

            {/* TABLE SECTION */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50/50 dark:bg-gray-900/50 text-gray-500 border-b border-gray-100 dark:border-gray-800">
                            <tr>
                                <th className="p-5 text-left font-semibold uppercase tracking-wider text-xs">
                                    Product
                                </th>
                                <th className="p-5 text-left font-semibold uppercase tracking-wider text-xs">
                                    Category
                                </th>
                                <th className="p-5 text-left font-semibold uppercase tracking-wider text-xs">
                                    Stock Level
                                </th>
                                <th className="p-5 text-left font-semibold uppercase tracking-wider text-xs">
                                    Price
                                </th>
                                <th className="p-5 text-left font-semibold uppercase tracking-wider text-xs">
                                    Status
                                </th>
                                <th className="p-5 text-right font-semibold uppercase tracking-wider text-xs">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {isLoading ? (
                                Array.from({ length: limit }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="p-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
                                                <div className="space-y-2">
                                                    <div className="h-5 w-32 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                                                    <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="h-5 w-16 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                                        </td>
                                        <td className="p-5">
                                            <div className="space-y-2">
                                                <div className="h-4 w-12 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                                                <div className="h-1.5 w-32 bg-gray-200 dark:bg-gray-800 rounded-full" />
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="h-5 w-14 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                                        </td>
                                        <td className="p-5">
                                            <div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded-full" />
                                        </td>
                                        <td className="p-5 flex justify-end gap-2">
                                            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded-xl" />
                                            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded-xl" />
                                        </td>
                                    </tr>
                                ))
                            ) : paginated.length > 0 ? (
                                paginated.map((product) => (
                                    <motion.tr
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={product._id}
                                        className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors group"
                                    >
                                        {/* PRODUCT */}
                                        <td className="p-5">
                                            <div className="flex items-center gap-4">
                                                <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shadow-sm flex-shrink-0">
                                                    {product.image?.url ? (
                                                        <img
                                                            src={product.image.url}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold text-lg">
                                                            {product.name.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-gray-900 dark:text-white text-base truncate">
                                                        {product.name}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                                                        <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-[10px]">SKU: {product.sku}</span>
                                                        {product.brand?.name && (
                                                            <>
                                                                <span>•</span>
                                                                <span className="truncate">Brand: {product.brand.name}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* CATEGORY */}
                                        <td className="p-5">
                                            {product.category?.name ? (
                                                <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                                                    {product.category.name}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-xs">Uncategorized</span>
                                            )}
                                        </td>

                                        {/* STOCK LEVEL */}
                                        <td className="p-5">
                                            <div className="flex flex-col space-y-1">
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                    {product.stock} {product.measurement?.unit ?? "units"}
                                                </p>
                                                <div className="w-32 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                    <div
                                                        style={{ width: `${Math.min((product.stock / 100) * 100, 100)}%` }}
                                                        className={`h-full rounded-full transition-all duration-500 ${
                                                            product.stock === 0
                                                                ? "bg-red-500"
                                                                : product.stock < 10
                                                                ? "bg-amber-500"
                                                                : "bg-emerald-600"
                                                        }`}
                                                    />
                                                </div>
                                                <span
                                                    className={`text-xs font-medium ${
                                                        product.stock === 0
                                                            ? "text-red-500"
                                                            : product.stock < 10
                                                            ? "text-amber-500"
                                                            : "text-emerald-600"
                                                    }`}
                                                >
                                                    {product.stock === 0
                                                        ? "Out of Stock"
                                                        : product.stock < 10
                                                        ? "Low Stock"
                                                        : "Healthy"}
                                                </span>
                                            </div>
                                        </td>

                                        {/* PRICE */}
                                        <td className="p-5">
                                            {product.discountPrice !== undefined && product.discountPrice > 0 ? (
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-base">
                                                        ${product.discountPrice.toFixed(2)}
                                                    </span>
                                                    <span className="text-xs text-gray-400 line-through">
                                                        ${product.price.toFixed(2)}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="font-semibold text-gray-900 dark:text-white text-base">
                                                    ${product.price.toFixed(2)}
                                                </span>
                                            )}
                                        </td>

                                        {/* STATUS */}
                                        <td className="p-5">
                                            <span
                                                className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                                                    product.isActive
                                                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                }`}
                                            >
                                                {product.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>

                                        {/* ACTIONS */}
                                        <td className="p-5">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => onEdit(product)}
                                                    className="p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all active:scale-95 border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs"
                                                    title="Edit Product"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => onDelete(product)}
                                                    className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all active:scale-95 border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs"
                                                    title="Delete Product"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-24 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <div className="w-16 h-16 mb-4 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                                                <Search className="w-8 h-8 opacity-50" />
                                            </div>
                                            <p className="text-lg font-medium text-gray-900 dark:text-white">
                                                No products found
                                            </p>
                                            <p className="text-sm mt-1">
                                                Try adjusting your search filters or add a new product.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                {totalPages > 0 && (
                    <div className="flex items-center justify-between p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/30">
                        <span className="text-sm font-medium text-gray-500">
                            Showing {startItem} to {endItem} of {filtered.length} products
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-xs active:scale-95"
                            >
                                Previous
                            </button>

                            {/* Page numbers */}
                            {Array.from({ length: totalPages }).map((_, i) => {
                                const pageNumber = i + 1;
                                return (
                                    <button
                                        key={i}
                                        onClick={() => setPage(pageNumber)}
                                        className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                                            page === pageNumber
                                                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                                                : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                        }`}
                                    >
                                        {pageNumber}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-xs active:scale-95"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}