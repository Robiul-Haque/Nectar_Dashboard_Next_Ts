export interface CategoryIcon {
    url: string;
    publicId: string;
}

export interface Category {
    _id: string;
    name: string;
    description: string;
    icon: CategoryIcon;
    isActive: boolean;
    isFeatured: boolean;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
    productCount: number;
}

export interface GetCategoriesResponse {
    success: boolean;
    message: string;
    pagination: {
        total: number;
        page: number;
        limit: number;
    };
    data: Category[];
}

export interface CategoryStatsData {
    totalCategories: number;
    activeItems: number;
    stockHealth: number;
}

export interface GetCategoryStatsResponse {
    success: boolean;
    message: string;
    data: CategoryStatsData;
}

export interface GenericResponse {
    success: boolean;
    message: string;
}
