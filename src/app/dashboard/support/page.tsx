"use client";

import { useMemo, useState } from "react";
import { Search, Phone, Video, MoreVertical, Send, Paperclip, Smile, CheckCheck, FileText } from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";

type Contact = {
    id: number;
    name: string;
    avatar: string;
    role: string;
    message: string;
    time: string;
    unread?: number;
    online?: boolean;
};

type Message = {
    id: number;
    sender: "me" | "other";
    text?: string;
    image?: string;
    time: string;
};

const contacts: Contact[] = [
    {
        id: 1,
        name: "Eleanor Pena",
        role: "Lead Botanist",
        avatar: "https://i.pravatar.cc/150?img=32",
        message: "I've attached the latest greenhouse report.",
        time: "10:42 AM",
        online: true
    },
    {
        id: 2,
        name: "Wade Warren",
        role: "Operations Manager",
        avatar: "https://i.pravatar.cc/150?img=12",
        message: "Can we review the inventory tomorrow?",
        time: "Yesterday",
        unread: 2
    },
    {
        id: 3,
        name: "Jane Cooper",
        role: "Supply Coordinator",
        avatar: "https://i.pravatar.cc/150?img=5",
        message: "The shipment has arrived.",
        time: "Monday"
    },
    {
        id: 4,
        name: "Robert Fox",
        role: "Warehouse Supervisor",
        avatar: "https://i.pravatar.cc/150?img=22",
        message: "Please confirm the order details.",
        time: "Sunday"
    }
];

const messages: Message[] = [
    {
        id: 1,
        sender: "other",
        text: "Hi! I wanted to check in on the new organic fertilizer order. Did it arrive at the warehouse yet?",
        time: "10:28 AM"
    },
    {
        id: 2,
        sender: "me",
        text: "Yes, it just came in this morning. The pallets look good, no damaged bags so far. I'll have the team start inventory shortly.",
        time: "10:30 AM"
    },
    {
        id: 3,
        sender: "other",
        image:
            "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=1200&auto=format&fit=crop",
        text: "I've attached the latest greenhouse report. The humidity levels in Sector B are perfect right now.",
        time: "10:42 AM"
    },
];

const sharedMedia = [
    "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=500&auto=format&fit=crop"
];

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const containerVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: EASE,
            staggerChildren: 0.08,
        },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.45,
            ease: EASE,
        },
    },
};

const messageVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 20,
        scale: 0.98,
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.45,
            ease: EASE,
        },
    },
};

