"use client";

import { useState } from "react";
import ProductStats from "@/components/dashboard/products/ProductStats";
import ProductTable from "@/components/dashboard/products/ProductTable";
import ProductModal from "@/components/dashboard/products/ProductModal";
import DeleteProductModal from "@/components/dashboard/products/DeleteProductModal";
import ProductReviewModal from "@/components/dashboard/products/reviews/ProductReviewModal";
import { useGetProductsQuery } from "@/redux/features/product/productApi";
import { Product } from "@/redux/features/product/productTypes";

export default function ProductsPage() {
    // Fetch live products from backend
    const { data: productsData, isLoading, isFetching } = useGetProductsQuery({ limit: 100 });
    const products = productsData?.data || [];
    
    // Modal states
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const handleEdit = (product: Product) => {
        setSelectedProduct(product);
        setIsProductModalOpen(true);
    };

    const handleDeleteClick = (product: Product) => {
        setSelectedProduct(product);
        setIsDeleteModalOpen(true);
    };

    const handleViewReviews = (product: Product) => {
        setSelectedProduct(product);
        setIsReviewModalOpen(true);
    };

    const handleAddClick = () => {
        setSelectedProduct(null);
        setIsProductModalOpen(true);
    };

    return (
        <section className="w-full space-y-6">
            {/* HEADER */}
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Catalog Management
                    </p>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Products
                    </h1>
                </div>
            </div>

            {/* STATS */}
            <ProductStats />

            {/* TABLE */}
            <ProductTable
                products={products}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onViewReviews={handleViewReviews}
                onAddClick={handleAddClick}
                isLoading={isLoading || isFetching}
            />

            {/* MODALS */}
            <ProductModal
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                product={selectedProduct}
            />

            <DeleteProductModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                product={selectedProduct}
            />

            <ProductReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                product={selectedProduct}
            />
        </section>
    );
}