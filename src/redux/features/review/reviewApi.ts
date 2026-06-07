import { baseApi } from "../../api/baseApi";
import { tagTypes } from "../../api/tagTypes";
import {
    GetReviewsResponse,
    UpdateReviewRequest,
    GenericResponse,
} from "./reviewTypes";

export const reviewApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getReviews: builder.query<
            GetReviewsResponse,
            { productId?: string; page?: number; limit?: number }
        >({
            query: (params) => {
                const queryParams = new URLSearchParams();
                
                // If productId is provided, use it (matches getProductReviewsSchema query.productId)
                if (params?.productId) {
                    queryParams.append("productId", params.productId);
                    return `/review?${queryParams.toString()}`;
                }
                
                // Fallback for admin to see all reviews
                if (params?.page) queryParams.append("page", params.page.toString());
                if (params?.limit) queryParams.append("limit", params.limit.toString());
                
                return `/review/admin/all?${queryParams.toString()}`;
            },
            providesTags: [tagTypes.REVIEW],
        }),

        updateReview: builder.mutation<GenericResponse, UpdateReviewRequest>({
            query: (data) => ({
                url: "/review/update",
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: [tagTypes.REVIEW],
        }),

        deleteReview: builder.mutation<GenericResponse, string>({
            query: (id) => ({
                url: `/review/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: [tagTypes.REVIEW],
        }),
    }),
});

export const {
    useGetReviewsQuery,
    useUpdateReviewMutation,
    useDeleteReviewMutation,
} = reviewApi;
