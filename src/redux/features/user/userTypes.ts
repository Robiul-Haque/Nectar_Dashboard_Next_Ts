export interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    avatar?: {
        url: string;
        publicId: string;
    };
    isVerified: boolean;
    isActive: boolean;
    location?: {
        city: string;
        country: string;
        latitude: number;
        longitude: number;
    };
    createdAt: string;
}

export interface AdminProfileResponse {
    success: boolean;
    message: string;
    data: {
        _id: string;
        name: string;
        email: string;
        role: string;
        avatar?: {
            url: string | null;
            publicId: string | null;
        } | null;
        isVerified: boolean;
        isActive?: boolean;
        createdAt: string;
    };
}

export interface UpdateAdminProfileResponse {
    success: boolean;
    message: string;
    data: {
        id: string;
        name: string;
        email: string;
        role: string;
        avatar?: {
            url: string | null;
            publicId: string | null;
        } | null;
        isVerified: boolean;
        isActive: boolean;
    };
}

export interface GetUsersResponse {
    success: boolean;
    message: string;
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    data: User[];
}

export interface GetUsersParams {
    search?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
}

export interface CustomerProfile {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    provider: string;
    role: string;
    notificationEnabled: boolean;
    appVersion: string | null;
    location?: {
        latitude: number;
        longitude: number;
        country: string;
        city: string;
    } | null;
    joinedAt: string;
    updatedAt: string;
}

export interface CustomerStatus {
    isActive: boolean;
    isVerified: boolean;
    lastLoginAt: string | null;
    lastKnownIp: string | null;
}

export interface CustomerSecurity {
    isLocked: boolean;
    loginLockedUntil: string | null;
    lockRemainingMs: number;
    failedLoginCount: number;
    passwordChangedAt: string | null;
    redisLockActive: boolean;
}

export interface CustomerDevice {
    platform: string;
    deviceId: string | null;
    deviceModel: string | null;
    osVersion: string | null;
    appVersion: string | null;
    lastActive: string | null;
}

export interface CustomerDetails {
    profile: CustomerProfile;
    status: CustomerStatus;
    security: CustomerSecurity;
    devices: CustomerDevice[];
}

export interface GetCustomerDetailsResponse {
    success: boolean;
    message: string;
    data: CustomerDetails;
}

export interface OrderItem {
    product: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
}

export interface CustomerOrder {
    _id: string;
    orderStatus: string;
    paymentStatus: string;
    totalPrice: number;
    totalQuantity: number;
    items: OrderItem[];
    shippingAddress: {
        address: string;
        city: string;
        country: string;
        phone: string;
    };
    createdAt: string;
    paymentIntentId?: string;
}

export interface CustomerOrderSummary {
    totalOrders: number;
    totalSpent: number;
    avgOrderValue: number;
    byStatus: {
        pending: number;
        confirmed: number;
        shipped: number;
        delivered: number;
        cancelled: number;
    };
    byPayment: {
        paid: number;
        failed: number;
    };
}

export interface GetCustomerOrdersResponse {
    success: boolean;
    message: string;
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    data: {
        summary: CustomerOrderSummary;
        orders: CustomerOrder[];
    };
}

export interface PaymentStatusDetail {
    status: string;
    count: number;
    totalAmount: number;
}

export interface GetCustomerPaymentSummaryResponse {
    success: boolean;
    message: string;
    data: {
        totalSpent: number;
        paidOrdersCount: number;
        failedOrdersCount: number;
        paymentStatusDetails: PaymentStatusDetail[];
    };
}

export interface WishlistItem {
    productId: string | null;
    name: string | null;
    image: string | null;
    price: number;
    discountPrice: number | null;
    stock: number;
    isActive: boolean;
    addedAt: string;
}

export interface CartItem {
    productId: string;
    name: string | null;
    image: string | null;
    price: number;
    quantity: number;
    variant: string | null;
    subtotal: number;
}

export interface GetCustomerWishlistCartResponse {
    success: boolean;
    message: string;
    data: {
        cart: {
            totalItems: number;
            totalPrice: number;
            itemCount: number;
            items: CartItem[];
            lastUpdated?: string;
        } | null;
        wishlist: {
            count: number;
            items: WishlistItem[];
        };
    };
}

export interface TimelineItem {
    type: "auth" | "wishlist" | "order" | "chat" | "payment";
    description: string;
    meta: any;
    timestamp: string;
}

export interface GetCustomerTimelineResponse {
    success: boolean;
    message: string;
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    data: TimelineItem[];
}

export interface LoginHistoryItem {
    _id: string;
    event: string;
    provider: string;
    ip: string;
    userAgent: string;
    platform: string;
    deviceId?: string | null;
    appVersion?: string | null;
    meta?: any;
    createdAt: string;
}

export interface GetCustomerLoginHistoryResponse {
    success: boolean;
    message: string;
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    data: LoginHistoryItem[];
}

export interface ChatMessageSummary {
    content: string;
    sentAt: string;
}

export interface RecentChat {
    chatId: string;
    lastMessage: string;
    lastUpdated: string;
    otherParticipant: {
        id: string;
        name: string;
        email: string;
        role: string;
        avatar?: string | null;
    };
}

export interface GetCustomerChatSummaryResponse {
    success: boolean;
    message: string;
    data: {
        summary: {
            totalChats: number;
            totalMessages: number;
            unreadMessages: number;
            lastMessage: ChatMessageSummary | null;
        };
        recentChats: RecentChat[];
    };
}

export interface AdminNote {
    _id: string;
    note: string;
    userId: string;
    adminId: {
        _id: string;
        name: string;
        email: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface GetCustomerNotesResponse {
    success: boolean;
    message: string;
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    data: AdminNote[];
}

export interface AddCustomerNoteParams {
    id: string;
    note: string;
}

export interface UpdateCustomerNoteParams {
    id: string;
    noteId: string;
    note: string;
}

export interface DeleteCustomerNoteParams {
    id: string;
    noteId: string;
}

