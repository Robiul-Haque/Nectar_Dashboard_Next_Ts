export interface Participant {
    _id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
}

export interface Chat {
    _id: string;
    participants: Participant[];
    lastUpdated: string;
    lastMessage: string;
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
