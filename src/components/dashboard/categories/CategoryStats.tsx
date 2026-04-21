"use client";

const stats = [
    {
        title: "Total Categories",
        value: "12",
        sub: "+2 added this month",
    },
    {
        title: "Active Items",
        value: "1,482",
        sub: "Across all departments",
    },
    {
        title: "Stock Health",
        value: "94%",
        sub: "Above target threshold",
    },
];

export default function CategoryStats() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {stats.map((item, i) => (
                <div
                    key={i}
                    className="relative p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden"
                >
                    {/* subtle circle */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full" />

                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                        {item.title}
                    </p>

                    <h2 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
                        {item.value}
                    </h2>

                    <p className="text-xs text-emerald-600 mt-2">
                        {item.sub}
                    </p>
                </div>
            ))}
        </div>
    );
}