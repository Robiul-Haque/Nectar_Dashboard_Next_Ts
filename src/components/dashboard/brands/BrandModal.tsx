"use client";

import { useState, useEffect, useRef } from "react";
import { X, UploadCloud, Loader2, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCreateBrandMutation, useUpdateBrandMutation } from "@/redux/features/brand/brandApi";
import { Brand } from "@/redux/features/brand/brandTypes";
import toast from "react-hot-toast";

interface BrandModalProps {
    isOpen: boolean;
    onClose: () => void;
    brand?: Brand | null;
}

export default function BrandModal({ isOpen, onClose, brand }: BrandModalProps) {
    const isEdit = !!brand;
    const [name, setName] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [createBrand, { isLoading: isCreating }] = useCreateBrandMutation();
    const [updateBrand, { isLoading: isUpdating }] = useUpdateBrandMutation();

    const isLoading = isCreating || isUpdating;

    useEffect(() => {
        if (isOpen) {
            if (brand) {
                setName(brand.name);
                setIsActive(brand.isActive);
                setPreviewUrl(brand.logo?.url || null);
            } else {
                setName("");
                setIsActive(true);
                setPreviewUrl(null);
            }
            setFile(null);
        }
    }, [isOpen, brand]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) {
            setFile(selected);
            setPreviewUrl(URL.createObjectURL(selected));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!name.trim()) {
            toast.error("Brand name is required");
            return;
        }

        const formData = new FormData();
        formData.append("name", name.trim());
        if (file) {
            formData.append("logo", file);
        }
        
        if (isEdit) {
            formData.append("isActive", isActive.toString());
        }

        try {
            if (isEdit) {
                await updateBrand({ id: brand!._id, data: formData }).unwrap();
                toast.success("Brand updated successfully");
            } else {
                if (!file) {
                    toast.error("Brand logo is required for creation");
                    return;
                }
                await createBrand(formData).unwrap();
                toast.success("Brand created successfully");
            }
            onClose();
        } catch (error: any) {
            toast.error(error?.data?.message || "Something went wrong");
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
                        onClick={!isLoading ? onClose : undefined}
                        className="fixed inset-0 z-[100] bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm"
                    />

                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                            className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden pointer-events-auto"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {isEdit ? "Edit Brand" : "Create New Brand"}
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {isEdit ? "Update brand details below." : "Add a new brand to the catalog."}
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all disabled:opacity-50"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {/* Name Input */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Brand Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Fresh Farms"
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                        disabled={isLoading}
                                    />
                                </div>

                                {/* File Upload */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Brand Logo {isEdit ? "" : <span className="text-red-500">*</span>}
                                    </label>
                                    <div
                                        onClick={() => !isLoading && fileInputRef.current?.click()}
                                        className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                                            previewUrl 
                                                ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/5" 
                                                : "border-gray-300 dark:border-gray-700 hover:border-emerald-500 hover:bg-gray-50 dark:hover:bg-gray-800"
                                        } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                    >
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            accept="image/*"
                                            className="hidden"
                                            disabled={isLoading}
                                        />
                                        
                                        {previewUrl ? (
                                            <div className="flex flex-col items-center space-y-4">
                                                <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-900">
                                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                                </div>
                                                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                                    Click to change logo
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center space-y-3">
                                                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                                    <UploadCloud className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                        Click to upload
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">SVG, PNG, JPG or GIF (max. 2MB)</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Active Toggle (Edit Only) */}
                                {isEdit && (
                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">Active Status</p>
                                            <p className="text-xs text-gray-500">Enable or disable this brand in the app.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only peer" 
                                                checked={isActive} 
                                                onChange={(e) => setIsActive(e.target.checked)}
                                                disabled={isLoading}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                                        </label>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        disabled={isLoading}
                                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all shadow-lg shadow-emerald-600/20 active:scale-95 disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            isEdit ? "Update Brand" : "Create Brand"
                                        )}
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
