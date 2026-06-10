import { baseApi } from "../../api/baseApi";
import { tagTypes } from "../../api/tagTypes";
import { GetUsersParams, GetUsersResponse } from "./userTypes";

export const userApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getUsers: builder.query<GetUsersResponse, GetUsersParams | void>({
            query: (params) => ({
                url: "/user/all",
                method: "GET",
                params: params || {},
            }),
            providesTags: [tagTypes.USER],
        }),
        toggleUserStatus: builder.mutation<{ success: boolean; message: string }, { id: string; isActive: boolean }>({
            query: ({ id, isActive }) => ({
                url: `/user/toggle-status/${id}`,
                method: "PATCH",
                body: { isActive },
            }),
            invalidatesTags: [tagTypes.USER],
        }),
    }),
});

export const { useGetUsersQuery, useToggleUserStatusMutation } = userApi;
