"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileText, Shield, UserCheck, Scale, AlertCircle } from "lucide-react";

export default function TermsPage() {
    const sections = [
        {
            icon: UserCheck,
            title: "1. Agreement to Terms",
            content: "By accessing or using Hacklyn, you agree to be bound by these Terms and Conditions and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site."
        },
        {
            icon: Shield,
            title: "2. User Accounts",
            content: "When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service."
        },
        {
            icon: Scale,
            title: "3. Hackathon Participation",
            content: "Participants must adhere to the specific rules of each hackathon they join. Plagiarism, cheating, or any form of intellectual property theft will result in immediate disqualification and potential account banning."
        },
        {
            icon: FileText,
            title: "4. Intellectual Property",
            content: "The Service and its original content, features, and functionality are and will remain the exclusive property of Hacklyn and its licensors. Projects submitted to hackathons remain the property of their respective creators unless specified otherwise by the event organizer's specific rules."
        },
        {
            icon: AlertCircle,
            title: "5. Limitation of Liability",
            content: "In no event shall Hacklyn, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses."
        }
    ];

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />

            <main className="flex-1 pt-32 pb-16 px-4">
                <div className="max-w-4xl mx-auto space-y-8 animate-fade-up">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-2">
                            <FileText className="h-8 w-8 text-primary" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
                            Terms & <span className="text-primary">Conditions</span>
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Last updated: December 30, 2025. Please read these terms carefully before using our platform.
                        </p>
                    </div>

                    <Card className="border-none shadow-soft overflow-hidden bg-card/50 backdrop-blur-sm">
                        <CardContent className="p-8 md:p-12 space-y-12">
                            {sections.map((section, index) => (
                                <div key={index} className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-secondary rounded-lg">
                                            <section.icon className="h-5 w-5 text-primary" />
                                        </div>
                                        <h2 className="text-xl font-bold text-foreground">{section.title}</h2>
                                    </div>
                                    <p className="text-muted-foreground leading-relaxed pl-11">
                                        {section.content}
                                    </p>
                                    {index < sections.length - 1 && <Separator className="mt-8" />}
                                </div>
                            ))}

                            <div className="bg-primary/5 rounded-2xl p-6 mt-8 border border-primary/10">
                                <h3 className="font-bold text-primary mb-2 flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    Questions?
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    If you have any questions about these Terms, please contact us at support@hacklyn.com
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
