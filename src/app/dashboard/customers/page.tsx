"use client";

import { useMemo, useState } from "react";
import { Search, Filter, Download, ChevronLeft, ChevronRight, MoreHorizontal, Mail, ShoppingBag, Users, DollarSign, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type CustomerStatus = "Active" | "Blocked" | "Pending";
type OrderStatus = "Delivered" | "Processing" | "Shipped" | "Cancelled";

interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar: string;
    status: CustomerStatus;
    totalOrders: number;
    currentOrders: number;
    totalSpent: number;
    joinedAt: string;
    lastOrder: string;
    orderStatus: OrderStatus;
}

const customers: Customer[] = [
    {
        id: "CST-9281",
        name: "Eleanor Shellstrop",
        email: "eleanor@shrimp.com",
        phone: "+1 (555) 012-3456",
        avatar: "https://i.pravatar.cc/100?img=32",
        status: "Active",
        totalOrders: 24,
        currentOrders: 2,
        totalSpent: 4250,
        joinedAt: "2023-10-12",
        lastOrder: "2026-04-20",
        orderStatus: "Delivered",
    },
    {
        id: "CST-4421",
        name: "Chidi Anagonye",
        email: "chidi@ethics.edu",
        phone: "+1 (555) 987-6543",
        avatar: "https://i.pravatar.cc/100?img=12",
        status: "Active",
        totalOrders: 12,
        currentOrders: 1,
        totalSpent: 2180,
        joinedAt: "2023-11-04",
        lastOrder: "2026-04-19",
        orderStatus: "Processing",
    },
    {
        id: "CST-7761",
        name: "Tahani Al-Jamil",
        email: "tahani@gmail.com",
        phone: "+1 (555) 301-0987",
        avatar: "https://i.pravatar.cc/100?img=47",
        status: "Blocked",
        totalOrders: 48,
        currentOrders: 0,
        totalSpent: 9320,
        joinedAt: "2023-12-20",
        lastOrder: "2026-04-14",
        orderStatus: "Cancelled",
    },
    {
        id: "CST-6672",
        name: "Jason Mendoza",
        email: "jason@duval.com",
        phone: "+1 (555) 443-2211",
        avatar: "https://i.pravatar.cc/100?img=15",
        status: "Pending",
        totalOrders: 6,
        currentOrders: 1,
        totalSpent: 860,
        joinedAt: "2024-01-05",
        lastOrder: "2026-04-21",
        orderStatus: "Shipped",
    },
    {
        id: "CST-0001",
        name: "Janet NotAGirl",
        email: "janet@knowledge.ai",
        phone: "+1 (555) 000-0000",
        avatar: "https://i.pravatar.cc/100?img=5",
        status: "Active",
        totalOrders: 99,
        currentOrders: 4,
        totalSpent: 18450,
        joinedAt: "2023-08-01",
        lastOrder: "2026-04-22",
        orderStatus: "Processing",
    },
    {
        id: "CST-1102",
        name: "Michael Architect",
        email: "michael@neighborhood.io",
        phone: "+1 (555) 654-7788",
        avatar: "https://i.pravatar.cc/100?img=22",
        status: "Active",
        totalOrders: 31,
        currentOrders: 3,
        totalSpent: 6450,
        joinedAt: "2024-02-15",
        lastOrder: "2026-04-23",
        orderStatus: "Delivered",
    },
    {
        id: "CST-8843",
        name: "Vicky Larson",
        email: "vicky@store.com",
        phone: "+1 (555) 741-9632",
        avatar: "https://i.pravatar.cc/100?img=41",
        status: "Blocked",
        totalOrders: 17,
        currentOrders: 0,
        totalSpent: 1910,
        joinedAt: "2024-03-12",
        lastOrder: "2026-04-11",
        orderStatus: "Cancelled",
    },
    {
        id: "CST-2044",
        name: "Sarah Parker",
        email: "sarah@company.com",
        phone: "+1 (555) 321-6549",
        avatar: "https://i.pravatar.cc/100?img=25",
        status: "Active",
        totalOrders: 54,
        currentOrders: 5,
        totalSpent: 12120,
        joinedAt: "2023-09-28",
        lastOrder: "2026-04-24",
        orderStatus: "Shipped",
    },
];


