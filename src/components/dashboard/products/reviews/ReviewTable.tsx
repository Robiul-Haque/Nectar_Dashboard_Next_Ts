"use client";

import Image from "next/image";
import { Pencil, Trash2, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Review } from "@/redux/features/review/reviewTypes";

interface ReviewTableProps {
    reviews: Review[];
    onEdit: (review: Review) => void;
    onDelete: (reviewId: string) => void;
    isLoading?: boolean;
    pagination?: {
        total: number;
        page: number;
        limit: number;
    };
    onPageChange?: (page: number) => void;
}

export default function ReviewTable({
    reviews,
    onEdit,
    onDelete,
    isLoading = false,
    pagination,
    onPageChange,
}: ReviewTableProps) {
    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch (e) {
            return "N/A";
        }
    };

    const cleanImageUrl = (url: string) => {
        if (!url) return "";
        return url.trim().replace(/`/g, "");
    };

    const totalPages = pagination ? Math.ceil(pagination.total / pagination.limit) : 0;

    return (
        <div className="bg-white dark:bg-gray-900 overflow-hidden flex flex-col h-full">
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50/50 dark:bg-gray-950/50 text-gray-500 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10 backdrop-blur-sm">
                        <tr>
                            <th className="px-6 py-4 text-left font-bold uppercase tracking-widest text-[9px] text-gray-400 dark:text-gray-500">Customer</th>
                            <th className="px-6 py-4 text-center font-bold uppercase tracking-widest text-[9px] text-gray-400 dark:text-gray-500">Rating</th>
                            <th className="px-6 py-4 text-left font-bold uppercase tracking-widest text-[9px] text-gray-400 dark:text-gray-500 max-w-[200px] lg:max-w-xs">Feedback</th>
                            <th className="px-6 py-4 text-left font-bold uppercase tracking-widest text-[9px] text-gray-400 dark:text-gray-500">Date</th>
                            <th className="px-6 py-4 text-right font-bold uppercase tracking-widest text-[9px] text-gray-400 dark:text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl" />
                                            <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                                        </div>
                                    </td>
                                    <td className="p-6"><div className="h-6 w-12 bg-gray-100 dark:bg-gray-800 mx-auto rounded-lg" /></td>
                                    <td className="p-6"><div className="h-3 w-40 bg-gray-100 dark:bg-gray-800 rounded-lg" /></td>
                                    <td className="p-6"><div className="h-3 w-16 bg-gray-100 dark:bg-gray-800 rounded-lg" /></td>
                                    <td className="p-6"><div className="h-8 w-16 bg-gray-100 dark:bg-gray-800 ml-auto rounded-xl" /></td>
                                </tr>
                            ))
                        ) : reviews.length > 0 ? (
                            reviews.map((review) => (
                                <motion.tr
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    key={review._id}
                                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group"
                                >
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex-shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                                                {review.user.avatar?.url ? (
                                                    <Image
                                                        src={cleanImageUrl(review.user.avatar.url)}
                                                        alt={review.user.name}
                                                        fill
                                                        className="object-cover"
                                                        sizes="40px"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-bold text-base">
                                                        {review.user.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <p className="font-semibold text-gray-900 dark:text-white text-sm truncate max-w-[120px]">
                                                {review.user.name}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center justify-center gap-1 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-lg border border-amber-100 dark:border-amber-900/40 w-fit mx-auto shadow-xs">
                                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                            <span className="font-bold text-gray-900 dark:text-white text-xs">{review.rating}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 max-w-[200px] lg:max-w-xs">
                                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-2" title={review.comment}>
                                            {review.comment}
                                        </p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="text-gray-500 font-medium text-[10px] uppercase tracking-wider whitespace-nowrap">
                                            {formatDate(review.createdAt)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex justify-end items-center gap-2">
                                            <button
                                                onClick={() => onEdit(review)}
                                                className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all active:scale-90"
                                                title="Edit Review"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onDelete(review._id)}
                                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all active:scale-90"
                                                title="Delete Review"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="p-20 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-3">
                                        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center border border-gray-100 dark:border-gray-800">
                                            <Star className="w-7 h-7 text-gray-200 dark:text-gray-700" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-base font-bold text-gray-900 dark:text-white">No reviews found</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Customer feedback will appear here.</p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* SERVER-SIDE PAGINATION FOOTER */}
            {pagination && totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/30 dark:bg-gray-900/30">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Page {pagination.page} of {totalPages}
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            disabled={pagination.page <= 1 || isLoading}
                            onClick={() => onPageChange?.(pagination.page - 1)}
                            className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-30 transition-all"
                        >
                            <Star className="w-3 h-3 rotate-180" />
                        </button>

                        <div className="flex items-center gap-1 px-2">
                            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                                // Simple logic to show near current page
                                let pageNum = pagination.page;
                                if (pagination.page <= 3) pageNum = i + 1;
                                else if (pagination.page >= totalPages - 2) pageNum = totalPages - 4 + i;
                                else pageNum = pagination.page - 2 + i;

                                if (pageNum > 0 && pageNum <= totalPages) {
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => onPageChange?.(pageNum)}
                                            className={`w-7 h-7 text-[10px] font-black rounded-lg transition-all ${pagination.page === pageNum
                                                ? "bg-amber-500 text-white shadow-sm"
                                                : "text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-800"
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                }
                                return null;
                            })}
                        </div>

                        <button
                            disabled={pagination.page >= totalPages || isLoading}
                            onClick={() => onPageChange?.(pagination.page + 1)}
                            className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-30 transition-all"
                        >
                            <Star className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}