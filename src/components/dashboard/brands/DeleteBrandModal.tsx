"use client";

import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDeleteBrandMutation } from "@/redux/features/brand/brandApi";
import { Brand } from "@/redux/features/brand/brandTypes";
import toast from "react-hot-toast";

interface DeleteBrandModalProps {
    isOpen: boolean;
    onClose: () => void;
    brand: Brand | null;
}

export default function DeleteBrandModal({ isOpen, onClose, brand }: DeleteBrandModalProps) {
    const [deleteBrand, { isLoading }] = useDeleteBrandMutation();

    const handleDelete = async () => {
        if (!brand) return;
        try {
            await deleteBrand(brand._id).unwrap();
            toast.success("Brand deleted successfully");
            onClose();
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to delete brand");
        }
    };

    return (
        <AnimatePresence>
            {isOpen && brand && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
                        onClick={!isLoading ? onClose : undefined}
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 20 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl pointer-events-auto"
                        >
                            {/* Top Gradient Bar */}
                            <div className="h-1.5 bg-linear-to-r from-red-500 via-rose-500 to-orange-500" />

                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                disabled={isLoading}
                                className="absolute right-4 top-4 rounded-xl p-2 text-gray-400 transition-all hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
                                aria-label="Close"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <div className="p-7">
                                {/* Icon */}
                                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-950/40">
                                    <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                                </div>

                                {/* Content */}
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Delete Brand
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                                    Are you sure you want to delete <strong className="text-gray-900 dark:text-gray-200">{brand.name}</strong>? 
                                    This action cannot be undone and will permanently remove this brand from the system.
                                </p>

                                {/* Actions */}
                                <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                    <button
                                        onClick={onClose}
                                        disabled={isLoading}
                                        className="inline-flex items-center justify-center rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-5 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-[0.98] disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        onClick={handleDelete}
                                        disabled={isLoading}
                                        className="inline-flex items-center justify-center rounded-2xl bg-red-600 hover:bg-red-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Deleting...
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Confirm Delete
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
