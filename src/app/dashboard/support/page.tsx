"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search, Send, Paperclip, CheckCheck, Loader2, Trash2, X, MessageSquare, Truck, CheckCircle2, RotateCcw, Maximize2 } from "lucide-react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { useGetChatsQuery, useGetChatDetailsQuery, useGetMessagesQuery, useSendMessageMutation, useMarkAsReadMutation, useDeleteMessageMutation, useUpdateChatStatusMutation, chatApi } from "@/redux/features/chat/chatApi";
import type { Chat, Message as ChatMessage, Participant } from "@/redux/features/chat/chatTypes";
import Image from "next/image";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { useAppDispatch } from "@/redux/hook";
import { useGetAdminProfileQuery } from "@/redux/features/user/userApi";
import { getSocket, initializeSocket } from "@/lib/socket";

// Helper Functions
const formatLastUpdated = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const formatMessageTime = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
};

const cleanImageUrl = (url?: string | null) => {
    if (!url) return "";
    return url.trim().replace(/`/g, "");
};

const getAvatarUrl = (participant?: Participant | any) => {
    if (!participant) return "https://i.pravatar.cc/150?u=admin";
    const avatar = participant?.avatar?.url || participant?.avatar || participant?.image?.url || participant?.image;
    if (avatar && typeof avatar === "string" && avatar.trim()) {
        return cleanImageUrl(avatar);
    }
    const id = participant?._id || participant?.id || "admin";
    return `https://i.pravatar.cc/150?u=${id}`;
};

// URL detector helper to render links inside text messages safely
const renderTextWithLinks = (text?: string) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
        if (part.match(urlRegex)) {
            return (
                <a
                    key={index}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-semibold text-emerald-200 hover:text-white dark:text-emerald-400 dark:hover:text-emerald-300 break-all"
                >
                    {part}
                </a>
            );
        }
        return part;
    });
};

// Framer Motion Config
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: EASE, staggerChildren: 0.05 },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } },
};

const messageVariants: Variants = {
    hidden: { opacity: 0, y: 16, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: EASE } },
};

