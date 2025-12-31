"use client";

import { useFormContext } from "react-hook-form";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, CheckCircle2, AlertCircle, Mail, Loader2 } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { AutocompleteMulti } from "@/components/ui/autocomplete";
import { useAuth } from "@/contexts/AuthContext";
import { profileAPI, authAPI } from "@/lib/api";
import { toast } from "sonner";

export function BasicInfoStep() {
    const { control, watch, setValue } = useFormContext();
    const { user, loginSuccess } = useAuth();
    const [preview, setPreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Email verification state
    const [otp, setOtp] = useState("");
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [countdown, setCountdown] = useState(0);

    // Initial preview from form or user/profile data
    useEffect(() => {
        const currentPic = watch("profilePicture");
        if (!preview && currentPic) {
            // If it's a string (URL)
            if (typeof currentPic === 'string') setPreview(currentPic);
        } else if (!preview && user?.avatar) {
            // Fallback to Google avatar if no profile pic
            setPreview(user.avatar);
        }
    }, [watch, user, preview]);

    // Countdown timer for OTP resend
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);

            // 1. Immediate Upload
            const formData = new FormData();
            formData.append("profile_picture", file);

            await profileAPI.update(formData);

            // 2. Update Preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);

            // 3. Update Form State (optional, but keeps consistency)
            setValue("profilePicture", file); // Or URL if API returned it

            // 4. Update Auth Context to reflect new avatar across app
            await loginSuccess();

            toast.success("Profile photo updated!");
        } catch (error) {
            console.error("Upload failed:", error);
            toast.error("Failed to upload photo");
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemovePhoto = async () => {
        try {
            setIsUploading(true);
            // Send null to remove
            await profileAPI.update({ profile_picture: null });

            // Reset to fallback
            setValue("profilePicture", null);
            setPreview(user?.avatar || null);

            await loginSuccess();
            toast.success("Profile photo removed");
        } catch (error) {
            console.error("Remove failed:", error);
            toast.error("Failed to remove photo");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSendOtp = async () => {
        setIsSendingOtp(true);
        try {
            const result = await authAPI.sendEmailOTP();
            if (result.ok) {
                toast.success("OTP sent to your email!");
                setOtpSent(true);
                setCountdown(300); // 5 minutes in seconds
            } else {
                toast.error(result.data?.error || "Failed to send OTP");
            }
        } catch (error) {
            toast.error("Failed to send OTP");
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp || otp.length !== 6) {
            toast.error("Please enter a valid 6-digit OTP");
            return;
        }

        setIsVerifyingOtp(true);
        try {
            const result = await authAPI.verifyEmailOTP(otp);
            if (result.ok) {
                toast.success("Email verified successfully!");
                await loginSuccess(); // Refresh user data
                setOtp("");
                setOtpSent(false);
                setCountdown(0);
            } else {
                toast.error(result.data?.error || "Invalid OTP");
            }
        } catch (error) {
            toast.error("Failed to verify OTP");
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    const formatCountdown = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const fullName = watch("fullName");

    return (
        <div className="space-y-6 animate-fade-up">
            <div className="flex flex-col items-center gap-4 mb-8">
                <Avatar className="w-24 h-24 border-2 border-primary/20">
                    <AvatarImage src={preview || ""} className="object-cover" />
                    <AvatarFallback className="text-xl bg-primary/5 text-primary">
                        {fullName ? fullName.substring(0, 2).toUpperCase() : "??"}
                    </AvatarFallback>
                </Avatar>

                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="gap-2"
                    >
                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {preview && preview !== user?.avatar ? "Change Photo" : "Upload Photo"}
                    </Button>

                    {preview && preview !== user?.avatar && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleRemovePhoto}
                            disabled={isUploading}
                            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                        >
                            Remove
                        </Button>
                    )}
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={control}
                    name="fullName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                                <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="tagline"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tagline</FormLabel>
                            <FormControl>
                                <Input placeholder="Full Stack Developer | AI Enthusiast" {...field} />
                            </FormControl>
                            <FormDescription>A short professional headline.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                                <Input placeholder="San Francisco, CA" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                                <Input placeholder="john@example.com" type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            {/* Email Verification Section */}
            <div className="p-4 rounded-xl border bg-secondary/30">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-primary" />
                        <span className="font-medium">Email Verification</span>
                    </div>
                    {user?.email_verified ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                            Verified
                        </Badge>
                    ) : (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200">
                            <AlertCircle className="w-3.5 h-3.5 mr-1" />
                            Not Verified
                        </Badge>
                    )}
                </div>

                {!user?.email_verified && (
                    <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            Verify your email to host events and apply to hackathons.
                        </p>

                        {!otpSent ? (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleSendOtp}
                                disabled={isSendingOtp}
                                className="w-full"
                            >
                                {isSendingOtp ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Sending OTP...
                                    </>
                                ) : (
                                    <>
                                        <Mail className="w-4 h-4 mr-2" />
                                        Send Verification OTP
                                    </>
                                )}
                            </Button>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    <Input
                                        type="text"
                                        placeholder="Enter 6-digit OTP"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        maxLength={6}
                                        className="font-mono text-center tracking-widest"
                                    />
                                    <Button
                                        type="button"
                                        onClick={handleVerifyOtp}
                                        disabled={isVerifyingOtp || otp.length !== 6}
                                    >
                                        {isVerifyingOtp ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            "Verify"
                                        )}
                                    </Button>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    {countdown > 0 ? (
                                        <span className="text-muted-foreground">
                                            OTP expires in {formatCountdown(countdown)}
                                        </span>
                                    ) : (
                                        <span className="text-amber-600">OTP expired</span>
                                    )}
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleSendOtp}
                                        disabled={isSendingOtp || countdown > 240} // Allow resend after 1 min
                                        className="text-primary"
                                    >
                                        {isSendingOtp ? "Sending..." : "Resend OTP"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <FormField
                control={control}
                name="bio"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Short Bio</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Tell us a bit about yourself, your interests, and what you're working on..."
                                className="resize-none h-32"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="skills"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Skills & Technologies</FormLabel>
                        <FormControl>
                            <AutocompleteMulti
                                type="skill"
                                placeholder="Add skills (React, Python, etc.)..."
                                value={field.value || []}
                                onChange={field.onChange}
                            />
                        </FormControl>
                        <FormDescription>Choose from existing skills or create your own.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}

