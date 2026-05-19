export const tagTypes = {
    AUTH: "AUTH",
    PRODUCT: "PRODUCT",
    CATEGORY: "CATEGORY",
    BRAND: "BRAND",
    DASHBOARD: "DASHBOARD",
} as const;

export const tagTypesList = Object.values(tagTypes);