"use client";

import { useState } from "react";
import { Plus, Search, Pencil, Trash2, Image as ImageIcon, Play, ExternalLink } from "lucide-react";
import { useGetSlidersQuery, useDeleteSliderMutation } from "@/redux/features/slider/sliderApi";
import { Slider } from "@/redux/features/slider/sliderTypes";
import SliderModal from "@/components/dashboard/sliders/SliderModal";
import { motion } from "framer-motion";
import Image from "next/image";
import toast from "react-hot-toast";

export default function SlidersPage() {
    const { data: slidersData, isLoading, isFetching } = useGetSlidersQuery();
    const [deleteSlider] = useDeleteSliderMutation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSlider, setSelectedSlider] = useState<Slider | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const sliders = slidersData?.data || [];
    const filteredSliders = sliders.filter(slider =>
        slider.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEdit = (slider: Slider) => {
        setSelectedSlider(slider);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this slider?")) {
            try {
                await deleteSlider(id).unwrap();
                toast.success("Slider deleted successfully");
            } catch (error: any) {
                toast.error(error?.data?.message || "Failed to delete slider");
            }
        }
    };

    const cleanImageUrl = (url: string) => {
        if (!url) return "";
        return url.trim().replace(/`/g, "");
    };

    return (
        <section className="w-full space-y-8">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Slider Management
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Manage your homepage promotional sliders and banners.
                    </p>
                </div>
                <button
                    onClick={() => {
                        setSelectedSlider(null);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Add New Slider
                </button>
            </div>

            {/* TOOLBAR */}
            <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-gray-900 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by slider title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all dark:text-white"
                    />
                </div>
            </div>

            {/* CONTENT */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {isLoading || isFetching ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 animate-pulse space-y-4">
                            <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-2xl w-full" />
                            <div className="space-y-2">
                                <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded-lg w-3/4" />
                                <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-lg w-1/2" />
                            </div>
                        </div>
                    ))
                ) : filteredSliders.length > 0 ? (
                    filteredSliders.map((slider) => (
                        <motion.div
                            key={slider._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="group bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300"
                        >
                            {/* Preview */}
                            <div className="relative aspect-[21/9] bg-gray-100 dark:bg-gray-800">
                                {slider.images && slider.images.length > 0 ? (
                                    <Image
                                        src={cleanImageUrl(slider.images[0].url)}
                                        alt={slider.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                        <ImageIcon className="w-12 h-12 mb-2 opacity-20" />
                                        <span className="text-sm font-medium">No images uploaded</span>
                                    </div>
                                )}

                                {/* Status Badge */}
                                <div className="absolute top-4 right-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border ${slider.isActive
                                        ? "bg-emerald-500/90 text-white border-emerald-400"
                                        : "bg-red-500/90 text-white border-red-400"
                                        }`}>
                                        {slider.isActive ? "Active" : "Inactive"}
                                    </span>
                                </div>

                                {/* Animation Badge */}
                                <div className="absolute bottom-4 left-4">
                                    <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 border border-white/10">
                                        <Play className="w-3 h-3 fill-current" />
                                        {slider.animationType}
                                    </span>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="p-6">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="min-w-0">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                                            {slider.title}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-3 mt-2">
                                            <span className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                                                <ImageIcon className="w-3.5 h-3.5" />
                                                {slider.images.length} Images
                                            </span>
                                            {slider.actionButton?.text && (
                                                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                    {slider.actionButton.text}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleEdit(slider)}
                                            className="p-3 bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-2xl transition-all active:scale-90"
                                            title="Edit Slider"
                                        >
                                            <Pencil className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(slider._id)}
                                            className="p-3 bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-2xl transition-all active:scale-90"
                                            title="Delete Slider"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="xl:col-span-2 py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-center px-6">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                            <ImageIcon className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">No Sliders Found</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm">
                            You haven't added any promotional sliders yet. Create your first slider to showcase your top products.
                        </p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="mt-6 flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            Create Slider
                        </button>
                    </div>
                )}
            </div>

            {/* MODAL */}
            <SliderModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                slider={selectedSlider}
            />
        </section>
    );
}
