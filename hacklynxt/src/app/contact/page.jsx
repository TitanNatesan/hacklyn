"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, MapPin, Phone, Send, Loader2, Twitter, Github, Linkedin } from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        toast.success("Message sent successfully! We'll get back to you soon.");
        setFormData({ name: "", email: "", subject: "", message: "" });
        setIsLoading(false);
    };

    const contactInfo = [
        {
            icon: Mail,
            title: "Email",
            value: "hello@hacklyn.com",
            description: "We'll respond within 24 hours",
        },
        {
            icon: Phone,
            title: "Phone",
            value: "+1 (555) 123-4567",
            description: "Mon-Fri from 9am to 6pm",
        },
        {
            icon: MapPin,
            title: "Office",
            value: "San Francisco, CA",
            description: "123 Innovation Street",
        },
    ];

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 pt-20">
                {/* Hero Section - Simplified */}
                <section className="py-24 bg-white border-b border-neutral-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-french-blue-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="container mx-auto px-4 text-center relative z-10">
                        <Badge className="mb-6 bg-french-blue-50 text-french-blue-600 border border-french-blue-100 font-bold px-4 py-1.5 rounded-full">
                            <Send className="w-3.5 h-3.5 mr-1.5" />
                            Get in Touch
                        </Badge>
                        <h1 className="font-display text-4xl md:text-5xl font-bold text-neutral-900 mb-6 tracking-tight">
                            We'd Love to <span className="text-french-blue-600">Hear from You</span>
                        </h1>
                        <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed font-medium">
                            Have questions about Hacklyn? Want to partner with us?
                            Our team is here to help you every step of the way.
                        </p>
                    </div>
                </section>

                {/* Contact Section */}
                <section className="py-20 bg-neutral-50/30">
                    <div className="container mx-auto px-4">
                        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {/* Contact Info - Simplified Cards with Accents */}
                            <div className="space-y-4">
                                {contactInfo.map((info, index) => {
                                    const colors = [
                                        { icon: 'text-french-blue-600', bg: 'bg-french-blue-50', border: 'border-french-blue-100' },
                                        { icon: 'text-turquoise-surf-600', bg: 'bg-turquoise-surf-50', border: 'border-turquoise-surf-100' },
                                        { icon: 'text-deep-twilight-600', bg: 'bg-deep-twilight-50', border: 'border-deep-twilight-100' },
                                    ];
                                    const color = colors[index % 3];

                                    return (
                                        <Card key={info.title} className="border-neutral-200 shadow-sm hover:border-french-blue-200 hover:shadow-md transition-all duration-300 group">
                                            <CardContent className="p-6 flex items-start gap-4">
                                                <div className={`w-12 h-12 rounded-xl ${color.bg} ${color.border} border flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                                                    <info.icon className={`w-6 h-6 ${color.icon}`} />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-neutral-900 mb-1">{info.title}</h3>
                                                    <p className="text-french-blue-600 font-bold text-sm mb-1">{info.value}</p>
                                                    <p className="text-sm text-neutral-500 leading-relaxed font-medium">{info.description}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}

                                {/* Social Connect Card */}
                                <Card className="border-dashed border-2 border-neutral-200 bg-transparent shadow-none">
                                    <CardContent className="p-6">
                                        <h3 className="font-bold text-neutral-900 mb-3 text-sm uppercase tracking-wider">Follow Us</h3>
                                        <div className="flex gap-2">
                                            {[Twitter, Github, Linkedin].map((Icon, i) => (
                                                <Button key={i} variant="outline" size="icon" className="rounded-xl hover:text-french-blue-600 hover:border-french-blue-200 h-10 w-10">
                                                    <Icon className="w-4 h-4" />
                                                </Button>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Contact Form - Cleaner Design */}
                            <Card className="lg:col-span-2 border-neutral-200 shadow-xl rounded-3xl overflow-hidden">
                                <div className="bg-neutral-900 p-8 text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-french-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                                    <div className="relative z-10">
                                        <CardTitle className="text-2xl font-bold">Send us a message</CardTitle>
                                        <CardDescription className="text-neutral-400 mt-2 text-base">
                                            Fill out the form and we'll get back to you within 24 hours.
                                        </CardDescription>
                                    </div>
                                </div>
                                <CardContent className="p-10">
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="name" className="text-sm font-bold text-neutral-700">Name</Label>
                                                <Input
                                                    id="name"
                                                    placeholder="Your name"
                                                    className="h-12 rounded-xl bg-neutral-50 border-neutral-200 focus:bg-white focus:border-french-blue-500 focus:ring-0 transition-all font-medium"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="text-sm font-bold text-neutral-700">Email Address</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="you@example.com"
                                                    className="h-12 rounded-xl bg-neutral-50 border-neutral-200 focus:bg-white focus:border-french-blue-500 focus:ring-0 transition-all font-medium"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="subject" className="text-sm font-bold text-neutral-700">Subject</Label>
                                            <Input
                                                id="subject"
                                                placeholder="How can we help?"
                                                className="h-12 rounded-xl bg-neutral-50 border-neutral-200 focus:bg-white focus:border-french-blue-500 focus:ring-0 transition-all font-medium"
                                                value={formData.subject}
                                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="message" className="text-sm font-bold text-neutral-700">Detailed Message</Label>
                                            <Textarea
                                                id="message"
                                                placeholder="Tell us more about your inquiry..."
                                                className="min-h-[160px] rounded-xl bg-neutral-50 border-neutral-200 focus:bg-white focus:border-french-blue-500 focus:ring-0 transition-all font-medium resize-none p-4"
                                                value={formData.message}
                                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full md:w-auto h-12 px-8 rounded-xl bg-french-blue-600 hover:bg-french-blue-700 text-white font-bold shadow-lg shadow-french-blue-500/20 transition-all active:scale-[0.98]"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                    Sending Message...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="mr-2 h-5 w-5" />
                                                    Send Message
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
