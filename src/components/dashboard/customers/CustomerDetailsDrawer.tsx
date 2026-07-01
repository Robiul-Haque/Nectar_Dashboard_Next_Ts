"use client";

import { useState, useEffect } from "react";
import {
    X, User, Mail, MapPin, ShieldCheck, ShieldAlert, UserCheck, UserX,
    Calendar, Smartphone, Globe, ShoppingBag, Heart, ShoppingCart,
    MessageSquare, Clock, History, AlertCircle, Edit2, Trash2, Plus,
    Loader2, Key, CheckCircle, Info, ExternalLink, ChevronLeft, ChevronRight, Lock, Unlock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    useGetCustomerDetailsQuery,
    useGetCustomerOrdersQuery,
    useGetCustomerWishlistCartQuery,
    useGetCustomerTimelineQuery,
    useGetCustomerLoginHistoryQuery,
    useGetCustomerChatSummaryQuery,
    useUnblockCustomerMutation,
    useGetCustomerNotesQuery,
    useAddCustomerNoteMutation,
    useUpdateCustomerNoteMutation,
    useDeleteCustomerNoteMutation,
} from "@/redux/features/user/userApi";
import toast from "react-hot-toast";
import Image from "next/image";

interface CustomerDetailsDrawerProps {
    customerId: string | null;
    isOpen: boolean;
    onClose: () => void;
}

type TabType = "overview" | "orders" | "wishlist-cart" | "activity" | "notes";

