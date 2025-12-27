"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

function OAuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { handleOAuthCallback, isAuthenticated, user } = useAuth();
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(true);

    useEffect(() => {
        const processCallback = async () => {
            try {
                const result = await handleOAuthCallback();

                if (result.ok) {
                    // Determine redirect based on user data
                    const userData = result.data.user;

                    if (userData?.is_staff) {
                        router.push("/dashboard/admin");
                    } else if (!userData?.profile_completed) {
                        router.push("/complete-profile");
                    } else {
                        router.push("/dashboard");
                    }
                } else {
                    setError(result.data?.error || "Authentication failed. Please try again.");
                    setProcessing(false);
                }
            } catch (err) {
                console.error("OAuth callback error:", err);
                setError("An error occurred during authentication. Please try again.");
                setProcessing(false);
            }
        };

        processCallback();
    }, [handleOAuthCallback, router]);

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background">
                <div className="text-center space-y-4 max-w-md p-8">
                    <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                        <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Authentication Failed</h1>
                    <p className="text-muted-foreground">{error}</p>
                    <button
                        onClick={() => router.push("/auth")}
                        className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                        Return to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background">
            <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                <h1 className="text-xl font-semibold text-foreground">Completing Sign In...</h1>
                <p className="text-muted-foreground">Please wait while we verify your account.</p>
            </div>
        </div>
    );
}

export default function OAuthCallbackPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-background">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            }
        >
            <OAuthCallbackContent />
        </Suspense>
    );
}
