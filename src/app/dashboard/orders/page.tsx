// src/app/dashboard/orders/page.tsx
'use client';

import { useState } from 'react';
import { Plus, Filter, Download, ChevronLeft, ChevronRight } from 'lucide-react';

interface Order {
    id: string;
    date: string;
    time: string;
    customer: {
        initials: string;
        name: string;
        avatarColor: string;
    };
    items: number;
    amount: number;
    status: 'Delivered' | 'Pending' | 'Cancelled';
}

const mockOrders: Order[] = [
    {
        id: 'ORD-90234',
        date: 'Oct 24, 2023',
        time: '14:20',
        customer: { initials: 'SH', name: 'Sarah Harrison', avatarColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' },
        items: 12,
        amount: 142.5,
        status: 'Delivered',
    },
    {
        id: 'ORD-90235',
        date: 'Oct 24, 2023',
        time: '15:45',
        customer: { initials: 'MT', name: 'Marcus Thorne', avatarColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
        items: 4,
        amount: 56.2,
        status: 'Pending',
    },
    {
        id: 'ORD-90236',
        date: 'Oct 24, 2023',
        time: '16:12',
        customer: { initials: 'LW', name: 'Linda Wu', avatarColor: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
        items: 1,
        amount: 24.0,
        status: 'Cancelled',
    },
    {
        id: 'ORD-90237',
        date: 'Oct 23, 2023',
        time: '09:10',
        customer: { initials: 'ER', name: 'Elena Rodríguez', avatarColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' },
        items: 22,
        amount: 312.8,
        status: 'Delivered',
    },
    {
        id: 'ORD-90238',
        date: 'Oct 23, 2023',
        time: '11:30',
        customer: { initials: 'JW', name: 'James Wilson', avatarColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
        items: 8,
        amount: 98.15,
        status: 'Pending',
    },
];

export default function OrdersPage() {
    const [activeTab, setActiveTab] = useState<'All Orders' | 'Pending' | 'Delivered' | 'Cancelled'>('All Orders');

    const filteredOrders = mockOrders.filter((order) => {
        if (activeTab === 'All Orders') return true;
        return order.status === activeTab;
    });

    const getStatusBadge = (status: Order['status']) => {
        const base = 'inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border';
        const styles = {
            Delivered: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800',
            Pending: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
            Cancelled: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800',
        };
        return <span className={`${base} ${styles[status]}`}>{status}</span>;
    };

    return (
        <div className="w-full max-w-screen-2xl mx-auto space-y-4 mt-20">

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
                        Order Management
                    </h1>
                    {/* <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Manage and track <span className="font-medium text-gray-900 dark:text-gray-200">1,284 total orders</span> across all regions.
                    </p> */}
                </div>

                {/* <button className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition-colors text-white px-6 py-3 rounded-2xl font-medium shadow-sm w-full sm:w-auto">
                    <Plus className="w-5 h-5" />
                    Create New Order
                </button> */}
            </div>

            {/* Stats Cards */}
            {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
                    <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">PENDING VALUE</p>
                    <p className="text-3xl font-semibold text-gray-900 dark:text-white">$12,480.00</p>
                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-sm mt-3">
                        <span>↑ 12%</span>
                        <span className="text-gray-500 dark:text-gray-500">vs last week</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
                    <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">DELIVERY RATE</p>
                    <p className="text-3xl font-semibold text-gray-900 dark:text-white">98.4%</p>
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-4 overflow-hidden">
                        <div className="h-1.5 w-[98.4%] bg-emerald-600 dark:bg-emerald-500 rounded-full"></div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
                    <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">REFUND PROCESSING</p>
                    <p className="text-3xl font-semibold text-gray-900 dark:text-white">0.4%</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Industry avg: 2.1%</p>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 relative">
                    <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">EST. REVENUE (TODAY)</p>
                    <p className="text-3xl font-semibold text-gray-900 dark:text-white">$4,290.45</p>
                    <div className="absolute top-6 right-6 flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs">
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                        Updating now...
                    </div>
                </div>
            </div> */}

            {/* Tabs + Filters - Fixed Alignment */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                {/* Tabs */}
                <div className="inline-flex bg-white dark:bg-gray-900 rounded-3xl p-1 shadow-sm border border-gray-200 dark:border-gray-800 flex-wrap">
                    {(['All Orders', 'Pending', 'Delivered', 'Cancelled'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 text-sm font-medium rounded-3xl transition-all whitespace-nowrap ${activeTab === tab
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 flex-shrink-0">
                    <button className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-2xl text-sm font-medium transition-colors">
                        <Filter className="w-4 h-4" />
                        More Filters
                    </button>
                    <button className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-2xl text-sm font-medium transition-colors">
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Orders Table - Stable Design */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[850px] divide-y divide-gray-200 dark:divide-gray-800">
                        <thead className="bg-gray-50 dark:bg-gray-950 sticky top-0 z-10">
                            <tr>
                                <th className="text-left py-5 px-6 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ORDER ID</th>
                                <th className="text-left py-5 px-6 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">DATE</th>
                                <th className="text-left py-5 px-6 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">CUSTOMER</th>
                                <th className="text-center py-5 px-6 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ITEMS</th>
                                <th className="text-right py-5 px-6 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">AMOUNT</th>
                                <th className="text-center py-5 px-6 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">STATUS</th>
                                <th className="text-right py-5 px-6 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
                            {filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors">
                                    <td className="px-6 py-6 font-medium text-gray-900 dark:text-white">#{order.id}</td>
                                    <td className="px-6 py-6">
                                        <div className="text-gray-900 dark:text-white">{order.date}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-500">{order.time}</div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 flex items-center justify-center rounded-2xl text-sm font-semibold flex-shrink-0 ${order.customer.avatarColor}`}>
                                                {order.customer.initials}
                                            </div>
                                            <div className="font-medium text-gray-900 dark:text-white truncate max-w-[180px]">{order.customer.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-center text-gray-700 dark:text-gray-300">{order.items} Items</td>
                                    <td className="px-6 py-6 text-right font-semibold text-gray-900 dark:text-white">
                                        ${order.amount.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-6 text-center">{getStatusBadge(order.status)}</td>
                                    <td className="px-6 py-6 text-right">
                                        <button className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium text-sm transition-colors">
                                            View Details →
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-5 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div>Showing 1 to {filteredOrders.length} of 5,284 entries</div>
                    <div className="flex items-center gap-1">
                        <button className="w-9 h-9 flex items-center justify-center rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button className="w-9 h-9 flex items-center justify-center bg-emerald-600 text-white rounded-2xl font-medium">1</button>
                        <button className="w-9 h-9 flex items-center justify-center rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">2</button>
                        <button className="w-9 h-9 flex items-center justify-center rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">3</button>
                        <span className="px-2">…</span>
                        <button className="w-9 h-9 flex items-center justify-center rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">42</button>
                        <button className="w-9 h-9 flex items-center justify-center rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}