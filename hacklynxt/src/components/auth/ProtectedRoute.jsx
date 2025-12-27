"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

/**
 * Protected Route Component
 * Wraps pages that require authentication
 * Redirects to /auth if user is not authenticated
 */
export function ProtectedRoute({ children, requireAdmin = false }) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                // Save the intended destination for redirect after login
                if (typeof window !== 'undefined') {
                    sessionStorage.setItem('redirectAfterLogin', pathname);
                }
                router.replace("/auth?mode=login");
            } else if (requireAdmin && !user?.is_staff) {
                router.replace("/dashboard");
            }
        }
    }, [isAuthenticated, isLoading, user, requireAdmin, router, pathname]);

    // Show loading spinner while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    // Don't render protected content if not authenticated
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    // Don't render admin content if not admin
    if (requireAdmin && !user?.is_staff) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground">Access denied. Redirecting...</p>
                </div>
            </div>
        );
    }

    return children;
}

/**
 * Public Route Component (optional utility)
 * For routes that should redirect authenticated users away
 */
export function PublicOnlyRoute({ children, redirectTo = "/dashboard" }) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            const destination = user?.is_staff ? "/dashboard/admin" : redirectTo;
            router.replace(destination);
        }
    }, [isAuthenticated, isLoading, user, router, redirectTo]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return children;
}
