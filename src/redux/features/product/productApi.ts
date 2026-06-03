import { baseApi } from "../../api/baseApi";
import { tagTypes } from "../../api/tagTypes";
import {
    GetProductsResponse,
    GetProductStatsResponse,
    GenericResponse,
} from "./productTypes";

export const productApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getProducts: builder.query<
            GetProductsResponse,
            { page?: number; limit?: number; search?: string; category?: string; brand?: string; active?: boolean }
        >({
            query: (params) => {
                const queryParams = new URLSearchParams();
                if (params?.page)
                    queryParams.append("page", params.page.toString());
                if (params?.limit)
                    queryParams.append("limit", params.limit.toString());
                if (params?.search)
                    queryParams.append("search", params.search);
                if (params?.category)
                    queryParams.append("category", params.category);
                if (params?.brand)
                    queryParams.append("brand", params.brand);
                if (params?.active !== undefined)
                    queryParams.append("active", params.active.toString());

                return `/product?${queryParams.toString()}`;
            },
            providesTags: [tagTypes.PRODUCT],
        }),

        getProductStats: builder.query<GetProductStatsResponse, void>({
            query: () => "/product/stats",
            providesTags: [tagTypes.PRODUCT],
        }),

        createProduct: builder.mutation<GenericResponse, FormData>({
            query: (data) => ({
                url: "/product/create",
                method: "POST",
                body: data,
            }),
            invalidatesTags: [tagTypes.PRODUCT],
        }),

        updateProduct: builder.mutation<
            GenericResponse,
            { id: string; data: FormData }
        >({
            query: ({ id, data }) => ({
                url: `/product/${id}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: [tagTypes.PRODUCT],
        }),

        deleteProduct: builder.mutation<GenericResponse, string>({
            query: (id) => ({
                url: `/product/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: [tagTypes.PRODUCT],
        }),
    }),
});

export const {
    useGetProductsQuery,
    useGetProductStatsQuery,
    useCreateProductMutation,
    useUpdateProductMutation,
    useDeleteProductMutation,
} = productApi;
