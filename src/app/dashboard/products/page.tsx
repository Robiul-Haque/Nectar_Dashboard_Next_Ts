"use client";

import { useState } from "react";
import ProductFilters from "@/components/dashboard/products/ProductFilters";
import ProductTable from "@/components/dashboard/products/ProductTable";

export default function ProductsPage() {
    const [filter, setFilter] = useState("all");

    return (
        <section className="w-full space-y-4">
            <ProductFilters activeFilter={filter} setFilter={setFilter} />
            <ProductTable filter={filter} />
        </section>
    );
}