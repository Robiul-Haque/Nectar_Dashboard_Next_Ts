export interface Product {
    _id: string;
    name: string;
    slug: string;
    sku: string;
    description?: string;
    measurement: {
        value: number;
        unit: "kg" | "g" | "pc";
    };
    price: number;
    discountPrice?: number;
    stock: number;
    image?: {
        url: string;
        publicId: string;
    };
    category: {
        _id: string;
        name: string;
    };
    brand: {
        _id: string;
        name: string;
    };
    nutrition?: string;
    averageRating?: number;
    totalReviews?: number;
    isFeatured?: boolean;
    isActive?: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface GetProductsResponse {
    success: boolean;
    message: string;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    data: Product[];
}

export interface ProductStatsData {
    totalProducts: number;
    lowStockAlerts: {
        total: number;
        outOfStock: number;
    };
    stockHealth: number;
    totalValuation: number;
}

export interface GetProductStatsResponse {
    success: boolean;
    message: string;
    data: ProductStatsData;
}

export interface GenericResponse {
    success: boolean;
    message: string;
}
