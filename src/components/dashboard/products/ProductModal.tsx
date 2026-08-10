"use client";

import { useEffect, useRef, useState } from "react";
import { X, UploadCloud, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateProductMutation, useUpdateProductMutation } from "@/redux/features/product/productApi";
import { useGetCategoriesQuery } from "@/redux/features/category/categoryApi";
import { useGetBrandsQuery } from "@/redux/features/brand/brandApi";
import { Product } from "@/redux/features/product/productTypes";
import toast from "react-hot-toast";

// ─── Schemas ────────────────────────────────────────────────────────────────

const baseFields = {
    name: z.string().min(1, "Product name is required").max(150, "Name too long"),
    sku: z.string().min(1, "SKU is required").max(50, "SKU too long"),
    description: z.string().max(2000, "Description too long").optional(),
    measurementValue: z.coerce.number().min(0, "Value must be positive"),
    measurementUnit: z.enum(["kg", "g", "pc"]),
    price: z.coerce.number().min(0, "Price must be positive"),
    // Use optional number only — empty string handled via UI default as undefined
    discountPrice: z.coerce
        .number()
        .min(0, "Discount price must be positive")
        .optional()
        .or(z.literal(undefined)),
    stock: z.coerce.number().min(0, "Stock must be non-negative"),
    category: z.string().min(1, "Category is required"),
    brand: z.string().min(1, "Brand is required"),
    nutrition: z.string().max(1000, "Nutrition info too long").optional(),
    isFeatured: z.boolean().default(false),
    isActive: z.boolean().default(true),
};

const createSchema = z
    .object(baseFields)
    .refine(
        (data) => {
            if (data.discountPrice === undefined) return true;
            return data.discountPrice < data.price;
        },
        { message: "Discount price must be less than regular price", path: ["discountPrice"] }
    );

const updateSchema = z
    .object({
        name: baseFields.name.optional(),
        sku: baseFields.sku.optional(),
        description: baseFields.description,
        measurementValue: baseFields.measurementValue.optional(),
        measurementUnit: baseFields.measurementUnit.optional(),
        price: baseFields.price.optional(),
        discountPrice: baseFields.discountPrice,
        stock: baseFields.stock.optional(),
        category: z.string().optional(),
        brand: z.string().optional(),
        nutrition: baseFields.nutrition,
        isFeatured: z.boolean().optional(),
        isActive: z.boolean().optional(),
    })
    .refine(
        (data) => {
            if (data.discountPrice === undefined || data.price === undefined) return true;
            return data.discountPrice < data.price;
        },
        { message: "Discount price must be less than regular price", path: ["discountPrice"] }
    );

// ─── Types ───────────────────────────────────────────────────────────────────

type ProductFormData = z.infer<typeof createSchema>;

// ─── Default values ───────────────────────────────────────────────────────────

