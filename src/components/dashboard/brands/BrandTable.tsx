"use client";

import { useState } from "react";
import { Pencil, Trash2, Search, Plus } from "lucide-react";
import { useGetBrandsQuery } from "@/redux/features/brand/brandApi";
import { Brand } from "@/redux/features/brand/brandTypes";
import BrandModal from "./BrandModal";
import DeleteBrandModal from "./DeleteBrandModal";
import { motion } from "framer-motion";

export default function BrandTable() {
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);

    const { data, isLoading, isFetching } = useGetBrandsQuery({ page, limit, search, active: activeFilter });
    
    const brands = data?.data || [];
    const pagination = data?.pagination;

    const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

    const handleEdit = (brand: Brand) => {
        setSelectedBrand(brand);
        setIsBrandModalOpen(true);
    };

    const handleDelete = (brand: Brand) => {
        setSelectedBrand(brand);
        setIsDeleteModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedBrand(null);
        setIsBrandModalOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* TOOLBAR */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search brands..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all dark:text-white"
                        />
                    </div>
                    <select
                        value={activeFilter === undefined ? "all" : activeFilter.toString()}
                        onChange={(e) => {
                            const val = e.target.value;
                            setActiveFilter(val === "all" ? undefined : val === "true");
                            setPage(1);
                        }}
                        className="py-2 px-4 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none cursor-pointer dark:text-white appearance-none"
                    >
                        <option value="all">All Status</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </select>
                </div>

                <button
                    onClick={handleCreate}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    Add Brand
                </button>
            </div>

            {/* TABLE SECTION */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50/50 dark:bg-gray-900/50 text-gray-500 border-b border-gray-100 dark:border-gray-800">
                            <tr>
                                <th className="p-5 text-left font-semibold uppercase tracking-wider text-xs">Brand Info</th>
                                <th className="p-5 text-left font-semibold uppercase tracking-wider text-xs">Status</th>
                                <th className="p-5 text-left font-semibold uppercase tracking-wider text-xs">Created At</th>
                                <th className="p-5 text-right font-semibold uppercase tracking-wider text-xs">Actions</th>
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
                                                <div className="h-5 w-32 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                                            </div>
                                        </td>
                                        <td className="p-5"><div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded-full" /></td>
                                        <td className="p-5"><div className="h-5 w-24 bg-gray-200 dark:bg-gray-800 rounded-lg" /></td>
                                        <td className="p-5 flex justify-end gap-2">
                                            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded-xl" />
                                            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded-xl" />
                                        </td>
                                    </tr>
                                ))
                            ) : brands.length > 0 ? (
                                brands.map((brand) => (
                                    <motion.tr
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={brand._id}
                                        className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors group"
                                    >
                                        <td className="p-5">
                                            <div className="flex items-center gap-4">
                                                <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shadow-sm">
                                                    {brand.logo?.url ? (
                                                        <img src={brand.logo.url} alt={brand.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xl">
                                                            {brand.name.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="font-semibold text-gray-900 dark:text-white text-base">
                                                    {brand.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span
                                                className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                                                    brand.isActive
                                                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                }`}
                                            >
                                                {brand.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="p-5 text-gray-500 dark:text-gray-400 font-medium">
                                            {new Date(brand.createdAt).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </td>
                                        <td className="p-5">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(brand)}
                                                    className="p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all active:scale-95"
                                                    title="Edit Brand"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(brand)}
                                                    className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all active:scale-95"
                                                    title="Delete Brand"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="py-24 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <div className="w-16 h-16 mb-4 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                                                <Search className="w-8 h-8 opacity-50" />
                                            </div>
                                            <p className="text-lg font-medium text-gray-900 dark:text-white">No brands found</p>
                                            <p className="text-sm mt-1">Try adjusting your search or filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                {pagination && pagination.totalPages > 0 && (
                    <div className="flex items-center justify-between p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/30">
                        <span className="text-sm font-medium text-gray-500">
                            Showing page {pagination.page} of {pagination.totalPages}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm active:scale-95"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                disabled={page === pagination.totalPages}
                                className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm active:scale-95"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* MODALS */}
            <BrandModal 
                isOpen={isBrandModalOpen} 
                onClose={() => setIsBrandModalOpen(false)} 
                brand={selectedBrand} 
            />
            
            <DeleteBrandModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                brand={selectedBrand}
            />
        </div>
    );
}
