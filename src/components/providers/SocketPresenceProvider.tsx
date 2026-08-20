"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { initializeSocket } from "@/lib/socket";
import { setOnlineUserIds, userConnected, userDisconnected } from "@/redux/features/presence/presenceSlice";
import { chatApi } from "@/redux/features/chat/chatApi";
import { userApi } from "@/redux/features/user/userApi";

export default function SocketPresenceProvider({ children }: { children: React.ReactNode }) {
    const dispatch = useDispatch<AppDispatch>();
    const accessToken = useSelector((state: RootState) => state.auth.accessToken);

    useEffect(() => {
        const socket = initializeSocket();
        if (!socket) return;

        const extractUserId = (data: any): string | null => {
            if (!data) return null;
            if (typeof data === "string") return data;
            if (data.userId) return String(data.userId);
            if (data.id) return String(data.id);
            if (data._id) return String(data._id);
            return null;
        };

        const updateRtkCaches = (userId: string, isOnline: boolean) => {
            const targetId = String(userId);

            ["all", "customer_support", "driver_support"].forEach((filter) => {
                dispatch(
                    chatApi.util.updateQueryData("getChats", { page: 1, limit: 50, chatType: filter }, (draft) => {
                        if (draft?.data) {
                            draft.data.forEach((c) => {
                                c.participants?.forEach((p: any) => {
                                    if (String(p._id || p.id) === targetId) {
                                        p.isOnline = isOnline;
                                    }
                                });
                            });
                        }
                    })
                );
            });

            dispatch(
                userApi.util.updateQueryData("getCustomerDetails", targetId, (draft) => {
                    if (draft?.data?.status) {
                        (draft.data.status as any).isOnline = isOnline;
                    }
                })
            );
        };

        const handleOnlineUsersList = (data: any) => {
            console.log("[SOCKET DASHBOARD 💻] 📥 Received event 'onlineUsersList':", data);
            const ids = Array.isArray(data) ? data : data?.onlineUserIds || data?.userIds || data?.data;
            if (Array.isArray(ids)) {
                const strIds = ids.map((id) => extractUserId(id) || String(id)).filter(Boolean) as string[];
                dispatch(setOnlineUserIds(strIds));
            }
        };

        const handleUserStatusChanged = (data: any) => {
            console.log("[SOCKET DASHBOARD 💻] 📥 Received event 'userStatusChanged':", data);
            const targetId = extractUserId(data);
            if (!targetId) return;
            const isOnline = Boolean(data?.isOnline);
            if (isOnline) {
                dispatch(userConnected(targetId));
            } else {
                dispatch(userDisconnected(targetId));
            }
            updateRtkCaches(targetId, isOnline);
        };

        const handleUserOnline = (data: any) => {
            console.log("[SOCKET DASHBOARD 💻] 📥 Received event 'user:online':", data);
            const targetId = extractUserId(data);
            if (!targetId) return;
            dispatch(userConnected(targetId));
            updateRtkCaches(targetId, true);
        };

        const handleUserOffline = (data: any) => {
            console.log("[SOCKET DASHBOARD 💻] 📥 Received event 'user:offline':", data);
            const targetId = extractUserId(data);
            if (!targetId) return;
            dispatch(userDisconnected(targetId));
            updateRtkCaches(targetId, false);
        };

        const handleConnect = () => {
            socket.emit("getOnlineUsers");
            socket.emit("users:online:get");
        };

        if (socket.connected) {
            handleConnect();
        }

        socket.on("connect", handleConnect);
        socket.on("onlineUsersList", handleOnlineUsersList);
        socket.on("userStatusChanged", handleUserStatusChanged);
        socket.on("user:online", handleUserOnline);
        socket.on("user:offline", handleUserOffline);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("onlineUsersList", handleOnlineUsersList);
            socket.off("userStatusChanged", handleUserStatusChanged);
            socket.off("user:online", handleUserOnline);
            socket.off("user:offline", handleUserOffline);
        };
    }, [dispatch, accessToken]);

    return <>{children}</>;
}
