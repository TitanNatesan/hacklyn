"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ArrowLeft, Loader2, CheckCircle2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { authAPI } from "@/lib/api";

function ForgotPasswordContent() {
    const router = useRouter();
    const [step, setStep] = useState(1); // 1: email, 2: otp, 3: new password, 4: success
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);

    // Countdown timer
    useState(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const formatCountdown = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error("Please enter your email address");
            return;
        }

        setIsLoading(true);
        try {
            const result = await authAPI.forgotPassword(email);
            if (result.ok) {
                toast.success("OTP sent to your email!");
                setStep(2);
                setCountdown(300); // 5 minutes
            } else {
                // Note: API doesn't reveal if email exists
                toast.success(result.data?.message || "If an account exists with this email, an OTP has been sent.");
                setStep(2);
                setCountdown(300);
            }
        } catch (error) {
            toast.error("Failed to send OTP. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        if (!otp || otp.length !== 6) {
            toast.error("Please enter a valid 6-digit OTP");
            return;
        }
        // Move to password step - actual verification happens on reset
        setStep(3);
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (!newPassword) {
            toast.error("Please enter a new password");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setIsLoading(true);
        try {
            const result = await authAPI.resetPassword(email, otp, newPassword);
            if (result.ok) {
                toast.success("Password reset successfully!");
                setStep(4);
            } else {
                toast.error(result.data?.error || "Failed to reset password");
                // If OTP is invalid/expired, go back to OTP step
                if (result.data?.error?.toLowerCase().includes('otp')) {
                    setStep(2);
                    setOtp("");
                }
            }
        } catch (error) {
            toast.error("Failed to reset password. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setIsLoading(true);
        try {
            await authAPI.forgotPassword(email);
            toast.success("New OTP sent to your email!");
            setCountdown(300);
            setOtp("");
        } catch (error) {
            toast.error("Failed to resend OTP");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-secondary to-background">
            <Header />

            <main className="flex-1 flex items-center justify-center py-24 px-4">
                <Card className="w-full max-w-md shadow-elevated animate-fade-up border-none bg-card/80 backdrop-blur-xl">
                    <CardHeader className="text-center">
                        <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4">
                            <Image src="/hacklyn.png" alt="Hacklyn" width={40} height={40} className="object-contain" />
                        </Link>
                        <CardTitle className="font-display text-2xl">
                            {step === 4 ? "Password Reset!" : "Reset Password"}
                        </CardTitle>
                        <CardDescription>
                            {step === 1 && "Enter your email to receive a password reset OTP"}
                            {step === 2 && "Enter the OTP sent to your email"}
                            {step === 3 && "Create a new password for your account"}
                            {step === 4 && "Your password has been reset successfully"}
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {/* Step 1: Enter Email */}
                        {step === 1 && (
                            <form onSubmit={handleSendOTP} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                </div>

                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Sending OTP...
                                        </>
                                    ) : (
                                        "Send Reset OTP"
                                    )}
                                </Button>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full"
                                    onClick={() => router.push("/auth")}
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Login
                                </Button>
                            </form>
                        )}

                        {/* Step 2: Enter OTP */}
                        {step === 2 && (
                            <form onSubmit={handleVerifyOTP} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="otp">Enter OTP</Label>
                                    <Input
                                        id="otp"
                                        type="text"
                                        placeholder="Enter 6-digit OTP"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        maxLength={6}
                                        className="font-mono text-center text-2xl tracking-[0.5em]"
                                        required
                                    />
                                    <p className="text-sm text-muted-foreground text-center">
                                        OTP sent to {email}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    {countdown > 0 ? (
                                        <span className="text-muted-foreground">
                                            Expires in {formatCountdown(countdown)}
                                        </span>
                                    ) : (
                                        <span className="text-amber-600">OTP expired</span>
                                    )}
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleResendOTP}
                                        disabled={isLoading || countdown > 240}
                                        className="text-primary"
                                    >
                                        {isLoading ? "Sending..." : "Resend OTP"}
                                    </Button>
                                </div>

                                <Button type="submit" className="w-full" disabled={otp.length !== 6}>
                                    Continue
                                </Button>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full"
                                    onClick={() => setStep(1)}
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Change Email
                                </Button>
                            </form>
                        )}

                        {/* Step 3: New Password */}
                        {step === 3 && (
                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="new-password">New Password</Label>
                                    <div className="relative">
                                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="new-password"
                                            type="password"
                                            placeholder="Enter new password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">Confirm Password</Label>
                                    <div className="relative">
                                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="confirm-password"
                                            type="password"
                                            placeholder="Confirm new password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                </div>

                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Resetting Password...
                                        </>
                                    ) : (
                                        "Reset Password"
                                    )}
                                </Button>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full"
                                    onClick={() => setStep(2)}
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back
                                </Button>
                            </form>
                        )}

                        {/* Step 4: Success */}
                        {step === 4 && (
                            <div className="text-center space-y-6">
                                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                                </div>
                                <p className="text-muted-foreground">
                                    Your password has been reset successfully. You can now login with your new password.
                                </p>
                                <Button
                                    className="w-full"
                                    onClick={() => router.push("/auth?mode=login")}
                                >
                                    Go to Login
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>

            <Footer />
        </div>
    );
}

export default function ForgotPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <ForgotPasswordContent />
        </Suspense>
    );
}
