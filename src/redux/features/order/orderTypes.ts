export interface OrderItem {
    product: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
}

export interface ShippingAddress {
    address: string;
    city: string;
    country: string;
    phone: string;
}

export interface Customer {
    name: string;
    email: string;
    initials: string;
}

export interface Order {
    _id: string;
    user: string;
    items: OrderItem[];
    totalQuantity: number;
    totalPrice: number;
    shippingAddress: ShippingAddress;
    paymentStatus: 'pending' | 'paid' | 'failed';
    paymentIntentId: string;
    createdAt: string;
    updatedAt: string;
    orderStatus: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    customer: Customer;
    itemsCount: number;
    orderId: string;
}

export interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface GetOrdersResponse {
    success: boolean;
    message: string;
    pagination: Pagination;
    data: Order[];
}

export interface UpdateOrderStatusRequest {
    id: string;
    status: string;
}

export interface GenericResponse {
    success: boolean;
    message: string;
    data?: any;
}
