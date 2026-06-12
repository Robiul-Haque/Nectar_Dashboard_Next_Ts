import { baseApi } from "../../api/baseApi";
import { tagTypes } from "../../api/tagTypes";
import { GetChatsParams, GetChatsResponse, CreateChatRequest, Chat, GetMessagesParams, GetMessagesResponse, SendMessageRequest, Message } from "./chatTypes";

export const chatApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getChats: builder.query<GetChatsResponse, GetChatsParams>({
            query: (params) => ({
                url: "/chat",
                method: "GET",
                params: params,
            }),
            providesTags: [tagTypes.CHAT],
        }),

        createChat: builder.mutation<{ success: boolean; message: string; data: Chat }, CreateChatRequest>({
            query: (data) => ({
                url: "/chat",
                method: "POST",
                body: data,
            }),
            invalidatesTags: [tagTypes.CHAT],
        }),

        getMessages: builder.query<Message[], GetMessagesParams>({
            query: ({ chatId, ...params }) => ({
                url: `/message/${chatId}`,
                method: "GET",
                params: params,
            }),
            transformResponse: (response: GetMessagesResponse) => {
                // Extract nested data and reverse to show oldest at top
                return response.data.data.reverse();
            },
            providesTags: (result, error, arg) => [{ type: tagTypes.CHAT, id: arg.chatId }],
        }),

        sendMessage: builder.mutation<{ success: boolean; message: string; data: Message }, SendMessageRequest>({
            query: (data) => ({
                url: "/message/send",
                method: "POST",
                body: data,
            }),
            invalidatesTags: (result, error, arg) => [
                tagTypes.CHAT,
                { type: tagTypes.CHAT, id: arg.chatId },
            ],
        }),

        markAsRead: builder.mutation<{ success: boolean; message: string }, string>({
            query: (chatId) => ({
                url: `/message/read/${chatId}`,
                method: "PATCH",
            }),
            invalidatesTags: (result, error, arg) => [{ type: tagTypes.CHAT, id: arg }],
        }),

        deleteMessage: builder.mutation<{ success: boolean; message: string }, string>({
            query: (messageId) => ({
                url: `/message/${messageId}`,
                method: "DELETE",
            }),
            invalidatesTags: [tagTypes.CHAT],
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetChatsQuery,
    useCreateChatMutation,
    useGetMessagesQuery,
    useSendMessageMutation,
    useMarkAsReadMutation,
    useDeleteMessageMutation,
} = chatApi;
