import { baseApi } from "../../api/baseApi";
import { tagTypes } from "../../api/tagTypes";
import { GetChatsParams, GetChatsResponse, CreateChatRequest, Chat, GetMessagesParams, GetMessagesResponse, SendMessageRequest, Message, ChatDetailsResponse } from "./chatTypes";

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

        getChatDetails: builder.query<ChatDetailsResponse, string>({
            query: (chatId) => ({
                url: `/chat/${chatId}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: tagTypes.CHAT, id }],
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
            transformResponse: (response: any) => {
                // Extract messages array (supports both response.data array and legacy response.data.data array)
                const list = Array.isArray(response?.data)
                    ? response.data
                    : Array.isArray(response?.data?.data)
                    ? response.data.data
                    : [];
                // Clone array before reversing to avoid mutating frozen RTK Query state
                return [...list].reverse();
            },
            providesTags: (result, error, arg) => [{ type: tagTypes.CHAT, id: arg.chatId }],
        }),

        sendMessage: builder.mutation<{ success: boolean; message: string; data: Message }, SendMessageRequest | FormData>({
            query: (data) => ({
                url: "/message/send",
                method: "POST",
                body: data,
            }),
            // Do NOT invalidatesTags here. The backend emits a socket 'newMessage' event
            // after persisting the message. The socket handler in support/page.tsx
            // (handleNewMessage) will inject the message into the RTK cache via
            // updateQueryData. If we ALSO invalidate here, RTK refetches the full
            // message list, which races with the socket injection and can cause duplicates.
            // Instead, we use onQueryStarted to optimistically inject the message
            // returned from the API response directly into the RTK cache.
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data: result } = await queryFulfilled;
                    const sentMessage = result?.data;
                    if (!sentMessage?._id) return;

                    // Extract chatId from either FormData or plain object
                    let chatId: string | null = null;
                    if (arg instanceof FormData) {
                        chatId = arg.get("chatId") as string;
                    } else if (typeof arg === "object" && arg !== null && "chatId" in arg) {
                        chatId = (arg as any).chatId;
                    }
                    if (!chatId) return;

                    const chatIdStr = String(chatId);

                    // Inject into the RTK messages cache for this chat.
                    // The socket event will also arrive and try to add the same message,
                    // but handleNewMessage deduplicates by _id so no duplicate will appear.
                    dispatch(
                        chatApi.util.updateQueryData("getMessages", { chatId: chatIdStr }, (draft) => {
                            if (Array.isArray(draft)) {
                                const exists = draft.some((m) => m._id === sentMessage._id);
                                if (!exists) {
                                    draft.push(sentMessage);
                                }
                            }
                        })
                    );

                    // Also update the chat list preview (lastMessage, lastUpdated).
                    ["all", "customer_support", "driver_support"].forEach((filter) => {
                        dispatch(
                            chatApi.util.updateQueryData("getChats", { page: 1, limit: 50, chatType: filter }, (draft) => {
                                if (draft?.data) {
                                    const targetChat = draft.data.find((c) => String(c._id) === chatIdStr);
                                    if (targetChat) {
                                        targetChat.lastMessage = sentMessage.content || "📷 Image";
                                        targetChat.lastUpdated = sentMessage.createdAt || new Date().toISOString();
                                    }
                                }
                            })
                        );
                    });
                } catch {
                    // If the mutation failed, do nothing — error is handled by the caller.
                }
            },
        }),

        markAsRead: builder.mutation<{ success: boolean; message: string }, string>({
            query: (chatId) => ({
                url: `/message/read/${chatId}`,
                method: "PATCH",
            }),
            invalidatesTags: (result, error, arg) => [{ type: tagTypes.CHAT, id: arg }],
        }),

        updateChatStatus: builder.mutation<{ success: boolean; message: string; data: Chat }, { chatId: string; status: "open" | "resolved" }>({
            query: ({ chatId, status }) => ({
                url: `/chat/${chatId}/status`,
                method: "PATCH",
                body: { status },
            }),
            invalidatesTags: (result, error, arg) => [
                tagTypes.CHAT,
                { type: tagTypes.CHAT, id: arg.chatId },
            ],
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
    useGetChatDetailsQuery,
    useCreateChatMutation,
    useGetMessagesQuery,
    useSendMessageMutation,
    useMarkAsReadMutation,
    useUpdateChatStatusMutation,
    useDeleteMessageMutation,
} = chatApi;