export default function SupportChatPage() {
    const dispatch = useAppDispatch();

    // State
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [input, setInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [chatTypeFilter, setChatTypeFilter] = useState<"customer_support" | "driver_support">("customer_support");
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
    const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
    const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
    const selectedChatIdRef = useRef<string | null>(selectedChatId);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        selectedChatIdRef.current = selectedChatId;
    }, [selectedChatId]);

    // Image Upload State
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Redux
    const { data: chatData, isLoading: chatsLoading } = useGetChatsQuery({
        page: 1,
        limit: 50,
        chatType: chatTypeFilter,
    });
    const currentUser = useSelector((state: RootState) => state.auth.user);
    const currentUserId = currentUser?.id;
    const { data: adminProfileRes } = useGetAdminProfileQuery();
    const adminProfile = adminProfileRes?.data;

    const adminAvatar = useMemo(() => {
        const rawProfile = adminProfile as any;
        const avatarUrl =
            adminProfile?.avatar?.url ||
            (typeof adminProfile?.avatar === "string" ? adminProfile.avatar : undefined) ||
            rawProfile?.image?.url ||
            rawProfile?.image;
        if (avatarUrl && typeof avatarUrl === "string" && avatarUrl.trim()) {
            return cleanImageUrl(avatarUrl);
        }
        return getAvatarUrl(adminProfile || currentUser);
    }, [adminProfile, currentUser]);

    const {
        data: messages,
        isLoading: messagesLoading,
    } = useGetMessagesQuery(
        { chatId: selectedChatId ?? "" },
        { skip: !selectedChatId }
    );

    const { data: chatDetailsRes } = useGetChatDetailsQuery(selectedChatId ?? "", {
        skip: !selectedChatId,
    });

    const [sendMessage, { isLoading: sendingMessage }] = useSendMessageMutation();
    const [markAsRead] = useMarkAsReadMutation();
    const [deleteMessage, { isLoading: deletingMessage }] = useDeleteMessageMutation();
    const [updateChatStatus, { isLoading: updatingStatus }] = useUpdateChatStatusMutation();

    // Derived Data
    const chats = chatData?.data || [];

    // Helper to extract the other participant (customer/driver) excluding current logged in admin
    const getOtherParticipant = useCallback(
        (chat?: Chat | null): Participant | null => {
            if (!chat || !chat.participants || !Array.isArray(chat.participants) || chat.participants.length === 0) return null;
            if (currentUserId) {
                const found = chat.participants.find((p) => p && String(p._id || (p as any).id) !== String(currentUserId));
                if (found) return found;
            }
            return chat.participants[0] || null;
        },
        [currentUserId]
    );

    // Seed online user IDs from initial chat query data
    useEffect(() => {
        if (chats.length > 0) {
            const initialOnlineIds = new Set<string>();
            chats.forEach((chat) => {
                const p = getOtherParticipant(chat);
                if (p && p.isOnline) initialOnlineIds.add(String(p._id));
            });
            if (initialOnlineIds.size > 0) {
                setOnlineUserIds((prev) => new Set([...Array.from(prev), ...Array.from(initialOnlineIds)]));
            }
        }
    }, [chats, getOtherParticipant]);

    const filteredChats = useMemo(() => {
        if (!searchQuery.trim()) return chats;
        const lowerQuery = searchQuery.toLowerCase().trim();
        return chats.filter((chat) => {
            const participant = getOtherParticipant(chat);
            if (!participant) return false;
            const matchesName = (participant.name || "").toLowerCase().includes(lowerQuery);
            const matchesEmail = (participant.email || "").toLowerCase().includes(lowerQuery);
            const matchesLastMessage = (chat.lastMessage || "").toLowerCase().includes(lowerQuery);
            return matchesName || matchesEmail || matchesLastMessage;
        });
    }, [chats, searchQuery, getOtherParticipant]);

    const messagesArray = useMemo(() => {
        if (localMessages.length > 0 && messages) {
            const combined = [...messages, ...localMessages];
            const uniqueMessages = combined.filter((msg, index, self) =>
                index === self.findIndex((m) => m._id === msg._id)
            );
            return uniqueMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        }
        return messages || [];
    }, [messages, localMessages]);

    const selectedChat = useMemo(
        () => filteredChats.find((chat) => chat._id === selectedChatId) || filteredChats[0] || null,
        [filteredChats, selectedChatId]
    );

    const selectedContact = useMemo(() => {
        if (!selectedChat) return null;
        const participant = getOtherParticipant(selectedChat);
        if (!participant) return null;

        const isOnline = onlineUserIds.has(String(participant._id)) || Boolean(participant.isOnline);

        return {
            id: selectedChat._id,
            participantId: participant._id,
            name: participant.name,
            email: participant.email,
            avatar: getAvatarUrl(participant),
            role: participant.role,
            status: selectedChat.status || "open",
            chatType: selectedChat.chatType || "customer_support",
            message: selectedChat.lastMessage,
            time: formatLastUpdated(selectedChat.lastUpdated),
            isOnline,
        };
    }, [selectedChat, onlineUserIds, getOtherParticipant]);

    const relatedOrder = chatDetailsRes?.data?.relatedOrder;

    const handleToggleStatus = async () => {
        if (!selectedChatId || !selectedChat) return;
        const newStatus = selectedChat.status === "resolved" ? "open" : "resolved";
        try {
            await updateChatStatus({ chatId: selectedChatId, status: newStatus }).unwrap();
            toast.success(`Conversation marked as ${newStatus}`);
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to update chat status");
        }
    };

    // Socket Effects
    useEffect(() => {
        const socket = initializeSocket();
        if (!socket) return;

        const handleConnect = () => {
            socket.emit("getOnlineUsers");
            if (currentUserId) {
                socket.emit("joinRoom", { chatId: currentUserId });
            }
            const activeId = selectedChatIdRef.current;
            if (activeId) {
                socket.emit("joinRoom", { chatId: activeId });
                socket.emit("conversation:join", { chatId: activeId });
            }
        };

        if (socket.connected) {
            handleConnect();
        }

        socket.on("connect", handleConnect);

        const extractUserIdFromData = (data: any): string | null => {
            if (!data) return null;
            if (typeof data === "string") return data;
            if (data.userId) return String(data.userId);
            if (data.id) return String(data.id);
            if (data._id) return String(data._id);
            return null;
        };

        const handleOnlineUsersList = (data: any) => {
            const ids = Array.isArray(data) ? data : data?.onlineUserIds || data?.userIds || data?.data;
            if (Array.isArray(ids)) {
                const strIds = ids.map((id) => extractUserIdFromData(id) || String(id)).filter(Boolean) as string[];
                setOnlineUserIds((prev) => new Set([...Array.from(prev), ...strIds]));
            }
        };

        const updateOnlineInCache = (userId: string, isOnline: boolean) => {
            const targetId = String(userId);
            ["all", "customer_support", "driver_support"].forEach((filter) => {
                dispatch(
                    chatApi.util.updateQueryData("getChats", { page: 1, limit: 50, chatType: filter }, (draft) => {
                        if (draft?.data) {
                            draft.data.forEach((c) => {
                                c.participants?.forEach((p) => {
                                    if (String(p._id) === targetId || String((p as any).id) === targetId) {
                                        p.isOnline = isOnline;
                                    }
                                });
                            });
                        }
                    })
                );
            });
        };

        const handleUserStatusChanged = (data: any) => {
            const targetId = extractUserIdFromData(data);
            if (!targetId) return;
            const isOnline = Boolean(data?.isOnline);
            setOnlineUserIds((prev) => {
                const next = new Set(prev);
                if (isOnline) next.add(targetId);
                else next.delete(targetId);
                return next;
            });
            updateOnlineInCache(targetId, isOnline);
        };

        const handleUserOnline = (data: any) => {
            const targetId = extractUserIdFromData(data);
            if (!targetId) return;
            setOnlineUserIds((prev) => {
                const next = new Set(prev);
                next.add(targetId);
                return next;
            });
            updateOnlineInCache(targetId, true);
        };

        const handleUserOffline = (data: any) => {
            const targetId = extractUserIdFromData(data);
            if (!targetId) return;
            setOnlineUserIds((prev) => {
                const next = new Set(prev);
                next.delete(targetId);
                return next;
            });
            updateOnlineInCache(targetId, false);
        };

        const handleNewMessage = (message: ChatMessage) => {
            const activeId = selectedChatIdRef.current;
            if (activeId && message.chatId === activeId) {
                setLocalMessages((prev) => {
                    const exists = prev.some((m) => m._id === message._id);
                    return exists ? prev : [...prev, message];
                });
            }
            ["all", "customer_support", "driver_support"].forEach((filter) => {
                dispatch(
                    chatApi.util.updateQueryData("getChats", { page: 1, limit: 50, chatType: filter }, (draft) => {
                        if (draft?.data) {
                            const targetChat = draft.data.find((c) => c._id === message.chatId);
                            if (targetChat) {
                                targetChat.lastMessage = message.content || "📷 Image";
                                targetChat.lastUpdated = message.createdAt || new Date().toISOString();
                            }
                        }
                    })
                );
            });
        };

        const handleStatusUpdate = ({ chatId, status: newStatus }: { chatId: string; status: "open" | "resolved" }) => {
            ["all", "customer_support", "driver_support"].forEach((filter) => {
                dispatch(
                    chatApi.util.updateQueryData("getChats", { page: 1, limit: 50, chatType: filter }, (draft) => {
                        if (draft?.data) {
                            const targetChat = draft.data.find((c) => c._id === chatId);
                            if (targetChat) {
                                targetChat.status = newStatus;
                            }
                        }
                    })
                );
            });
            dispatch(
                chatApi.util.updateQueryData("getChatDetails", chatId, (draft) => {
                    if (draft?.data) {
                        draft.data.status = newStatus;
                    }
                })
            );
        };

        const handleMessageDeleted = ({ messageId }: { messageId: string }) => {
            setLocalMessages((prev) => prev.filter((m) => m._id !== messageId));
        };

        const handleTypingStart = (data: any) => {
            if (!data) return;
            const incomingChatId = typeof data === "string" ? data : data.chatId;
            const incomingUserId = typeof data === "object" ? data.userId : null;

            if (incomingUserId && currentUserId && String(incomingUserId) === String(currentUserId)) return;
            const activeId = selectedChatIdRef.current;
            if (!activeId || !incomingChatId || String(incomingChatId) === String(activeId)) {
                setIsTyping(true);
            }
        };

        const handleTypingStop = (data: any) => {
            if (!data) return;
            const incomingChatId = typeof data === "string" ? data : data.chatId;
            const incomingUserId = typeof data === "object" ? data.userId : null;

            if (incomingUserId && currentUserId && String(incomingUserId) === String(currentUserId)) return;
            const activeId = selectedChatIdRef.current;
            if (!activeId || !incomingChatId || String(incomingChatId) === String(activeId)) {
                setIsTyping(false);
            }
        };

        socket.on("onlineUsersList", handleOnlineUsersList);
        socket.on("userStatusChanged", handleUserStatusChanged);
        socket.on("user:online", handleUserOnline);
        socket.on("user:offline", handleUserOffline);
        socket.on("newMessage", handleNewMessage);
        socket.on("message:new", handleNewMessage);
        socket.on("messageDeleted", handleMessageDeleted);
        socket.on("typing:start", handleTypingStart);
        socket.on("typing:stop", handleTypingStop);
        socket.on("conversation:status", handleStatusUpdate);
        socket.on("chatStatusUpdated", handleStatusUpdate);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("onlineUsersList", handleOnlineUsersList);
            socket.off("userStatusChanged", handleUserStatusChanged);
            socket.off("user:online", handleUserOnline);
            socket.off("user:offline", handleUserOffline);
            socket.off("newMessage", handleNewMessage);
            socket.off("message:new", handleNewMessage);
            socket.off("messageDeleted", handleMessageDeleted);
            socket.off("typing:start", handleTypingStart);
            socket.off("typing:stop", handleTypingStop);
            socket.off("conversation:status", handleStatusUpdate);
            socket.off("chatStatusUpdated", handleStatusUpdate);
        };
    }, [currentUserId, dispatch]);

    useEffect(() => {
        if (selectedChatId) {
            const socket = getSocket();
            if (socket) {
                socket.emit("joinRoom", { chatId: selectedChatId });
                socket.emit("conversation:join", { chatId: selectedChatId });
            }
            markAsRead(selectedChatId).catch(() => { });
        }
        setLocalMessages([]);
        setIsTyping(false);
    }, [selectedChatId, markAsRead]);

    const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
        }, 80);
    };

    useEffect(() => {
        if (selectedChatId) {
            scrollToBottom("auto");
        }
    }, [selectedChatId]);

    useEffect(() => {
        scrollToBottom("smooth");
    }, [messagesArray.length, isTyping]);

    useEffect(() => {
        if (chats.length > 0) {
            const exists = chats.some((c) => c._id === selectedChatId);
            if (!selectedChatId || !exists) {
                if (chats[0]?._id) {
                    setSelectedChatId(chats[0]._id);
                }
            }
        }
    }, [chats, selectedChatId]);

    // Typing emission
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
        const socket = getSocket();
        if (socket && selectedChatId) {
            socket.emit("typing:start", { chatId: selectedChatId });
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                socket.emit("typing:stop", { chatId: selectedChatId });
            }, 2000);
        }
    };

    // Image Picker
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
        if (!validTypes.includes(file.type)) {
            toast.error("Please select a valid image file (JPG, PNG, WEBP)");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image file size must be less than 5MB");
            return;
        }

        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }

        setSelectedImage(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const clearSelectedImage = () => {
        setSelectedImage(null);
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    // Send Message
    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!selectedChatId || (!input.trim() && !selectedImage)) return;

        const socket = getSocket();
        if (socket && selectedChatId) {
            socket.emit("typing:stop", { chatId: selectedChatId });
        }

        try {
            if (selectedImage) {
                const formData = new FormData();
                formData.append("chatId", selectedChatId);
                formData.append("type", "image");
                formData.append("content", input.trim() || "📷 Image");
                formData.append("image", selectedImage);

                await sendMessage(formData as any).unwrap();
                clearSelectedImage();
            } else {
                await sendMessage({
                    chatId: selectedChatId,
                    content: input.trim(),
                    type: "text",
                }).unwrap();
            }
            setInput("");
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to send message");
        }
    };

    const handleDeleteClick = (messageId: string) => {
        setMessageToDelete(messageId);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!messageToDelete) return;
        try {
            await deleteMessage(messageToDelete).unwrap();
            toast.success("Message deleted!");
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to delete message");
        } finally {
            setDeleteModalOpen(false);
            setMessageToDelete(null);
        }
    };

    const isCurrentUser = (senderId?: string) => {
        return Boolean(senderId && currentUserId && senderId === currentUserId);
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative h-[calc(96vh-100px)] overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
        >
            <div className="grid h-full grid-cols-1 lg:grid-cols-[340px_minmax(0,1fr)_280px]">
                {/* Left Sidebar - Inbox Types */}
                <motion.aside
                    variants={itemVariants}
                    className="hidden lg:flex flex-col border-r border-gray-100 bg-gray-50/60 dark:border-gray-800 dark:bg-gray-950/40"
                >
                    <div className="border-b border-gray-100 p-5 dark:border-gray-800 space-y-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Support Messages
                        </h2>

                        {/* Separate Inboxes: Customer Support vs Driver Support */}
                        <div className="flex rounded-2xl bg-gray-200/70 p-1 dark:bg-gray-800">
                            <button
                                type="button"
                                onClick={() => {
                                    setChatTypeFilter("customer_support");
                                    setSelectedChatId(null);
                                }}
                                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all ${
                                    chatTypeFilter === "customer_support"
                                        ? "bg-white text-emerald-600 shadow-sm dark:bg-gray-900 dark:text-emerald-400"
                                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                                }`}
                            >
                                <MessageSquare className="h-3.5 w-3.5" />
                                Customer
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setChatTypeFilter("driver_support");
                                    setSelectedChatId(null);
                                }}
                                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all ${
                                    chatTypeFilter === "driver_support"
                                        ? "bg-white text-blue-600 shadow-sm dark:bg-gray-900 dark:text-blue-400"
                                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                                }`}
                            >
                                <Truck className="h-3.5 w-3.5" />
                                Driver
                            </button>
                        </div>

                        {/* Search Input */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-2xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Conversation List */}
                    <div className="flex-1 space-y-2 overflow-y-auto p-3">
                        {chatsLoading && chats.length === 0 ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="relative w-full overflow-hidden rounded-2xl border border-gray-100 bg-white p-3.5 dark:border-gray-800 dark:bg-gray-900"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
                                        <div className="min-w-0 flex-1 space-y-2">
                                            <div className="h-3.5 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                                            <div className="h-3 w-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : filteredChats.length === 0 ? (
                            <div className="text-center py-12 space-y-3">
                                <div className="flex justify-center">
                                    <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                        <Search className="h-6 w-6 text-gray-400" />
                                    </div>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 font-medium text-sm">
                                    {searchQuery ? "No matching conversations" : `No ${chatTypeFilter === "driver_support" ? "driver" : "customer"} messages`}
                                </p>
                            </div>
                        ) : (
                            filteredChats.map((chat, index) => {
                                const participant = getOtherParticipant(chat);
                                if (!participant) return null;
                                const isSelected = chat._id === selectedChatId;
                                const hasUnread = (chat.unreadCount || 0) > 0;
                                const isParticipantOnline = onlineUserIds.has(String(participant._id)) || Boolean(participant.isOnline);

                                return (
                                    <motion.button
                                        key={chat._id}
                                        variants={itemVariants}
                                        initial="hidden"
                                        animate="visible"
                                        transition={{ delay: index * 0.03 }}
                                        onClick={() => setSelectedChatId(chat._id)}
                                        className={`relative w-full overflow-hidden rounded-2xl border p-3 text-left transition-all duration-200 ${
                                            isSelected
                                                ? "border-emerald-500/50 bg-emerald-50/70 shadow-sm dark:border-emerald-700 dark:bg-emerald-950/30"
                                                : "border-transparent hover:border-gray-200 hover:bg-white hover:shadow-sm dark:hover:border-gray-800 dark:hover:bg-gray-900"
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="relative shrink-0">
                                                <div className="relative h-10 w-10">
                                                    <Image
                                                        src={getAvatarUrl(participant)}
                                                        alt={participant.name || "User"}
                                                        fill
                                                        className="rounded-full object-cover border border-white dark:border-gray-700"
                                                    />
                                                    <span
                                                        className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-gray-900 ${
                                                            isParticipantOnline ? "bg-emerald-500 animate-pulse" : "bg-gray-400"
                                                        }`}
                                                        title={isParticipantOnline ? "Online" : "Offline"}
                                                    />
                                                </div>
                                                {chat.chatType === "driver_support" && (
                                                    <span className="absolute -bottom-1 -right-1 bg-blue-500 text-[9px] text-white px-1 rounded-full font-bold">
                                                        D
                                                    </span>
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-1">
                                                    <h3 className={`truncate text-xs font-semibold ${hasUnread ? "text-gray-900 font-extrabold dark:text-white" : "text-gray-800 dark:text-gray-200"}`}>
                                                        {participant.name}
                                                    </h3>
                                                    <span className="shrink-0 text-[10px] text-gray-400">
                                                        {formatLastUpdated(chat.lastUpdated)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between gap-1 mt-1">
                                                    <p className={`truncate text-[11px] ${hasUnread ? "text-gray-900 font-bold dark:text-white" : "text-gray-500 dark:text-gray-400"}`}>
                                                        {chat.lastMessage || "Started conversation"}
                                                    </p>
                                                    {hasUnread && (
                                                        <span className="shrink-0 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                                                            {chat.unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.button>
                                );
                            })
                        )}
                    </div>
                </motion.aside>

                {/* Main Chat Area */}
                <div className="flex h-full min-w-0 flex-col overflow-hidden border-r border-gray-100 dark:border-gray-800">
                    {/* Header */}
                    <motion.div
                        variants={itemVariants}
                        className="flex items-center justify-between border-b border-gray-100 bg-white/80 px-6 py-4 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80"
                    >
                        {selectedContact ? (
                            <div className="flex w-full items-center justify-between">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="relative h-10 w-10 shrink-0">
                                        <Image
                                            src={selectedContact.avatar}
                                            alt={selectedContact.name || "User"}
                                            fill
                                            className="rounded-full object-cover border-2 border-emerald-100 dark:border-emerald-900"
                                        />
                                        <span
                                            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-gray-900 ${
                                                selectedContact.isOnline ? "bg-emerald-500 animate-pulse" : "bg-gray-400"
                                            }`}
                                            title={selectedContact.isOnline ? "Online" : "Offline"}
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="truncate font-bold text-gray-900 dark:text-white text-base">
                                                {selectedContact.name}
                                            </h3>
                                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                                                selectedContact.role === "driver"
                                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
                                                    : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200"
                                            }`}>
                                                {selectedContact.role}
                                            </span>
                                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full flex items-center gap-1 ${
                                                selectedContact.isOnline
                                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                                                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                            }`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${selectedContact.isOnline ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`} />
                                                {selectedContact.isOnline ? "Online" : "Offline"}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {isTyping ? (
                                                <span className="text-emerald-500 font-semibold animate-pulse">Typing...</span>
                                            ) : (
                                                selectedContact.email
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase flex items-center gap-1.5 ${
                                        selectedContact.status === "resolved"
                                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                                    }`}>
                                        <span className={`h-2 w-2 rounded-full ${selectedContact.status === "resolved" ? "bg-purple-500" : "bg-emerald-500 animate-pulse"}`} />
                                        {selectedContact.status}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={handleToggleStatus}
                                        disabled={updatingStatus}
                                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                                            selectedContact.status === "resolved"
                                                ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                                                : "bg-purple-600 hover:bg-purple-700 text-white"
                                        }`}
                                    >
                                        {updatingStatus ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : selectedContact.status === "resolved" ? (
                                            <>
                                                <RotateCcw className="h-3.5 w-3.5" />
                                                Reopen
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                Resolve
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center w-full py-1">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Select a conversation to start messaging</p>
                            </div>
                        )}
                    </motion.div>

                    {/* Messages Window */}
                    <div className="flex-1 overflow-y-auto bg-gray-50/40 px-4 py-6 dark:bg-gray-950/20 md:px-6">
                        {selectedContact ? (
                            <div className="mx-auto max-w-4xl space-y-5">
                                {messagesLoading && messagesArray.length === 0 ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
                                        >
                                            <div className="max-w-[85%] md:max-w-2xl">
                                                <div className="rounded-3xl bg-gray-200 dark:bg-gray-800 animate-pulse px-5 py-4 h-16" />
                                            </div>
                                        </div>
                                    ))
                                ) : messagesArray.length === 0 ? (
                                    <div className="text-center py-20">
                                        <p className="text-gray-500 dark:text-gray-400 text-base font-medium mb-1">
                                            No messages in this chat
                                        </p>
                                        <p className="text-xs text-gray-400">Send a text or image message below</p>
                                    </div>
                                ) : (
                                    <AnimatePresence mode="popLayout">
                                        {messagesArray.map((msg) => {
                                            const fromMe = isCurrentUser(msg.sender?._id);
                                            const imageUrl = cleanImageUrl(msg.image?.url);
                                            const isImageMsg = msg.type === "image" && Boolean(imageUrl);
                                            const hasTextContent = Boolean(msg.content && msg.content !== "📷 Image");
                                            const senderAvatar = fromMe
                                                ? adminAvatar
                                                : (selectedContact?.avatar || getAvatarUrl(msg.sender));

                                            return (
                                                <motion.div
                                                    key={msg._id}
                                                    variants={messageVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit="hidden"
                                                    layout
                                                    className={`flex items-end gap-2.5 ${fromMe ? "justify-end" : "justify-start"}`}
                                                >
                                                    {!fromMe && (
                                                        <div className="relative h-8 w-8 shrink-0 mb-5">
                                                            <Image
                                                                src={senderAvatar}
                                                                alt={msg.sender?.name || "User"}
                                                                fill
                                                                className="rounded-full object-cover border border-gray-200 shadow-xs dark:border-gray-700"
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="max-w-[80%] md:max-w-xl group relative">
                                                        <motion.div
                                                            whileHover={{ y: -1, transition: { duration: 0.2 } }}
                                                            className={`relative rounded-3xl shadow-sm transition-all duration-300 ${
                                                                isImageMsg && !hasTextContent ? "p-1.5" : "px-5 py-4"
                                                            } ${
                                                                fromMe
                                                                    ? "rounded-br-lg bg-emerald-500 text-white shadow-emerald-500/20"
                                                                    : "rounded-bl-lg border border-gray-100 bg-white text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                                            }`}
                                                        >
                                                            {isImageMsg && (
                                                                <div
                                                                    onClick={() => setPreviewImageUrl(imageUrl)}
                                                                    className={`group/img relative overflow-hidden rounded-2xl max-w-sm max-h-80 cursor-pointer border border-black/10 dark:border-white/10 ${hasTextContent ? "mb-2" : "mb-0"}`}
                                                                >
                                                                    <Image
                                                                        src={imageUrl}
                                                                        alt="Message image attachment"
                                                                        width={350}
                                                                        height={260}
                                                                        className="w-full h-auto max-h-80 object-cover rounded-2xl transition-transform duration-300 group-hover/img:scale-105"
                                                                    />
                                                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white">
                                                                        <Maximize2 className="h-6 w-6" />
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {hasTextContent && (
                                                                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                                                    {renderTextWithLinks(msg.content)}
                                                                </p>
                                                            )}
                                                        </motion.div>

                                                        <div className="mt-1 flex items-center justify-between gap-2 px-2">
                                                            <span className="text-[10px] text-gray-400">
                                                                {formatMessageTime(msg.createdAt)}
                                                            </span>
                                                            {fromMe && (
                                                                <div className="flex items-center gap-1">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleDeleteClick(msg._id)}
                                                                        className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-0.5"
                                                                        title="Delete message"
                                                                    >
                                                                        {deletingMessage && messageToDelete === msg._id ? (
                                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                                        ) : (
                                                                            <Trash2 className="h-3 w-3" />
                                                                        )}
                                                                    </button>
                                                                    <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {fromMe && (
                                                        <div className="relative h-8 w-8 shrink-0 mb-5">
                                                            <Image
                                                                src={senderAvatar}
                                                                alt={adminProfile?.name || currentUser?.name || "Admin"}
                                                                fill
                                                                className="rounded-full object-cover border border-emerald-300 shadow-xs dark:border-emerald-700"
                                                            />
                                                        </div>
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                )}

                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className="bg-gray-200 dark:bg-gray-800 rounded-full px-4 py-1.5 text-xs font-semibold text-gray-500 animate-pulse">
                                            {selectedContact.name} is typing...
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                                <MessageSquare className="h-10 w-10 text-gray-300 dark:text-gray-700 mb-2" />
                                <p className="text-sm font-medium">Select a conversation</p>
                            </div>
                        )}
                    </div>

                    {/* Image Attachment Preview */}
                    {imagePreview && (
                        <div className="flex items-center gap-3 border-t border-gray-100 bg-emerald-50/50 px-5 py-2.5 dark:border-gray-800 dark:bg-emerald-950/20">
                            <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-emerald-200">
                                <Image src={imagePreview} alt="Selected preview" fill className="object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
                                    {selectedImage?.name}
                                </p>
                                <p className="text-[10px] text-gray-500">
                                    {((selectedImage?.size || 0) / 1024).toFixed(1)} KB
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={clearSelectedImage}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-gray-500"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )}

                    {/* Message Input */}
                    <motion.div
                        variants={itemVariants}
                        className="border-t border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
                    >
                        {selectedContact ? (
                            <form onSubmit={handleSendMessage} className="flex items-center gap-3 rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all duration-300 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 dark:border-gray-700 dark:bg-gray-800">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/jpg"
                                    onChange={handleImageSelect}
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-gray-400 transition-colors hover:text-emerald-500"
                                    title="Attach Image (JPG, PNG, WEBP)"
                                >
                                    <Paperclip className="h-5 w-5" />
                                </button>
                                <input
                                    value={input}
                                    onChange={handleInputChange}
                                    placeholder="Type your message or link..."
                                    className="flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-white"
                                />
                                <button
                                    type="submit"
                                    disabled={(!input.trim() && !selectedImage) || sendingMessage}
                                    className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-600 disabled:opacity-50 disabled:active:scale-100 active:scale-95"
                                >
                                    {sendingMessage ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                </button>
                            </form>
                        ) : (
                            <div className="text-center text-gray-500 dark:text-gray-400 py-2 text-sm">
                                Select a conversation to send messages
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Right Context Sidebar - User Context */}
                <motion.aside
                    variants={itemVariants}
                    className="hidden lg:flex flex-col border-l border-gray-100 bg-gray-50/40 p-5 dark:border-gray-800 dark:bg-gray-950/20"
                >
                    {selectedContact ? (
                        <div className="space-y-6">
                            <div className="text-center space-y-3 pb-5 border-b border-gray-200 dark:border-gray-800">
                                <div className="relative mx-auto h-20 w-20">
                                    <Image
                                        src={selectedContact.avatar}
                                        alt={selectedContact.name || "User"}
                                        fill
                                        className="rounded-full object-cover border-4 border-white shadow-sm dark:border-gray-800"
                                    />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white text-base">
                                        {selectedContact.name}
                                    </h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        {selectedContact.email}
                                    </p>
                                </div>
                                <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 capitalize">
                                    Role: {selectedContact.role}
                                </span>
                            </div>

                            <div className="space-y-3">
                                <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                    Active / Recent Order
                                </h5>
                                {relatedOrder ? (
                                    <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-2 dark:border-gray-800 dark:bg-gray-900 shadow-sm">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-bold text-gray-900 dark:text-white">
                                                #{relatedOrder.orderId}
                                            </span>
                                            <span className="px-2 py-0.5 rounded-md font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 uppercase text-[10px]">
                                                {relatedOrder.orderStatus}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-1">
                                            <span>Total Amount:</span>
                                            <span className="font-bold text-gray-900 dark:text-white">${relatedOrder.totalAmount?.toFixed(2)}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                            <span>Payment:</span>
                                            <span className="capitalize font-medium text-emerald-600 dark:text-emerald-400">{relatedOrder.paymentStatus}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-400 italic">No active order history found.</p>
                                )}
                            </div>

                            {/* Shared Media Gallery */}
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center justify-between">
                                    <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                        Shared Media ({messagesArray.filter(m => m.type === "image" && m.image?.url).length})
                                    </h5>
                                </div>
                                {messagesArray.filter(m => m.type === "image" && m.image?.url).length > 0 ? (
                                    <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                                        {messagesArray.filter(m => m.type === "image" && m.image?.url).map((msg) => {
                                            const imageUrl = cleanImageUrl(msg.image?.url);
                                            return (
                                                <div
                                                    key={msg._id}
                                                    onClick={() => setPreviewImageUrl(imageUrl)}
                                                    className="relative aspect-square overflow-hidden rounded-xl cursor-pointer border border-gray-200 dark:border-gray-800 hover:opacity-90 transition-opacity"
                                                >
                                                    <Image
                                                        src={imageUrl}
                                                        alt="Shared media attachment"
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-400 italic">No media shared in this chat.</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-xs text-gray-400 py-10">
                            Select a chat to view context.
                        </div>
                    )}
                </motion.aside>
            </div>

            {/* Delete Modal */}
            <AnimatePresence>
                {deleteModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                        Delete Message
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => setDeleteModalOpen(false)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                                    >
                                        <X className="h-5 w-5 text-gray-500" />
                                    </button>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 mb-8">
                                    Are you sure you want to delete this message?
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setDeleteModalOpen(false)}
                                        className="flex-1 px-5 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleConfirmDelete}
                                        disabled={deletingMessage}
                                        className="flex-1 flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-xl transition-colors"
                                    >
                                        {deletingMessage ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Deleting...
                                            </>
                                        ) : (
                                            "Delete"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Image Preview Modal */}
            <AnimatePresence>
                {previewImageUrl && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setPreviewImageUrl(null)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center p-2"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                type="button"
                                onClick={() => setPreviewImageUrl(null)}
                                className="absolute top-4 right-4 z-10 p-2.5 bg-black/60 hover:bg-black text-white rounded-full transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                            <div className="relative w-full h-full max-h-[85vh]">
                                <Image
                                    src={previewImageUrl}
                                    alt="Enlarged attachment"
                                    fill
                                    className="object-contain rounded-2xl"
                                />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}