const FORM_DEFAULTS: ProductFormData = {
    name: "",
    sku: "",
    description: "",
    measurementValue: 1,
    measurementUnit: "pc",
    price: 0,
    discountPrice: undefined,
    stock: 0,
    category: "",
    brand: "",
    nutrition: "",
    isFeatured: false,
    isActive: true,
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    product?: Product | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProductModal({ isOpen, onClose, product }: ProductModalProps) {
    const isEdit = !!product;

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const { data: categoriesData } = useGetCategoriesQuery({ limit: 100 });
    const { data: brandsData } = useGetBrandsQuery({ limit: 100 });
    const categories = categoriesData?.data ?? [];
    const brands = brandsData?.data ?? [];

    const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
    const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
    const isLoading = isCreating || isUpdating;

    const [isGeneratingAI, setIsGeneratingAI] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        getValues,
        setValue,
        formState: { errors },
    } = useForm<ProductFormData>({
        // Cast is safe: updateSchema is a relaxed superset of createSchema.
        // Both resolve to compatible shapes at runtime; TS just can't infer it.
        resolver: zodResolver(isEdit ? updateSchema : createSchema) as Resolver<ProductFormData>,
        defaultValues: FORM_DEFAULTS,
    });

    // ── AI Content Auto Generator ──────────────────────────────────────────────

    const handleAutoGenerate = async () => {
        const currentName = getValues("name")?.trim();
        if (!currentName) {
            toast.error("Please enter a product name first to generate content");
            return;
        }

        const currentCategoryId = getValues("category");
        const currentBrandId = getValues("brand");
        const currentUnit = getValues("measurementUnit");

        const categoryObj = categories.find((c) => c._id === currentCategoryId);
        const brandObj = brands.find((b) => b._id === currentBrandId);

        setIsGeneratingAI(true);
        const toastId = toast.loading("Generating product content with AI...");

        try {
            const response = await fetch("/api/ai/generate-product", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: currentName,
                    categoryName: categoryObj?.name,
                    brandName: brandObj?.name,
                    measurementUnit: currentUnit,
                }),
            });

            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || "Failed to generate AI content");
            }

            const { description, nutrition, suggestedSku } = result.data;

            if (description) {
                setValue("description", description, { shouldValidate: true, shouldDirty: true });
            }
            if (nutrition) {
                setValue("nutrition", nutrition, { shouldValidate: true, shouldDirty: true });
            }
            if (suggestedSku && !getValues("sku")?.trim()) {
                setValue("sku", suggestedSku, { shouldValidate: true, shouldDirty: true });
            }

            toast.success("Product content generated successfully!", { id: toastId });
        } catch (error: any) {
            console.error("AI Generation Error:", error);
            toast.error(error?.message || "Failed to generate AI content", { id: toastId });
        } finally {
            setIsGeneratingAI(false);
        }
    };

    // ── Populate form on open ──────────────────────────────────────────────────

    useEffect(() => {
        if (!isOpen) return;

        if (product) {
            reset({
                name: product.name ?? "",
                sku: product.sku ?? "",
                description: product.description ?? "",
                measurementValue: product.measurement?.value ?? 1,
                measurementUnit: (product.measurement?.unit as "kg" | "g" | "pc") ?? "pc",
                price: product.price ?? 0,
                discountPrice: product.discountPrice ?? undefined,
                stock: product.stock ?? 0,
                category: product.category?._id ?? "",
                brand: product.brand?._id ?? "",
                nutrition: product.nutrition ?? "",
                isFeatured: product.isFeatured ?? false,
                isActive: product.isActive ?? true,
            });
            setPreviewUrl(product.image?.url ?? null);
        } else {
            reset({
                ...FORM_DEFAULTS,
                category: categories[0]?._id ?? "",
                brand: brands[0]?._id ?? "",
            });
            setPreviewUrl(null);
        }

        setFile(null);
    }, [isOpen, product, reset, categories, brands]);

    // ── File handling ─────────────────────────────────────────────────────────

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (!selected) return;
        setFile(selected);
        setPreviewUrl(URL.createObjectURL(selected));
    };

    // ── Submit ────────────────────────────────────────────────────────────────

    const onSubmit = async (data: ProductFormData) => {
        if (!isEdit && !file) {
            toast.error("A product image is required");
            return;
        }

        const formData = new FormData();

        formData.append("name", data.name.trim());
        formData.append("sku", data.sku.trim().toUpperCase());
        if (data.description?.trim()) formData.append("description", data.description.trim());
        formData.append("measurement[value]", String(data.measurementValue));
        formData.append("measurement[unit]", data.measurementUnit);
        formData.append("price", String(data.price));
        if (data.discountPrice !== undefined) formData.append("discountPrice", String(data.discountPrice));
        formData.append("stock", String(data.stock));
        formData.append("category", data.category);
        formData.append("brand", data.brand);
        if (data.nutrition?.trim()) formData.append("nutrition", data.nutrition.trim());
        formData.append("isFeatured", String(data.isFeatured));
        formData.append("isActive", String(data.isActive));
        if (file) formData.append("image", file);

        try {
            if (isEdit) {
                await updateProduct({ id: product!._id, data: formData }).unwrap();
                toast.success("Product updated successfully");
            } else {
                await createProduct(formData).unwrap();
                toast.success("Product created successfully");
            }
            onClose();
        } catch (error: unknown) {
            const message =
                error instanceof Object && "data" in error
                    ? (error as { data?: { message?: string } }).data?.message
                    : undefined;
            toast.error(message ?? "Something went wrong");
        }
    };

    // ── Shared input class helper ─────────────────────────────────────────────

    const inputCls = (hasError: boolean) =>
        `w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border ${
            hasError ? "border-red-500" : "border-gray-200 dark:border-gray-700"
        } rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm disabled:opacity-60`;

    // ─── Render ───────────────────────────────────────────────────────────────

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
                            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                            className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden pointer-events-auto max-h-[90vh] overflow-y-auto"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {isEdit ? "Edit Product" : "Create New Product"}
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {isEdit ? "Update product details below." : "Add a new product to the catalog."}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all disabled:opacity-50"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">

                                {/* Name & SKU */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Product Name {!isEdit && <span className="text-red-500">*</span>}
                                        </label>
                                        <input
                                            {...register("name")}
                                            type="text"
                                            placeholder="e.g. Organic Heirloom Kale"
                                            className={inputCls(!!errors.name)}
                                            disabled={isLoading}
                                        />
                                        {errors.name && <p className="text-[10px] text-red-500">{errors.name.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            SKU {!isEdit && <span className="text-red-500">*</span>}
                                        </label>
                                        <input
                                            {...register("sku")}
                                            type="text"
                                            placeholder="e.g. LFG-001-KALE"
                                            className={inputCls(!!errors.sku)}
                                            disabled={isLoading}
                                        />
                                        {errors.sku && <p className="text-[10px] text-red-500">{errors.sku.message}</p>}
                                    </div>
                                </div>

                                {/* Category & Brand */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Category {!isEdit && <span className="text-red-500">*</span>}
                                        </label>
                                        <select
                                            {...register("category")}
                                            className={inputCls(!!errors.category)}
                                            disabled={isLoading}
                                        >
                                            <option value="" disabled>Select Category</option>
                                            {categories.map((cat) => (
                                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                                            ))}
                                        </select>
                                        {errors.category && <p className="text-[10px] text-red-500">{errors.category.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Brand {!isEdit && <span className="text-red-500">*</span>}
                                        </label>
                                        <select
                                            {...register("brand")}
                                            className={inputCls(!!errors.brand)}
                                            disabled={isLoading}
                                        >
                                            <option value="" disabled>Select Brand</option>
                                            {brands.map((b) => (
                                                <option key={b._id} value={b._id}>{b.name}</option>
                                            ))}
                                        </select>
                                        {errors.brand && <p className="text-[10px] text-red-500">{errors.brand.message}</p>}
                                    </div>
                                </div>

                                {/* Price, Discount Price & Stock */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Price ($) {!isEdit && <span className="text-red-500">*</span>}
                                        </label>
                                        <input
                                            {...register("price")}
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="3.49"
                                            className={inputCls(!!errors.price)}
                                            disabled={isLoading}
                                        />
                                        {errors.price && <p className="text-[10px] text-red-500">{errors.price.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Discount Price ($)
                                        </label>
                                        <input
                                            {...register("discountPrice")}
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="2.99"
                                            className={inputCls(!!errors.discountPrice)}
                                            disabled={isLoading}
                                        />
                                        {errors.discountPrice && <p className="text-[10px] text-red-500">{errors.discountPrice.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Stock {!isEdit && <span className="text-red-500">*</span>}
                                        </label>
                                        <input
                                            {...register("stock")}
                                            type="number"
                                            min="0"
                                            placeholder="42"
                                            className={inputCls(!!errors.stock)}
                                            disabled={isLoading}
                                        />
                                        {errors.stock && <p className="text-[10px] text-red-500">{errors.stock.message}</p>}
                                    </div>
                                </div>

                                {/* Measurement */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Measurement Value {!isEdit && <span className="text-red-500">*</span>}
                                        </label>
                                        <input
                                            {...register("measurementValue")}
                                            type="number"
                                            step="any"
                                            min="0"
                                            placeholder="1"
                                            className={inputCls(!!errors.measurementValue)}
                                            disabled={isLoading}
                                        />
                                        {errors.measurementValue && <p className="text-[10px] text-red-500">{errors.measurementValue.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Measurement Unit {!isEdit && <span className="text-red-500">*</span>}
                                        </label>
                                        <select
                                            {...register("measurementUnit")}
                                            className={inputCls(!!errors.measurementUnit)}
                                            disabled={isLoading}
                                        >
                                            <option value="kg">kg</option>
                                            <option value="g">g</option>
                                            <option value="pc">pc</option>
                                        </select>
                                        {errors.measurementUnit && <p className="text-[10px] text-red-500">{errors.measurementUnit.message}</p>}
                                    </div>
                                </div>

                                {/* Nutrition */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Nutrition Info
                                    </label>
                                    <input
                                        {...register("nutrition")}
                                        type="text"
                                        placeholder="e.g. Calories: 120, Protein: 2g"
                                        className={inputCls(!!errors.nutrition)}
                                        disabled={isLoading}
                                    />
                                    {errors.nutrition && <p className="text-[10px] text-red-500">{errors.nutrition.message}</p>}
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Description
                                        </label>
                                        <button
                                            type="button"
                                            onClick={handleAutoGenerate}
                                            disabled={isLoading || isGeneratingAI}
                                            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-xs transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 cursor-pointer"
                                            title="Auto generate description, nutrition info & SKU with Gemini AI"
                                        >
                                            {isGeneratingAI ? (
                                                <>
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    <span>Generating...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="w-3.5 h-3.5" />
                                                    <span>Auto Generate Content</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <textarea
                                        {...register("description")}
                                        placeholder="Organic farm fresh greens..."
                                        rows={3}
                                        className={`${inputCls(!!errors.description)} resize-none`}
                                        disabled={isLoading || isGeneratingAI}
                                    />
                                    {errors.description && <p className="text-[10px] text-red-500">{errors.description.message}</p>}
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
                                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
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

                                {/* Toggles */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {(
                                        [
                                            { field: "isActive", label: "Active Status", sub: "Visible in shop." },
                                            { field: "isFeatured", label: "Featured Product", sub: "Highlight in app." },
                                        ] as const
                                    ).map(({ field, label, sub }) => (
                                        <div
                                            key={field}
                                            className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-gray-100 dark:border-gray-800"
                                        >
                                            <div>
                                                <p className="text-xs font-bold text-gray-900 dark:text-white">{label}</p>
                                                <p className="text-[10px] text-gray-500">{sub}</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    {...register(field)}
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    disabled={isLoading}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600" />
                                            </label>
                                        </div>
                                    ))}
                                </div>

                                {/* Actions */}
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
                                                <span>{isEdit ? "Updating..." : "Creating..."}</span>
                                            </>
                                        ) : (
                                            <span>{isEdit ? "Update Product" : "Create Product"}</span>
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