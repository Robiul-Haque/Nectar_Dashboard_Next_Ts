import { User } from "@/redux/features/user/userTypes";
import { Order } from "@/redux/features/order/orderTypes";

// Utility to convert data to CSV
export const exportToCSV = <T>(
    data: T[],
    filename: string,
    headers?: { key: keyof T; label: string }[],
    csvData?: { csvHeaders: string[], csvData: string[][] }
) => {
    if (data.length === 0) {
        alert("No data available to export.");
        return;
    }

    // Create CSV content
    let csvHeader: string;
    let csvRows: string[];
    
    if (csvData) {
        csvHeader = csvData.csvHeaders.map(h => `"${h}"`).join(",");
        csvRows = csvData.csvData.map(row =>
            row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(",")
        );
    } else if (headers) {
        csvHeader = headers.map(h => `"${h.label}"`).join(",");
        csvRows = data.map(row =>
            headers.map(header => {
                const value = row[header.key];
                // Handle objects/arrays by stringifying
                let cellValue = "";
                if (typeof value === "object" && value !== null) {
                    cellValue = JSON.stringify(value);
                } else if (value !== undefined && value !== null) {
                    cellValue = String(value);
                }
                // Escape double quotes and wrap in quotes
                return `"${cellValue.replace(/"/g, '""')}"`;
            }).join(",")
        );
    } else {
        throw new Error("Either headers or csvData must be provided.");
    }

    const csvContent = [csvHeader, ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

// Utility to convert data to simple PDF (using print method for compatibility)
export const exportToPDF = (
    title: string,
    tableHeaders: string[],
    tableData: string[][],
    filename: string
) => {
    // Create a temporary HTML for printing
    const tempDiv = document.createElement("div");
    tempDiv.style.position = "absolute";
    tempDiv.style.left = "-9999px";
    
    tempDiv.innerHTML = `
        <html>
        <head>
            <title>${title}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { text-align: center; color: #333; margin-bottom: 30px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                th { background-color: #10b981; color: white; font-weight: bold; }
                tr:nth-child(even) { background-color: #f9fafb; }
                .footer { margin-top: 40px; text-align: center; color: #888; font-size: 12px; }
            </style>
        </head>
        <body>
            <h1>${title}</h1>
            <table>
                <thead>
                    <tr>
                        ${tableHeaders.map(h => `<th>${h}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${tableData.map(row => `
                        <tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="footer">Generated on ${new Date().toLocaleString()}</div>
        </body>
        </html>
    `;
    
    document.body.appendChild(tempDiv);
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document;
    if (doc) {
        doc.write(tempDiv.innerHTML);
        doc.close();
        setTimeout(() => {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            document.body.removeChild(tempDiv);
            document.body.removeChild(iframe);
        }, 250);
    }
};

// Helper to prepare customer data for export
export const prepareCustomerExport = (customers: User[]) => {
    // For CSV: manual mapping for better control
    const csvHeaders = [
        'User ID',
        'Name',
        'Email',
        'Role',
        'Verified',
        'Active',
        'Joined Date'
    ];
    
    const csvData = customers.map(customer => [
        customer._id.slice(-8).toUpperCase(),
        customer.name,
        customer.email,
        customer.role,
        customer.isVerified ? 'Yes' : 'No',
        customer.isActive ? 'Yes' : 'No',
        new Date(customer.createdAt).toLocaleDateString()
    ]);

    const pdfHeaders = ['User ID', 'Name', 'Email', 'Role', 'Verified', 'Active', 'Joined Date'];
    const pdfData = customers.map(customer => [
        customer._id.slice(-8).toUpperCase(),
        customer.name,
        customer.email,
        customer.role,
        customer.isVerified ? 'Yes' : 'No',
        customer.isActive ? 'Yes' : 'No',
        new Date(customer.createdAt).toLocaleDateString()
    ]);

    return { csvHeaders, csvData, pdfHeaders, pdfData };
};

// Helper to prepare order data for export
export const prepareOrderExport = (orders: Order[]) => {
    // For CSV: we need to map manually to handle nested customer object
    const csvHeaders = [
        'Order ID',
        'Customer Name',
        'Customer Email',
        'Total Items',
        'Total Price ($)',
        'Order Status',
        'Payment Status',
        'Order Date'
    ];
    
    const csvData = orders.map(order => [
        order.orderId,
        order.customer.name,
        order.customer.email,
        order.totalQuantity.toString(),
        order.totalPrice.toFixed(2),
        order.orderStatus,
        order.paymentStatus,
        new Date(order.createdAt).toLocaleDateString()
    ]);

    const pdfHeaders = ['Order ID', 'Customer', 'Email', 'Items', 'Total', 'Status', 'Payment', 'Date'];
    const pdfData = orders.map(order => [
        order.orderId,
        order.customer.name,
        order.customer.email,
        order.totalQuantity.toString(),
        order.totalPrice.toFixed(2),
        order.orderStatus,
        order.paymentStatus,
        new Date(order.createdAt).toLocaleDateString()
    ]);

    return { csvHeaders, csvData, pdfHeaders, pdfData };
};