"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/redux/store";
import { injectSocketStore } from "@/lib/socket";

if (typeof window !== "undefined") {
    injectSocketStore(store);
}

export default function ReduxProvider({ children }: { children: React.ReactNode; }) {
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                {children}
            </PersistGate>
        </Provider>
    );
}