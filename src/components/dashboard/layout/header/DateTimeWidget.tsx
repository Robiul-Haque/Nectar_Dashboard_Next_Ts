"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3 } from "lucide-react";
import { motion } from "framer-motion";

export default function DateTimeWidget() {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(new Date()), 1000);

        return () => clearInterval(interval);
    }, []);

    const formatted = useMemo(
        () => ({
            time: currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
            date: currentTime.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
        }),
        [currentTime]
    );

    return (
        <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="hidden xl:flex items-center gap-2 md:mr-6"
        >
            {/* Time Card */}
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-linear-to-r from-emerald-50/90 to-green-50/80 dark:from-emerald-950/30 dark:to-green-950/20 px-3 py-2 backdrop-blur-xl">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Clock3 className="h-4 w-4" />
                </div>

                <div className="leading-none">
                    <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                        Current Time
                    </p>
                    <p className="mt-1 text-sm font-bold text-gray-900 dark:text-white">
                        {formatted.time}
                    </p>
                </div>
            </div>

            {/* Date Card */}
            <div className="flex items-center gap-2 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-800/70 px-3 py-2 backdrop-blur-xl">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700 text-emerald-600 dark:text-emerald-400">
                    <CalendarDays className="h-4 w-4" />
                </div>

                <div className="leading-none">
                    <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                        Today
                    </p>
                    <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                        {formatted.date}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}