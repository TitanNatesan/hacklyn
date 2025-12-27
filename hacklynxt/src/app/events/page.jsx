"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { EventCard } from "@/components/events/EventCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Calendar, Loader2 } from "lucide-react";
import { eventsAPI, authAPI } from "@/lib/api";
import { toast } from "sonner";

export default function EventsPage() {
    const router = useRouter();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("all");

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const { ok, data } = await eventsAPI.getEvents();
                if (ok) {
                    setEvents(data.results || data || []);
                }
            } catch (error) {
                console.error("Failed to fetch events:", error);
                toast.error("Failed to load events");
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const handleApply = (eventId) => {
        if (!authAPI.isAuthenticated()) {
            toast.error("Please sign in to apply for events");
            router.push("/auth?mode=login");
            return;
        }
        router.push(`/dashboard/apply/${eventId}`);
    };

    const filteredEvents = events.filter((event) => {
        const matchesSearch = event.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterType === "all" || event.type === filterType || event.mode?.toLowerCase() === filterType;
        return matchesSearch && matchesFilter;
    });

    // Sample events for demo
    const sampleEvents = [
        {
            id: 1,
            name: "AI Innovation Challenge 2024",
            description: "Build innovative AI solutions to real-world problems",
            start_date: "2024-02-15",
            mode: "Hybrid",
            organizer_name: "Tech University",
            prize_pool: "₹50,000",
            tracks: "AI/ML, NLP, Computer Vision",
            cover_image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800",
        },
        {
            id: 2,
            name: "Web Dev Workshop Series",
            description: "Learn modern web development from industry experts",
            start_date: "2024-02-20",
            mode: "Online",
            organizer_name: "Developer Community",
            prize_pool: "Certificates",
            tracks: "React, Next.js, Node.js",
            cover_image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
        },
        {
            id: 3,
            name: "Mobile App Hackathon",
            description: "Create the next big mobile application",
            start_date: "2024-03-01",
            mode: "Offline",
            organizer_name: "App Dev Club",
            prize_pool: "₹75,000",
            tracks: "Flutter, React Native, iOS, Android",
            cover_image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800",
        },
        {
            id: 4,
            name: "Blockchain Summit",
            description: "Explore the future of decentralized technology",
            start_date: "2024-03-10",
            mode: "Hybrid",
            organizer_name: "Crypto Club",
            prize_pool: "₹1,00,000",
            tracks: "DeFi, NFT, Smart Contracts",
            cover_image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800",
        },
    ];

    const displayEvents = events.length > 0 ? filteredEvents : sampleEvents;

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 pt-20">
                {/* Hero Section */}
                <section className="py-12 bg-gradient-to-b from-secondary/30 to-background">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-8">
                            <Badge variant="secondary" className="mb-4">
                                <Calendar className="w-3 h-3 mr-1" />
                                Events
                            </Badge>
                            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                                Discover Amazing Events
                            </h1>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                Find hackathons, workshops, and tech events happening across campuses.
                            </p>
                        </div>

                        {/* Search and Filter */}
                        <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search events..."
                                    className="pl-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Select value={filterType} onValueChange={setFilterType}>
                                <SelectTrigger className="w-full md:w-40">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Filter" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Events</SelectItem>
                                    <SelectItem value="online">Online</SelectItem>
                                    <SelectItem value="offline">Offline</SelectItem>
                                    <SelectItem value="hybrid">Hybrid</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </section>

                {/* Events Grid */}
                <section className="py-12">
                    <div className="container mx-auto px-4">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : displayEvents.length === 0 ? (
                            <div className="text-center py-20">
                                <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-xl font-semibold text-foreground mb-2">No events found</h3>
                                <p className="text-muted-foreground">
                                    Try adjusting your search or filter criteria.
                                </p>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {displayEvents.map((event, index) => (
                                    <div
                                        key={event.id}
                                        className="animate-fade-up"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <EventCard event={event} onApply={handleApply} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