export default function CustomerDetailsDrawer({ customerId, isOpen, onClose }: CustomerDetailsDrawerProps) {
    const [activeTab, setActiveTab] = useState<TabType>("overview");

    // Pagination states for different tabs
    const [ordersPage, setOrdersPage] = useState(1);
    const [timelinePage, setTimelinePage] = useState(1);
    const [loginHistoryPage, setLoginHistoryPage] = useState(1);
    const [notesPage, setNotesPage] = useState(1);

    // Notes CRUD states
    const [noteText, setNoteText] = useState("");
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [editText, setEditText] = useState("");

    // Reset pagination and tab on customer change
    useEffect(() => {
        if (customerId) {
            setActiveTab("overview");
            setOrdersPage(1);
            setTimelinePage(1);
            setLoginHistoryPage(1);
            setNotesPage(1);
            setNoteText("");
            setEditingNoteId(null);
        }
    }, [customerId]);

    // Redux Queries
    const { data: detailsData, isLoading: isDetailsLoading, refetch: refetchDetails } = useGetCustomerDetailsQuery(customerId || "", {
        skip: !customerId || !isOpen,
    });

    const { data: ordersData, isLoading: isOrdersLoading } = useGetCustomerOrdersQuery(
        { id: customerId || "", page: ordersPage, limit: 5 },
        { skip: !customerId || !isOpen || activeTab !== "orders" }
    );

    const { data: wishlistCartData, isLoading: isWishlistCartLoading } = useGetCustomerWishlistCartQuery(customerId || "", {
        skip: !customerId || !isOpen || activeTab !== "wishlist-cart",
    });

    const { data: timelineData, isLoading: isTimelineLoading } = useGetCustomerTimelineQuery(
        { id: customerId || "", page: timelinePage, limit: 5 },
        { skip: !customerId || !isOpen || activeTab !== "activity" }
    );

    const { data: loginHistoryData, isLoading: isLoginHistoryLoading } = useGetCustomerLoginHistoryQuery(
        { id: customerId || "", page: loginHistoryPage, limit: 5 },
        { skip: !customerId || !isOpen || activeTab !== "activity" }
    );

    const { data: chatSummaryData } = useGetCustomerChatSummaryQuery(customerId || "", {
        skip: !customerId || !isOpen,
    });

    const { data: notesData, isLoading: isNotesLoading } = useGetCustomerNotesQuery(
        { id: customerId || "", page: notesPage, limit: 5 },
        { skip: !customerId || !isOpen || activeTab !== "notes" }
    );

    // Mutations
    const [unblockCustomer, { isLoading: isUnblocking }] = useUnblockCustomerMutation();
    const [addNote, { isLoading: isAddingNote }] = useAddCustomerNoteMutation();
    const [updateNote, { isLoading: isUpdatingNote }] = useUpdateCustomerNoteMutation();
    const [deleteNote, { isLoading: isDeletingNote }] = useDeleteCustomerNoteMutation();

    if (!isOpen) return null;

    const details = detailsData?.data;
    const profile = details?.profile;
    const status = details?.status;
    const security = details?.security;
    const devices = details?.devices || [];

    const handleUnblock = async () => {
        if (!customerId) return;
        try {
            const res = await unblockCustomer(customerId).unwrap();
            toast.success(res.message || "Customer account unlocked successfully!");
            refetchDetails();
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to unlock account!");
        }
    };

    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customerId || !noteText.trim()) return;
        try {
            await addNote({ id: customerId, note: noteText.trim() }).unwrap();
            toast.success("Note added successfully!");
            setNoteText("");
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to add note!");
        }
    };

    const handleStartEdit = (noteId: string | undefined, currentText: string) => {
        if (!noteId) {
            toast.error("Cannot edit this note: missing note ID.");
            return;
        }
        setEditingNoteId(noteId);
        setEditText(currentText);
    };

    const handleUpdateNote = async (noteId: string | undefined) => {
        if (!customerId || !editText.trim()) return;
        if (!noteId) {
            toast.error("Cannot update note: missing note ID.");
            return;
        }
        try {
            await updateNote({ id: customerId, noteId, note: editText.trim() }).unwrap();
            toast.success("Note updated successfully!");
            setEditingNoteId(null);
            setEditText("");
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to update note!");
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        if (!customerId || !confirm("Are you sure you want to delete this note?")) return;
        try {
            await deleteNote({ id: customerId, noteId }).unwrap();
            toast.success("Note deleted successfully!");
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to delete note!");
        }
    };

    const cleanImageUrl = (url: string) => {
        if (!url) return "";
        return url.trim().replace(/`/g, "");
    };

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex justify-end">
                {/* Backdrop overlay */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-xs"
                />

                {/* Drawer Container */}
                <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="relative flex h-full w-full max-w-2xl flex-col border-l border-gray-100 bg-gray-50 shadow-2xl dark:border-gray-800 dark:bg-gray-950"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-5 dark:border-gray-800 dark:bg-gray-900">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onClose}
                                className="rounded-xl p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                            >
                                <X className="h-5 w-5" />
                            </button>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Customer Insights</h2>
                                <p className="text-xs text-gray-500 font-mono">ID: {customerId}</p>
                            </div>
                        </div>

                        {chatSummaryData?.data?.summary?.unreadMessages ? (
                            <div className="flex items-center gap-2 rounded-2xl bg-amber-50 px-4 py-2 border border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20">
                                <MessageSquare className="h-4 w-4 animate-bounce" />
                                <span className="text-xs font-semibold">
                                    {chatSummaryData.data.summary.unreadMessages} Unread Support Chats
                                </span>
                            </div>
                        ) : null}
                    </div>

                    {/* Drawer Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {isDetailsLoading ? (
                            <div className="flex h-96 flex-col items-center justify-center gap-3">
                                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                                <p className="text-sm font-medium text-gray-500">Retrieving customer metrics...</p>
                            </div>
                        ) : !profile ? (
                            <div className="flex h-96 flex-col items-center justify-center gap-3 text-gray-400">
                                <AlertCircle className="h-10 w-10 opacity-30" />
                                <p className="text-sm font-medium">Failed to retrieve customer details.</p>
                            </div>
                        ) : (
                            <>
                                {/* Quick Stats Section / Profile Card */}
                                <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
                                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="relative h-20 w-20 flex-shrink-0">
                                                {profile.avatar ? (
                                                    <Image
                                                        src={cleanImageUrl(profile.avatar)}
                                                        alt={profile.name}
                                                        fill
                                                        className="rounded-3xl object-cover ring-4 ring-emerald-500/10"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600 dark:bg-emerald-955/40 dark:text-emerald-400 font-extrabold text-3xl">
                                                        {profile.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{profile.name}</h3>
                                                <p className="text-sm text-gray-500">{profile.email}</p>
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                                                        status?.isActive
                                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                                                            : "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
                                                    }`}>
                                                        {status?.isActive ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                                                        {status?.isActive ? "Active" : "Inactive"}
                                                    </span>

                                                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                                                        status?.isVerified
                                                            ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
                                                            : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                                                    }`}>
                                                        {status?.isVerified ? <ShieldCheck className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
                                                        {status?.isVerified ? "Verified" : "Unverified"}
                                                    </span>

                                                    {security?.isLocked ? (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 text-xs font-semibold dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20">
                                                            <Lock className="h-3 w-3" />
                                                            Locked (Brute Force)
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                                                            <Unlock className="h-3 w-3" />
                                                            Secure
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Locked Banner with Action */}
                                    {security?.isLocked && (
                                        <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-rose-100 bg-rose-50/50 p-4 dark:border-rose-955/40 dark:bg-rose-955/20">
                                            <div className="flex items-start gap-3">
                                                <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-rose-800 dark:text-rose-300">Account Temporarily Locked</p>
                                                    <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">
                                                        Triggered by {security.failedLoginCount} failed password attempts. Remaining lock time:{" "}
                                                        <strong>{Math.ceil(security.lockRemainingMs / 60000)} minutes</strong> (Until: {formatDate(security.loginLockedUntil)}).
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleUnblock}
                                                disabled={isUnblocking}
                                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 py-2.5 text-xs font-semibold text-white transition-all hover:bg-rose-700 disabled:opacity-50 dark:bg-rose-700 dark:hover:bg-rose-600"
                                            >
                                                {isUnblocking ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    <Unlock className="h-3.5 w-3.5" />
                                                )}
                                                Force Unlock Account
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Tabs Navigation */}
                                <div className="flex border-b border-gray-200 dark:border-gray-800 gap-1 overflow-x-auto">
                                    {(["overview", "orders", "wishlist-cart", "activity", "notes"] as TabType[]).map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`border-b-2 px-4 py-3 text-sm font-semibold capitalize whitespace-nowrap transition-colors ${
                                                activeTab === tab
                                                    ? "border-emerald-600 text-emerald-600 dark:border-emerald-500 dark:text-emerald-400"
                                                    : "border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                                            }`}
                                        >
                                            {tab === "wishlist-cart" ? "Wishlist & Cart" : tab === "activity" ? "Activity & Logs" : tab}
                                        </button>
                                    ))}
                                </div>

                                {/* Tabs Panels */}
                                <div className="space-y-6">
                                    {/* ── Tab 1: Overview ──────────────────────────────── */}
                                    {activeTab === "overview" && (
                                        <div className="space-y-6">
                                            {/* Details Info List */}
                                            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
                                                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                                                    <Info className="h-4 w-4" /> Account Details
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-gray-500 text-xs">Auth Provider</p>
                                                        <p className="font-semibold text-gray-955 dark:text-white capitalize">{profile.provider}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500 text-xs">Joined Date</p>
                                                        <p className="font-semibold text-gray-955 dark:text-white">{formatDate(profile.joinedAt)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500 text-xs">Last Login At</p>
                                                        <p className="font-semibold text-gray-955 dark:text-white">{formatDate(status?.lastLoginAt)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500 text-xs">Last Known IP</p>
                                                        <p className="font-mono font-semibold text-gray-955 dark:text-white">{status?.lastKnownIp || "N/A"}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500 text-xs">Notifications</p>
                                                        <p className="font-semibold text-gray-955 dark:text-white">{profile.notificationEnabled ? "Enabled" : "Disabled"}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500 text-xs">App Version (Last Seen)</p>
                                                        <p className="font-semibold text-gray-955 dark:text-white">{profile.appVersion || "N/A"}</p>
                                                    </div>
                                                    {profile.location && (
                                                        <div className="md:col-span-2">
                                                            <p className="text-gray-500 text-xs">Location Coordinates</p>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <MapPin className="h-4 w-4 text-emerald-500" />
                                                                <span className="font-semibold text-gray-955 dark:text-white">
                                                                    {profile.location.city ? `${profile.location.city}, ` : ""}
                                                                    {profile.location.country || "Unknown Country"}
                                                                    <span className="text-xs font-normal text-gray-500 block">
                                                                        Lat: {profile.location.latitude}, Lng: {profile.location.longitude}
                                                                    </span>
                                                                </span>
                                                                <a
                                                                    href={`https://www.google.com/maps/search/?api=1&query=${profile.location.latitude},${profile.location.longitude}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                                                                >
                                                                    Maps <ExternalLink className="h-3 w-3" />
                                                                </a>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Registered Devices List */}
                                            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
                                                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                                                    <Smartphone className="h-4 w-4" /> Registered Devices ({devices.length})
                                                </h4>
                                                {devices.length === 0 ? (
                                                    <p className="text-center py-6 text-sm text-gray-500">No device signatures registered yet.</p>
                                                ) : (
                                                    <div className="space-y-4">
                                                        {devices.map((device, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="flex items-start justify-between border-b border-gray-50 pb-4 last:border-0 last:pb-0 dark:border-gray-800"
                                                            >
                                                                <div className="flex gap-3">
                                                                    <div className="rounded-xl bg-gray-50 p-2.5 dark:bg-gray-800 text-gray-500">
                                                                        <Smartphone className="h-5 w-5" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-semibold text-gray-900 dark:text-white">
                                                                            {device.deviceModel || "Unknown Device"}
                                                                        </p>
                                                                        <p className="text-xs text-gray-500 mt-0.5">
                                                                            Platform: <span className="capitalize">{device.platform}</span> ({device.osVersion || "N/A"}) • App: v{device.appVersion || "N/A"}
                                                                        </p>
                                                                        <p className="text-[10px] font-mono text-gray-400 mt-1">UUID: {device.deviceId || "N/A"}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <span className="text-[11px] font-medium text-gray-400 block">Last Active</span>
                                                                    <span className="text-xs text-gray-600 dark:text-gray-300 font-semibold">{formatDate(device.lastActive)}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* ── Tab 2: Orders & Payments ────────────────────── */}
                                    {activeTab === "orders" && (
                                        <div className="space-y-6">
                                            {isOrdersLoading ? (
                                                <div className="flex py-12 justify-center"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div>
                                            ) : (
                                                <>
                                                    {/* Aggregates Summary */}
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-2xs dark:border-gray-800 dark:bg-gray-900">
                                                            <span className="text-xs font-semibold text-gray-400 uppercase">Lifetime Spent</span>
                                                            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                                                                ${ordersData?.data?.summary?.totalSpent?.toFixed(2) || "0.00"}
                                                            </p>
                                                        </div>
                                                        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-2xs dark:border-gray-800 dark:bg-gray-900">
                                                            <span className="text-xs font-semibold text-gray-400 uppercase">Total Orders</span>
                                                            <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                                                                {ordersData?.data?.summary?.totalOrders || 0}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Orders List */}
                                                    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
                                                        <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                                                            <ShoppingBag className="h-4 w-4" /> Order History
                                                        </h4>
                                                        {!ordersData?.data?.orders || ordersData.data.orders.length === 0 ? (
                                                            <p className="text-center py-6 text-sm text-gray-500">No orders placed by this customer.</p>
                                                        ) : (
                                                            <div className="space-y-4">
                                                                {ordersData.data.orders.map((order) => (
                                                                    <div key={order._id} className="rounded-2xl border border-gray-50 p-4 hover:bg-gray-50/50 dark:border-gray-800 dark:hover:bg-gray-900/30">
                                                                        <div className="flex items-center justify-between">
                                                                            <div>
                                                                                <span className="text-xs text-gray-400 font-semibold uppercase">Order ID: {order._id.slice(-8).toUpperCase()}</span>
                                                                                <p className="text-xs text-gray-500 mt-0.5">{formatDate(order.createdAt)}</p>
                                                                            </div>
                                                                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                                                                                order.orderStatus === "delivered"
                                                                                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                                                                                    : order.orderStatus === "cancelled"
                                                                                    ? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                                                                                    : "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                                                                            }`}>
                                                                                {order.orderStatus}
                                                                            </span>
                                                                        </div>

                                                                        <div className="mt-3 flex items-center justify-between border-t border-gray-50 pt-3 dark:border-gray-800/50">
                                                                            <div className="text-xs text-gray-500">
                                                                                Items: <span className="font-semibold text-gray-800 dark:text-gray-200">{order.totalQuantity}</span>
                                                                            </div>
                                                                            <div className="text-sm font-bold text-gray-900 dark:text-white">
                                                                                ${order.totalPrice.toFixed(2)}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}

                                                                {/* Orders Pagination */}
                                                                {ordersData.pagination.totalPages > 1 && (
                                                                    <div className="flex items-center justify-between pt-4 border-t border-gray-55 dark:border-gray-800">
                                                                        <button
                                                                            onClick={() => setOrdersPage(p => Math.max(1, p - 1))}
                                                                            disabled={ordersPage === 1}
                                                                            className="rounded-lg p-1.5 hover:bg-gray-100 disabled:opacity-50 text-gray-550 dark:hover:bg-gray-800"
                                                                        >
                                                                            <ChevronLeft className="h-4 w-4" />
                                                                        </button>
                                                                        <span className="text-xs font-medium text-gray-500">Page {ordersPage} of {ordersData.pagination.totalPages}</span>
                                                                        <button
                                                                            onClick={() => setOrdersPage(p => Math.min(ordersData.pagination.totalPages, p + 1))}
                                                                            disabled={ordersPage === ordersData.pagination.totalPages}
                                                                            className="rounded-lg p-1.5 hover:bg-gray-100 disabled:opacity-50 text-gray-550 dark:hover:bg-gray-800"
                                                                        >
                                                                            <ChevronRight className="h-4 w-4" />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {/* ── Tab 3: Wishlist & Cart ──────────────────────── */}
                                    {activeTab === "wishlist-cart" && (
                                        <div className="space-y-6">
                                            {isWishlistCartLoading ? (
                                                <div className="flex py-12 justify-center"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div>
                                            ) : (
                                                <>
                                                    {/* Active Cart */}
                                                    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
                                                        <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                                                            <ShoppingCart className="h-4 w-4" /> Active Shopping Cart
                                                        </h4>
                                                        {!wishlistCartData?.data?.cart?.items || wishlistCartData.data.cart.items.length === 0 ? (
                                                            <p className="text-center py-6 text-sm text-gray-500">Customer's cart is empty.</p>
                                                        ) : (
                                                            <div className="space-y-4">
                                                                {wishlistCartData.data.cart.items.map((item, idx) => (
                                                                    <div key={idx} className="flex items-center gap-3 justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0 dark:border-gray-800">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-gray-50">
                                                                                {item.image ? (
                                                                                    <Image
                                                                                        src={cleanImageUrl(item.image)}
                                                                                        alt={item.name || "Product"}
                                                                                        fill
                                                                                        className="object-cover"
                                                                                    />
                                                                                ) : (
                                                                                    <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400"><ShoppingBag className="h-4 w-4" /></div>
                                                                                )}
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.name || "Unknown Product"}</p>
                                                                                <p className="text-xs text-gray-500">Qty: {item.quantity} • ${item.price?.toFixed(2)} each</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="text-sm font-bold text-gray-955 dark:text-white">
                                                                            ${(item.quantity * item.price).toFixed(2)}
                                                                        </div>
                                                                    </div>
                                                                ))}

                                                                <div className="border-t border-gray-100 pt-4 flex items-center justify-between dark:border-gray-800">
                                                                    <span className="text-xs font-semibold text-gray-500">Total Cart Value</span>
                                                                    <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                                                                        ${wishlistCartData.data.cart.totalPrice?.toFixed(2) || "0.00"}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Wishlist Bookmarks */}
                                                    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
                                                        <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                                                            <Heart className="h-4 w-4" /> Bookmarked Wishlist
                                                        </h4>
                                                        {!wishlistCartData?.data?.wishlist?.items || wishlistCartData.data.wishlist.items.length === 0 ? (
                                                            <p className="text-center py-6 text-sm text-gray-500">Customer's wishlist is empty.</p>
                                                        ) : (
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                {wishlistCartData.data.wishlist.items.map((item, idx) => (
                                                                    <div key={idx} className="flex items-center gap-3 rounded-2xl border border-gray-50 p-3 dark:border-gray-800">
                                                                        <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-gray-50 flex-shrink-0">
                                                                            {item.image ? (
                                                                                <Image
                                                                                    src={cleanImageUrl(item.image)}
                                                                                    alt={item.name || "Product"}
                                                                                    fill
                                                                                    className="object-cover"
                                                                                    sizes="48px"
                                                                                />
                                                                            ) : (
                                                                                <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400"><ShoppingBag className="h-4 w-4" /></div>
                                                                            )}
                                                                        </div>
                                                                        <div className="min-w-0">
                                                                            <p className="text-xs font-semibold text-gray-955 dark:text-white truncate">{item.name || "Unknown Product"}</p>
                                                                            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">${item.price?.toFixed(2)}</p>
                                                                            <p className="text-[10px] text-gray-400 mt-0.5">Added: {formatDate(item.addedAt).split(",")[0]}</p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {/* ── Tab 4: Activity & History Logs ──────────────── */}
                                    {activeTab === "activity" && (
                                        <div className="space-y-6">
                                            {/* Chronological Activity Timeline */}
                                            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
                                                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-6 flex items-center gap-2">
                                                    <Clock className="h-4 w-4" /> Interactive Activity Timeline
                                                </h4>

                                                {isTimelineLoading ? (
                                                    <div className="flex py-6 justify-center"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div>
                                                ) : !timelineData?.data || timelineData.data.length === 0 ? (
                                                    <p className="text-center py-6 text-sm text-gray-500">No activity logs recorded.</p>
                                                ) : (
                                                    <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100 dark:before:bg-gray-800">
                                                        {timelineData.data.map((item, idx) => (
                                                            <div key={idx} className="relative">
                                                                <div className={`absolute -left-6 top-1 h-4.5 w-4.5 rounded-full border-4 border-white bg-emerald-500 dark:border-gray-900 ${
                                                                    item.type === "auth"
                                                                        ? "bg-blue-500"
                                                                        : item.type === "order"
                                                                        ? "bg-emerald-500"
                                                                        : item.type === "wishlist"
                                                                        ? "bg-rose-500"
                                                                        : "bg-gray-500"
                                                                }`} />
                                                                <div>
                                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.description}</p>
                                                                    <span className="text-[10px] text-gray-400 font-medium block mt-0.5">{formatDate(item.timestamp)}</span>
                                                                </div>
                                                            </div>
                                                        ))}

                                                        {/* Timeline Pagination */}
                                                        {timelineData.pagination.totalPages > 1 && (
                                                            <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800/50">
                                                                <button
                                                                    onClick={() => setTimelinePage(p => Math.max(1, p - 1))}
                                                                    disabled={timelinePage === 1}
                                                                    className="rounded-lg p-1 hover:bg-gray-100 disabled:opacity-50 text-gray-555 dark:hover:bg-gray-800"
                                                                >
                                                                    <ChevronLeft className="h-4 w-4" />
                                                                </button>
                                                                <span className="text-xs text-gray-500">Page {timelinePage} of {timelineData.pagination.totalPages}</span>
                                                                <button
                                                                    onClick={() => setTimelinePage(p => Math.min(timelineData.pagination.totalPages, p + 1))}
                                                                    disabled={timelinePage === timelineData.pagination.totalPages}
                                                                    className="rounded-lg p-1 hover:bg-gray-100 disabled:opacity-50 text-gray-555 dark:hover:bg-gray-800"
                                                                >
                                                                    <ChevronRight className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Security Log Table */}
                                            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
                                                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                                                    <History className="h-4 w-4" /> Security Audit Log
                                                </h4>
                                                {isLoginHistoryLoading ? (
                                                    <div className="flex py-6 justify-center"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div>
                                                ) : !loginHistoryData?.data || loginHistoryData.data.length === 0 ? (
                                                    <p className="text-center py-6 text-sm text-gray-500">No login history recorded.</p>
                                                ) : (
                                                    <div className="space-y-4">
                                                        {loginHistoryData.data.map((event) => (
                                                            <div key={event._id} className="text-xs border-b border-gray-50 pb-3 last:border-0 last:pb-0 dark:border-gray-800">
                                                                <div className="flex items-center justify-between">
                                                                    <span className={`font-semibold capitalize ${
                                                                        event.event.includes("success")
                                                                            ? "text-emerald-600 dark:text-emerald-400"
                                                                            : event.event.includes("failed") || event.event.includes("locked")
                                                                            ? "text-rose-600 dark:text-rose-400"
                                                                            : "text-blue-600 dark:text-blue-400"
                                                                    }`}>
                                                                        {event.event.replace("_", " ")}
                                                                    </span>
                                                                    <span className="text-[10px] text-gray-400">{formatDate(event.createdAt)}</span>
                                                                </div>
                                                                <div className="mt-1 flex flex-wrap gap-x-4 text-gray-555">
                                                                    <span>Platform: <span className="capitalize">{event.platform}</span> (v{event.appVersion || "N/A"})</span>
                                                                    <span>IP: {event.ip}</span>
                                                                </div>
                                                                <div className="text-[10px] text-gray-400 font-mono mt-1 truncate">UA: {event.userAgent}</div>
                                                            </div>
                                                        ))}

                                                        {/* Login History Pagination */}
                                                        {loginHistoryData.pagination.totalPages > 1 && (
                                                            <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800">
                                                                <button
                                                                    onClick={() => setLoginHistoryPage(p => Math.max(1, p - 1))}
                                                                    disabled={loginHistoryPage === 1}
                                                                    className="rounded-lg p-1 hover:bg-gray-100 disabled:opacity-50 text-gray-555 dark:hover:bg-gray-800"
                                                                >
                                                                    <ChevronLeft className="h-4 w-4" />
                                                                </button>
                                                                <span className="text-xs text-gray-500">Page {loginHistoryPage} of {loginHistoryData.pagination.totalPages}</span>
                                                                <button
                                                                    onClick={() => setLoginHistoryPage(p => Math.min(loginHistoryData.pagination.totalPages, p + 1))}
                                                                    disabled={loginHistoryPage === loginHistoryData.pagination.totalPages}
                                                                    className="rounded-lg p-1 hover:bg-gray-100 disabled:opacity-50 text-gray-555 dark:hover:bg-gray-800"
                                                                >
                                                                    <ChevronRight className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* ── Tab 5: Admin Notes ──────────────────────────── */}
                                    {activeTab === "notes" && (
                                        <div className="space-y-6">
                                            {/* Note Input Box */}
                                            <form onSubmit={handleAddNote} className="space-y-3">
                                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Write Administrative Internal Note</label>
                                                <textarea
                                                    placeholder="Add an internal note about refund disputes, support issues, etc..."
                                                    value={noteText}
                                                    onChange={(e) => setNoteText(e.target.value)}
                                                    rows={3}
                                                    required
                                                    maxLength={2000}
                                                    className="w-full rounded-2xl border border-gray-200 bg-white p-3 text-sm placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={isAddingNote || !noteText.trim()}
                                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                                                >
                                                    {isAddingNote ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                                                    Submit Admin Note
                                                </button>
                                            </form>

                                            {/* Notes List */}
                                            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
                                                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                                                    <FileText className="h-4 w-4" /> Internal Admin Notes
                                                </h4>

                                                {isNotesLoading ? (
                                                    <div className="flex py-6 justify-center"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div>
                                                ) : !notesData?.data || notesData.data.length === 0 ? (
                                                    <p className="text-center py-6 text-sm text-gray-500">No notes written for this customer.</p>
                                                ) : (
                                                    <div className="space-y-4">
                                                        {notesData.data.map((note) => (
                                                            <div key={note._id} className="rounded-2xl border border-gray-50 bg-gray-50/20 p-4 dark:border-gray-800 dark:bg-gray-900/10">
                                                                <div className="flex justify-between items-start">
                                                                    <div>
                                                                        <span className="text-xs font-bold text-gray-900 dark:text-white">{note.adminId?.name || "Admin"}</span>
                                                                        <span className="text-[10px] text-gray-400 ml-2">{formatDate(note.createdAt)}</span>
                                                                    </div>

                                                                    <div className="flex gap-2">
                                                                        <button
                                                                            onClick={() => handleStartEdit(note._id, note.note)}
                                                                            className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-555 hover:text-gray-700"
                                                                        >
                                                                            <Edit2 className="h-3 w-3" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteNote(note._id)}
                                                                            className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-800 text-red-500 hover:text-red-700"
                                                                        >
                                                                            <Trash2 className="h-3 w-3" />
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                {editingNoteId === note._id ? (
                                                                    <div className="mt-3 space-y-2">
                                                                        <textarea
                                                                            value={editText}
                                                                            onChange={(e) => setEditText(e.target.value)}
                                                                            rows={2}
                                                                            maxLength={2000}
                                                                            className="w-full rounded-xl border border-gray-200 bg-white p-2 text-xs focus:outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800"
                                                                        />
                                                                        <div className="flex gap-2 justify-end">
                                                                            <button
                                                                                onClick={() => setEditingNoteId(null)}
                                                                                className="rounded-lg bg-gray-100 px-3 py-1.5 text-[10px] font-semibold text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleUpdateNote(note._id)}
                                                                                disabled={isUpdatingNote || !editText.trim()}
                                                                                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-[10px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                                                                            >
                                                                                {isUpdatingNote ? "Saving..." : "Save"}
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{note.note}</p>
                                                                )}
                                                            </div>
                                                        ))}

                                                        {/* Notes Pagination */}
                                                        {notesData.pagination.totalPages > 1 && (
                                                            <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800">
                                                                <button
                                                                    onClick={() => setNotesPage(p => Math.max(1, p - 1))}
                                                                    disabled={notesPage === 1}
                                                                    className="rounded-lg p-1 hover:bg-gray-100 disabled:opacity-50 text-gray-555 dark:hover:bg-gray-800"
                                                                >
                                                                    <ChevronLeft className="h-4 w-4" />
                                                                </button>
                                                                <span className="text-xs text-gray-500">Page {notesPage} of {notesData.pagination.totalPages}</span>
                                                                <button
                                                                    onClick={() => setNotesPage(p => Math.min(notesData.pagination.totalPages, p + 1))}
                                                                    disabled={notesPage === notesData.pagination.totalPages}
                                                                    className="rounded-lg p-1 hover:bg-gray-100 disabled:opacity-50 text-gray-555 dark:hover:bg-gray-800"
                                                                >
                                                                    <ChevronRight className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

// Inline elements for lists mapping
function FileText({ className }: { className?: string }) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
}
