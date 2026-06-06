'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Order, Pagination } from '@/redux/features/order/orderTypes';
import OrderStatusBadge from './OrderStatusBadge';

interface OrderTableProps {
    orders: Order[];
    pagination: Pagination;
    onPageChange: (page: number) => void;
    onOrderClick: (order: Order) => void;
    isLoading: boolean;
}

const OrderTable: React.FC<OrderTableProps> = ({orders,pagination,onPageChange,onOrderClick,isLoading}) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };
    };

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="p-20 flex flex-col items-center justify-center">
                    <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Loading orders...</p>
                </div>
            </div>
        );
    }

    return (
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
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-20 text-center text-gray-500 dark:text-gray-400">
                                    No orders found.
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => {
                                const { date, time } = formatDate(order.createdAt);
                                return (
                                    <tr 
                                        key={order._id} 
                                        onClick={() => onOrderClick(order)}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors cursor-pointer group"
                                    >
                                        <td className="px-6 py-6 font-medium text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                                            #{order.orderId}
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="text-gray-900 dark:text-white">{date}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-500">{time}</div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 flex items-center justify-center rounded-2xl text-sm font-semibold flex-shrink-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                    {order.customer.initials}
                                                </div>
                                                <div className="font-medium text-gray-900 dark:text-white truncate max-w-[180px]">
                                                    {order.customer.name}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-center text-gray-700 dark:text-gray-300">
                                            {order.itemsCount} {order.itemsCount === 1 ? 'Item' : 'Items'}
                                        </td>
                                        <td className="px-6 py-6 text-right font-semibold text-gray-900 dark:text-white">
                                            ${order.totalPrice.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <OrderStatusBadge status={order.orderStatus} />
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <button className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl transition-all">
                                                <Eye className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="px-6 py-5 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div>
                        Showing <span className="font-medium text-gray-900 dark:text-white">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-medium text-gray-900 dark:text-white">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-medium text-gray-900 dark:text-white">{pagination.total}</span> entries
                    </div>
                    <div className="flex items-center gap-1">
                        <button 
                            disabled={pagination.page === 1}
                            onClick={() => onPageChange(pagination.page - 1)}
                            className="w-9 h-9 flex items-center justify-center rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        
                        {[...Array(pagination.totalPages)].map((_, idx) => {
                            const pageNum = idx + 1;
                            // Basic pagination logic to show current, first, last and neighbors
                            if (
                                pageNum === 1 || 
                                pageNum === pagination.totalPages || 
                                (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1)
                            ) {
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => onPageChange(pageNum)}
                                        className={`w-9 h-9 flex items-center justify-center rounded-2xl font-medium transition-all ${
                                            pagination.page === pageNum
                                                ? 'bg-emerald-600 text-white shadow-md'
                                                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            } else if (
                                pageNum === pagination.page - 2 || 
                                pageNum === pagination.page + 2
                            ) {
                                return <span key={pageNum} className="px-1 text-gray-400">...</span>;
                            }
                            return null;
                        })}

                        <button 
                            disabled={pagination.page === pagination.totalPages}
                            onClick={() => onPageChange(pagination.page + 1)}
                            className="w-9 h-9 flex items-center justify-center rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderTable;
