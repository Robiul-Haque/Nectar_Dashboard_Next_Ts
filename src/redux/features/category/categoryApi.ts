import { baseApi } from "../../api/baseApi";
import { tagTypes } from "../../api/tagTypes";
import {
    GetCategoriesResponse,
    GetCategoryStatsResponse,
    GenericResponse,
} from "./categoryTypes";

export const categoryApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getCategories: builder.query<
            GetCategoriesResponse,
            { page?: number; limit?: number; search?: string }
        >({
            query: (params) => {
                const queryParams = new URLSearchParams();
                if (params?.page)
                    queryParams.append("page", params.page.toString());
                if (params?.limit)
                    queryParams.append("limit", params.limit.toString());
                if (params?.search)
                    queryParams.append("search", params.search);

                return `/category?${queryParams.toString()}`;
            },
            providesTags: [tagTypes.CATEGORY],
        }),

        getCategoryStats: builder.query<GetCategoryStatsResponse, void>({
            query: () => "/category/stats",
            providesTags: [tagTypes.CATEGORY],
        }),

        createCategory: builder.mutation<GenericResponse, FormData>({
            query: (data) => ({
                url: "/category/create",
                method: "POST",
                body: data,
            }),
            invalidatesTags: [tagTypes.CATEGORY],
        }),

        updateCategory: builder.mutation<
            GenericResponse,
            { id: string; data: FormData }
        >({
            query: ({ id, data }) => ({
                url: `/category/update/${id}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: [tagTypes.CATEGORY],
        }),

        deleteCategory: builder.mutation<GenericResponse, string>({
            query: (id) => ({
                url: `/category/delete/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: [tagTypes.CATEGORY],
        }),
    }),
});

export const {
    useGetCategoriesQuery,
    useGetCategoryStatsQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
} = categoryApi;
