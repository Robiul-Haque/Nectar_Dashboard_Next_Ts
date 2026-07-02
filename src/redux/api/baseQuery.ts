import { fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";
import { logout, setCredentials } from "../features/auth/authSlice";
import { setCookie, deleteCookie } from "@/lib/cookies";

const rawBaseQuery = fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
        const token = (getState() as RootState).auth.accessToken;
        if (token) headers.set("authorization", `Bearer ${token}`);
        return headers;
    },
});

// Mutex to prevent multiple simultaneous refresh calls (race condition fix)
let isRefreshing = false;

export const baseQueryWithRefresh: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
    args,
    api,
    extraOptions
) => {
    let result = await rawBaseQuery(args, api, extraOptions);

    // Access token expired — attempt refresh
    if (result.error?.status === 401) {
        // If already refreshing, wait briefly and retry original request
        if (isRefreshing) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            return rawBaseQuery(args, api, extraOptions);
        }

        isRefreshing = true;

        try {
            const refreshResult = await rawBaseQuery(
                {
                    url: "/auth/admin/refresh-token",
                    method: "POST",
                },
                api,
                extraOptions
            );

            if (refreshResult.data) {
                const state = api.getState() as RootState;
                const refreshData = refreshResult.data as {
                    data: { accessToken: string };
                };

                const newAccessToken = refreshData.data.accessToken;

                // Update Redux state
                api.dispatch(
                    setCredentials({
                        user: state.auth.user,
                        accessToken: newAccessToken,
                    })
                );

                // Update browser cookie so Next.js middleware sees the new token
                setCookie("accessToken", newAccessToken);

                // Retry the original failed request with the new token
                result = await rawBaseQuery(args, api, extraOptions);
            } else {
                // Refresh failed — clear everything and redirect to login
                deleteCookie("accessToken");
                api.dispatch(logout());
            }
        } finally {
            isRefreshing = false;
        }
    }

    return result;
};