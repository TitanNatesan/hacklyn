"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function CTASection() {
    return (
        <section className="py-24 bg-primary relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-64 h-64 bg-bright-sky-400/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-cobalt-blue-400/20 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 mb-8 backdrop-blur-sm border border-white/20">
                        <Sparkles className="w-4 h-4 text-white" />
                        <span className="text-sm font-medium text-white">
                            Ready to Get Started?
                        </span>
                    </div>

                    <h2 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground mb-6">
                        Transform Your Campus Events Today
                    </h2>

                    <p className="text-lg text-primary-foreground/80 mb-10 max-w-xl mx-auto">
                        Join hundreds of colleges already using Hacklyn to manage their
                        hackathons, workshops, and tech events.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button
                            size="xl"
                            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-elevated"
                            asChild
                        >
                            <Link href="/auth?mode=register">
                                Create Free Account
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </Button>
                        <Button
                            variant="ghost"
                            size="xl"
                            className="text-primary-foreground hover:bg-primary-foreground/10"
                            asChild
                        >
                            <Link href="/contact">
                                Contact Sales
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
