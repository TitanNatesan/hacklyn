"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { authAPI } from "@/lib/api";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

function OAuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { loginSuccess } = useAuth();
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(true);
    const [retrying, setRetrying] = useState(false);

    const processCallback = async () => {
        try {
            // Read tokens from URL parameters (passed by Django)
            let accessToken = searchParams.get('access');
            let refreshToken = searchParams.get('refresh');
            let userId = searchParams.get('user_id');
            let email = searchParams.get('email');
            let username = searchParams.get('username');
            let firstName = searchParams.get('first_name');
            let lastName = searchParams.get('last_name');
            let isStaff = searchParams.get('is_staff') === 'true';
            let profileCompleted = searchParams.get('profile_completed') === 'true';
            let avatar = searchParams.get('avatar');

            // If tokens are not in URL, try to fetch via API (session-based fallback)
            if (!accessToken || !refreshToken) {
                console.log("No tokens in URL, attempting API fallback...");
                try {
                    const result = await authAPI.handleOAuthCallback();
                    if (result.ok && result.data.tokens) {
                        accessToken = result.data.tokens.access;
                        refreshToken = result.data.tokens.refresh;

                        // Extract user data from API response
                        const user = result.data.user;
                        if (user) {
                            userId = user.id;
                            email = user.email || '';
                            username = user.username || '';
                            firstName = user.first_name || '';
                            lastName = user.last_name || '';
                            isStaff = user.is_staff || false;
                            profileCompleted = user.profile_completed || false;
                            avatar = user.avatar || '';
                        }
                    }
                } catch (apiError) {
                    console.error("API fallback failed:", apiError);
                }
            }

            // Final check for tokens
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

                // Create user object
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

                // Update global auth state immediately
                loginSuccess(userData);

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
            }
        } catch (err) {
            console.error("OAuth callback error:", err);
            setError("An error occurred during authentication. Please try again.");
            setProcessing(false);
        }
    };

    useEffect(() => {
        processCallback();
    }, [searchParams]);

    const handleRetry = async () => {
        setRetrying(true);
        setError(null);
        setProcessing(true);

        // Small delay then retry
        await new Promise(resolve => setTimeout(resolve, 500));
        await processCallback();
        setRetrying(false);
    };

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
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                            onClick={handleRetry}
                            variant="outline"
                            disabled={retrying}
                        >
                            {retrying ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Retrying...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Retry
                                </>
                            )}
                        </Button>
                        <Button
                            onClick={() => router.push("/auth")}
                        >
                            Return to Login
                        </Button>
                    </div>
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
