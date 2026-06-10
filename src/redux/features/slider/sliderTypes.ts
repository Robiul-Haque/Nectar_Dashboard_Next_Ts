export interface SliderImage {
    url: string;
    publicId: string;
    displayOrder: number;
    _id: string;
}

export interface ActionButton {
    text?: string;
    link?: string;
}

export interface Slider {
    _id: string;
    title: string;
    images: SliderImage[];
    animationType: "fade" | "slide" | "zoom" | "none";
    isActive: boolean;
    actionButton?: ActionButton;
    createdAt: string;
    updatedAt: string;
}

export interface GetSlidersResponse {
    success: boolean;
    message: string;
    pagination: {
        total: number;
        page: number;
        limit: number;
    };
    data: Slider[];
}

export interface GetSlidersParams {
    page?: number;
    limit?: number;
}

export interface SliderMutationResponse {
    success: boolean;
    message: string;
    data: Slider;
}
