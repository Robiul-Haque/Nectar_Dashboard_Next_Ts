import ProductFilters from "@/components/dashboard/products/ProductFilters";
import ProductTable from "@/components/dashboard/products/ProductTable";

export default function ProductsPage() {
    return (
        <section className="w-full space-y-4">
            <ProductFilters />
            <ProductTable />
        </section>
    );
}