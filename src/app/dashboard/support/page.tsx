"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Send, Paperclip, Smile, CheckCheck, Loader2, Trash2, X } from "lucide-react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { useGetChatsQuery, useGetMessagesQuery, useSendMessageMutation, useMarkAsReadMutation, useDeleteMessageMutation } from "@/redux/features/chat/chatApi";
import type { Chat, Participant, Message as ChatMessage } from "@/redux/features/chat/chatTypes";
import Image from "next/image";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { getSocket, initializeSocket } from "@/lib/socket";

// Helper Functions
const formatLastUpdated = (dateString: string) => {
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

const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
};

const cleanImageUrl = (url: string | undefined | null) => {
    if (!url) return "";
    return url.trim().replace(/`/g, "");
};

const getAvatarUrl = (participant: Participant) => {
    if (participant.avatar) {
        return cleanImageUrl(participant.avatar);
    }
    return `https://i.pravatar.cc/150?u=${participant._id}`;
};

// Framer Motion Config
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const containerVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: EASE, staggerChildren: 0.08 },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

const messageVariants: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: EASE } },
};

// Main Component
export default function SupportChatPage() {
    // State
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [input, setInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
    const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Redux
    const { data: chatData, isLoading: chatsLoading, isFetching: chatsFetching, refetch: refetchChats } = useGetChatsQuery({ page: 1, limit: 20 });
    const currentUser = useSelector((state: RootState) => state.auth.user);
    const currentUserId = currentUser?.id;

    const {
        data: messages,
        isLoading: messagesLoading,
        isFetching: messagesFetching,
        refetch: refetchMessages,
    } = useGetMessagesQuery(
        { chatId: selectedChatId! },
        { skip: !selectedChatId }
    );

    const [sendMessage, { isLoading: sendingMessage }] = useSendMessageMutation();
    const [markAsRead] = useMarkAsReadMutation();
    const [deleteMessage, { isLoading: deletingMessage }] = useDeleteMessageMutation();

    // Derived Data
    const chats = chatData?.data || [];
    
    // Filter chats based on search query
    const filteredChats = useMemo(() => {
        if (!searchQuery.trim()) return chats;
        
        const lowerQuery = searchQuery.toLowerCase().trim();
        return chats.filter((chat) => {
            const participant = chat.participants?.[0];
            if (!participant) return false;
            
            // Search by:
            // 1. Participant name
            const matchesName = participant.name.toLowerCase().includes(lowerQuery);
            // 2. Participant email
            const matchesEmail = participant.email.toLowerCase().includes(lowerQuery);
            // 3. Last message
            const matchesLastMessage = chat.lastMessage.toLowerCase().includes(lowerQuery);
            // 4. Role (user/admin)
            const matchesRole = participant.role.toLowerCase().includes(lowerQuery);
            
            return matchesName || matchesEmail || matchesLastMessage || matchesRole;
        });
    }, [chats, searchQuery]);
    
    const messagesArray = useMemo(() => {
        // If local messages exist, merge them with API messages
        if (localMessages.length > 0 && messages) {
            const combined = [...messages, ...localMessages];
            // Remove duplicates by _id
            const uniqueMessages = combined.filter((msg, index, self) =>
                index === self.findIndex((m) => m._id === msg._id)
            );
            // Sort by createdAt
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
            avatar: getAvatarUrl(participant),
            role: participant.role,
            message: selectedChat.lastMessage,
            time: formatLastUpdated(selectedChat.lastUpdated),
        };
    }, [selectedChat]);

    // Effects
    useEffect(() => {
        // Initialize socket
        const socket = initializeSocket();
        if (!socket) return;

        // Join rooms
        if (currentUserId) {
            socket.emit("joinRoom", { chatId: currentUserId });
        }

        // Listen for new messages
        const handleNewMessage = (message: ChatMessage) => {
            console.log("📨 New message received:", message);

            // If the message is in the currently selected chat, add it to local messages
            if (selectedChatId && message.chatId === selectedChatId) {
                setLocalMessages(prev => [...prev, message]);
            }

            // Refetch chats to update last message
            refetchChats();
        };

        // Listen for message deleted
        const handleMessageDeleted = ({ messageId }: { messageId: string }) => {
            console.log("🗑️ Message deleted:", messageId);

            // Remove from local messages
            setLocalMessages(prev => prev.filter(m => m._id !== messageId));

            // Refetch everything to be safe
            refetchChats();
            if (selectedChatId) {
                refetchMessages();
            }
        };

        // Listen for messages read
        const handleMessagesRead = ({ chatId, userId }: { chatId: string; userId: string }) => {
            console.log("✅ Messages read:", { chatId, userId });
            if (selectedChatId === chatId) {
                refetchMessages();
            }
        };

        socket.on("newMessage", handleNewMessage);
        socket.on("messageDeleted", handleMessageDeleted);
        socket.on("messagesRead", handleMessagesRead);

        return () => {
            socket.off("newMessage", handleNewMessage);
            socket.off("messageDeleted", handleMessageDeleted);
            socket.off("messagesRead", handleMessagesRead);
        };
    }, [selectedChatId, currentUserId, refetchChats, refetchMessages]);

    useEffect(() => {
        if (selectedChatId) {
            // Join the chat room
            const socket = getSocket();
            if (socket) {
                socket.emit("joinRoom", { chatId: selectedChatId });
            }

            markAsRead(selectedChatId).catch(() => { });
        }
        // Reset local messages when switching chats
        setLocalMessages([]);
    }, [selectedChatId, markAsRead]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messagesArray]);

    useEffect(() => {
        if (chats.length > 0 && !selectedChatId) {
            setSelectedChatId(chats[0]._id);
        }
    }, [chats, selectedChatId]);

    // Event Handlers
    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!selectedChatId || !input.trim()) return;

        try {
            await sendMessage({
                chatId: selectedChatId,
                content: input.trim(),
                type: "text",
            }).unwrap();
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
            <div className="grid h-full grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)]">
                {/* Left Sidebar - Chats List */}
                <motion.aside
                    variants={itemVariants}
                    className="hidden lg:flex flex-col border-r border-gray-100 bg-gray-50/60 dark:border-gray-800 dark:bg-gray-950/40"
                >
                    <div className="border-b border-gray-100 p-6 dark:border-gray-800">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Support Chats
                        </h2>
                        <div className="relative mt-5">
                            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, email, message, role..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto p-4">
                        {chatsLoading || chatsFetching ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="relative w-full overflow-hidden rounded-3xl border border-gray-100 bg-white p-4 text-left dark:border-gray-800 dark:bg-gray-900"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
                                        <div className="min-w-0 flex-1 space-y-2">
                                            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                                            <div className="h-3 w-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : filteredChats.length === 0 ? (
                            <div className="text-center py-10 space-y-3">
                                <div className="flex justify-center">
                                    <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                        <Search className="h-8 w-8 text-gray-400" />
                                    </div>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 font-medium">
                                    {searchQuery ? "No chats found" : "No chats yet"}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {searchQuery 
                                        ? "Try searching with a different term" 
                                        : "Start a conversation to get started"
                                    }
                                </p>
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-colors"
                                    >
                                        <X className="h-4 w-4" />
                                        Clear search
                                    </button>
                                )}
                            </div>
                        ) : (
                            filteredChats.map((chat, index) => {
                                const participant = chat.participants?.[0];
                                if (!participant) return null;
                                const isSelected = chat._id === selectedChatId;

                                return (
                                    <motion.button
                                        key={chat._id}
                                        variants={itemVariants}
                                        initial="hidden"
                                        animate="visible"
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ y: -2, transition: { duration: 0.2, ease: EASE } }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setSelectedChatId(chat._id)}
                                        className={`relative w-full overflow-hidden rounded-3xl border p-4 text-left transition-all duration-300 ${isSelected
                                            ? "border-emerald-200 bg-emerald-50/80 shadow-sm dark:border-emerald-800 dark:bg-emerald-900/20"
                                            : "border-transparent hover:border-gray-100 hover:bg-white hover:shadow-sm dark:hover:border-gray-800 dark:hover:bg-gray-900"
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="relative shrink-0">
                                                <div className="relative h-12 w-12">
                                                    <Image
                                                        src={getAvatarUrl(participant)}
                                                        alt={participant.name}
                                                        fill
                                                        className="rounded-full object-cover border-2 border-white dark:border-gray-700"
                                                    />
                                                </div>
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <h3 className="truncate font-semibold text-gray-900 dark:text-white">
                                                        {participant.name}
                                                    </h3>
                                                    <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                                                        {formatLastUpdated(chat.lastUpdated)}
                                                    </span>
                                                </div>
                                                <p className="mt-1 truncate text-sm text-gray-500 dark:text-gray-400">
                                                    {chat.lastMessage}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.button>
                                );
                            })
                        )}
                    </div>
                </motion.aside>

                {/* Main Chat Area */}
                <div className="flex min-w-0 flex-col">
                    {/* Chat Header */}
                    <motion.div
                        variants={itemVariants}
                        className="flex items-center justify-between border-b border-gray-100 bg-white/80 px-6 py-5 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80"
                    >
                        {selectedContact ? (
                            <div className="flex min-w-0 items-center gap-4">
                                <div className="relative h-12 w-12">
                                    <Image
                                        src={selectedContact.avatar}
                                        alt={selectedContact.name}
                                        fill
                                        className="rounded-full object-cover border-2 border-emerald-100 dark:border-emerald-900"
                                    />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="truncate font-semibold text-gray-900 dark:text-white">
                                        {selectedContact.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                                        {selectedContact.role}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center w-full">
                                <p className="text-gray-500 dark:text-gray-400">Select a chat to start</p>
                            </div>
                        )}
                    </motion.div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto bg-gray-50/40 px-4 py-6 dark:bg-gray-950/20 md:px-6">
                        {selectedContact ? (
                            <div className="mx-auto max-w-4xl space-y-6">
                                {messagesLoading || messagesFetching ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
                                        >
                                            <div className={`max-w-[85%] md:max-w-2xl ${i % 2 === 0 ? "rounded-bl-lg" : "rounded-br-lg"}`}>
                                                <div className="rounded-3xl bg-gray-200 dark:bg-gray-800 animate-pulse px-5 py-4 h-16" />
                                            </div>
                                        </div>
                                    ))
                                ) : messagesArray.length === 0 ? (
                                    <div className="text-center py-20">
                                        <div className="mb-4 flex justify-center">
                                            <div className="h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                <MessageIcon className="h-10 w-10 text-gray-400" />
                                            </div>
                                        </div>
                                        <p className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-2">
                                            No messages yet
                                        </p>
                                        <p className="text-sm text-gray-400 dark:text-gray-500">
                                            Start the conversation!
                                        </p>
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
                                                                <div className="mb-3 overflow-hidden rounded-2xl">
                                                                    <Image
                                                                        src={cleanImageUrl(msg.image.url)}
                                                                        alt="Message image"
                                                                        width={400}
                                                                        height={300}
                                                                        className="w-full h-auto object-cover"
                                                                    />
                                                                </div>
                                                            )}
                                                            {msg.content && (
                                                                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                                                    {msg.content}
                                                                </p>
                                                            )}
                                                        </motion.div>

                                                        <div className="mt-2 flex items-center justify-between gap-2 px-2">
                                                            <span className="text-xs text-gray-400">
                                                                {formatMessageTime(msg.createdAt)}
                                                            </span>
                                                            {fromMe && (
                                                                <div className="flex items-center gap-1">
                                                                    <button
                                                                        onClick={() => handleDeleteClick(msg._id)}
                                                                        className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1"
                                                                        title="Delete message"
                                                                    >
                                                                        {deletingMessage && messageToDelete === msg._id ? (
                                                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                        ) : (
                                                                            <Trash2 className="h-3.5 w-3.5" />
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
                                <div ref={messagesEndRef} />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                                <div className="mb-4">
                                    <div className="h-24 w-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                        <MessageIcon className="h-12 w-12 text-gray-400" />
                                    </div>
                                </div>
                                <p className="text-lg font-medium">Select a conversation</p>
                                <p className="text-sm mt-1">Choose a chat from the left sidebar</p>
                            </div>
                        )}
                    </div>

                    {/* Message Input */}
                    <motion.div
                        variants={itemVariants}
                        className="border-t border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
                    >
                        {selectedContact ? (
                            <form onSubmit={handleSendMessage} className="flex items-center gap-3 rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all duration-300 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 dark:border-gray-700 dark:bg-gray-800">
                                <button
                                    type="button"
                                    className="text-gray-400 transition-colors hover:text-emerald-500"
                                >
                                    <Smile className="h-5 w-5" />
                                </button>
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-white"
                                />
                                <button
                                    type="button"
                                    className="text-gray-400 transition-colors hover:text-emerald-500"
                                >
                                    <Paperclip className="h-5 w-5" />
                                </button>
                                <button
                                    type="submit"
                                    disabled={!input.trim() || sendingMessage}
                                    className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-600 disabled:opacity-50 disabled:active:scale-100 active:scale-95"
                                >
                                    {sendingMessage ? (
                                        <Loader2 className="h-4.5 w-4.5 animate-spin" />
                                    ) : (
                                        <Send className="h-4.5 w-4.5" />
                                    )}
                                </button>
                            </form>
                        ) : (
                            <div className="text-center text-gray-500 dark:text-gray-400 py-3">
                                Select a conversation to send messages
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
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
                                    Are you sure you want to delete this message? This action cannot be undone.
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

function MessageIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    );
}