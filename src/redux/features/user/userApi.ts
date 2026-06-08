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
    }),
});

export const { useGetUsersQuery } = userApi;
