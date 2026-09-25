import { fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";
import { logout, setCredentials } from "../features/auth/authSlice";
import { setCookie, getCookie, deleteCookie } from "@/lib/cookies";

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

    // Access token expired – attempt refresh
    if (result.error?.status === 401) {
        // If already refreshing, wait briefly and retry original request
        if (isRefreshing) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            return rawBaseQuery(args, api, extraOptions);
        }

        isRefreshing = true;

        const state = api.getState() as RootState;
        const refreshToken =
            state.auth.refreshToken ||
            (typeof window !== "undefined" ? getCookie("refreshToken") || localStorage.getItem("refreshToken") : null);

        if (!refreshToken) {
            deleteCookie("accessToken");
            deleteCookie("refreshToken");
            api.dispatch(logout());
            isRefreshing = false;
            return result;
        }

        try {
            const refreshResult = await rawBaseQuery(
                {
                    url: "/auth/admin/refresh-token",
                    method: "POST",
                    body: { refreshToken },
                },
                api,
                extraOptions
            );

            if (refreshResult.data) {
                const refreshData = refreshResult.data as {
                    data: { accessToken: string; refreshToken?: string };
                };

                const newAccessToken = refreshData.data?.accessToken;
                const newRefreshToken = refreshData.data?.refreshToken || refreshToken;

                if (newAccessToken) {
                    // Update Redux state
                    api.dispatch(
                        setCredentials({
                            user: (api.getState() as RootState).auth.user,
                            accessToken: newAccessToken,
                            refreshToken: newRefreshToken,
                        })
                    );

                    // Update browser cookies so Next.js proxy sees the active tokens
                    setCookie("accessToken", newAccessToken);
                    if (newRefreshToken) {
                        setCookie("refreshToken", newRefreshToken, 7 * 24 * 60 * 60);
                    }

                    // Sync socket authentication token immediately
                    try {
                        const { updateSocketAuthToken } = await import("@/lib/socket");
                        updateSocketAuthToken(newAccessToken);
                    } catch {}

                    // Retry the original failed request with the new token
                    result = await rawBaseQuery(args, api, extraOptions);
                } else {
                    deleteCookie("accessToken");
                    deleteCookie("refreshToken");
                    api.dispatch(logout());
                }
            } else {
                // Refresh failed – clear everything and redirect to login
                deleteCookie("accessToken");
                deleteCookie("refreshToken");
                api.dispatch(logout());
            }
        } finally {
            isRefreshing = false;
        }
    }

    return result;
};
