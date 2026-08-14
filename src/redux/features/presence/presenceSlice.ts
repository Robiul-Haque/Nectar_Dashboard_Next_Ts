import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PresenceState {
    onlineUserIds: string[];
}

const initialState: PresenceState = {
    onlineUserIds: [],
};

export const presenceSlice = createSlice({
    name: "presence",
    initialState,
    reducers: {
        setOnlineUserIds: (state, action: PayloadAction<string[]>) => {
            const unique = Array.from(new Set((action.payload || []).map((id) => String(id))));
            state.onlineUserIds = unique;
        },
        userConnected: (state, action: PayloadAction<string>) => {
            const idStr = String(action.payload);
            if (!state.onlineUserIds.includes(idStr)) {
                state.onlineUserIds.push(idStr);
            }
        },
        userDisconnected: (state, action: PayloadAction<string>) => {
            const idStr = String(action.payload);
            state.onlineUserIds = state.onlineUserIds.filter((id) => id !== idStr);
        },
    },
});

export const { setOnlineUserIds, userConnected, userDisconnected } = presenceSlice.actions;
export default presenceSlice.reducer;