const statusStyles: Record<CustomerStatus, string> = {
    Active: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
    Blocked: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
    Pending: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
};

const orderStyles: Record<OrderStatus, string> = {
    Delivered: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    Processing: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    Shipped: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400",
    Cancelled: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
};

function StatCard({ title, value, icon: Icon, subtitle }: { title: string; value: string; subtitle: string; icon: any; }) {
    return (
        <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.25 }}
            className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {title}
                    </p>
                    <h3 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                        {value}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {subtitle}
                    </p>
                </div>

                <div className="rounded-2xl bg-emerald-50 p-3 dark:bg-emerald-500/10">
                    <Icon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
            </div>
        </motion.div>
    );
}

function StatusBadge({ status }: { status: CustomerStatus }) {
    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status]}`}
        >
            {status}
        </span>
    );
}

function OrderBadge({ status }: { status: OrderStatus }) {
    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${orderStyles[status]}`}
        >
            {status}
        </span>
    );
}

export default function CustomersPage() {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("All");
    const [page, setPage] = useState(1);

    const perPage = 5;

    const filteredCustomers = useMemo(() => {
        return customers.filter((customer) => {
            const matchesSearch =
                customer.name.toLowerCase().includes(search.toLowerCase()) ||
                customer.email.toLowerCase().includes(search.toLowerCase()) ||
                customer.id.toLowerCase().includes(search.toLowerCase());

            const matchesStatus =
                status === "All" || customer.status === status;

            return matchesSearch && matchesStatus;
        });
    }, [search, status]);

    const totalPages = Math.ceil(filteredCustomers.length / perPage);

    const paginatedCustomers = filteredCustomers.slice(
        (page - 1) * perPage,
        page * perPage
    );

    const activeCustomers = customers.filter(
        (c) => c.status === "Active"
    ).length;

    const totalRevenue = customers.reduce(
        (sum, c) => sum + c.totalSpent,
        0
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Customers
                    </h1>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">
                        Manage your customers, orders, and relationships.
                    </p>
                </div>

                <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                    <Download className="h-4 w-4" />
                    Export Customers
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    title="Total Customers"
                    value={customers.length.toString()}
                    subtitle="Across all segments"
                    icon={Users}
                />
                <StatCard
                    title="Active Customers"
                    value={activeCustomers.toString()}
                    subtitle="Currently engaged"
                    icon={Mail}
                />
                <StatCard
                    title="Total Revenue"
                    value={`$${totalRevenue.toLocaleString()}`}
                    subtitle="Lifetime customer value"
                    icon={DollarSign}
                />
                <StatCard
                    title="Open Orders"
                    value={customers
                        .reduce((sum, c) => sum + c.currentOrders, 0)
                        .toString()}
                    subtitle="Pending fulfillment"
                    icon={Package}
                />
            </div>

            {/* Table Card */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
                {/* Filters */}
                <div className="border-b border-gray-100 p-6 dark:border-gray-800">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search customers..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                className="h-12 w-full rounded-2xl border border-gray-200 bg-white pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            />
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <div className="relative">
                                <Filter className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <select
                                    value={status}
                                    onChange={(e) => {
                                        setStatus(e.target.value);
                                        setPage(1);
                                    }}
                                    className="h-12 rounded-2xl border border-gray-200 bg-white pl-11 pr-10 text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                >
                                    <option>All</option>
                                    <option>Active</option>
                                    <option>Pending</option>
                                    <option>Blocked</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden overflow-x-auto lg:block">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/70 dark:border-gray-800 dark:bg-gray-800/50">
                                {[
                                    "Customer",
                                    "Contact",
                                    "Joining Date",
                                    "Total Orders",
                                    "Current Orders",
                                    "Order Status",
                                    "Status",
                                    "Actions",
                                ].map((heading) => (
                                    <th
                                        key={heading}
                                        className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                                    >
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            <AnimatePresence mode="wait">
                                {paginatedCustomers.map((customer, index) => (
                                    <motion.tr
                                        key={customer.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ delay: index * 0.04 }}
                                        className="border-b border-gray-100 transition-colors hover:bg-gray-50/70 dark:border-gray-800 dark:hover:bg-gray-800/40"
                                    >
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <img
                                                    src={customer.avatar}
                                                    alt={customer.name}
                                                    className="h-12 w-12 rounded-2xl object-cover ring-2 ring-gray-100 dark:ring-gray-700"
                                                />
                                                <div>
                                                    <p className="font-semibold text-gray-900 dark:text-white">
                                                        {customer.name}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        ID: {customer.id}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-5">
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {customer.email}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {customer.phone}
                                            </p>
                                        </td>

                                        <td className="px-6 py-5 text-gray-700 dark:text-gray-300">
                                            {new Date(customer.joinedAt).toLocaleDateString()}
                                        </td>

                                        <td className="px-6 py-5">
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {customer.totalOrders}
                                            </span>
                                        </td>

                                        <td className="px-6 py-5">
                                            <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-emerald-50 px-2.5 py-1 text-sm font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                                                {customer.currentOrders}
                                            </span>
                                        </td>

                                        <td className="px-6 py-5">
                                            <OrderBadge status={customer.orderStatus} />
                                        </td>

                                        <td className="px-6 py-5">
                                            <StatusBadge status={customer.status} />
                                        </td>

                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <button className="rounded-xl border border-gray-200 p-2 text-gray-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-emerald-500/10">
                                                    <Mail className="h-4 w-4" />
                                                </button>
                                                <button className="rounded-xl border border-gray-200 p-2 text-gray-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-blue-500/10">
                                                    <ShoppingBag className="h-4 w-4" />
                                                </button>
                                                <button className="rounded-xl border border-gray-200 p-2 text-gray-600 transition hover:border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="space-y-4 p-4 lg:hidden">
                    {paginatedCustomers.map((customer) => (
                        <motion.div
                            key={customer.id}
                            whileHover={{ y: -2 }}
                            className="rounded-2xl border border-gray-100 p-4 dark:border-gray-800"
                        >
                            <div className="flex items-start gap-4">
                                <img
                                    src={customer.avatar}
                                    alt={customer.name}
                                    className="h-14 w-14 rounded-2xl object-cover"
                                />

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                                {customer.name}
                                            </h3>
                                            <p className="truncate text-sm text-gray-500">
                                                {customer.email}
                                            </p>
                                        </div>
                                        <StatusBadge status={customer.status} />
                                    </div>

                                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className="text-gray-500">Orders</p>
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {customer.totalOrders}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Open</p>
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {customer.currentOrders}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Joined</p>
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {new Date(customer.joinedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Status</p>
                                            <OrderBadge status={customer.orderStatus} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Pagination */}
                <div className="flex flex-col gap-4 border-t border-gray-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Showing{" "}
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {(page - 1) * perPage + 1}
                        </span>{" "}
                        to{" "}
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {Math.min(page * perPage, filteredCustomers.length)}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {filteredCustomers.length}
                        </span>{" "}
                        customers
                    </p>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="rounded-xl border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={`h-10 w-10 rounded-xl text-sm font-semibold transition ${p === page
                                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25"
                                    : "border border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                                    }`}
                            >
                                {p}
                            </button>
                        ))}

                        <button
                            onClick={() =>
                                setPage((p) => Math.min(totalPages, p + 1))
                            }
                            disabled={page === totalPages}
                            className="rounded-xl border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}