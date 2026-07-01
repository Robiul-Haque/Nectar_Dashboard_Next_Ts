import { baseApi } from "../../api/baseApi";
import { tagTypes } from "../../api/tagTypes";
import {
    AdminProfileResponse,
    GetUsersParams,
    GetUsersResponse,
    UpdateAdminProfileResponse,
    GetCustomerDetailsResponse,
    GetCustomerOrdersResponse,
    GetCustomerPaymentSummaryResponse,
    GetCustomerWishlistCartResponse,
    GetCustomerTimelineResponse,
    GetCustomerLoginHistoryResponse,
    GetCustomerChatSummaryResponse,
    GetCustomerNotesResponse,
    AddCustomerNoteParams,
    UpdateCustomerNoteParams,
    DeleteCustomerNoteParams,
    AdminNote
} from "./userTypes";

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
        getAdminProfile: builder.query<AdminProfileResponse, void>({
            query: () => ({
                url: "/user/admin/profile",
                method: "GET",
            }),
            providesTags: [tagTypes.USER],
        }),
        updateAdminProfile: builder.mutation<UpdateAdminProfileResponse, FormData>({
            query: (formData) => ({
                url: "/user/admin/profile-update",
                method: "PUT",
                body: formData,
            }),
            invalidatesTags: [tagTypes.USER],
        }),

        // ─── Admin Customer Dashboard Endpoints ─────────────────────────────────────
        getCustomerDetails: builder.query<GetCustomerDetailsResponse, string>({
            query: (id) => ({
                url: `/admin/customers/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: tagTypes.USER, id }],
        }),
        getCustomerOrders: builder.query<GetCustomerOrdersResponse, { id: string; page?: number; limit?: number }>({
            query: ({ id, page = 1, limit = 10 }) => ({
                url: `/admin/customers/${id}/orders`,
                method: "GET",
                params: { page, limit },
            }),
        }),
        getCustomerPaymentSummary: builder.query<GetCustomerPaymentSummaryResponse, string>({
            query: (id) => ({
                url: `/admin/customers/${id}/payment-summary`,
                method: "GET",
            }),
        }),
        getCustomerWishlistCart: builder.query<GetCustomerWishlistCartResponse, string>({
            query: (id) => ({
                url: `/admin/customers/${id}/wishlist-cart`,
                method: "GET",
            }),
        }),
        getCustomerTimeline: builder.query<GetCustomerTimelineResponse, { id: string; page?: number; limit?: number }>({
            query: ({ id, page = 1, limit = 10 }) => ({
                url: `/admin/customers/${id}/timeline`,
                method: "GET",
                params: { page, limit },
            }),
        }),
        getCustomerLoginHistory: builder.query<GetCustomerLoginHistoryResponse, { id: string; page?: number; limit?: number }>({
            query: ({ id, page = 1, limit = 10 }) => ({
                url: `/admin/customers/${id}/login-history`,
                method: "GET",
                params: { page, limit },
            }),
        }),
        getCustomerChatSummary: builder.query<GetCustomerChatSummaryResponse, string>({
            query: (id) => ({
                url: `/admin/customers/${id}/chat-summary`,
                method: "GET",
            }),
        }),
        unblockCustomer: builder.mutation<{ success: boolean; message: string; data: any }, string>({
            query: (id) => ({
                url: `/admin/customers/${id}/unblock`,
                method: "POST",
            }),
            invalidatesTags: (result, error, id) => [
                tagTypes.USER,
                { type: tagTypes.USER, id }
            ],
        }),
        getCustomerNotes: builder.query<GetCustomerNotesResponse, { id: string; page?: number; limit?: number }>({
            query: ({ id, page = 1, limit = 10 }) => ({
                url: `/admin/customers/${id}/notes`,
                method: "GET",
                params: { page, limit },
            }),
            providesTags: (result, error, { id }) => [{ type: tagTypes.USER, id: `${id}-notes` }],
        }),
        addCustomerNote: builder.mutation<{ success: boolean; message: string; data: AdminNote }, AddCustomerNoteParams>({
            query: ({ id, note }) => ({
                url: `/admin/customers/${id}/notes`,
                method: "POST",
                body: { note },
            }),
            invalidatesTags: (result, error, { id }) => [{ type: tagTypes.USER, id: `${id}-notes` }],
        }),
        updateCustomerNote: builder.mutation<{ success: boolean; message: string; data: AdminNote }, UpdateCustomerNoteParams>({
            query: ({ id, noteId, note }) => ({
                url: `/admin/customers/${id}/notes/${noteId}`,
                method: "PUT",
                body: { note },
            }),
            invalidatesTags: (result, error, { id }) => [{ type: tagTypes.USER, id: `${id}-notes` }],
        }),
        deleteCustomerNote: builder.mutation<{ success: boolean; message: string }, DeleteCustomerNoteParams>({
            query: ({ id, noteId }) => ({
                url: `/admin/customers/${id}/notes/${noteId}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, { id }) => [{ type: tagTypes.USER, id: `${id}-notes` }],
        }),
    }),
});

export const {
    useGetUsersQuery,
    useToggleUserStatusMutation,
    useGetAdminProfileQuery,
    useUpdateAdminProfileMutation,
    useGetCustomerDetailsQuery,
    useGetCustomerOrdersQuery,
    useGetCustomerPaymentSummaryQuery,
    useGetCustomerWishlistCartQuery,
    useGetCustomerTimelineQuery,
    useGetCustomerLoginHistoryQuery,
    useGetCustomerChatSummaryQuery,
    useUnblockCustomerMutation,
    useGetCustomerNotesQuery,
    useAddCustomerNoteMutation,
    useUpdateCustomerNoteMutation,
    useDeleteCustomerNoteMutation,
} = userApi;

