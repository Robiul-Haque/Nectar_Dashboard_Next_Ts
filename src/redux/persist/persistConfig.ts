import storage from "../storage";

export const authPersistConfig = {
    key: "auth",
    storage,

    whitelist: [
        "accessToken",
        "user",
    ],
};