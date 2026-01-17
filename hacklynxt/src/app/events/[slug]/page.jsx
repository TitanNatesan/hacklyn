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
import { formatEventDate, getRelativeTime } from "@/lib/utils";

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

    // Route param is slug
    const eventSlug = params.slug;

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                // Fetch event by slug
                const data = await eventsAPI.get(eventSlug);
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

        if (eventSlug) {
            fetchEvent();
            fetchUser();
        }
    }, [eventSlug]);

    const handleApply = async () => {
        if (!authAPI.isAuthenticated()) {
            toast.error("Please sign in to apply");
            router.push("/auth?mode=login");
            return;
        }

        // Check profile completion before allowing application
        try {
            const user = await authAPI.getMe();
            if (!user?.is_profile_complete) {
                toast.error(
                    "Please complete your profile before applying",
                    {
                        description: "You need a resume, GitHub link, LinkedIn link, and at least one education entry.",
                        duration: 5000,
                    }
                );
                router.push("/dashboard/profile");
                return;
            }
        } catch (error) {
            console.error("Failed to check profile:", error);
            toast.error("Please log in again to apply");
            router.push("/auth?mode=login");
            return;
        }

        // Navigate using slug
        router.push(`/dashboard/apply/${event?.slug}`);
    };

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            toast.success("Link copied to clipboard!");
        } catch (error) {
            toast.error("Failed to copy link");
        }
    };

    const handleWhatsAppShare = () => {
        const text = `Check out ${event?.name}!\n${event?.tagline || ''}`;
        const url = window.location.href;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`;
        window.open(whatsappUrl, '_blank');
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
                                                    {formatEventDate(event.start_date, event.end_date)}
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
                                                    ? `${formatEventDate(event.registration_end)} (${getRelativeTime(event.registration_end)})`
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
                                                    <Link href={`/events/${event.slug}/manage`}>
                                                        Manage Event
                                                    </Link>
                                                </Button>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <Button variant="outline" className="w-full" onClick={handleShare}>
                                                        <Share2 className="h-4 w-4 mr-2" />
                                                        Copy Link
                                                    </Button>
                                                    <Button variant="outline" className="w-full" onClick={handleWhatsAppShare}>
                                                        <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                                        </svg>
                                                        WhatsApp
                                                    </Button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <Button className="w-full" size="lg" onClick={handleApply}>
                                                    Apply Now
                                                </Button>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <Button variant="outline" className="w-full" onClick={handleShare}>
                                                        <Share2 className="h-4 w-4 mr-2" />
                                                        Copy Link
                                                    </Button>
                                                    <Button variant="outline" className="w-full" onClick={handleWhatsAppShare}>
                                                        <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                                        </svg>
                                                        WhatsApp
                                                    </Button>
                                                </div>
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
