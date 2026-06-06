'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Truck, CreditCard, User, Calendar, MapPin, Phone, Mail } from 'lucide-react';
import { Order } from '@/redux/features/order/orderTypes';
import { useUpdateOrderStatusMutation } from '@/redux/features/order/orderApi';
import OrderStatusBadge from './OrderStatusBadge';
import { toast } from 'react-hot-toast';

interface OrderDetailModalProps {
    order: Order | null;
    isOpen: boolean;
    onClose: () => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, isOpen, onClose }) => {
    const [updateStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();
    const [selectedStatus, setSelectedStatus] = useState(order?.orderStatus || 'pending');

    if (!order) return null;

    const handleStatusUpdate = async (newStatus: string) => {
        try {
            await updateStatus({ id: order._id, status: newStatus }).unwrap();
            toast.success('Order status updated successfully');
            setSelectedStatus(newStatus as any);
        } catch (error) {
            toast.error('Failed to update order status');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    Order Details
                                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">#{order.orderId}</span>
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {formatDate(order.createdAt)}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {/* Top Section: Status & Actions */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl">
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current Status</p>
                                    <OrderStatusBadge status={order.orderStatus} />
                                </div>

                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Update Status</p>
                                    {isUpdating ? (
                                        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl w-full md:w-48">
                                            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-sm text-gray-500">Updating...</span>
                                        </div>
                                    ) : (
                                        <select
                                            value={order.orderStatus}
                                            onChange={(e) => handleStatusUpdate(e.target.value)}
                                            className="w-full md:w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all cursor-pointer hover:border-gray-300 dark:hover:border-gray-600"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Customer Info */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                                        <User className="w-5 h-5 text-emerald-600" />
                                        Customer Information
                                    </h3>
                                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-2xl space-y-3 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                                                {order.customer.initials}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{order.customer.name}</p>
                                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                                    <Mail className="w-3 h-3" />
                                                    {order.customer.email}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Shipping Address */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                                        <Truck className="w-5 h-5 text-emerald-600" />
                                        Shipping Details
                                    </h3>
                                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-2xl space-y-3 shadow-sm text-sm">
                                        <div className="flex items-start gap-2">
                                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                            <p className="text-gray-700 dark:text-gray-300">
                                                {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.country}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            <p className="text-gray-700 dark:text-gray-300">{order.shippingAddress.phone}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                                    <Package className="w-5 h-5 text-emerald-600" />
                                    Order Items ({order.items.length})
                                </h3>
                                <div className="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400">
                                            <tr>
                                                <th className="px-4 py-3 font-medium">Product</th>
                                                <th className="px-4 py-3 font-medium text-center">Price</th>
                                                <th className="px-4 py-3 font-medium text-center">Qty</th>
                                                <th className="px-4 py-3 font-medium text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {order.items.map((item, idx) => (
                                                <tr key={idx} className="bg-white dark:bg-gray-900">
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0 relative">
                                                                <Image 
                                                                    src={item.image} 
                                                                    alt={item.name} 
                                                                    fill
                                                                    className="object-cover" 
                                                                />
                                                            </div>
                                                            <span className="font-medium text-gray-900 dark:text-white">{item.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-center text-gray-600 dark:text-gray-400">${item.price.toFixed(2)}</td>
                                                    <td className="px-4 py-4 text-center text-gray-600 dark:text-gray-400">{item.quantity}</td>
                                                    <td className="px-4 py-4 text-right font-semibold text-gray-900 dark:text-white">${(item.price * item.quantity).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="bg-gray-50 dark:bg-gray-800/30 rounded-2xl p-6 space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                                    <CreditCard className="w-5 h-5 text-emerald-600" />
                                    Payment Summary
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">Payment Status</span>
                                        <span className={`font-medium capitalize ${order.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                            {order.paymentStatus}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">Payment Intent ID</span>
                                        <span className="text-gray-700 dark:text-gray-300 font-mono text-xs">{order.paymentIntentId}</span>
                                    </div>
                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2 flex justify-between items-center">
                                        <span className="text-base font-semibold text-gray-900 dark:text-white">Total Amount</span>
                                        <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">${order.totalPrice.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default OrderDetailModal;
