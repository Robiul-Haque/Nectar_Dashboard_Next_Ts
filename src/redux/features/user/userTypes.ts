export interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    avatar?: {
        url: string;
        publicId: string;
    };
    isVerified: boolean;
    isActive: boolean;
    location?: {
        city: string;
        country: string;
        latitude: number;
        longitude: number;
    };
    createdAt: string;
}

export interface GetUsersResponse {
    success: boolean;
    message: string;
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    data: User[];
}

export interface GetUsersParams {
    search?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
}
