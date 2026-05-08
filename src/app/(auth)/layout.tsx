import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Admin Login | Nectar Dashboard",
    description: "Secure admin authentication portal for Nectar dashboard",
};

interface LoginLayoutProps {
    children: React.ReactNode;
}

export default function LoginLayout({
    children,
}: LoginLayoutProps) {
    return (
        <section className="min-h-screen">
            {children}
        </section>
    );
}