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
import { Search, Filter, Calendar } from "lucide-react";
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
                const data = await eventsAPI.list();
                if (data) {
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

    const handleViewEvent = (slug) => {
        router.push(`/events/${slug}`);
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
        {
            id: 5,
            name: "Cybersecurity Bootcamp",
            description: "Master the art of ethical hacking and defense",
            start_date: "2024-03-25",
            mode: "Online",
            organizer_name: "Security Masters",
            prize_pool: "₹30,000",
            tracks: "Network Security, Cryptography",
            cover_image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800",
        },
        {
            id: 6,
            name: "Game Dev Jam",
            description: "Create an indie game in 48 hours",
            start_date: "2024-04-05",
            mode: "Offline",
            organizer_name: "Indie Gamers",
            prize_pool: "₹1,50,000",
            tracks: "Unity, Unreal, 2D Art",
            cover_image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800",
        },
    ];

    const displayEvents = events.length > 0 ? filteredEvents : sampleEvents;

    // Simplified 5-column 4-row bento grid pattern (repeats every 6 events)
    // Removed QuoteCard to ensure content clarity and fix visibility
    // Pattern:
    // Row 1: [Event 1 (3 cols)] [Event 2 (2 cols, tall)]
    // Row 2: [Event 3 (3 cols)] [Event 2 (row 2)]
    // Row 3: [Event 4 (2 cols, tall)] [Event 5 (3 cols)]
    // Row 4: [Event 4 (row 2)] [Event 6 (3 cols)]

    const getCardConfig = (index) => {
        const pos = index % 6;
        switch (pos) {
            case 0: // Event 1: top-left landscape
                return { variant: "landscape", classes: "md:col-span-3", bannerSide: "right" };
            case 1: // Event 2: top-right tall standard
                return { variant: "standard", classes: "md:col-span-2 md:row-span-2 md:col-start-4", bannerSide: "auto" };
            case 2: // Event 3: row 2 left landscape (now matches card 1)
                return { variant: "landscape", classes: "md:col-span-3 md:row-start-2", bannerSide: "left" };
            case 3: // Event 4: bottom-left tall standard
                return { variant: "standard", classes: "md:col-span-2 md:row-span-2 md:col-start-1 md:row-start-3", bannerSide: "auto" };
            case 4: // Event 5: row 3 right landscape
                return { variant: "landscape", classes: "md:col-span-3 md:col-start-3 md:row-start-3", bannerSide: "right" };
            case 5: // Event 6: bottom-right landscape
                return { variant: "landscape", classes: "md:col-span-3 md:col-start-3 md:row-start-4", bannerSide: "left" };
            default:
                return { variant: "standard", classes: "", bannerSide: "auto" };
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 pt-20">
                {/* Hero Section */}
                <section className="py-20 bg-neutral-50/50 border-b border-dashed border-neutral-200 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="text-center mb-12">
                            <Badge className="mb-6 bg-french-blue-50 text-french-blue-600 border border-dashed border-french-blue-200 font-bold px-4 py-1.5 rounded-full">
                                <Calendar className="w-4 h-4 mr-2" />
                                Discovery
                            </Badge>
                            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 tracking-tight">
                                Explore <span className="text-french-blue-600">Events</span> & Challenges
                            </h1>
                            <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed font-medium">
                                Join hackathons, workshops, and tech meetups. Boost your skills and connect with like-minded developers.
                            </p>
                        </div>

                        {/* Search and Filter */}
                        <div className="max-w-4xl mx-auto">
                            <div className="bg-white border-2 border-dashed border-neutral-200 rounded-3xl p-3 shadow-xl shadow-neutral-200/40 flex flex-col md:flex-row gap-3">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                                    <Input
                                        placeholder="Search by event name, tracks, or tech..."
                                        className="h-14 pl-12 pr-4 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 focus:bg-white focus:border-french-blue-400 focus:ring-0 text-base transition-all font-medium"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <Select value={filterType} onValueChange={setFilterType}>
                                        <SelectTrigger className="w-full md:w-44 h-14 rounded-2xl border border-dashed border-neutral-200 bg-white hover:bg-neutral-50 font-bold text-neutral-700 px-6">
                                            <Filter className="h-4 w-4 mr-2 text-french-blue-600" />
                                            <SelectValue placeholder="Format" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-dashed border-neutral-200 shadow-2xl p-2">
                                            <SelectItem value="all" className="rounded-xl font-medium focus:bg-french-blue-50 focus:text-french-blue-600">All Formats</SelectItem>
                                            <SelectItem value="online" className="rounded-xl font-medium focus:bg-french-blue-50 focus:text-french-blue-600">Online only</SelectItem>
                                            <SelectItem value="offline" className="rounded-xl font-medium focus:bg-french-blue-50 focus:text-french-blue-600">In-person</SelectItem>
                                            <SelectItem value="hybrid" className="rounded-xl font-medium focus:bg-french-blue-50 focus:text-french-blue-600">Hybrid model</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button className="h-14 w-14 rounded-2xl bg-neutral-900 hover:bg-french-blue-600 text-white shadow-lg shrink-0 border-2 border-dashed border-transparent hover:border-french-blue-400">
                                        <Search className="h-6 w-6" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Events Grid */}
                <section className="py-16 bg-white">
                    <div className="container mx-auto px-4">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-24">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-full border-4 border-dashed border-french-blue-100 border-t-french-blue-500 animate-spin"></div>
                                </div>
                                <p className="text-muted-foreground mt-4 font-medium">Loading events...</p>
                            </div>
                        ) : displayEvents.length === 0 ? (
                            <div className="py-24 border-2 border-dashed border-neutral-200 rounded-3xl">
                                <div className="flex flex-col items-center text-center max-w-md mx-auto">
                                    <div className="w-20 h-20 rounded-2xl bg-neutral-50 border-2 border-dashed border-neutral-200 flex items-center justify-center mb-6">
                                        <Calendar className="h-10 w-10 text-neutral-300" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-neutral-900 mb-3">No events match your criteria</h3>
                                    <p className="text-neutral-500 mb-8 font-medium">
                                        Try adjusting your search or clearing filters to see more events.
                                    </p>
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="rounded-xl px-8 h-12 font-bold border-2 border-dashed border-neutral-200 hover:border-french-blue-400 hover:text-french-blue-600 transition-all"
                                        onClick={() => { setSearchQuery(""); setFilterType("all"); }}
                                    >
                                        Clear All Filters
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-5 md:grid-rows-4 gap-4">
                                {displayEvents.map((event, index) => {
                                    const config = getCardConfig(index);
                                    return (
                                        <div
                                            key={event.id}
                                            className={`animate-fade-up ${config.classes}`}
                                            style={{ animationDelay: `${index * 60}ms` }}
                                        >
                                            <EventCard
                                                event={event}
                                                onApply={handleViewEvent}
                                                variant={config.variant}
                                                bannerSide={config.bannerSide}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
