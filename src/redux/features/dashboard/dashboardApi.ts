import { baseApi } from "../../api/baseApi";
import { tagTypes } from "../../api/tagTypes";

export interface DashboardAnalyticsData {
    cards: {
        totalSales: number;
        dailyOrders: number;
        newCustomers: number;
        outOfStock: number;
    };
    salesOverview: {
        weekly: {
            dayNumber: number;
            day: string;
            revenue: number;
            orders: number;
        }[];
        monthly: {
            date: string;
            revenue: number;
            orders: number;
        }[];
    };
    popularProducts: {
        productId: string;
        name: string;
        slug: string;
        image: string;
        price: number;
        stock: number;
        totalSold: number;
    }[];
}

export interface DashboardAnalyticsResponse {
    success: boolean;
    message: string;
    data: DashboardAnalyticsData;
}

export const dashboardApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getDashboardStats: builder.query<DashboardAnalyticsResponse, void>({
            query: () => "/dashboard/stats",
            providesTags: [tagTypes.DASHBOARD],
        }),
    }),
});

export const { useGetDashboardStatsQuery } = dashboardApi;
