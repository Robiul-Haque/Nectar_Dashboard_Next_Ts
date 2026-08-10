import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { deleteCookie } from "@/lib/cookies";

export interface DecodedUser {
    id?: string;
    _id?: string;
    name?: string;
    role?: string;
    email?: string;
    avatar?: {
        url?: string | null;
        publicId?: string | null;
    } | string | null;
    image?: {
        url?: string | null;
        publicId?: string | null;
    } | string | null;
    iat?: number;
    exp?: number;
}

interface AuthState {
    accessToken: string | null;
    user: DecodedUser | null;
    status: "idle" | "authenticated" | "unauthenticated";
}

const initialState: AuthState = {
    accessToken: null,
    user: null,
    status: "idle",
};

const authSlice = createSlice({
    name: "auth",
    initialState,

    reducers: {
        setCredentials: (
            state,
            action: PayloadAction<{
                accessToken: string;
                user?: DecodedUser | null;
                id?: string;
                _id?: string;
                name?: string;
                role?: string;
                email?: string;
                avatar?: any;
                image?: any;
                iat?: number;
                exp?: number;
            }>
        ) => {
            const { accessToken, user, ...rest } = action.payload;
            state.accessToken = accessToken;
            
            // If user object is provided, use it. Otherwise, use the flat properties.
            if (user) {
                state.user = user;
            } else if (rest.id || rest._id || rest.role) {
                state.user = {
                    id: rest.id || rest._id,
                    _id: rest._id || rest.id,
                    name: rest.name,
                    role: rest.role,
                    email: rest.email,
                    avatar: rest.avatar,
                    image: rest.image,
                    iat: rest.iat,
                    exp: rest.exp,
                };
            }
            
            state.status = "authenticated";
        },

        logout: (state) => {
            state.accessToken = null;
            state.user = null;
            state.status = "unauthenticated";
            // Clear browser cookie so Next.js proxy stops redirecting to dashboard
            if (typeof window !== "undefined") {
                deleteCookie("accessToken");
            }
        },
    },
});

export const { setCredentials, logout } = authSlice.actions;

export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.status === "authenticated";

export default authSlice.reducer;