export interface Participant {
    _id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    isOnline?: boolean;
}

export interface Chat {
    _id: string;
    participants: Participant[];
    lastUpdated: string;
    lastMessage: string;
    status?: "open" | "resolved";
    chatType?: "customer_support" | "driver_support" | "direct";
    unreadCount?: number;
}

export interface RelatedOrder {
    _id: string;
    orderId: string;
    orderStatus: string;
    totalAmount: number;
    paymentStatus: string;
    createdAt: string;
}

export interface ChatDetailsResponse {
    success: boolean;
    data: Chat & {
        relatedOrder?: RelatedOrder | null;
    };
}

export interface MessageImage {
    url: string;
    publicId: string;
}

export interface Message {
    _id: string;
    chatId: string;
    sender: Participant;
    content?: string;
    type: "text" | "image";
    image?: MessageImage | null;
    readBy: string[];
    createdAt: string;
    updatedAt: string;
}

export interface GetChatsResponse {
    success: boolean;
    message: string;
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    data: Chat[];
}

export interface GetChatsParams {
    page?: number;
    limit?: number;
    chatType?: "customer_support" | "driver_support" | "direct" | string;
    status?: "open" | "resolved" | string;
}

export interface GetMessagesParams {
    chatId: string;
    page?: number;
    limit?: number;
}

// Fix: Match actual API response
export interface GetMessagesResponse {
    success: boolean;
    message: string;
    pagination: {
        total: number;
        page: number;
        limit: number;
    };
    data: {
        data: Message[];
    };
}

export interface SendMessageRequest {
    chatId: string;
    content: string;
    type: "text" | "image";
}

export interface CreateChatRequest {
    receiverId: string;
}
