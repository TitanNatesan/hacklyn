"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export function DashboardLayout({ children, role }) {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />

            {/* Main Content */}
            <main className="flex-1 pt-16">
                <div className="container mx-auto px-4 py-8">
                    {children}
                </div>
            </main>

            <Footer />
        </div>
    );
}
