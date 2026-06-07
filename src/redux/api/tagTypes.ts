export const tagTypes = {
    AUTH: "AUTH",
    PRODUCT: "PRODUCT",
    CATEGORY: "CATEGORY",
    BRAND: "BRAND",
    DASHBOARD: "DASHBOARD",
    ORDER: "ORDER",
    REVIEW: "REVIEW",
} as const;

export const tagTypesList = Object.values(tagTypes);