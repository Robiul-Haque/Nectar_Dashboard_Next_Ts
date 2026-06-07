"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Loader2, Save } from "lucide-react";
import { Review } from "@/redux/features/review/reviewTypes";
import { useUpdateReviewMutation } from "@/redux/features/review/reviewApi";
import toast from "react-hot-toast";

interface EditReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    review: Review | null;
}

export default function EditReviewModal({ isOpen, onClose, review }: EditReviewModalProps) {
    const [updateReview, { isLoading }] = useUpdateReviewMutation();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [hoverRating, setHoverRating] = useState(0);

    useEffect(() => {
        if (review) {
            setRating(review.rating);
            setComment(review.comment);
        }
    }, [review]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!review) return;

        try {
            await updateReview({
                reviewId: review._id,
                rating,
                comment
            }).unwrap();
            toast.success("Review updated successfully");
            onClose();
        } catch (error: any) {
            // Global Error Handling for Update
            const message = error?.data?.message || "Failed to update review";
            if (error?.data?.errors && Array.isArray(error.data.errors)) {
                error.data.errors.forEach((err: any) => {
                    toast.error(`${err.field}: ${err.message}`);
                });
            } else {
                toast.error(message);
            }
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
                    />

                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900 pointer-events-auto"
                        >
                            <div className="h-1.5 bg-emerald-500" />
                            
                            <button
                                onClick={onClose}
                                className="absolute right-4 top-4 rounded-xl p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <form onSubmit={handleSubmit} className="p-6 md:p-8">
                                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                    Refine Feedback
                                </h3>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
                                    Adjust the rating and comment for this review.
                                </p>

                                <div className="mt-6 space-y-6">
                                    {/* Star Rating */}
                                    <div className="space-y-3 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            Satisfaction Level
                                        </label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setRating(star)}
                                                    onMouseEnter={() => setHoverRating(star)}
                                                    onMouseLeave={() => setHoverRating(0)}
                                                    className="p-1 transition-all hover:scale-125 active:scale-90"
                                                >
                                                    <Star
                                                        className={`h-7 w-7 transition-all ${
                                                            star <= (hoverRating || rating)
                                                                ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]"
                                                                : "text-gray-300 dark:text-gray-700"
                                                        }`}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Comment */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            Written Feedback
                                        </label>
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            required
                                            rows={4}
                                            className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white transition-all placeholder:text-gray-400"
                                            placeholder="Write your review here..."
                                        />
                                    </div>
                                </div>

                                <div className="mt-8 flex flex-col gap-3">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full inline-flex h-12 items-center justify-center rounded-2xl bg-emerald-600 px-6 text-sm font-black text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-70"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="mr-2 h-4 w-4" />
                                        )}
                                        Update Review
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="w-full h-12 rounded-2xl border border-gray-200 bg-white px-6 text-sm font-bold text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
