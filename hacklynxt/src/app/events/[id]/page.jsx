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
    Loader2,
    Tag,
    Layers
} from "lucide-react";
import { eventsAPI, authAPI } from "@/lib/api";
import { toast } from "sonner";

// Simple Markdown renderer component
function MarkdownRenderer({ content }) {
    if (!content) return <p className="text-muted-foreground">No description provided.</p>;

    const renderMarkdown = (text) => {
        let html = text
            // Escape HTML first
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            // Headers
            .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
            .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>')
            .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
            // Bold and Italic
            .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            // Code blocks
            .replace(/```([\s\S]*?)```/g, '<pre class="bg-muted p-3 rounded-md my-2 overflow-x-auto text-sm"><code>$1</code></pre>')
            // Inline code
            .replace(/`(.+?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
            // Blockquotes
            .replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-primary pl-4 my-2 italic text-muted-foreground">$1</blockquote>')
            // Unordered lists
            .replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
            // Ordered lists  
            .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>')
            // Links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline hover:no-underline" target="_blank" rel="noopener">$1</a>')
            // Line breaks
            .replace(/\n/g, '<br/>');

        return html;
    };

    return (
        <div
            className="prose prose-sm max-w-none text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
        />
    );
}

export default function EventDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);

    const [currentUser, setCurrentUser] = useState(null);

    // Treat the route param as slug (can be slug or id for backwards compat)
    const eventSlugOrId = params.id;

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                // Try slug-based lookup first, fallback to id if it looks numeric
                let data;
                if (/^\d+$/.test(eventSlugOrId)) {
                    data = await eventsAPI.get(eventSlugOrId);
                } else {
                    data = await eventsAPI.getBySlug(eventSlugOrId);
                }
                if (data) {
                    setEvent(data);
                }
            } catch (error) {
                console.error("Failed to fetch event:", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchUser = () => {
            const user = authAPI.getUser();
            setCurrentUser(user);
        };

        if (eventSlugOrId) {
            fetchEvent();
            fetchUser();
        }
    }, [eventSlugOrId]);

    const handleApply = () => {
        if (!authAPI.isAuthenticated()) {
            toast.error("Please sign in to apply");
            router.push("/auth?mode=login");
            return;
        }
        // Navigate using slug if available, otherwise id
        router.push(`/dashboard/apply/${event?.slug || event?.id}`);
    };

    const handleShare = async () => {
        try {
            await navigator.share({
                title: event?.name,
                text: event?.tagline || event?.description?.substring(0, 100),
                url: window.location.href,
            });
        } catch {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            toast.success("Link copied to clipboard!");
        }
    };

    // Parse comma-separated strings into arrays
    const parseCommaList = (str) => {
        if (!str) return [];
        return str.split(',').map(item => item.trim()).filter(Boolean);
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

    const tracks = parseCommaList(event.tracks);
    const themes = parseCommaList(event.themes);
    const hasThemesOrTracks = tracks.length > 0 || themes.length > 0;

    // Determine cover image - use cover_image or logo or default
    const coverImage = event.cover_image || event.logo || "/placeholder-event.jpg";
    const logoImage = event.logo;

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 pt-16">
                {/* Hero Image */}
                <div className="relative h-64 md:h-96 bg-secondary">
                    {coverImage && (
                        <Image
                            src={coverImage}
                            alt={event.name}
                            fill
                            className="object-cover"
                            priority
                            unoptimized
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
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
                                    <div className="flex gap-6">
                                        {/* Event Logo */}
                                        {logoImage && (
                                            <div className="hidden md:block relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 border shadow-sm">
                                                <Image
                                                    src={logoImage}
                                                    alt={`${event.name} logo`}
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                            </div>
                                        )}

                                        <div className="flex-1">
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                <Badge variant="secondary">{event.mode}</Badge>
                                                {event.status && event.status !== 'published' && (
                                                    <Badge variant="outline">{event.status}</Badge>
                                                )}
                                            </div>

                                            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                                                {event.name}
                                            </h1>

                                            {event.tagline && (
                                                <p className="text-lg text-muted-foreground mb-4">{event.tagline}</p>
                                            )}

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
                                                    {event.venue || event.city || "Online"}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4" />
                                                    {event.participants_count || 0} registered
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Themes and Tracks */}
                                    {hasThemesOrTracks && (
                                        <div className="mt-6 pt-6 border-t space-y-4">
                                            {themes.length > 0 && (
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Tag className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm font-medium text-muted-foreground mr-2">Themes:</span>
                                                    {themes.map((theme, idx) => (
                                                        <Badge key={idx} variant="secondary">{theme}</Badge>
                                                    ))}
                                                </div>
                                            )}
                                            {tracks.length > 0 && (
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Layers className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm font-medium text-muted-foreground mr-2">Tracks:</span>
                                                    {tracks.map((track, idx) => (
                                                        <Badge key={idx} variant="outline">{track}</Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Tabs */}
                            <Tabs defaultValue="about" className="w-full">
                                <TabsList className="w-full justify-start">
                                    <TabsTrigger value="about">About</TabsTrigger>
                                    <TabsTrigger value="prizes">Prizes</TabsTrigger>
                                    <TabsTrigger value="rules">Rules & Eligibility</TabsTrigger>
                                </TabsList>

                                <TabsContent value="about" className="mt-4">
                                    <Card>
                                        <CardContent className="p-6">
                                            <MarkdownRenderer content={event.description} />
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="prizes" className="mt-4">
                                    <Card>
                                        <CardContent className="p-6">
                                            {event.prizes && event.prizes.length > 0 ? (
                                                <div className="grid gap-4">
                                                    {event.prizes.map((prize, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50"
                                                        >
                                                            <Trophy className={`h-8 w-8 ${index === 0 ? "text-warning" :
                                                                index === 1 ? "text-neutral-400" :
                                                                    "text-warning"
                                                                }`} />
                                                            <div>
                                                                <p className="font-semibold text-foreground">{prize.position}</p>
                                                                <p className="text-muted-foreground">{prize.reward}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                                    <p className="text-muted-foreground">
                                                        Prize details will be announced soon.
                                                    </p>
                                                    {event.prize_pool && (
                                                        <p className="text-lg font-semibold text-primary mt-2">
                                                            Total Prize Pool: {event.prize_pool}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="rules" className="mt-4">
                                    <Card>
                                        <CardContent className="p-6 space-y-6">
                                            {event.rules && (
                                                <div>
                                                    <h3 className="font-semibold text-lg mb-3">Rules</h3>
                                                    <MarkdownRenderer content={event.rules} />
                                                </div>
                                            )}
                                            {event.eligibility && (
                                                <div>
                                                    <h3 className="font-semibold text-lg mb-3">Eligibility</h3>
                                                    <MarkdownRenderer content={event.eligibility} />
                                                </div>
                                            )}
                                            {!event.rules && !event.eligibility && (
                                                <p className="text-muted-foreground">
                                                    Rules and eligibility criteria will be announced soon.
                                                </p>
                                            )}
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
                                        <p className="text-3xl font-bold text-primary">{event.prize_pool || "TBA"}</p>
                                        <p className="text-sm text-muted-foreground">in prizes</p>
                                    </div>

                                    <Separator />

                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Team Size</span>
                                            <span className="font-medium">{event.team_min || 1} - {event.team_max || 4} members</span>
                                        </div>

                                        {/* Registration Deadline */}
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                Reg. Deadline
                                            </span>
                                            <span className="font-medium">
                                                {event.registration_end
                                                    ? new Date(event.registration_end).toLocaleDateString("en-IN", {
                                                        day: "numeric",
                                                        month: "short",
                                                        hour: "2-digit",
                                                        minute: "2-digit"
                                                    })
                                                    : "Not specified"}
                                            </span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Organizer</span>
                                            <span className="font-medium">{event.organizer_name}</span>
                                        </div>

                                        {event.website && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Website</span>
                                                <a
                                                    href={event.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-medium text-primary hover:underline flex items-center gap-1"
                                                >
                                                    Visit <ExternalLink className="h-3 w-3" />
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        {/* Logic: If Organizer -> Show Manage + Share only, Else -> Show Apply + Share */}
                                        {currentUser && event.organizer && currentUser.id === event.organizer.id ? (
                                            <>
                                                <Button className="w-full" size="lg" asChild>
                                                    <Link href={`/events/${event.slug || event.id}/manage`}>
                                                        Manage Event
                                                    </Link>
                                                </Button>
                                                <Button variant="outline" className="w-full" onClick={handleShare}>
                                                    <Share2 className="h-4 w-4 mr-2" />
                                                    Share
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button className="w-full" size="lg" onClick={handleApply}>
                                                    Apply Now
                                                </Button>
                                                <Button variant="outline" className="w-full" onClick={handleShare}>
                                                    <Share2 className="h-4 w-4 mr-2" />
                                                    Share
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main >

            <Footer />
        </div >
    );
}
