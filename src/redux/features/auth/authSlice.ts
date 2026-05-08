import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState, IUser } from "./authTypes";

const initialState: AuthState = {
    accessToken: null,
    user: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (state,action: PayloadAction<{accessToken: string;user: IUser;}>) => {
            state.accessToken = action.payload.accessToken;
            state.user = action.payload.user;
        },
        logout: (state) => {
            state.accessToken = null;
            state.user = null;
        },
    },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;