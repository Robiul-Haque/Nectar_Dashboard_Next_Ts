"use client";

import { useState } from "react";
import { Search, Filter, Download, ChevronLeft, ChevronRight, Mail, MapPin, ShieldCheck, ShieldAlert, UserCheck, UserX, Calendar, Users, Loader2, FileText, FileSpreadsheet, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetUsersQuery, useToggleUserStatusMutation } from "@/redux/features/user/userApi";
import Image from "next/image";
import toast from "react-hot-toast";
import { exportToCSV, exportToPDF, prepareCustomerExport } from "@/lib/utils/export";

const statusStyles = {
    active: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
    inactive: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
};

const verifyStyles = {
    verified: "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
    unverified: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
};

function CustomStatusDropdown({ currentStatus, onStatusChange, isLoading }: { currentStatus: boolean; onStatusChange: (status: boolean) => void; isLoading: boolean; }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isLoading}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors border disabled:opacity-50 disabled:cursor-not-allowed ${
                    currentStatus
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                        : "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
                }`}
            >
                {isLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                ) : currentStatus ? (
                    <UserCheck className="h-3 w-3" />
                ) : (
                    <UserX className="h-3 w-3" />
                )}
                {currentStatus ? "Active" : "Inactive"}
                <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <div
                    className="absolute z-50 right-0 top-full mt-2 w-36 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden"
                    onMouseLeave={() => setIsOpen(false)}
                >
                    <button
                        onClick={() => {
                            onStatusChange(true);
                            setIsOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                            currentStatus
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                    >
                        <UserCheck className="h-4 w-4" />
                        Active
                    </button>
                    <button
                        onClick={() => {
                            onStatusChange(false);
                            setIsOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                            !currentStatus
                                ? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                    >
                        <UserX className="h-4 w-4" />
                        Inactive
                    </button>
                </div>
            )}
        </div>
    );
}

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

export default function CustomersPage() {
    const [search, setSearch] = useState("");
    const [isActiveFilter, setIsActiveFilter] = useState<string>("all");
    const [page, setPage] = useState(1);
    const limit = 10;

    const { data: usersData, isLoading, isFetching } = useGetUsersQuery({
        search,
        isActive: isActiveFilter === "all" ? undefined : isActiveFilter === "active",
        page,
        limit,
    });

    const [toggleUserStatus, { isLoading: isUpdatingStatus }] = useToggleUserStatusMutation();

    const users = usersData?.data || [];
    const pagination = usersData?.pagination;
    const totalPages = pagination?.totalPages || 0;

    const handleUpdateStatus = async (id: string, newStatus: boolean) => {
        try {
            const res = await toggleUserStatus({ id, isActive: newStatus }).unwrap();
            toast.success(res.message || "Status updated successfully!");
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to update status!");
        }
    };

    const [showExportMenu, setShowExportMenu] = useState(false);

    const handleExportCSV = () => {
        const { csvHeaders, csvData } = prepareCustomerExport(users);
        exportToCSV(users, `customers-${new Date().toISOString().split('T')[0]}`, undefined, { csvHeaders, csvData });
        toast.success("CSV exported successfully!");
        setShowExportMenu(false);
    };

    const handleExportPDF = () => {
        const { pdfHeaders, pdfData } = prepareCustomerExport(users);
        exportToPDF("Customer Report", pdfHeaders, pdfData, `customers-${new Date().toISOString().split('T')[0]}`);
        toast.success("PDF download initiated!");
        setShowExportMenu(false);
    };

    const cleanImageUrl = (url: string) => {
        if (!url) return "";
        return url.trim().replace(/`/g, "");
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Customers
                    </h1>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">
                        Manage your customers and their account statuses.
                    </p>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                    >
                        <Download className="h-4 w-4" />
                        Export Customers
                        <ChevronDown className="h-4 w-4" />
                    </button>

                    <AnimatePresence>
                        {showExportMenu && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute right-0 top-full mt-2 w-48 z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
                            >
                                <button
                                    onClick={handleExportCSV}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                                    Export as CSV
                                </button>
                                <button
                                    onClick={handleExportPDF}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <FileText className="h-4 w-4 text-blue-500" />
                                    Export as PDF
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                <StatCard
                    title="Total Customers"
                    value={pagination?.total?.toString() || "0"}
                    subtitle="Registered users"
                    icon={Users}
                />
                <StatCard
                    title="Active Users"
                    value={users.filter(u => u.isActive).length.toString()}
                    subtitle="Currently active"
                    icon={UserCheck}
                />
                <StatCard
                    title="New Joinees"
                    value={users.filter(u => {
                        const date = new Date(u.createdAt);
                        const now = new Date();
                        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                    }).length.toString()}
                    subtitle="This month"
                    icon={Calendar}
                />
            </div>

            {/* Table Card */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-hidden"
            >
                {/* Filters */}
                <div className="border-b border-gray-100 p-6 dark:border-gray-800">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
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
                                    value={isActiveFilter}
                                    onChange={(e) => {
                                        setIsActiveFilter(e.target.value);
                                        setPage(1);
                                    }}
                                    className="h-12 rounded-2xl border border-gray-200 bg-white pl-11 pr-10 text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white appearance-none cursor-pointer"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden overflow-x-auto lg:block">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                                {[
                                    "Customer",
                                    "Contact",
                                    "Location",
                                    "Role",
                                    "Verification",
                                    "Joined Date",
                                    "Status",
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

                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {isLoading || isFetching ? (
                                Array.from({ length: limit }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-gray-200 dark:bg-gray-800" />
                                                <div className="space-y-2">
                                                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
                                                    <div className="h-3 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5"><div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded" /></td>
                                        <td className="px-6 py-5"><div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded" /></td>
                                        <td className="px-6 py-5"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded" /></td>
                                        <td className="px-6 py-5"><div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded-full" /></td>
                                        <td className="px-6 py-5"><div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded" /></td>
                                        <td className="px-6 py-5"><div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded-full" /></td>
                                    </tr>
                                ))
                            ) : users.length > 0 ? (
                                users.map((user) => (
                                    <tr
                                        key={user._id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-800/40"
                                    >
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="relative h-12 w-12 flex-shrink-0">
                                                    {user.avatar?.url ? (
                                                        <Image
                                                            src={cleanImageUrl(user.avatar.url)}
                                                            alt={user.name}
                                                            fill
                                                            className="rounded-2xl object-cover ring-2 ring-gray-100 dark:ring-gray-700"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 font-bold text-lg">
                                                            {user.name.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                                                        {user.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 font-mono truncate">
                                                        ID: {user._id.slice(-8).toUpperCase()}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                                                <Mail className="h-3.5 w-3.5 text-gray-400" />
                                                <span className="text-sm font-medium">{user.email}</span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                                <MapPin className="h-3.5 w-3.5" />
                                                <span className="text-sm">
                                                    {user.location?.city || user.location?.country 
                                                        ? `${user.location.city}${user.location.city && user.location.country ? ", " : ""}${user.location.country}`
                                                        : "N/A"}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-5">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                                                {user.role}
                                            </span>
                                        </td>

                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${user.isVerified ? verifyStyles.verified : verifyStyles.unverified}`}>
                                                {user.isVerified ? <ShieldCheck className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
                                                {user.isVerified ? "Verified" : "Unverified"}
                                            </span>
                                        </td>

                                        <td className="px-6 py-5 text-sm text-gray-700 dark:text-gray-300">
                                            {formatDate(user.createdAt)}
                                        </td>

                                        <td className="px-6 py-5">
                                            <CustomStatusDropdown
                                                currentStatus={user.isActive}
                                                onStatusChange={(newStatus) => handleUpdateStatus(user._id, newStatus)}
                                                isLoading={isUpdatingStatus}
                                            />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="py-24 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <Search className="h-12 w-12 mb-4 opacity-20" />
                                            <p className="text-lg font-medium text-gray-900 dark:text-white">No customers found</p>
                                            <p className="text-sm mt-1">Try adjusting your search or filters</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="space-y-4 p-4 lg:hidden">
                    {isLoading || isFetching ? (
                         Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="animate-pulse rounded-2xl border border-gray-100 p-4 dark:border-gray-800">
                                <div className="flex gap-4">
                                    <div className="h-14 w-14 rounded-2xl bg-gray-200 dark:bg-gray-800" />
                                    <div className="flex-1 space-y-3">
                                        <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-800 rounded" />
                                        <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
                                    </div>
                                </div>
                            </div>
                         ))
                    ) : users.length > 0 ? (
                        users.map((user) => (
                            <motion.div
                                key={user._id}
                                whileHover={{ y: -2 }}
                                className="rounded-2xl border border-gray-100 p-4 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="relative h-14 w-14 flex-shrink-0">
                                        {user.avatar?.url ? (
                                            <Image
                                                src={cleanImageUrl(user.avatar.url)}
                                                alt={user.name}
                                                fill
                                                className="rounded-2xl object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 font-bold text-lg">
                                                {user.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                                        {user.name}
                                                    </h3>
                                                    <p className="truncate text-sm text-gray-500">
                                                        {user.email}
                                                    </p>
                                                </div>
                                                <CustomStatusDropdown
                                                    currentStatus={user.isActive}
                                                    onStatusChange={(newStatus) => handleUpdateStatus(user._id, newStatus)}
                                                    isLoading={isUpdatingStatus}
                                                />
                                            </div>

                                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <p className="text-gray-500 text-xs">Role</p>
                                                <p className="font-semibold text-gray-900 dark:text-white capitalize">
                                                    {user.role}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-xs">Joined</p>
                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                    {formatDate(user.createdAt)}
                                                </p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-gray-500 text-xs">Location</p>
                                                <p className="font-semibold text-gray-900 dark:text-white truncate">
                                                    {user.location?.city || user.location?.country 
                                                        ? `${user.location.city}${user.location.city && user.location.country ? ", " : ""}${user.location.country}`
                                                        : "N/A"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="py-12 text-center text-gray-500">
                            No customers found.
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex flex-col gap-4 border-t border-gray-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Showing{" "}
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {(page - 1) * limit + 1}
                            </span>{" "}
                            to{" "}
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {Math.min(page * limit, pagination?.total || 0)}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {pagination?.total}
                            </span>{" "}
                            customers
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1 || isFetching}
                                className="rounded-xl border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                                .map((p, i, arr) => (
                                    <div key={p} className="flex items-center gap-2">
                                        {i > 0 && arr[i-1] !== p - 1 && <span className="text-gray-400">...</span>}
                                        <button
                                            onClick={() => setPage(p)}
                                            disabled={isFetching}
                                            className={`h-10 w-10 rounded-xl text-sm font-semibold transition ${p === page
                                                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25"
                                                : "border border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    </div>
                                ))}

                            <button
                                onClick={() =>
                                    setPage((p) => Math.min(totalPages, p + 1))
                                }
                                disabled={page === totalPages || isFetching}
                                className="rounded-xl border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
