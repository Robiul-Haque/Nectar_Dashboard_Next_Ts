"use client";

import { useState } from "react";
import { Pencil, Trash2, Search, Plus, Star } from "lucide-react";
import { useGetCategoriesQuery } from "@/redux/features/category/categoryApi";
import { Category } from "@/redux/features/category/categoryTypes";
import CategoryModal from "./CategoryModal";
import DeleteCategoryModal from "./DeleteCategoryModal";
import { motion } from "framer-motion";

export default function CategoryTable() {
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [search, setSearch] = useState("");

    const { data, isLoading, isFetching } = useGetCategoriesQuery({
        page,
        limit,
        search,
    });

    const categories = data?.data || [];
    const pagination = data?.pagination;
    const totalPages = pagination
        ? Math.ceil(pagination.total / pagination.limit)
        : 0;

    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] =
        useState<Category | null>(null);

    const handleEdit = (category: Category) => {
        setSelectedCategory(category);
        setIsCategoryModalOpen(true);
    };

    const handleDelete = (category: Category) => {
        setSelectedCategory(category);
        setIsDeleteModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedCategory(null);
        setIsCategoryModalOpen(true);
    };

    const startItem = pagination
        ? (pagination.page - 1) * pagination.limit + 1
        : 0;
    const endItem = pagination
        ? Math.min(pagination.page * pagination.limit, pagination.total)
        : 0;

    return (
        <div className="space-y-6">
            {/* TOOLBAR */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all dark:text-white"
                        />
                    </div>
                </div>

                <button
                    onClick={handleCreate}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    Add Category
                </button>
            </div>

            {/* TABLE SECTION */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50/50 dark:bg-gray-900/50 text-gray-500 border-b border-gray-100 dark:border-gray-800">
                            <tr>
                                <th className="p-5 text-left font-semibold uppercase tracking-wider text-xs">
                                    Category
                                </th>
                                <th className="p-5 text-left font-semibold uppercase tracking-wider text-xs">
                                    Products
                                </th>
                                <th className="p-5 text-left font-semibold uppercase tracking-wider text-xs">
                                    Status
                                </th>
                                <th className="p-5 text-left font-semibold uppercase tracking-wider text-xs">
                                    Created
                                </th>
                                <th className="p-5 text-right font-semibold uppercase tracking-wider text-xs">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {isLoading || isFetching ? (
                                // SKELETON LOADER
                                Array.from({ length: limit }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="p-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
                                                <div className="space-y-2">
                                                    <div className="h-5 w-32 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                                                    <div className="h-3 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="h-5 w-16 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                                        </td>
                                        <td className="p-5">
                                            <div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded-full" />
                                        </td>
                                        <td className="p-5">
                                            <div className="h-5 w-24 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                                        </td>
                                        <td className="p-5 flex justify-end gap-2">
                                            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded-xl" />
                                            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded-xl" />
                                        </td>
                                    </tr>
                                ))
                            ) : categories.length > 0 ? (
                                categories.map((cat) => (
                                    <motion.tr
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={cat._id}
                                        className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors group"
                                    >
                                        {/* CATEGORY */}
                                        <td className="p-5">
                                            <div className="flex items-center gap-4">
                                                <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shadow-sm flex-shrink-0">
                                                    {cat.icon?.url ? (
                                                        <img
                                                            src={cat.icon.url}
                                                            alt={cat.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xl">
                                                            {cat.name.charAt(0)}
                                                        </div>
                                                    )}
                                                    {cat.isFeatured && (
                                                        <div className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-amber-400 rounded-bl-lg rounded-tr-xl flex items-center justify-center">
                                                            <Star className="w-3 h-3 text-white fill-white" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-gray-900 dark:text-white text-base truncate">
                                                        {cat.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                                        {cat.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* PRODUCT COUNT */}
                                        <td className="p-5">
                                            <span className="text-gray-900 dark:text-white font-medium">
                                                {cat.productCount}
                                            </span>
                                            <span className="text-xs text-gray-500 ml-1">
                                                items
                                            </span>
                                        </td>

                                        {/* STATUS */}
                                        <td className="p-5">
                                            <span
                                                className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                                                    cat.isActive
                                                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                }`}
                                            >
                                                {cat.isActive
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </td>

                                        {/* CREATED AT */}
                                        <td className="p-5 text-gray-500 dark:text-gray-400 font-medium">
                                            {new Date(
                                                cat.createdAt
                                            ).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </td>

                                        {/* ACTIONS */}
                                        <td className="p-5">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() =>
                                                        handleEdit(cat)
                                                    }
                                                    className="p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all active:scale-95"
                                                    title="Edit Category"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(cat)
                                                    }
                                                    className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all active:scale-95"
                                                    title="Delete Category"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-24 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <div className="w-16 h-16 mb-4 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                                                <Search className="w-8 h-8 opacity-50" />
                                            </div>
                                            <p className="text-lg font-medium text-gray-900 dark:text-white">
                                                No categories found
                                            </p>
                                            <p className="text-sm mt-1">
                                                Try adjusting your search or
                                                create a new category.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                {pagination && totalPages > 0 && (
                    <div className="flex items-center justify-between p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/30">
                        <span className="text-sm font-medium text-gray-500">
                            Showing {startItem} to {endItem} of{" "}
                            {pagination.total}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() =>
                                    setPage((p) => Math.max(1, p - 1))
                                }
                                disabled={page === 1}
                                className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm active:scale-95"
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
                                onClick={() =>
                                    setPage((p) =>
                                        Math.min(totalPages, p + 1)
                                    )
                                }
                                disabled={page === totalPages}
                                className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm active:scale-95"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* MODALS */}
            <CategoryModal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                category={selectedCategory}
            />

            <DeleteCategoryModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                category={selectedCategory}
            />
        </div>
    );
}