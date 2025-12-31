"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ArrowRight,
    Calendar,
    Users,
    Trophy,
    Award,
    CheckCircle2,
    Sparkles
} from "lucide-react";

export function HeroSection() {
    return (
        <section className="relative pt-32 pb-24 overflow-hidden bg-white">
            {/* Background Pattern - Modern and Clean */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:32px_32px] opacity-30" />
                <div className="absolute top-20 right-[-10%] w-[500px] h-[500px] bg-french-blue-50/50 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-turquoise-surf-50/30 rounded-full blur-[130px]" />
            </div>

            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-french-blue-50 border border-french-blue-100 mb-8 animate-fade-up" style={{ animationDelay: '0ms' }}>
                        <Sparkles className="w-4 h-4 text-french-blue-600" />
                        <span className="text-sm font-medium text-french-blue-900">
                            The Future of Campus Events
                        </span>
                    </div>

                    {/* Headline */}
                    <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 tracking-tight animate-fade-up" style={{ animationDelay: '100ms' }}>
                        Manage Campus Events
                        <span className="block gradient-text">Like Never Before</span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: '200ms' }}>
                        From registration to certification, streamline your hackathons, workshops,
                        and tech events with our all-in-one management platform.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-up" style={{ animationDelay: '300ms' }}>
                        <Button variant="hero" size="xl" asChild>
                            <Link href="/auth?mode=register">
                                Start for Free
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </Button>
                        <Button variant="hero-outline" size="xl" asChild>
                            <Link href="/events">
                                Browse Events
                            </Link>
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 animate-fade-up" style={{ animationDelay: '400ms' }}>
                        {[
                            { value: "500+", label: "Events Hosted" },
                            { value: "10K+", label: "Participants" },
                            { value: "50+", label: "Colleges" },
                            { value: "98%", label: "Satisfaction" },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center">
                                <div className="font-display text-3xl md:text-4xl font-bold text-foreground">
                                    {stat.value}
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
