import { baseApi } from "../../api/baseApi";
import { tagTypes } from "../../api/tagTypes";
import {GetOrdersResponse,UpdateOrderStatusRequest,GenericResponse,} from "./orderTypes";

export const orderApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getOrders: builder.query<GetOrdersResponse, { page?: number; limit?: number; orderStatus?: string }>({
            query: (params) => {
                const queryParams = new URLSearchParams();
                if (params?.page) queryParams.append("page", params.page.toString());
                if (params?.limit) queryParams.append("limit", params.limit.toString());
                if (params?.orderStatus) queryParams.append("orderStatus", params.orderStatus);

                return `/order/admin/all?${queryParams.toString()}`;
            },
            providesTags: [tagTypes.ORDER],
        }),
        updateOrderStatus: builder.mutation<GenericResponse, UpdateOrderStatusRequest>({
            query: ({ id, status }) => ({
                url: `/order/status/${id}`,
                method: "PATCH",
                body: { orderStatus: status },
            }),
            invalidatesTags: [tagTypes.ORDER],
        }),
    }),
});

export const {useGetOrdersQuery,useUpdateOrderStatusMutation} = orderApi;
