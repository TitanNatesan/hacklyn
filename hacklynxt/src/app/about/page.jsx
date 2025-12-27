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
                {/* Hero Section */}
                <section className="py-20 bg-gradient-to-b from-secondary/30 to-background">
                    <div className="container mx-auto px-4 text-center">
                        <Badge variant="secondary" className="mb-4">About Us</Badge>
                        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
                            Empowering Campus Communities
                            <span className="block gradient-text">One Event at a Time</span>
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Hacklyn was born from a simple observation: organizing campus events shouldn't be complicated.
                            We're on a mission to make hackathon and event management accessible to everyone.
                        </p>
                    </div>
                </section>

                {/* Story Section */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="max-w-3xl mx-auto">
                            <h2 className="font-display text-3xl font-bold text-foreground mb-6 text-center">Our Story</h2>
                            <div className="prose prose-lg mx-auto text-muted-foreground">
                                <p className="mb-4">
                                    It all started in 2023 when a group of college students tried to organize a hackathon
                                    and found themselves drowning in spreadsheets, manual registrations, and scattered communications.
                                </p>
                                <p className="mb-4">
                                    We knew there had to be a better way. So we built Hacklyn — a platform that handles
                                    everything from registration to certification, letting organizers focus on what matters
                                    most: creating amazing experiences for participants.
                                </p>
                                <p>
                                    Today, Hacklyn powers events across 50+ colleges, helping thousands of students
                                    participate in hackathons, workshops, and tech events every month.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Values Section */}
                <section className="py-20 bg-secondary/30">
                    <div className="container mx-auto px-4">
                        <h2 className="font-display text-3xl font-bold text-foreground mb-12 text-center">Our Values</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {values.map((value, index) => (
                                <Card key={value.title} className="animate-fade-up" style={{ animationDelay: `${index * 100}ms` }}>
                                    <CardContent className="p-6 text-center">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                            <value.icon className="w-6 h-6 text-primary" />
                                        </div>
                                        <h3 className="font-display text-lg font-semibold text-foreground mb-2">{value.title}</h3>
                                        <p className="text-sm text-muted-foreground">{value.description}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Team Section */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <h2 className="font-display text-3xl font-bold text-foreground mb-12 text-center">Meet Our Team</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {teamMembers.map((member, index) => (
                                <Card
                                    key={member.name}
                                    variant="interactive"
                                    className="animate-fade-up"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <CardContent className="p-6 text-center">
                                        <Image
                                            src={member.image}
                                            alt={member.name}
                                            width={96}
                                            height={96}
                                            className="rounded-full mx-auto mb-4 object-cover"
                                        />
                                        <h3 className="font-display text-lg font-semibold text-foreground">{member.name}</h3>
                                        <p className="text-sm text-primary mb-2">{member.role}</p>
                                        <p className="text-sm text-muted-foreground">{member.bio}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
