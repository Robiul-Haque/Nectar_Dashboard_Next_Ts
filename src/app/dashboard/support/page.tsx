"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Send, Paperclip, CheckCheck, Loader2, Trash2, X, MessageSquare, Truck } from "lucide-react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import {
    useGetChatsQuery,
    useGetChatDetailsQuery,
    useGetMessagesQuery,
    useSendMessageMutation,
    useMarkAsReadMutation,
    useDeleteMessageMutation,
    chatApi,
} from "@/redux/features/chat/chatApi";
import type { Participant, Message as ChatMessage } from "@/redux/features/chat/chatTypes";
import Image from "next/image";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { useAppDispatch } from "@/redux/hook";
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

const cleanImageUrl = (url: string | undefined | null) => {
    if (!url) return "";
    return url.trim().replace(/`/g, "");
};

const getAvatarUrl = (participant?: Participant) => {
    if (!participant) return "https://i.pravatar.cc/150";
    if (participant.avatar) return cleanImageUrl(participant.avatar);
    return `https://i.pravatar.cc/150?u=${participant._id}`;
};

// URL detector helper to render links inside text messages safely
const renderTextWithLinks = (text: string) => {
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
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Image Upload State
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Redux
    const { data: chatData, isLoading: chatsLoading, isFetching: chatsFetching } = useGetChatsQuery({
        page: 1,
        limit: 50,
        chatType: chatTypeFilter,
    });
    const currentUser = useSelector((state: RootState) => state.auth.user);
    const currentUserId = currentUser?.id;

    const {
        data: messages,
        isLoading: messagesLoading,
        isFetching: messagesFetching,
    } = useGetMessagesQuery(
        { chatId: selectedChatId! },
        { skip: !selectedChatId }
    );

    const { data: chatDetailsRes } = useGetChatDetailsQuery(selectedChatId!, {
        skip: !selectedChatId,
    });

    const [sendMessage, { isLoading: sendingMessage }] = useSendMessageMutation();
    const [markAsRead] = useMarkAsReadMutation();
    const [deleteMessage, { isLoading: deletingMessage }] = useDeleteMessageMutation();

    // Derived Data
    const chats = chatData?.data || [];
    
    const filteredChats = useMemo(() => {
        if (!searchQuery.trim()) return chats;
        const lowerQuery = searchQuery.toLowerCase().trim();
        return chats.filter((chat) => {
            const participant = chat.participants?.[0];
            if (!participant) return false;
            const matchesName = participant.name.toLowerCase().includes(lowerQuery);
            const matchesEmail = participant.email.toLowerCase().includes(lowerQuery);
            const matchesLastMessage = (chat.lastMessage || "").toLowerCase().includes(lowerQuery);
            return matchesName || matchesEmail || matchesLastMessage;
        });
    }, [chats, searchQuery]);
    
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
        const participant = selectedChat.participants?.[0];
        if (!participant) return null;

        return {
            id: selectedChat._id,
            name: participant.name,
            email: participant.email,
            avatar: getAvatarUrl(participant),
            role: participant.role,
            chatType: selectedChat.chatType || "customer_support",
            message: selectedChat.lastMessage,
            time: formatLastUpdated(selectedChat.lastUpdated),
        };
    }, [selectedChat]);

    const relatedOrder = chatDetailsRes?.data?.relatedOrder;

    // Socket Effects
    useEffect(() => {
        const socket = initializeSocket();
        if (!socket) return;

        if (currentUserId) {
            socket.emit("joinRoom", { chatId: currentUserId });
        }

        const handleNewMessage = (message: ChatMessage) => {
            if (selectedChatId && message.chatId === selectedChatId) {
                setLocalMessages(prev => [...prev, message]);
            }
            // Update left sidebar chat item locally in RTK Query cache without refetching
            dispatch(
                chatApi.util.updateQueryData("getChats", { page: 1, limit: 50, chatType: chatTypeFilter }, (draft) => {
                    if (draft?.data) {
                        const targetChat = draft.data.find(c => c._id === message.chatId);
                        if (targetChat) {
                            targetChat.lastMessage = message.content || "📷 Image";
                            targetChat.lastUpdated = message.createdAt || new Date().toISOString();
                        }
                    }
                })
            );
        };

        const handleMessageDeleted = ({ messageId }: { messageId: string }) => {
            setLocalMessages(prev => prev.filter(m => m._id !== messageId));
        };

        const handleTypingStart = ({ chatId }: { chatId: string }) => {
            if (selectedChatId === chatId) setIsTyping(true);
        };

        const handleTypingStop = ({ chatId }: { chatId: string }) => {
            if (selectedChatId === chatId) setIsTyping(false);
        };

        socket.on("newMessage", handleNewMessage);
        socket.on("message:new", handleNewMessage);
        socket.on("messageDeleted", handleMessageDeleted);
        socket.on("typing:start", handleTypingStart);
        socket.on("typing:stop", handleTypingStop);

        return () => {
            socket.off("newMessage", handleNewMessage);
            socket.off("message:new", handleNewMessage);
            socket.off("messageDeleted", handleMessageDeleted);
            socket.off("typing:start", handleTypingStart);
            socket.off("typing:stop", handleTypingStop);
        };
    }, [selectedChatId, currentUserId, chatTypeFilter, dispatch]);

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

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messagesArray, isTyping]);

    useEffect(() => {
        if (filteredChats.length > 0) {
            const exists = filteredChats.some(c => c._id === selectedChatId);
            if (!exists) {
                setSelectedChatId(filteredChats[0]._id);
            }
        } else {
            setSelectedChatId(null);
        }
    }, [filteredChats, selectedChatId]);

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

        setSelectedImage(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const clearSelectedImage = () => {
        setSelectedImage(null);
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

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

    const isCurrentUser = (senderId: string) => {
        return senderId === currentUserId;
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
                                onClick={() => {
                                    setChatTypeFilter("customer_support");
                                    setSelectedChatId(null);
                                }}
                                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all ${chatTypeFilter === "customer_support"
                                        ? "bg-white text-emerald-600 shadow-sm dark:bg-gray-900 dark:text-emerald-400"
                                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                                    }`}
                            >
                                <MessageSquare className="h-3.5 w-3.5" />
                                Customer
                            </button>
                            <button
                                onClick={() => {
                                    setChatTypeFilter("driver_support");
                                    setSelectedChatId(null);
                                }}
                                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all ${chatTypeFilter === "driver_support"
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
                        {chatsLoading || chatsFetching ? (
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
                                const participant = chat.participants?.[0];
                                if (!participant) return null;
                                const isSelected = chat._id === selectedChatId;
                                const hasUnread = (chat.unreadCount || 0) > 0;

                                return (
                                    <motion.button
                                        key={chat._id}
                                        variants={itemVariants}
                                        initial="hidden"
                                        animate="visible"
                                        transition={{ delay: index * 0.03 }}
                                        onClick={() => setSelectedChatId(chat._id)}
                                        className={`relative w-full overflow-hidden rounded-2xl border p-3 text-left transition-all duration-200 ${isSelected
                                                ? "border-emerald-500/50 bg-emerald-50/70 shadow-sm dark:border-emerald-700 dark:bg-emerald-950/30"
                                                : "border-transparent hover:border-gray-200 hover:bg-white hover:shadow-sm dark:hover:border-gray-800 dark:hover:bg-gray-900"
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="relative shrink-0">
                                                <div className="relative h-10 w-10">
                                                    <Image
                                                        src={getAvatarUrl(participant)}
                                                        alt={participant.name}
                                                        fill
                                                        className="rounded-full object-cover border border-white dark:border-gray-700"
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
                <div className="flex min-w-0 flex-col border-r border-gray-100 dark:border-gray-800">
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
                                            alt={selectedContact.name}
                                            fill
                                            className="rounded-full object-cover border-2 border-emerald-100 dark:border-emerald-900"
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="truncate font-bold text-gray-900 dark:text-white text-base">
                                                {selectedContact.name}
                                            </h3>
                                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${selectedContact.role === "driver"
                                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
                                                    : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200"
                                                }`}>
                                                {selectedContact.role}
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
                                {messagesLoading || messagesFetching ? (
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
                                            const fromMe = isCurrentUser(msg.sender._id);
                                            return (
                                                <motion.div
                                                    key={msg._id}
                                                    variants={messageVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit="hidden"
                                                    layout
                                                    className={`flex ${fromMe ? "justify-end" : "justify-start"}`}
                                                >
                                                    <div className="max-w-[85%] md:max-w-2xl group relative">
                                                        <motion.div
                                                            whileHover={{ y: -1, transition: { duration: 0.2 } }}
                                                            className={`relative rounded-3xl px-5 py-4 shadow-sm transition-all duration-300 ${fromMe
                                                                    ? "rounded-br-lg bg-emerald-500 text-white shadow-emerald-500/20"
                                                                    : "rounded-bl-lg border border-gray-100 bg-white text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                                                }`}
                                                        >
                                                            {msg.type === "image" && msg.image?.url && (
                                                                <div className="mb-2 overflow-hidden rounded-2xl max-w-sm">
                                                                    <Image
                                                                        src={cleanImageUrl(msg.image.url)}
                                                                        alt="Message image attachment"
                                                                        width={350}
                                                                        height={260}
                                                                        className="w-full h-auto object-cover rounded-2xl"
                                                                    />
                                                                </div>
                                                            )}
                                                            {msg.content && (
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
                                        alt={selectedContact.name}
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
                                        onClick={() => setDeleteModalOpen(false)}
                                        className="flex-1 px-5 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
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
        </motion.div>
    );
}