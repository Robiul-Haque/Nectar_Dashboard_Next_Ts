"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface Crumb {
    label: string;
    href?: string;
}

export default function Breadcrumb({ items }: { items: Crumb[] }) {
    return (
        <div className="flex items-center gap-1 text-sm">
            {items.map((item, index) => {
                const isLast = index === items.length - 1;

                return (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-1"
                    >
                        {item.href && !isLast ? (
                            <Link
                                href={item.href}
                                className="text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span className="text-gray-900 dark:text-white font-medium">
                                {item.label}
                            </span>
                        )}

                        {!isLast && (
                            <span className="text-gray-400">›</span>
                        )}
                    </motion.div>
                );
            })}
        </div>
    );
}