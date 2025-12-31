"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, Eye, Lock, Database, Smartphone, Info } from "lucide-react";

export default function PrivacyPage() {
    const sections = [
        {
            icon: Database,
            title: "1. Information We Collect",
            content: "We collect information you provide directly to us when you create an account, such as your name, email address, profile picture, and professional details. When you participate in hackathons, we may also collect project details, code repository links, and team communications."
        },
        {
            icon: Eye,
            title: "2. How We Use Your Information",
            content: "We use the information we collect to operate and maintain our platform, process registrations for hackathons, facilitate team matching, and communicate with you about event updates, security alerts, and support messages."
        },
        {
            icon: Lock,
            title: "3. Data Security",
            content: "We implement industry-standard security measures to protect your personal information. This includes encryption of data in transit and at rest, secure hosting on trusted cloud providers, and regular security audits of our systems."
        },
        {
            icon: Shield,
            title: "4. Information Sharing",
            content: "We do not sell your personal data. Your information is shared with hackathon organizers for the events you join. We may also share data with third-party service providers who perform services on our behalf, subject to strict confidentiality agreements."
        },
        {
            icon: Smartphone,
            title: "5. Cookies & Tracking",
            content: "We use cookies and similar technologies to remember your login state, personalize your experience, and analyze platform usage. You can control cookie settings through your browser, but disabling them may limit some functionality of our service."
        }
    ];

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />

            <main className="flex-1 pt-32 pb-16 px-4">
                <div className="max-w-4xl mx-auto space-y-8 animate-fade-up">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center p-3 bg-success/10 rounded-2xl mb-2">
                            <Shield className="h-8 w-8 text-success" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
                            Privacy <span className="text-success">Policy</span>
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Last updated: December 30, 2025. Your privacy is our top priority. Learn how we handle your data.
                        </p>
                    </div>

                    <Card className="border-none shadow-soft overflow-hidden bg-card/50 backdrop-blur-sm">
                        <CardContent className="p-8 md:p-12 space-y-12">
                            {sections.map((section, index) => (
                                <div key={index} className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-secondary rounded-lg">
                                            <section.icon className="h-5 w-5 text-success" />
                                        </div>
                                        <h2 className="text-xl font-bold text-foreground">{section.title}</h2>
                                    </div>
                                    <p className="text-muted-foreground leading-relaxed pl-11">
                                        {section.content}
                                    </p>
                                    {index < sections.length - 1 && <Separator className="mt-8" />}
                                </div>
                            ))}

                            <div className="bg-success/5 rounded-2xl p-6 mt-8 border border-success/10">
                                <h3 className="font-bold text-success mb-2 flex items-center gap-2">
                                    <Info className="h-4 w-4" />
                                    Your Privacy Rights
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    You have the right to access, correct, or delete your personal information at any time. For data requests or privacy concerns, please email us at privacy@hacklyn.com
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>

            <Footer />
        </div>
    );
}
