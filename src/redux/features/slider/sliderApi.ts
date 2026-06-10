import { baseApi } from "../../api/baseApi";
import { tagTypes } from "../../api/tagTypes";
import { GetSlidersParams, GetSlidersResponse, SliderMutationResponse } from "./sliderTypes";

export const sliderApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getSliders: builder.query<GetSlidersResponse, GetSlidersParams | void>({
            query: (params) => ({
                url: "/slider/admin",
                method: "GET",
                params: params || {},
            }),
            providesTags: [tagTypes.SLIDER],
        }),
        createSlider: builder.mutation<SliderMutationResponse, FormData>({
            query: (formData) => ({
                url: "/slider/admin",
                method: "POST",
                body: formData,
            }),
            invalidatesTags: [tagTypes.SLIDER],
        }),
        updateSlider: builder.mutation<SliderMutationResponse, { id: string; formData: FormData }>({
            query: ({ id, formData }) => ({
                url: `/slider/admin/${id}`,
                method: "PUT",
                body: formData,
            }),
            invalidatesTags: [tagTypes.SLIDER],
        }),
        deleteSlider: builder.mutation<SliderMutationResponse, string>({
            query: (id) => ({
                url: `/slider/admin/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: [tagTypes.SLIDER],
        }),
        deleteSliderImage: builder.mutation<SliderMutationResponse, { sliderId: string; imageId: string }>({
            query: ({ sliderId, imageId }) => ({
                url: `/slider/admin/${sliderId}/images/${imageId}`,
                method: "DELETE",
            }),
            invalidatesTags: [tagTypes.SLIDER],
        }),
        updateSliderImageOrder: builder.mutation<SliderMutationResponse, { order: string[] }>({
            query: (body) => ({
                url: "/slider/admin/update-order",
                method: "PATCH",
                body,
            }),
            invalidatesTags: [tagTypes.SLIDER],
        }),
    }),
});

export const {
    useGetSlidersQuery,
    useCreateSliderMutation,
    useUpdateSliderMutation,
    useDeleteSliderMutation,
    useDeleteSliderImageMutation,
    useUpdateSliderImageOrderMutation,
} = sliderApi;
