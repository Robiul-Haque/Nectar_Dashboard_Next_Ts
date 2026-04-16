"use client";

import { useState } from "react";
import { Notification } from "@/types/notification";

const initialData: Notification[] = [
    {
        id: "1",
        title: "New Order Received",
        message: "Order #1024 has been placed successfully.",
        createdAt: "2026-04-17 10:30",
        read: false,
        type: "success",
    },
    {
        id: "2",
        title: "Low Stock Alert",
        message: "Organic Banana stock is running low.",
        createdAt: "2026-04-17 09:10",
        read: false,
        type: "error",
    },
];

export function useNotifications() {
    const [notifications, setNotifications] =
        useState<Notification[]>(initialData);

    const [open, setOpen] = useState(false);

    const hasUnread = notifications.some((n) => !n.read);

    const togglePanel = () => setOpen((prev) => !prev);

    const markAsRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) =>
                n.id === id ? { ...n, read: true } : n
            )
        );
    };

    const markAllAsRead = () => {
        setNotifications((prev) =>
            prev.map((n) => ({ ...n, read: true }))
        );
    };

    return {
        notifications,
        open,
        hasUnread,
        togglePanel,
        markAsRead,
        markAllAsRead,
    };
}