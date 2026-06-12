export const tagTypes = {
    AUTH: "AUTH",
    PRODUCT: "PRODUCT",
    CATEGORY: "CATEGORY",
    BRAND: "BRAND",
    DASHBOARD: "DASHBOARD",
    ORDER: "ORDER",
    REVIEW: "REVIEW",
    USER: "USER",
    SLIDER: "SLIDER",
    CHAT: "CHAT",
} as const;

export const tagTypesList = Object.values(tagTypes);