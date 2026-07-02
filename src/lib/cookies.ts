/**
 * Set a browser cookie.
 * @param name Cookie name
 * @param value Cookie value
 * @param maxAgeSeconds Max age in seconds (default: 7200 = 2 hours, matching ACCESS_TOKEN_EXPIRES_IN=120m)
 */
export const setCookie = (name: string, value: string, maxAgeSeconds: number = 7200) => {
    document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAgeSeconds}; path=/; SameSite=Lax`;
};

export const getCookie = (name: string) => {
    return document.cookie.split('; ').reduce((r, v) => {
        const parts = v.split('=');
        return parts[0] === name ? decodeURIComponent(parts[1]) : r;
    }, '');
};

export const deleteCookie = (name: string) => {
    // Standard cookie deletion for client-side cookies
    document.cookie = `${name}=; max-age=0; path=/; SameSite=Lax`;
};
