export interface ReviewUser {
    name: string;
    avatar: {
        url: string;
        publicId: string;
    };
}

export interface ReviewProduct {
    _id?: string;
    name: string;
}

export interface Review {
    _id: string;
    product: ReviewProduct;
    user: ReviewUser;
    rating: number;
    comment: string;
    createdAt: string;
}

export interface GetReviewsResponse {
    success: boolean;
    message: string;
    pagination: {
        total: number;
        page: number;
        limit: number;
    };
    data: Review[];
}

export interface UpdateReviewRequest {
    reviewId: string;
    rating: number | string;
    comment: string;
}

export interface GenericResponse {
    success: boolean;
    message: string;
    data?: any;
}
