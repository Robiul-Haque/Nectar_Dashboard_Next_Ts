"use client";

const products = [
    {
        id: 1,
        name: "Organic Heirloom Kale",
        sku: "LFG-001-KALE",
        category: "Leafy Greens",
        stock: 42,
        status: "Healthy",
        price: 3.49,
        active: true,
    },
    {
        id: 2,
        name: "Sweet Dutch Carrots",
        sku: "RVG-224-CART",
        category: "Root Veg",
        stock: 8,
        status: "Low Stock",
        price: 4.95,
        active: true,
    },
    {
        id: 3,
        name: "Honey-Drip Tomatoes",
        sku: "FRU-882-TOMT",
        category: "Fruits",
        stock: 124,
        status: "Stocked",
        price: 5.25,
        active: true,
    },
    {
        id: 4,
        name: "Grass-Fed Butter",
        sku: "DRY-551-BUTR",
        category: "Dairy",
        stock: 0,
        status: "Critical",
        price: 8.15,
        active: false,
    },
    ...Array.from({ length: 6 }).map((_, i) => ({
        id: i + 5,
        name: "Fresh Product " + (i + 5),
        sku: "SKU-" + (i + 5),
        category: "General",
        stock: Math.floor(Math.random() * 100),
        status: "Healthy",
        price: (Math.random() * 10).toFixed(2),
        active: true,
    })),
];

export default function ProductTable() {
    return (
        <div className="w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">

            <div className="overflow-x-auto">
                <table className="w-full text-sm">

                    {/* HEADER */}
                    <thead className="bg-gray-50 dark:bg-gray-950 text-gray-500 border-b dark:border-gray-800">
                        <tr>
                            <th className="p-4 w-10"><input type="checkbox" /></th>
                            <th className="p-4 text-left">PRODUCT</th>
                            <th className="p-4 text-left">CATEGORY</th>
                            <th className="p-4 text-left">STOCK LEVEL</th>
                            <th className="p-4 text-left">PRICE</th>
                            <th className="p-4 text-left">STATUS</th>
                        </tr>
                    </thead>

                    {/* BODY */}
                    <tbody>
                        {products.map((p) => (
                            <tr
                                key={p.id}
                                className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                            >
                                <td className="p-4"><input type="checkbox" /></td>

                                {/* PRODUCT */}
                                <td className="p-4 flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-gray-200" />
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {p.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            SKU: {p.sku}
                                        </p>
                                    </div>
                                </td>

                                {/* CATEGORY */}
                                <td className="p-4">
                                    <span className="px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-600">
                                        {p.category}
                                    </span>
                                </td>

                                {/* STOCK */}
                                <td className="p-4">
                                    <p className="text-sm font-medium">
                                        {p.stock} Units
                                    </p>

                                    <div className="w-32 h-1.5 bg-gray-200 rounded-full mt-1">
                                        <div
                                            style={{ width: `${Math.min(p.stock, 100)}%` }}
                                            className={`h-1.5 rounded-full ${p.stock === 0
                                                ? "bg-red-500"
                                                : p.stock < 10
                                                    ? "bg-orange-400"
                                                    : "bg-emerald-600"
                                                }`}
                                        />
                                    </div>

                                    <span
                                        className={`text-xs ml-1 ${p.stock === 0
                                            ? "text-red-500"
                                            : p.stock < 10
                                                ? "text-orange-500"
                                                : "text-emerald-600"
                                            }`}
                                    >
                                        {p.status}
                                    </span>
                                </td>

                                {/* PRICE */}
                                <td className="p-4 font-medium text-gray-900 dark:text-white">
                                    ${p.price} / ea
                                </td>

                                {/* STATUS */}
                                <td className="p-4">
                                    <span
                                        className={`flex items-center gap-2 ${p.active
                                            ? "text-emerald-600"
                                            : "text-gray-400"
                                            }`}
                                    >
                                        <span
                                            className={`w-2 h-2 rounded-full ${p.active
                                                ? "bg-emerald-600"
                                                : "bg-gray-400"
                                                }`}
                                        />
                                        {p.active ? "Active" : "Inactive"}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* PAGINATION */}
            <div className="flex items-center justify-between p-4 text-sm text-gray-500">
                <span>Showing 1 to 10 of 128 products</span>

                <div className="flex items-center gap-2">
                    <button className="w-8 h-8 rounded-lg bg-emerald-600 text-white">
                        1
                    </button>
                    <button className="w-8 h-8">2</button>
                    <button className="w-8 h-8">3</button>
                    <span>...</span>
                    <button className="w-8 h-8">32</button>
                </div>
            </div>
        </div>
    );
}