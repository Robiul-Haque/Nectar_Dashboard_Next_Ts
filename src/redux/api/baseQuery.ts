import {
    fetchBaseQuery,
    BaseQueryFn,
    FetchArgs,
    FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

import type { RootState } from "../store";

import {
    logout,
    setCredentials,
} from "../features/auth/authSlice";

import { API_BASE_URL } from "@/lib/constants/api";

const rawBaseQuery = fetchBaseQuery({
    baseUrl: API_BASE_URL,

    credentials: "include",

    prepareHeaders: (
        headers,
        { getState }
    ) => {
        const token = (
            getState() as RootState
        ).auth.accessToken;

        if (token) {
            headers.set(
                "authorization",
                `Bearer ${token}`
            );
        }

        return headers;
    },
});

export const baseQueryWithRefresh: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (
    args,
    api,
    extraOptions
) => {
        let result = await rawBaseQuery(
            args,
            api,
            extraOptions
        );

        // Access token expired
        if (result.error?.status === 401) {
            const refreshResult =
                await rawBaseQuery(
                    {
                        url: "/auth/admin/refresh-token",
                        method: "POST",
                    },
                    api,
                    extraOptions
                );

            if (refreshResult.data) {
                const state =
                    api.getState() as RootState;

                const refreshData =
                    refreshResult.data as {
                        data: {
                            accessToken: string;
                        };
                    };

                api.dispatch(
                    setCredentials({
                        user: state.auth.user,

                        accessToken:
                            refreshData.data
                                .accessToken,
                    })
                );

                // Retry original request
                result = await rawBaseQuery(
                    args,
                    api,
                    extraOptions
                );
            } else {
                api.dispatch(logout());
            }
        }

        return result;
    };