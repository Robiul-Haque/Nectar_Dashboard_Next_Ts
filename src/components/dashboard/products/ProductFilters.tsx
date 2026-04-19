"use client";

interface Props {
    activeFilter: string;
    setFilter: (value: string) => void;
}

export default function ProductFilters({ activeFilter, setFilter }: Props) {
    const filters = [
        { label: "All", value: "all" },
        { label: "Low Stock", value: "low" },
        { label: "High Stock", value: "high" },
        { label: "Low Price", value: "lowPrice" },
        { label: "High Price", value: "highPrice" },
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
    ];

    return (
        <div className="flex flex-wrap gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            {filters.map((f) => (
                <button
                    key={f.value}
                    onClick={() => setFilter(f.value)}
                    className={`px-4 py-1.5 text-sm rounded-lg transition ${activeFilter === f.value
                        ? "bg-white dark:bg-gray-900 text-emerald-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                        }`}
                >
                    {f.label}
                </button>
            ))}
        </div>
    );
}