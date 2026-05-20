export interface Brand {
    _id: string;
    name: string;
    logo: {
        url: string;
        publicId: string;
    };
    isActive: boolean;
    createdAt: string;
}

export interface GetBrandsResponse {
    success: boolean;
    message: string;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    data: Brand[];
}

export interface GenericResponse {
    success: boolean;
    message: string;
}
