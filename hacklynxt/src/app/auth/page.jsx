"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Github, Mail, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authAPI } from "@/lib/api";

function AuthContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const mode = searchParams.get("mode") || "login";

    const [activeTab, setActiveTab] = useState(mode);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Login form state
    const [loginForm, setLoginForm] = useState({
        email: "",
        password: "",
        rememberMe: false,
    });

    // Register form state
    const [registerForm, setRegisterForm] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        agreeTerms: false,
    });

    useEffect(() => {
        setActiveTab(mode);
    }, [mode]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { ok, data } = await authAPI.login(loginForm.email, loginForm.password);

            if (ok) {
                toast.success("Welcome back!");

                if (data.user?.is_staff) {
                    router.push("/dashboard/admin");
                } else if (!data.user?.profile_completed) {
                    router.push("/complete-profile");
                } else {
                    router.push("/dashboard");
                }
            } else {
                toast.error(data.error || "Invalid credentials");
            }
        } catch (error) {
            toast.error("Login failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (registerForm.password !== registerForm.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (!registerForm.agreeTerms) {
            toast.error("Please agree to the terms and conditions");
            return;
        }

        setIsLoading(true);

        try {
            const nameParts = registerForm.fullName.trim().split(" ");
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(" ");

            const { ok, data } = await authAPI.register({
                username: registerForm.email.split("@")[0],
                email: registerForm.email,
                password: registerForm.password,
                first_name: firstName,
                last_name: lastName,
            });

            if (ok) {
                toast.success("Account created successfully!");
                router.push("/complete-profile");
            } else {
                const errorMessage = data.email?.[0] || data.username?.[0] || data.error || "Registration failed";
                toast.error(errorMessage);
            }
        } catch (error) {
            toast.error("Registration failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOAuth = (provider) => {
        if (provider === "google") {
            window.location.href = authAPI.getGoogleLoginUrl();
        } else if (provider === "github") {
            window.location.href = authAPI.getGithubLoginUrl();
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-secondary/30 to-background">
            <Header />

            <main className="flex-1 flex items-center justify-center py-24 px-4">
                <Card className="w-full max-w-md shadow-elevated animate-fade-up">
                    <CardHeader className="text-center">
                        <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4">
                            <Image src="/hacklyn.png" alt="Hacklyn" width={40} height={40} className="object-contain" />
                        </Link>
                        <CardTitle className="font-display text-2xl">
                            {activeTab === "login" ? "Welcome Back" : "Create Account"}
                        </CardTitle>
                        <CardDescription>
                            {activeTab === "login"
                                ? "Sign in to access your dashboard"
                                : "Join Hacklyn to start your journey"}
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-6">
                                <TabsTrigger value="login">Sign In</TabsTrigger>
                                <TabsTrigger value="register">Sign Up</TabsTrigger>
                            </TabsList>

                            <TabsContent value="login">
                                <form onSubmit={handleLogin} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="login-email">Email</Label>
                                        <Input
                                            id="login-email"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={loginForm.email}
                                            onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="login-password">Password</Label>
                                            <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                                                Forgot password?
                                            </Link>
                                        </div>
                                        <div className="relative">
                                            <Input
                                                id="login-password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={loginForm.password}
                                                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="remember"
                                            checked={loginForm.rememberMe}
                                            onCheckedChange={(checked) => setLoginForm({ ...loginForm, rememberMe: !!checked })}
                                        />
                                        <Label htmlFor="remember" className="text-sm font-normal">
                                            Remember me
                                        </Label>
                                    </div>

                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Signing in...
                                            </>
                                        ) : (
                                            "Sign In"
                                        )}
                                    </Button>
                                </form>
                            </TabsContent>

                            <TabsContent value="register">
                                <form onSubmit={handleRegister} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="register-name">Full Name</Label>
                                        <Input
                                            id="register-name"
                                            placeholder="John Doe"
                                            value={registerForm.fullName}
                                            onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="register-email">Email</Label>
                                        <Input
                                            id="register-email"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={registerForm.email}
                                            onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="register-password">Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="register-password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={registerForm.password}
                                                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirm-password">Confirm Password</Label>
                                        <Input
                                            id="confirm-password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={registerForm.confirmPassword}
                                            onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="terms"
                                            checked={registerForm.agreeTerms}
                                            onCheckedChange={(checked) => setRegisterForm({ ...registerForm, agreeTerms: !!checked })}
                                        />
                                        <Label htmlFor="terms" className="text-sm font-normal">
                                            I agree to the{" "}
                                            <Link href="/terms" className="text-primary hover:underline">
                                                Terms
                                            </Link>{" "}
                                            and{" "}
                                            <Link href="/privacy" className="text-primary hover:underline">
                                                Privacy Policy
                                            </Link>
                                        </Label>
                                    </div>

                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Creating account...
                                            </>
                                        ) : (
                                            "Create Account"
                                        )}
                                    </Button>
                                </form>
                            </TabsContent>
                        </Tabs>

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <Separator className="w-full" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <Button variant="outline" onClick={() => handleOAuth("google")}>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Google
                                </Button>
                                <Button variant="outline" onClick={() => handleOAuth("github")}>
                                    <Github className="mr-2 h-4 w-4" />
                                    GitHub
                                </Button>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="flex justify-center">
                        <p className="text-sm text-muted-foreground">
                            {activeTab === "login" ? (
                                <>
                                    Don't have an account?{" "}
                                    <button
                                        onClick={() => setActiveTab("register")}
                                        className="text-primary hover:underline font-medium"
                                    >
                                        Sign up
                                    </button>
                                </>
                            ) : (
                                <>
                                    Already have an account?{" "}
                                    <button
                                        onClick={() => setActiveTab("login")}
                                        className="text-primary hover:underline font-medium"
                                    >
                                        Sign in
                                    </button>
                                </>
                            )}
                        </p>
                    </CardFooter>
                </Card>
            </main>

            <Footer />
        </div>
    );
}

export default function AuthPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <AuthContent />
        </Suspense>
    );
}
