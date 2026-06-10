'use client';

import { useState } from 'react';
import { Download, FileText, FileSpreadsheet, ChevronDown } from 'lucide-react';
import { useGetOrdersQuery } from '@/redux/features/order/orderApi';
import OrderTable from '@/components/dashboard/orders/OrderTable';
import OrderDetailModal from '@/components/dashboard/orders/OrderDetailModal';
import { Order } from '@/redux/features/order/orderTypes';
import { exportToCSV, exportToPDF, prepareOrderExport } from '@/lib/utils/export';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function OrdersPage() {
    const [page, setPage] = useState(1);
    const [orderStatus, setOrderStatus] = useState<string>('pending');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: ordersData, isLoading, isFetching } = useGetOrdersQuery({
        page,
        limit: 10,
        orderStatus: orderStatus === 'all' ? undefined : orderStatus,
    });

    const [showExportMenu, setShowExportMenu] = useState(false);

    const handleExportCSV = () => {
        if (!ordersData?.data || ordersData.data.length === 0) {
            toast.error("No orders to export!");
            return;
        }

        const { csvHeaders, csvData } = prepareOrderExport(ordersData.data);
        exportToCSV(ordersData.data, `orders-${orderStatus}-${new Date().toISOString().split('T')[0]}`, undefined, { csvHeaders, csvData });
        toast.success("CSV exported successfully!");
        setShowExportMenu(false);
    };

    const handleExportPDF = () => {
        if (!ordersData?.data || ordersData.data.length === 0) {
            toast.error("No orders to export!");
            return;
        }

        const { pdfHeaders, pdfData } = prepareOrderExport(ordersData.data);
        exportToPDF("Order Report", pdfHeaders, pdfData, `orders-${orderStatus}-${new Date().toISOString().split('T')[0]}`);
        toast.success("PDF download initiated!");
        setShowExportMenu(false);
    };

    const handleOrderClick = (order: Order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const handleTabChange = (newStatus: string) => {
        setOrderStatus(newStatus);
        setPage(1); // Reset to first page when changing status
    };

    const tabs = [
        { label: 'All Orders', value: 'all' },
        { label: 'Pending', value: 'pending' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Shipped', value: 'shipped' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'Cancelled', value: 'cancelled' },
    ];

    return (
        <div className="w-full max-w-screen-2xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Order Management
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        View and manage customer orders, track shipping, and update order statuses.
                    </p>
                </div>
            </div>

            {/* Tabs + Filters */}
            <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
                {/* Tabs */}
                <div className="inline-flex bg-white dark:bg-gray-900 rounded-3xl p-1 shadow-sm border border-gray-200 dark:border-gray-800 flex-wrap">
                    {tabs.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => handleTabChange(tab.value)}
                            className={`px-6 py-2.5 text-sm font-medium rounded-2xl transition-all whitespace-nowrap ${
                                orderStatus === tab.value
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto">
                    <div className="relative w-full sm:w-auto">
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            disabled={!ordersData?.data || ordersData.data.length === 0}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-2xl text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download className="w-4 h-4" />
                            Export
                            <ChevronDown className="w-4 h-4" />
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
            </div>

            {/* Orders Table */}
            <OrderTable 
                orders={ordersData?.data || []}
                pagination={ordersData?.pagination || { total: 0, page: 1, limit: 10, totalPages: 0 }}
                onPageChange={setPage}
                onOrderClick={handleOrderClick}
                isLoading={isLoading || isFetching}
            />

            {/* Order Detail Modal */}
            <OrderDetailModal 
                order={selectedOrder}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}
