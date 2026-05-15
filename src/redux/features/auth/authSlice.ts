import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { deleteCookie } from "@/lib/cookies";

interface DecodedUser {
    id?: string;
    role?: string;
    email?: string;
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
                role?: string;
                email?: string;
                iat?: number;
                exp?: number;
            }>
        ) => {
            const { accessToken, user, ...rest } = action.payload;
            state.accessToken = accessToken;
            
            // If user object is provided, use it. Otherwise, use the flat properties.
            if (user) {
                state.user = user;
            } else if (rest.id || rest.role) {
                state.user = {
                    id: rest.id,
                    role: rest.role,
                    email: rest.email,
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
            deleteCookie("accessToken");
        },
    },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;