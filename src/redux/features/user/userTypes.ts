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

export interface AdminProfileResponse {
    success: boolean;
    message: string;
    data: {
        _id: string;
        name: string;
        email: string;
        role: string;
        avatar?: {
            url: string | null;
            publicId: string | null;
        } | null;
        isVerified: boolean;
        isActive?: boolean;
        createdAt: string;
    };
}

export interface UpdateAdminProfileResponse {
    success: boolean;
    message: string;
    data: {
        id: string;
        name: string;
        email: string;
        role: string;
        avatar?: {
            url: string | null;
            publicId: string | null;
        } | null;
        isVerified: boolean;
        isActive: boolean;
    };
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
