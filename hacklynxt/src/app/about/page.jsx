import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Target, Rocket, Heart } from "lucide-react";

const teamMembers = [
    {
        name: "Alex Johnson",
        role: "Founder & CEO",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
        bio: "Passionate about democratizing hackathon management for every campus.",
    },
    {
        name: "Sarah Chen",
        role: "CTO",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
        bio: "Full-stack engineer with 10+ years building scalable platforms.",
    },
    {
        name: "Michael Park",
        role: "Head of Product",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
        bio: "Former organizer of 50+ hackathons, now building tools for others.",
    },
    {
        name: "Emily Rodriguez",
        role: "Head of Design",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
        bio: "Creating delightful experiences that make event management a breeze.",
    },
];

const values = [
    {
        icon: Users,
        title: "Community First",
        description: "We build for the community of organizers, participants, and judges who make hackathons possible.",
    },
    {
        icon: Target,
        title: "Simplicity",
        description: "Complex problems deserve elegant solutions. We strive for intuitive design in everything we build.",
    },
    {
        icon: Rocket,
        title: "Innovation",
        description: "We continuously push boundaries to create the best event management experience possible.",
    },
    {
        icon: Heart,
        title: "Passion",
        description: "We're hackathon enthusiasts ourselves, building tools we wish we had when organizing events.",
    },
];

export default function AboutPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 pt-20">
                {/* Hero Section - Simplified */}
                <section className="py-24 bg-white border-b border-neutral-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
                    <div className="container mx-auto px-4 text-center relative z-10">
                        <Badge className="mb-6 bg-french-blue-50 text-french-blue-600 border border-french-blue-100 font-bold px-4 py-1.5 rounded-full">
                            <Heart className="w-4 h-4 mr-2" />
                            Our Purpose
                        </Badge>
                        <h1 className="font-display text-4xl md:text-5xl lg:text-7xl font-bold text-neutral-900 mb-6 tracking-tight">
                            Empowering <span className="text-french-blue-600">Communities</span>
                        </h1>
                        <p className="text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed font-medium">
                            Hacklyn makes organizing campus events seamless. We're on a mission to democratize hackathon management for everyone, everywhere.
                        </p>
                    </div>
                </section>

                {/* Story Section - Cleaner */}
                <section className="py-24 bg-neutral-50/30">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="grid md:grid-cols-2 gap-12 items-center">
                                <div className="space-y-6">
                                    <h2 className="font-display text-4xl font-bold text-neutral-900">
                                        Our <span className="text-french-blue-600">Story</span>
                                    </h2>
                                    <div className="space-y-4 text-lg text-neutral-600 leading-relaxed font-medium">
                                        <p>
                                            In 2023, a group of students realized that organizing a hackathon was unnecessarily hard. Spreadsheets, manual emails, and broken workflows were the norm.
                                        </p>
                                        <p>
                                            We built Hacklyn to solve our own problems. Today, it helps thousands of students participate in world-class events across 50+ campuses.
                                        </p>
                                    </div>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-0 bg-french-blue-100 rounded-3xl rotate-3" />
                                    <div className="relative bg-white border border-neutral-200 rounded-3xl p-8 shadow-xl">
                                        <Rocket className="w-12 h-12 text-french-blue-600 mb-6" />
                                        <p className="text-2xl font-bold text-neutral-900 leading-tight">
                                            "Transforming the way campus events are managed, one line of code at a time."
                                        </p>
                                        <p className="mt-4 text-neutral-500 font-bold">— The Hacklyn Team</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Values Section - Accented White Cards */}
                <section className="py-24 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="font-display text-4xl font-bold text-neutral-900 mb-4">Values that Drive Us</h2>
                            <p className="text-neutral-500 font-medium">How we think about our mission and our community.</p>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {values.map((value, index) => {
                                const accents = [
                                    { icon: 'text-french-blue-600', bg: 'bg-french-blue-50' },
                                    { icon: 'text-turquoise-surf-600', bg: 'bg-turquoise-surf-50' },
                                    { icon: 'text-deep-twilight-600', bg: 'bg-deep-twilight-50' },
                                    { icon: 'text-yellow-600', bg: 'bg-yellow-50' },
                                ];
                                const accent = accents[index % 4];

                                return (
                                    <Card key={value.title} className="border-neutral-200 shadow-sm hover:shadow-xl hover:border-french-blue-200 transition-all duration-300 group">
                                        <CardContent className="p-8">
                                            <div className={`w-14 h-14 rounded-2xl ${accent.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                                <value.icon className={`w-7 h-7 ${accent.icon}`} />
                                            </div>
                                            <h3 className="font-bold text-lg text-neutral-900 mb-3">{value.title}</h3>
                                            <p className="text-neutral-500 leading-relaxed font-medium">{value.description}</p>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Team Section - Refined Professional Look */}
                <section className="py-24 bg-neutral-50/50">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="font-display text-4xl font-bold text-neutral-900 mb-4">The Humans Behind Hacklyn</h2>
                            <p className="text-neutral-500 font-medium">Meet the passionate builders dedicated to campus innovation.</p>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
                            {teamMembers.map((member, index) => (
                                <div
                                    key={member.name}
                                    className="group animate-fade-up"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className="relative aspect-square mb-6 overflow-hidden rounded-3xl shadow-lg border-4 border-white">
                                        <Image
                                            src={member.image}
                                            alt={member.name}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        {/* Subtle overlay on hover */}
                                        <div className="absolute inset-0 bg-french-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-bold text-neutral-900">{member.name}</h3>
                                        <p className="text-sm font-bold text-french-blue-600 uppercase tracking-widest">{member.role}</p>
                                        <p className="text-neutral-500 text-sm leading-relaxed mt-2 font-medium line-clamp-2">{member.bio}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
