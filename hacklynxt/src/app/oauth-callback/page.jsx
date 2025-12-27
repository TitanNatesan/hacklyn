"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { authAPI } from "@/lib/api";
import { Loader2 } from "lucide-react";

function OAuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(true);

    useEffect(() => {
        const processCallback = async () => {
            try {
                // Read tokens from URL parameters (passed by Django)
                const accessToken = searchParams.get('access');
                const refreshToken = searchParams.get('refresh');
                const userId = searchParams.get('user_id');
                const email = searchParams.get('email');
                const username = searchParams.get('username');
                const firstName = searchParams.get('first_name');
                const lastName = searchParams.get('last_name');
                const isStaff = searchParams.get('is_staff') === 'true';
                const profileCompleted = searchParams.get('profile_completed') === 'true';
                const avatar = searchParams.get('avatar');

                // Check if tokens exist in URL
                if (!accessToken || !refreshToken) {
                    setError("Authentication tokens not received. Please try again.");
                    setProcessing(false);
                    return;
                }

                // Store tokens in localStorage
                if (typeof window !== 'undefined') {
                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('refreshToken', refreshToken);
                    localStorage.setItem('isAuthenticated', 'true');

                    // Store user data
                    const userData = {
                        id: userId,
                        email: email || '',
                        username: username || '',
                        first_name: firstName || '',
                        last_name: lastName || '',
                        is_staff: isStaff,
                        profile_completed: profileCompleted,
                        avatar: avatar || '',
                    };
                    localStorage.setItem('user', JSON.stringify(userData));
                }

                // Clear URL parameters for security (remove tokens from URL)
                window.history.replaceState({}, '', '/oauth-callback');

                // Redirect based on user role/profile status
                if (isStaff) {
                    router.push("/dashboard/admin");
                } else if (!profileCompleted) {
                    router.push("/complete-profile");
                } else {
                    router.push("/dashboard");
                }
            } catch (err) {
                console.error("OAuth callback error:", err);
                setError("An error occurred during authentication. Please try again.");
                setProcessing(false);
            }
        };

        processCallback();
    }, [searchParams, router]);

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
