import { baseApi } from "@/redux/api/baseApi";

export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        adminLogin: builder.mutation({
            query: (body) => ({
                url: "/auth/admin/signup",
                method: "POST",
                body,
            }),

            // ✅ ONLY TAGS / CACHE CONTROL HERE
            invalidatesTags: ["AUTH"],
        }),

        getProfile: builder.query({
            query: () => ({
                url: "/user/profile",
                method: "GET",
            }),
            providesTags: ["AUTH"],
        }),
    }),
});

export const {
    useAdminLoginMutation,
    useGetProfileQuery,
} = authApi;