export default function SupportChatPage() {
    const [selectedContact] = useState<Contact>(contacts[0]);
    const [input, setInput] = useState("");

    const files = useMemo(
        () => [
            { name: "Q3_Fertilizer_Log.pdf", size: "3.2 MB" },
            { name: "Inventory_List_v2.xlsx", size: "4.5 MB" },
        ],
        []
    );

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative h-[calc(96vh-100px)] overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
        >
            <div className="grid h-full grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)_320px]">
                {/* Left Sidebar */}
                <motion.aside
                    variants={itemVariants}
                    className="hidden xl:flex flex-col border-r border-gray-100 bg-gray-50/60 dark:border-gray-800 dark:bg-gray-950/40"
                >
                    <div className="border-b border-gray-100 p-6 dark:border-gray-800">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Messages
                        </h2>

                        <div className="relative mt-5">
                            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto p-4">
                        {contacts.map((contact, index) => (
                            <motion.button
                                key={contact.id}
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                                transition={{ delay: index * 0.05 }}
                                whileHover={{
                                    y: -4,
                                    transition: { duration: 0.25, ease: EASE },
                                }}
                                whileTap={{ scale: 0.98 }}
                                className={`relative w-full overflow-hidden rounded-3xl border p-4 text-left transition-all duration-300 ${contact.id === selectedContact.id
                                    ? "border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
                                    : "border-transparent hover:border-gray-100 hover:bg-white hover:shadow-sm dark:hover:border-gray-800 dark:hover:bg-gray-900"
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="relative shrink-0">
                                        <img
                                            src={contact.avatar}
                                            alt={contact.name}
                                            className="h-12 w-12 rounded-full object-cover"
                                        />
                                        {contact.online && (
                                            <motion.span
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ duration: 0.3, ease: EASE }}
                                                className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 dark:border-gray-900"
                                            />
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <h3 className="truncate font-semibold text-gray-900 dark:text-white">
                                                {contact.name}
                                            </h3>
                                            <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                                                {contact.time}
                                            </span>
                                        </div>

                                        <p className="mt-1 truncate text-sm text-gray-500 dark:text-gray-400">
                                            {contact.message}
                                        </p>
                                    </div>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </motion.aside>

                {/* Main Chat */}
                <div className="flex min-w-0 flex-col">
                    {/* Header */}
                    <motion.div
                        variants={itemVariants}
                        className="flex items-center justify-between border-b border-gray-100 bg-white/80 px-6 py-5 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80"
                    >
                        <div className="flex min-w-0 items-center gap-4">
                            <motion.img
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.25 }}
                                src={selectedContact.avatar}
                                alt={selectedContact.name}
                                className="h-12 w-12 rounded-full object-cover"
                            />

                            <div className="min-w-0">
                                <h3 className="truncate font-semibold text-gray-900 dark:text-white">
                                    {selectedContact.name}
                                </h3>
                                <p className="text-sm text-emerald-500">Online now</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {[Phone, Video, MoreVertical].map((Icon, i) => (
                                <motion.button
                                    key={i}
                                    whileHover={{ scale: 1.08, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="rounded-2xl p-2.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-emerald-500 dark:text-gray-400 dark:hover:bg-gray-800"
                                >
                                    <Icon className="h-5 w-5" />
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto bg-gray-50/40 px-4 py-6 dark:bg-gray-950/20 md:px-6">
                        <div className="mx-auto max-w-4xl space-y-6">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.35, ease: EASE }}
                                className="flex justify-center"
                            >
                                <span className="rounded-full bg-gray-100 px-4 py-1.5 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                    Today
                                </span>
                            </motion.div>

                            <AnimatePresence mode="popLayout">
                                {messages.map((message) => (
                                    <motion.div
                                        key={message.id}
                                        variants={messageVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="hidden"
                                        layout
                                        className={`flex ${message.sender === "me"
                                            ? "justify-end"
                                            : "justify-start"
                                            }`}
                                    >
                                        <div className="max-w-[85%] md:max-w-2xl">
                                            <motion.div
                                                whileHover={{
                                                    y: -4,
                                                    transition: { duration: 0.25, ease: EASE },
                                                }}
                                                className={`rounded-3xl px-5 py-4 shadow-sm transition-all duration-300 ${message.sender === "me"
                                                    ? "rounded-br-lg bg-emerald-500 text-white shadow-emerald-500/20"
                                                    : "rounded-bl-lg border border-gray-100 bg-white text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                                    }`}
                                            >
                                                {message.image && (
                                                    <motion.img
                                                        whileHover={{ scale: 1.02 }}
                                                        transition={{ duration: 0.3 }}
                                                        src={message.image}
                                                        alt="Shared media"
                                                        className="mb-4 h-56 w-full rounded-2xl object-cover"
                                                        loading="lazy"
                                                    />
                                                )}

                                                {message.text && (
                                                    <p className="text-sm leading-7">{message.text}</p>
                                                )}
                                            </motion.div>

                                            <div className="mt-2 flex items-center gap-1 px-2 text-xs text-gray-400">
                                                <span>{message.time}</span>
                                                {message.sender === "me" && (
                                                    <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Input */}
                    <motion.div
                        variants={itemVariants}
                        className="border-t border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
                    >
                        <div className="flex items-center gap-3 rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all duration-300 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 dark:border-gray-700 dark:bg-gray-800">
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 8 }}
                                whileTap={{ scale: 0.9 }}
                                className="text-gray-400 transition-colors hover:text-emerald-500"
                            >
                                <Smile className="h-5 w-5" />
                            </motion.button>

                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-white"
                            />

                            <motion.button
                                whileHover={{ scale: 1.1, rotate: -8 }}
                                whileTap={{ scale: 0.9 }}
                                className="text-gray-400 transition-colors hover:text-emerald-500"
                            >
                                <Paperclip className="h-5 w-5" />
                            </motion.button>

                            <motion.button
                                whileHover={{
                                    scale: 1.05,
                                    y: -2,
                                    boxShadow: "0 12px 24px rgba(16, 185, 129, 0.25)",
                                }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ duration: 0.25 }}
                                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-600"
                            >
                                <Send className="h-4.5 w-4.5" />
                            </motion.button>
                        </div>
                    </motion.div>
                </div>

                {/* Right Sidebar */}
                <motion.aside
                    variants={itemVariants}
                    className="hidden xl:flex flex-col border-l border-gray-100 bg-gray-50/60 dark:border-gray-800 dark:bg-gray-950/40"
                >
                    <div className="border-b border-gray-100 p-6 text-center dark:border-gray-800">
                        <motion.img
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, ease: EASE }}
                            whileHover={{ scale: 1.05 }}
                            src={selectedContact.avatar}
                            alt={selectedContact.name}
                            className="mx-auto h-24 w-24 rounded-full object-cover shadow-lg ring-4 ring-white dark:ring-gray-800"
                        />

                        <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
                            {selectedContact.name}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {selectedContact.role}
                        </p>

                        <motion.span
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15, duration: 0.35 }}
                            className="mt-4 inline-flex items-center rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        >
                            Active now
                        </motion.span>
                    </div>

                    <div className="flex-1 space-y-8 overflow-y-auto p-6">
                        <section>
                            <div className="mb-4 flex items-center justify-between">
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                    Shared Media
                                </h4>
                                <button className="text-sm text-emerald-500 transition-colors hover:text-emerald-600">
                                    View all
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {sharedMedia.map((media, index) => (
                                    <motion.img
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{
                                            delay: index * 0.06,
                                            duration: 0.35,
                                            ease: EASE,
                                        }}
                                        whileHover={{ scale: 1.05, y: -4 }}
                                        src={media}
                                        alt={`Shared media ${index + 1}`}
                                        loading="lazy"
                                        className="aspect-square cursor-pointer rounded-2xl object-cover shadow-sm"
                                    />
                                ))}
                            </div>
                        </section>

                        <section>
                            <h4 className="mb-4 font-semibold text-gray-900 dark:text-white">
                                Files
                            </h4>

                            <div className="space-y-3">
                                {files.map((file, index) => (
                                    <motion.div
                                        key={file.name}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                            delay: index * 0.08,
                                            duration: 0.35,
                                            ease: EASE,
                                        }}
                                        whileHover={{
                                            y: -4,
                                            transition: { duration: 0.25, ease: EASE },
                                        }}
                                        className="relative cursor-pointer overflow-hidden rounded-3xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-300 dark:border-gray-800 dark:bg-gray-900"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="rounded-2xl bg-emerald-50 p-2.5 dark:bg-emerald-900/20">
                                                <FileText className="h-5 w-5 text-emerald-500" />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-medium text-gray-900 dark:text-white">
                                                    {file.name}
                                                </p>
                                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                    {file.size}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </section>
                    </div>
                </motion.aside>
            </div>
        </motion.div>
    );
}