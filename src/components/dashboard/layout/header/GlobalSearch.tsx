"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Search, Users, Package, ShoppingCart, SlidersHorizontal, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useGetProductsQuery } from "@/redux/features/product/productApi";
import { useGetChatsQuery } from "@/redux/features/chat/chatApi";

interface SearchItem {
    id: string;
    title: string;
    subtitle: string;
    category: "products" | "customers" | "orders" | "sliders" | "support";
    icon: React.ReactNode;
    href: string;
}

export default function GlobalSearch() {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Fetch data for search
    const { data: productsData } = useGetProductsQuery({ page: 1, limit: 20 });
    const { data: chatsData } = useGetChatsQuery({ page: 1, limit: 20 });

    // Mock data for orders (in real app, fetch from API)
    const mockOrders: SearchItem[] = [
        {
            id: "1",
            title: "Order #1024",
            subtitle: "Customer: Abc Rahman • $124.50",
            category: "orders",
            icon: <ShoppingCart className="w-4 h-4" />,
            href: "/dashboard/orders"
        },
        {
            id: "2",
            title: "Order #1023",
            subtitle: "Customer: John Doe • $89.99",
            category: "orders",
            icon: <ShoppingCart className="w-4 h-4" />,
            href: "/dashboard/orders"
        }
    ];

    // Mock data for sliders
    const mockSliders: SearchItem[] = [
        {
            id: "1",
            title: "Summer Sale Slider",
            subtitle: "Active • 3 images",
            category: "sliders",
            icon: <SlidersHorizontal className="w-4 h-4" />,
            href: "/dashboard/sliders"
        }
    ];

    // Prepare search data
    const searchItems: SearchItem[] = useMemo(() => {
        const items: SearchItem[] = [];

        // Products
        (productsData?.data || []).forEach((product) => {
            items.push({
                id: product._id,
                title: product.name,
                subtitle: `$${product.discountPrice || product.price} • Stock: ${product.stock}`,
                category: "products",
                icon: <Package className="w-4 h-4" />,
                href: "/dashboard/products"
            });
        });

        // Support Chats (Customers)
        (chatsData?.data || []).forEach((chat) => {
            const participant = chat.participants?.[0];
            if (participant) {
                items.push({
                    id: chat._id,
                    title: participant.name,
                    subtitle: `${participant.email} • ${chat.lastMessage}`,
                    category: "customers",
                    icon: <Users className="w-4 h-4" />,
                    href: "/dashboard/customers"
                });
            }
        });

        // Orders
        items.push(...mockOrders);

        // Sliders
        items.push(...mockSliders);

        return items;
    }, [productsData, chatsData]);

    // Filter items based on search query
    const filteredItems = useMemo(() => {
        if (!searchQuery.trim()) return [];

        const lowerQuery = searchQuery.toLowerCase().trim();
        return searchItems.filter((item) =>
            item.title.toLowerCase().includes(lowerQuery) ||
            item.subtitle.toLowerCase().includes(lowerQuery) ||
            item.category.toLowerCase().includes(lowerQuery)
        ).slice(0, 8); // Limit to 8 results
    }, [searchItems, searchQuery]);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsOpen((prev) => !prev);
            }

            if (e.key === "Escape") {
                setIsOpen(false);
            }

            if (isOpen) {
                if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setSelectedIndex((prev) =>
                        prev < filteredItems.length - 1 ? prev + 1 : 0
                    );
                } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setSelectedIndex((prev) =>
                        prev > 0 ? prev - 1 : filteredItems.length - 1
                    );
                } else if (e.key === "Enter" && filteredItems.length > 0) {
                    const item = filteredItems[selectedIndex];
                    if (item) {
                        router.push(item.href);
                        setIsOpen(false);
                        setSearchQuery("");
                    }
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, selectedIndex, filteredItems, router]);

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            setSelectedIndex(0);
        }
    }, [isOpen]);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getCategoryColor = (category: string) => {
        switch (category) {
            case "products": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
            case "customers": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
            case "orders": return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
            case "sliders": return "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400";
            case "support": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
            default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
        }
    };

    return (
        <div ref={searchRef} className="relative w-full">
            {/* Search Input (Always Visible) */}
            <div className="group relative w-full">
                {/* Glow Effect */}
                <div className="absolute -inset-0.5 rounded-2xl bg-linear-to-r from-emerald-500/20 via-green-500/10 to-emerald-500/20 opacity-0 blur-lg transition duration-500 group-focus-within:opacity-100" />

                {/* Search Icon */}
                <Search className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors duration-300 group-focus-within:text-emerald-500 dark:text-gray-500 dark:group-focus-within:text-emerald-400" />

                {/* Search Input */}
                <input
                    ref={inputRef}
                    onClick={() => setIsOpen(true)}
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (!isOpen && e.target.value) setIsOpen(true);
                    }}
                    type="text"
                    placeholder="Search products, orders, customers..."
                    className="relative w-full rounded-2xl border border-gray-200/80 bg-white/90 py-3 pl-12 pr-20 text-sm font-medium text-gray-900 shadow-sm backdrop-blur-xl transition-all duration-300 placeholder:text-gray-400 hover:border-emerald-200 hover:shadow-md focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none dark:border-gray-700/80 dark:bg-gray-800/80 dark:text-white dark:placeholder:text-gray-500 dark:hover:border-emerald-800 dark:focus:border-emerald-700"
                />

                {/* Ctrl + K Shortcut Badge */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden items-center gap-1 sm:flex">
                    <kbd className="rounded-lg bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-500 dark:bg-gray-700 dark:text-gray-300">
                        Ctrl
                    </kbd>
                    <span className="text-gray-400 text-xs">+</span>
                    <kbd className="rounded-lg bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-500 dark:bg-gray-700 dark:text-gray-300">
                        K
                    </kbd>
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Search Dropdown */}
                        <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.98 }}
                            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                            className="absolute left-1/2 right-auto top-full z-50 mt-4 w-[calc(100vw-2rem)] sm:w-full sm:max-w-2xl -translate-x-1/2 sm:translate-x-0 sm:left-0 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900"
                        >
                            {/* Results */}
                            <div className="max-h-[450px] overflow-y-auto p-4">
                                {filteredItems.length > 0 ? (
                                    <div className="space-y-2">
                                        {filteredItems.map((item, index) => (
                                            <motion.button
                                                key={item.id}
                                                initial={{ opacity: 0, y: 4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.03 }}
                                                onClick={() => {
                                                    router.push(item.href);
                                                    setIsOpen(false);
                                                    setSearchQuery("");
                                                }}
                                                className={`flex w-full items-center justify-between gap-4 rounded-2xl p-4 text-left transition-all duration-200 ${selectedIndex === index
                                                        ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-100"
                                                        : "hover:bg-gray-50 dark:hover:bg-gray-800"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${getCategoryColor(item.category)}`}>
                                                        {item.icon}
                                                    </div>
                                                    <div>
                                                        <p className={`font-semibold ${selectedIndex === index ? "text-emerald-900 dark:text-emerald-100" : "text-gray-900 dark:text-white"
                                                            }`}>
                                                            {item.title}
                                                        </p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.subtitle}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getCategoryColor(item.category)}`}>
                                                        {item.category}
                                                    </span>
                                                    <ChevronRight className="h-4 w-4 text-gray-400" />
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                ) : searchQuery.trim() ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <div className="mb-4 h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center dark:bg-gray-800">
                                            <Search className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <p className="font-semibold text-gray-900 dark:text-white mb-2">
                                            No results found
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Try searching for something else
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-10 text-center">
                                        <div className="mb-4 h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center dark:bg-emerald-900/30">
                                            <Search className="h-7 w-7 text-emerald-500 dark:text-emerald-400" />
                                        </div>
                                        <p className="font-semibold text-gray-900 dark:text-white mb-2">
                                            Search everything instantly
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                            Products, orders, customers, sliders & more
                                        </p>
                                        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-gray-400">
                                            <kbd className="rounded-lg bg-gray-100 px-2 py-1 font-semibold dark:bg-gray-800">
                                                ↑
                                            </kbd>
                                            <kbd className="rounded-lg bg-gray-100 px-2 py-1 font-semibold dark:bg-gray-800">
                                                ↓
                                            </kbd>
                                            <span>Navigate</span>
                                            <span className="hidden sm:inline">•</span>
                                            <kbd className="rounded-lg bg-gray-100 px-2 py-1 font-semibold dark:bg-gray-800">
                                                Enter
                                            </kbd>
                                            <span>Open</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}