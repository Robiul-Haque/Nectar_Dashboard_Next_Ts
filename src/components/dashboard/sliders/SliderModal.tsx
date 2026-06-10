"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { X, UploadCloud, Loader2, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateSliderMutation, useUpdateSliderMutation, useDeleteSliderImageMutation } from "@/redux/features/slider/sliderApi";
import { Slider } from "@/redux/features/slider/sliderTypes";
import toast from "react-hot-toast";
import Image from "next/image";

const sliderSchema = z.object({
    title: z.string().min(1, "Title is required").max(200, "Title too long"),
    animationType: z.enum(["fade", "slide", "zoom", "none"]),
    isActive: z.boolean().default(true),
    actionButtonText: z.string().max(50, "Text too long").optional(),
    actionButtonLink: z.string().url("Invalid URL").optional().or(z.literal("")),
});

type SliderFormData = z.infer<typeof sliderSchema>;

interface SliderModalProps {
    isOpen: boolean;
    onClose: () => void;
    slider?: Slider | null;
}

export default function SliderModal({ isOpen, onClose, slider }: SliderModalProps) {
    const [createSlider, { isLoading: isCreating }] = useCreateSliderMutation();
    const [updateSlider, { isLoading: isUpdating }] = useUpdateSliderMutation();
    const [deleteSliderImage] = useDeleteSliderImageMutation();
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<SliderFormData>({
        resolver: zodResolver(sliderSchema) as any,
        defaultValues: {
            title: "",
            animationType: "fade",
            isActive: true,
            actionButtonText: "",
            actionButtonLink: "",
        },
    });

    const previewUrlsRef = useRef<string[]>([]);

    useEffect(() => {
        previewUrlsRef.current = previewUrls;
    }, [previewUrls]);

    useEffect(() => {
        return () => {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            previewUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
        };
    }, []);

    useEffect(() => {
        if (slider) {
            reset({
                title: slider.title,
                animationType: slider.animationType,
                isActive: slider.isActive,
                actionButtonText: slider.actionButton?.text || "",
                actionButtonLink: slider.actionButton?.link || "",
            });
        } else {
            reset({
                title: "",
                animationType: "fade",
                isActive: true,
                actionButtonText: "",
                actionButtonLink: "",
            });
        }
        setSelectedImages([]);
        setPreviewUrls([]);
    }, [slider, reset, isOpen]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setSelectedImages((prev) => [...prev, ...files]);

        const urls = files.map(file => URL.createObjectURL(file));
        setPreviewUrls((prev) => [...prev, ...urls]);
    };

    const removeNewImage = (index: number) => {
        setSelectedImages((prev) => prev.filter((_, i) => i !== index));
        setPreviewUrls((prev) => {
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleDeleteExistingImage = async (imageId: string) => {
        if (!slider) return;
        try {
            await deleteSliderImage({ sliderId: slider._id, imageId }).unwrap();
            toast.success("Image deleted successfully");
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to delete image");
        }
    };

    const onSubmit = async (data: SliderFormData) => {
        try {
            const formData = new FormData();
            formData.append("title", data.title);
            formData.append("animationType", data.animationType);
            formData.append("isActive", String(data.isActive));

            if (data.actionButtonText) {
                formData.append("actionButton[text]", data.actionButtonText);
            }
            if (data.actionButtonLink) {
                formData.append("actionButton[link]", data.actionButtonLink);
            }

            selectedImages.forEach((image) => {
                formData.append("sliderImages", image);
            });

            if (slider) {
                await updateSlider({ id: slider._id, formData }).unwrap();
                toast.success("Slider updated successfully");
            } else {
                if (selectedImages.length === 0) {
                    toast.error("Please select at least one image");
                    return;
                }
                await createSlider(formData).unwrap();
                toast.success("Slider created successfully");
            }
            onClose();
        } catch (error: any) {
            toast.error(error?.data?.message || "Something went wrong");
        }
    };

    const cleanImageUrl = useCallback((url: string) => {
        if (!url) return "";
        return url.trim().replace(/`/g, "");
    }, []);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-100 dark:border-gray-800"
                    >
                        {/* HEADER */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {slider ? "Edit Slider" : "Add New Slider"}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Fill in the details for your homepage slider.
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* FORM */}
                        <form
                            id="slider-form"
                            onSubmit={handleSubmit(onSubmit) as React.FormEventHandler<HTMLFormElement>}
                            className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Title */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Slider Title
                                    </label>
                                    <input
                                        {...register("title")}
                                        className={`w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border ${errors.title ? "border-red-500" : "border-gray-100 dark:border-gray-700"
                                            } focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all dark:text-white`}
                                        placeholder="Enter slider title"
                                    />
                                    {errors.title && (
                                        <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.title.message}</p>
                                    )}
                                </div>

                                {/* Animation Type */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Animation Type
                                    </label>
                                    <select
                                        {...register("animationType")}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all dark:text-white appearance-none cursor-pointer"
                                    >
                                        <option value="fade">Fade</option>
                                        <option value="slide">Slide</option>
                                        <option value="zoom">Zoom</option>
                                        <option value="none">None</option>
                                    </select>
                                </div>

                                {/* Status */}
                                <div className="flex items-center gap-3 h-full pt-6">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            {...register("isActive")}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                                        <span className="ml-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Active Status
                                        </span>
                                    </label>
                                </div>

                                {/* Action Button Text */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Button Text (Optional)
                                    </label>
                                    <input
                                        {...register("actionButtonText")}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all dark:text-white"
                                        placeholder="e.g. Shop Now"
                                    />
                                </div>

                                {/* Action Button Link */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Button Link (Optional)
                                    </label>
                                    <input
                                        {...register("actionButtonLink")}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all dark:text-white"
                                        placeholder="https://example.com"
                                    />
                                    {errors.actionButtonLink && (
                                        <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.actionButtonLink.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                                    Slider Images
                                </label>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                                    {/* Existing Images */}
                                    {slider?.images.map((img) => (
                                        <div key={img._id} className="relative aspect-video rounded-2xl overflow-hidden group bg-gray-100 dark:bg-gray-800">
                                            <Image
                                                src={cleanImageUrl(img.url)}
                                                alt="Slider"
                                                fill
                                                className="object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteExistingImage(img._id)}
                                                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {/* New Image Previews */}
                                    {previewUrls.map((url, index) => (
                                        <div key={index} className="relative aspect-video rounded-2xl overflow-hidden group bg-gray-100 dark:bg-gray-800">
                                            <img
                                                src={url}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => removeNewImage(index)}
                                                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Upload Button */}
                                    <label className="relative aspect-video rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all flex flex-col items-center justify-center cursor-pointer group bg-gray-50/50 dark:bg-gray-800/50">
                                        <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-emerald-500 transition-colors mb-2" />
                                        <span className="text-xs font-medium text-gray-500 group-hover:text-emerald-500 transition-colors">
                                            Upload Image
                                        </span>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                                <p className="text-[11px] text-gray-400">
                                    Recommended size: 1920x600px. You can upload multiple images.
                                </p>
                            </div>
                        </form>

                        {/* FOOTER */}
                        <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3 bg-gray-50/50 dark:bg-gray-900/50">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="slider-form"
                                disabled={isCreating || isUpdating}
                                className="flex items-center justify-center gap-2 px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-600/20 active:scale-95 disabled:opacity-70 disabled:active:scale-100"
                            >
                                {isCreating || isUpdating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        {slider ? "Updating..." : "Creating..."}
                                    </>
                                ) : (
                                    slider ? "Update Slider" : "Create Slider"
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
