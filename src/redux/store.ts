import {
    configureStore,
} from "@reduxjs/toolkit";

import {
    persistStore,
    persistReducer,
} from "redux-persist";

import storage from "./storage";

import authReducer from "./features/auth/authSlice";
import presenceReducer from "./features/presence/presenceSlice";

import { baseApi } from "./api/baseApi";

const authPersistConfig = {
    key: "auth",
    storage,

    whitelist: ["accessToken", "user"],
};

const persistedAuthReducer =
    persistReducer(
        authPersistConfig,
        authReducer
    );

export const store =
    configureStore({
        reducer: {
            auth: persistedAuthReducer,
            presence: presenceReducer,

            [baseApi.reducerPath]:
                baseApi.reducer,
        },

        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: false,
            }).concat(baseApi.middleware),
    });

export const persistor =
    persistStore(store);

export type RootState =
    ReturnType<typeof store.getState>;

export type AppDispatch =
    typeof store.dispatch;