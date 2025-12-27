"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
    Calendar,
    MapPin,
    Users,
    Trophy,
    Clock,
    ArrowLeft,
    Share2,
    Heart,
    ExternalLink,
    Loader2
} from "lucide-react";
import { eventsAPI, authAPI } from "@/lib/api";
import { toast } from "sonner";

export default function EventDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const { ok, data } = await eventsAPI.getEvent?.(params.id) || { ok: false };
                if (ok) {
                    setEvent(data);
                } else {
                    // Use sample data for demo
                    setEvent({
                        id: params.id,
                        name: "AI Innovation Challenge 2024",
                        description: `
              Join us for the most exciting AI hackathon of the year! 
              
              This is your chance to showcase your AI/ML skills, collaborate with talented peers, 
              and compete for amazing prizes. Whether you're a beginner or an expert, 
              there's something for everyone.
              
              ## What to Expect
              - 48 hours of intense coding and innovation
              - Mentorship from industry experts
              - Workshops on cutting-edge AI technologies
              - Networking opportunities with tech companies
              
              ## Tracks
              - Natural Language Processing
              - Computer Vision
              - Generative AI
              - AI for Social Good
            `,
                        start_date: "2024-02-15T09:00:00",
                        end_date: "2024-02-17T18:00:00",
                        registration_deadline: "2024-02-10T23:59:00",
                        mode: "Hybrid",
                        location: "Tech University Campus & Online",
                        organizer_name: "Tech University",
                        prize_pool: "₹50,000",
                        team_size_min: 2,
                        team_size_max: 4,
                        tracks: "AI/ML, NLP, Computer Vision, GenAI",
                        total_registrations: 156,
                        cover_image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200",
                        rules: "All submissions must be original work. Teams must consist of 2-4 members.",
                        prizes: [
                            { position: "1st Place", prize: "₹25,000 + Internship Opportunity" },
                            { position: "2nd Place", prize: "₹15,000 + Goodies" },
                            { position: "3rd Place", prize: "₹10,000 + Goodies" },
                        ],
                        timeline: [
                            { time: "Feb 15, 9:00 AM", event: "Opening Ceremony & Problem Statement Release" },
                            { time: "Feb 15, 11:00 AM", event: "Hacking Begins" },
                            { time: "Feb 16, 2:00 PM", event: "Mentor Office Hours" },
                            { time: "Feb 17, 12:00 PM", event: "Submission Deadline" },
                            { time: "Feb 17, 4:00 PM", event: "Judging & Results" },
                        ],
                    });
                }
            } catch (error) {
                console.error("Failed to fetch event:", error);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchEvent();
        }
    }, [params.id]);

    const handleApply = () => {
        if (!authAPI.isAuthenticated()) {
            toast.error("Please sign in to apply");
            router.push("/auth?mode=login");
            return;
        }
        router.push(`/dashboard/apply/${params.id}`);
    };

    const handleShare = async () => {
        try {
            await navigator.share({
                title: event?.name,
                text: event?.description?.substring(0, 100),
                url: window.location.href,
            });
        } catch {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            toast.success("Link copied to clipboard!");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
                        <Button asChild>
                            <Link href="/events">Browse Events</Link>
                        </Button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 pt-16">
                {/* Hero Image */}
                <div className="relative h-64 md:h-96 bg-secondary">
                    <Image
                        src={event.cover_image}
                        alt={event.name}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                </div>

                <div className="container mx-auto px-4 -mt-32 relative z-10">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Back Button */}
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/events">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Events
                                </Link>
                            </Button>

                            {/* Event Header */}
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <Badge variant="secondary">{event.mode}</Badge>
                                        {event.tracks?.split(",").slice(0, 3).map((track) => (
                                            <Badge key={track} variant="outline">{track.trim()}</Badge>
                                        ))}
                                    </div>

                                    <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                                        {event.name}
                                    </h1>

                                    <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            {new Date(event.start_date).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            {event.location || "Online"}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4" />
                                            {event.total_registrations || 0} registered
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Tabs */}
                            <Tabs defaultValue="about" className="w-full">
                                <TabsList className="w-full justify-start">
                                    <TabsTrigger value="about">About</TabsTrigger>
                                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                                    <TabsTrigger value="prizes">Prizes</TabsTrigger>
                                    <TabsTrigger value="rules">Rules</TabsTrigger>
                                </TabsList>

                                <TabsContent value="about" className="mt-4">
                                    <Card>
                                        <CardContent className="p-6 prose prose-sm max-w-none">
                                            <div className="whitespace-pre-wrap text-muted-foreground">
                                                {event.description}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="timeline" className="mt-4">
                                    <Card>
                                        <CardContent className="p-6">
                                            <div className="space-y-4">
                                                {(event.timeline || []).map((item, index) => (
                                                    <div key={index} className="flex gap-4">
                                                        <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                                                        <div>
                                                            <p className="font-medium text-foreground">{item.event}</p>
                                                            <p className="text-sm text-muted-foreground">{item.time}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="prizes" className="mt-4">
                                    <Card>
                                        <CardContent className="p-6">
                                            <div className="grid gap-4">
                                                {(event.prizes || []).map((prize, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50"
                                                    >
                                                        <Trophy className={`h-8 w-8 ${index === 0 ? "text-yellow-500" :
                                                            index === 1 ? "text-gray-400" :
                                                                "text-amber-600"
                                                            }`} />
                                                        <div>
                                                            <p className="font-semibold text-foreground">{prize.position}</p>
                                                            <p className="text-muted-foreground">{prize.prize}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="rules" className="mt-4">
                                    <Card>
                                        <CardContent className="p-6">
                                            <p className="text-muted-foreground">{event.rules || "Rules will be announced soon."}</p>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Apply Card */}
                            <Card className="sticky top-24">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Trophy className="h-5 w-5 text-primary" />
                                        Prize Pool
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="text-center">
                                        <p className="text-3xl font-bold text-primary">{event.prize_pool}</p>
                                        <p className="text-sm text-muted-foreground">in prizes</p>
                                    </div>

                                    <Separator />

                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Team Size</span>
                                            <span className="font-medium">{event.team_size_min || 1} - {event.team_size_max || 4} members</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Registration Deadline</span>
                                            <span className="font-medium">
                                                {new Date(event.registration_deadline || event.start_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Organizer</span>
                                            <span className="font-medium">{event.organizer_name}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Button className="w-full" size="lg" onClick={handleApply}>
                                            Apply Now
                                        </Button>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => setIsLiked(!isLiked)}
                                            >
                                                <Heart className={`h-4 w-4 mr-2 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                                                {isLiked ? "Saved" : "Save"}
                                            </Button>
                                            <Button variant="outline" className="flex-1" onClick={handleShare}>
                                                <Share2 className="h-4 w-4 mr-2" />
                                                Share
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
