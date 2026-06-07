"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, MessageSquareQuote, Loader2 } from "lucide-react";
import { Product } from "@/redux/features/product/productTypes";
import { Review } from "@/redux/features/review/reviewTypes";
import { useGetReviewsQuery, useDeleteReviewMutation } from "@/redux/features/review/reviewApi";
import ReviewTable from "./ReviewTable";
import EditReviewModal from "./EditReviewModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import toast from "react-hot-toast";

interface ProductReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
}

export default function ProductReviewModal({ isOpen, onClose, product }: ProductReviewModalProps) {
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [reviewToDeleteId, setReviewToDeleteId] = useState<string | null>(null);
    const [page, setPage] = useState(1);

    const { data: reviewsData, isLoading, isFetching, error: fetchError } = useGetReviewsQuery(
        { productId: product?._id, page, limit: 10 },
        { skip: !product }
    );

    const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewMutation();

    useEffect(() => {
        if (fetchError) {
            const errorData = fetchError as any;
            const message = errorData?.data?.message || "Failed to fetch reviews";
            toast.error(message);
        }
    }, [fetchError]);

    // Reset page when product changes
    useEffect(() => {
        setPage(1);
    }, [product?._id]);

    const reviews = reviewsData?.data || [];
    const pagination = reviewsData?.pagination;

    const handleEdit = (review: Review) => {
        setSelectedReview(review);
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = (id: string) => {
        setReviewToDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!reviewToDeleteId) return;
        try {
            await deleteReview(reviewToDeleteId).unwrap();
            toast.success("Review deleted successfully");
            setIsDeleteModalOpen(false);
            // If deleting the last item on a page, go back
            if (reviews.length === 1 && page > 1) {
                setPage(p => p - 1);
            }
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to delete review");
        }
    };

    if (!product) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px]"
                    />

                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-[2rem] border border-gray-200 bg-white/95 backdrop-blur-xl shadow-2xl dark:border-gray-800 dark:bg-gray-900/95 flex flex-col pointer-events-auto"
                        >
                            <div className="h-1.5 bg-gradient-to-r from-amber-400 to-amber-600" />
                            
                            <button
                                onClick={onClose}
                                className="absolute right-8 top-8 rounded-2xl p-3 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-all z-10 active:scale-90 border border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 shadow-sm"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <div className="flex-1 overflow-hidden flex flex-col p-6 md:p-10">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pr-12 flex-shrink-0">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-[10px] uppercase tracking-widest">
                                            <Star className="h-3.5 w-3.5 fill-amber-600" />
                                            Product Experience
                                        </div>
                                        <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                                            Reviews for <span className="text-amber-600 dark:text-amber-500">{product.name}</span>
                                        </h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                            Monitor and manage customer feedback.
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4 bg-gray-50/50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white dark:bg-gray-900 shadow-sm text-amber-600 border border-gray-100 dark:border-gray-800">
                                            <MessageSquareQuote className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Reviews</p>
                                            <p className="text-2xl font-black text-gray-900 dark:text-white leading-none mt-1">{pagination?.total || 0}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 min-h-0 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
                                    <ReviewTable
                                        reviews={reviews}
                                        onEdit={handleEdit}
                                        onDelete={handleDeleteClick}
                                        isLoading={isLoading || isFetching}
                                        pagination={pagination}
                                        onPageChange={setPage}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Nested Modals */}
                    <EditReviewModal
                        isOpen={isEditModalOpen}
                        onClose={() => setIsEditModalOpen(false)}
                        review={selectedReview}
                    />

                    <DeleteConfirmModal
                        isOpen={isDeleteModalOpen}
                        onClose={() => setIsDeleteModalOpen(false)}
                        onConfirm={handleConfirmDelete}
                        isLoading={isDeleting}
                    />
                </>
            )}
        </AnimatePresence>
    );
}
