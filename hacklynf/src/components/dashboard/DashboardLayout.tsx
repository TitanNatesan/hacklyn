
import { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

interface DashboardLayoutProps {
  children: ReactNode;
  role?: string; // Optional now - simplified architecture
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
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
