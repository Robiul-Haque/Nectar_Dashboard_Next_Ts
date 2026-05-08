import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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
                user: DecodedUser;
            }>
        ) => {
            state.accessToken = action.payload.accessToken;
            state.user = action.payload.user;
            state.status = "authenticated";
        },

        logout: (state) => {
            state.accessToken = null;
            state.user = null;
            state.status = "unauthenticated";
        },
    },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;