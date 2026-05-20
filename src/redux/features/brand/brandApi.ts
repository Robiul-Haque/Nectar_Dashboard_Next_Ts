import { baseApi } from "../../api/baseApi";
import { tagTypes } from "../../api/tagTypes";
import { GetBrandsResponse, GenericResponse } from "./brandTypes";

export const brandApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getBrands: builder.query<GetBrandsResponse, { page?: number; limit?: number; search?: string; active?: boolean }>({
            query: (params) => {
                const queryParams = new URLSearchParams();
                if (params?.page) queryParams.append("page", params.page.toString());
                if (params?.limit) queryParams.append("limit", params.limit.toString());
                if (params?.search) queryParams.append("search", params.search);
                if (params?.active !== undefined) queryParams.append("active", params.active.toString());

                return `/brand?${queryParams.toString()}`;
            },
            providesTags: [tagTypes.BRAND],
        }),
        createBrand: builder.mutation<GenericResponse, FormData>({
            query: (data) => ({
                url: "/brand/create",
                method: "POST",
                body: data,
            }),
            invalidatesTags: [tagTypes.BRAND],
        }),
        updateBrand: builder.mutation<GenericResponse, { id: string; data: FormData }>({
            query: ({ id, data }) => ({
                url: `/brand/update/${id}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: [tagTypes.BRAND],
        }),
        deleteBrand: builder.mutation<GenericResponse, string>({
            query: (id) => ({
                url: `/brand/delete/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: [tagTypes.BRAND],
        }),
    }),
});

export const {
    useGetBrandsQuery,
    useCreateBrandMutation,
    useUpdateBrandMutation,
    useDeleteBrandMutation,
} = brandApi;
