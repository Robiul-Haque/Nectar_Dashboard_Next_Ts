export interface IProduct {
    id: number;
    name: string;
    sku: string;
    category: string;
    stock: number;
    unit: string;
    status: "Healthy" | "Low" | "Critical";
    price: number;
    active: boolean;
    image?: string;
}