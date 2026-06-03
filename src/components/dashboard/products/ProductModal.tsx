"use client";

import { useState, useEffect, useRef } from "react";
import { X, UploadCloud, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCreateProductMutation, useUpdateProductMutation } from "@/redux/features/product/productApi";
import { useGetCategoriesQuery } from "@/redux/features/category/categoryApi";
import { useGetBrandsQuery } from "@/redux/features/brand/brandApi";
import { Product } from "@/redux/features/product/productTypes";
import toast from "react-hot-toast";

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    product?: Product | null;
}

export default function ProductModal({
    isOpen,
    onClose,
    product,
}: ProductModalProps) {
    const isEdit = !!product;

    const [name, setName] = useState("");
    const [sku, setSku] = useState("");
    const [description, setDescription] = useState("");
    const [measurementValue, setMeasurementValue] = useState<number>(1);
    const [measurementUnit, setMeasurementUnit] = useState<"kg" | "g" | "pc">("pc");
    const [price, setPrice] = useState<number>(0);
    const [discountPrice, setDiscountPrice] = useState<number | "">("");
    const [stock, setStock] = useState<number>(0);
    const [category, setCategory] = useState("");
    const [brand, setBrand] = useState("");
    const [nutrition, setNutrition] = useState("");
    const [isFeatured, setIsFeatured] = useState(false);
    const [isActive, setIsActive] = useState(true);
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch database categories and brands
    const { data: categoriesData } = useGetCategoriesQuery({ limit: 100 });
    const { data: brandsData } = useGetBrandsQuery({ limit: 100 });

    const categories = categoriesData?.data || [];
    const brands = brandsData?.data || [];

    const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
    const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

    const isLoading = isCreating || isUpdating;

    useEffect(() => {
        if (isOpen) {
            if (product) {
                setName(product.name);
                setSku(product.sku);
                setDescription(product.description || "");
                setMeasurementValue(product.measurement?.value ?? 1);
                setMeasurementUnit(product.measurement?.unit ?? "pc");
                setPrice(product.price);
                setDiscountPrice(product.discountPrice !== undefined ? product.discountPrice : "");
                setStock(product.stock);
                setCategory(product.category?._id || "");
                setBrand(product.brand?._id || "");
                setNutrition(product.nutrition || "");
                setIsFeatured(product.isFeatured ?? false);
                setIsActive(product.isActive ?? true);
                setPreviewUrl(product.image?.url || null);
            } else {
                setName("");
                setSku("");
                setDescription("");
                setMeasurementValue(1);
                setMeasurementUnit("pc");
                setPrice(0);
                setDiscountPrice("");
                setStock(0);
                setCategory(categories[0]?._id || "");
                setBrand(brands[0]?._id || "");
                setNutrition("");
                setIsFeatured(false);
                setIsActive(true);
                setPreviewUrl(null);
            }
            setFile(null);
        }
    }, [isOpen, product, categoriesData, brandsData]);

    // Handle lazy loaded category/brand defaulting
    useEffect(() => {
        if (isOpen && !product) {
            if (!category && categories.length > 0) {
                setCategory(categories[0]._id);
            }
            if (!brand && brands.length > 0) {
                setBrand(brands[0]._id);
            }
        }
    }, [categories, brands, isOpen, product, category, brand]);

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
            toast.error("Product name is required");
            return;
        }

        if (!sku.trim()) {
            toast.error("SKU is required");
            return;
        }

        if (!category) {
            toast.error("Category is required");
            return;
        }

        if (!brand) {
            toast.error("Brand is required");
            return;
        }

        if (price < 0) {
            toast.error("Price cannot be negative");
            return;
        }

        if (discountPrice !== "" && Number(discountPrice) >= price) {
            toast.error("Discount price must be less than regular price");
            return;
        }

        if (stock < 0) {
            toast.error("Stock cannot be negative");
            return;
        }

        if (measurementValue < 0) {
            toast.error("Measurement value cannot be negative");
            return;
        }

        if (!isEdit && !file) {
            toast.error("Product image is required for creation");
            return;
        }

        const formData = new FormData();
        formData.append("name", name.trim());
        formData.append("sku", sku.trim().toUpperCase());
        
        if (description.trim()) {
            formData.append("description", description.trim());
        }
        
        formData.append("measurement[value]", measurementValue.toString());
        formData.append("measurement[unit]", measurementUnit);
        formData.append("price", price.toString());
        
        if (discountPrice !== "") {
            formData.append("discountPrice", discountPrice.toString());
        }
        
        formData.append("stock", stock.toString());
        formData.append("category", category);
        formData.append("brand", brand);
        
        if (nutrition.trim()) {
            formData.append("nutrition", nutrition.trim());
        }
        
        formData.append("isFeatured", isFeatured.toString());
        formData.append("isActive", isActive.toString());

        if (file) {
            formData.append("image", file);
        }

        try {
            if (isEdit) {
                await updateProduct({
                    id: product!._id,
                    data: formData,
                }).unwrap();
                toast.success("Product updated successfully");
            } else {
                await createProduct(formData).unwrap();
                toast.success("Product created successfully");
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
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={!isLoading ? onClose : undefined}
                        className="fixed inset-0 z-[100] bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{
                                type: "spring",
                                bounce: 0,
                                duration: 0.3,
                            }}
                            className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden pointer-events-auto max-h-[90vh] overflow-y-auto"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {isEdit ? "Edit Product" : "Create New Product"}
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {isEdit
                                            ? "Update product details below."
                                            : "Add a new product to the catalog."}
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

                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                {/* Name & SKU */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Product Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="e.g. Organic Heirloom Kale"
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm"
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            SKU <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={sku}
                                            onChange={(e) => setSku(e.target.value)}
                                            placeholder="e.g. LFG-001-KALE"
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                {/* Category & Brand */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Category <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm"
                                            disabled={isLoading}
                                        >
                                            <option value="" disabled>Select Category</option>
                                            {categories.map((cat) => (
                                                <option key={cat._id} value={cat._id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Brand <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={brand}
                                            onChange={(e) => setBrand(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm"
                                            disabled={isLoading}
                                        >
                                            <option value="" disabled>Select Brand</option>
                                            {brands.map((b) => (
                                                <option key={b._id} value={b._id}>
                                                    {b.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Price, Discount Price & Stock */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Price ($) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={price}
                                            onChange={(e) => setPrice(Number(e.target.value))}
                                            placeholder="3.49"
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm"
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Discount Price ($)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={discountPrice}
                                            onChange={(e) => setDiscountPrice(e.target.value === "" ? "" : Number(e.target.value))}
                                            placeholder="2.99"
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm"
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Stock <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={stock}
                                            onChange={(e) => setStock(Number(e.target.value))}
                                            placeholder="42"
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                {/* Measurement Value & Measurement Unit */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Measurement Value <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            step="any"
                                            min="0"
                                            value={measurementValue}
                                            onChange={(e) => setMeasurementValue(Number(e.target.value))}
                                            placeholder="1"
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm"
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Measurement Unit <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={measurementUnit}
                                            onChange={(e) => setMeasurementUnit(e.target.value as any)}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm"
                                            disabled={isLoading}
                                        >
                                            <option value="kg">kg</option>
                                            <option value="g">g</option>
                                            <option value="pc">pc</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Nutrition Info */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Nutrition Info
                                    </label>
                                    <input
                                        type="text"
                                        value={nutrition}
                                        onChange={(e) => setNutrition(e.target.value)}
                                        placeholder="e.g. Calories: 120, Protein: 2g"
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm"
                                        disabled={isLoading}
                                    />
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Description
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Organic farm fresh greens..."
                                        rows={3}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm resize-none"
                                        disabled={isLoading}
                                    />
                                </div>

                                {/* Image Upload */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Product Image {!isEdit && <span className="text-red-500">*</span>}
                                    </label>
                                    <div
                                        onClick={() => !isLoading && fileInputRef.current?.click()}
                                        className={`relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
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
                                            <div className="flex flex-col items-center space-y-3">
                                                <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-900">
                                                    <img
                                                        src={previewUrl}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                                    Click to change image
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center space-y-2">
                                                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                                    <UploadCloud className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                        Click to upload image
                                                    </p>
                                                    <p className="text-[10px] text-gray-500 mt-0.5">
                                                        PNG, JPG, JPEG or SVG (max. 2MB)
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Active & Featured Toggles */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Active Status */}
                                    <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-gray-100 dark:border-gray-800">
                                        <div>
                                            <p className="text-xs font-bold text-gray-900 dark:text-white">
                                                Active Status
                                            </p>
                                            <p className="text-[10px] text-gray-500">
                                                Visible in shop.
                                            </p>
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

                                    {/* Featured Status */}
                                    <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-gray-100 dark:border-gray-800">
                                        <div>
                                            <p className="text-xs font-bold text-gray-900 dark:text-white">
                                                Featured Product
                                            </p>
                                            <p className="text-[10px] text-gray-500">
                                                Highlight in app.
                                            </p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={isFeatured}
                                                onChange={(e) => setIsFeatured(e.target.checked)}
                                                disabled={isLoading}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                                        </label>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        disabled={isLoading}
                                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-50 text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all shadow-lg shadow-emerald-600/20 active:scale-95 disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2 text-sm"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : isEdit ? (
                                            "Update Product"
                                        ) : (
                                            "Create Product"
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
