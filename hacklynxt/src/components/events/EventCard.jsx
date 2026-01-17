"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Trophy, ArrowRight } from "lucide-react";

// --- Helper Functions ---
const formatDate = (dateStr) => {
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    } catch {
        return dateStr;
    }
};

const getEventImage = (event) => {
    return event.cover_image ||
        `https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop`;
};

const getModeColor = (mode) => {
    switch (mode?.toLowerCase()) {
        case 'online': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        case 'offline': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'hybrid': return 'bg-purple-100 text-purple-700 border-purple-200';
        default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
};

const hoverClasses = "hover:border-french-blue-400 hover:shadow-xl hover:shadow-french-blue-100/50 hover:bg-white";
const borderClasses = "border-2 border-dashed border-neutral-200 transition-all duration-500 rounded-2xl overflow-hidden h-full";

// --- Sub-Components ---

function LandscapeCard({ event, onApply, bannerSide }) {
    const [isHovered, setIsHovered] = useState(false);
    const [bannerOnRight, setBannerOnRight] = useState(false);

    useEffect(() => {
        if (bannerSide === "right") setBannerOnRight(true);
        else if (bannerSide === "left") setBannerOnRight(false);
        else setBannerOnRight(Math.random() > 0.5);
    }, [bannerSide]);

    return (
        <Card
            className={`group relative bg-white/80 backdrop-blur-sm ${borderClasses} ${hoverClasses}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Advanced Hover Shimmer */}
            <div
                className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 ${isHovered ? "translate-x-full" : "-translate-x-full"}`}
                style={{ transition: isHovered ? "transform 1s ease-in-out" : "none" }}
            />

            <div className={`flex flex-col md:flex-row h-full ${bannerOnRight ? 'md:flex-row-reverse' : ''}`}>
                {/* Image Section - 40% width on desktop */}
                <div className="relative w-full md:w-2/5 aspect-video md:aspect-auto min-h-[220px] bg-neutral-100 overflow-hidden flex-shrink-0">
                    <Image
                        src={getEventImage(event)}
                        alt={event.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        unoptimized
                    />
                    <div className={`absolute inset-0 bg-gradient-to-${bannerOnRight ? 'l' : 'r'} from-black/60 via-transparent to-transparent opacity-80`} />

                    {/* Mode Badge */}
                    <div className="absolute top-4 right-4 z-10">
                        <Badge className={`${getModeColor(event.mode)} border backdrop-blur-md shadow-md py-1 px-3`}>
                            {event.mode}
                        </Badge>
                    </div>

                    {/* Location */}
                    <div className="absolute bottom-4 left-4 text-white z-10">
                        <p className="text-xs font-semibold flex items-center gap-1.5 drop-shadow-md">
                            <MapPin className="w-3.5 h-3.5" />
                            {event.venue || event.city || "Online"}
                        </p>
                    </div>
                </div>

                {/* Content Section - 60% width on desktop */}
                <div className="flex-1 p-6 flex flex-col justify-between relative z-10">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-french-blue-600 uppercase tracking-[0.2em] text-[10px]">
                                {event.organizer_name}
                            </span>
                        </div>

                        <h3 className="font-extrabold text-2xl leading-tight text-neutral-900 group-hover:text-french-blue-600 transition-colors">
                            {event.name}
                        </h3>

                        <div className="flex flex-wrap gap-2">
                            {(event.tracks?.split(",") || []).slice(0, 4).map(tag => (
                                <span key={tag} className="text-[10px] px-2.5 py-1 rounded-full bg-neutral-100/80 border border-neutral-200 text-neutral-700 font-bold uppercase tracking-wider">
                                    {tag.trim()}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 pt-6 mt-6 border-t border-dashed border-neutral-200/60">
                        <div className="flex items-center gap-6 text-sm">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Date</span>
                                <div className="flex items-center gap-2 text-neutral-800">
                                    <Calendar className="w-4 h-4 text-french-blue-500" />
                                    <span className="font-bold">{formatDate(event.start_date)}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Joined</span>
                                <div className="flex items-center gap-2 text-neutral-800">
                                    <Users className="w-4 h-4 text-french-blue-500" />
                                    <span className="font-bold">{event.participants_count || 0}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex flex-col items-end gap-0.5">
                                <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Prize Pool</span>
                                <div className="flex items-center gap-1.5 text-blue-600 font-black text-lg">
                                    <Trophy className="w-5 h-5" />
                                    <span>{event.prize_pool || "TBA"}</span>
                                </div>
                            </div>
                            <Button
                                size="lg"
                                className="rounded-xl bg-neutral-900 text-white hover:bg-french-blue-600 shadow-lg hover:shadow-french-blue-200 transition-all duration-300 px-6"
                                onClick={() => onApply?.(event.slug)}
                            >
                                <span className="font-bold">View</span>
                                <ArrowRight className={`w-4 h-4 ml-2 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Corner Glow Effect */}
            <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-french-blue-400/10 blur-3xl transition-opacity duration-500 ${isHovered ? "opacity-100" : "opacity-0"}`} />
        </Card>
    );
}

function StandardCard({ event, onApply }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Card
            className={`group relative bg-white/80 backdrop-blur-sm ${borderClasses} flex flex-col ${hoverClasses}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Simple Hover Shimmer */}
            <div
                className={`absolute inset-0 z-20 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ${isHovered ? "translate-x-full" : "-translate-x-full"}`}
                style={{ transition: isHovered ? "transform 0.7s ease-in-out" : "none" }}
            />

            {/* Image Section */}
            <div className="aspect-[16/10] relative bg-neutral-100 overflow-hidden">
                <Image
                    src={getEventImage(event)}
                    alt={event.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    unoptimized
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />

                {/* Badges Overlay */}
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                    <Badge className={`${getModeColor(event.mode)} border backdrop-blur-md shadow-md`}>
                        {event.mode}
                    </Badge>
                </div>

                <div className="absolute bottom-4 left-4 text-white z-10">
                    <p className="text-xs font-bold drop-shadow-md flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {event.venue || event.city || "Online"}
                    </p>
                </div>
            </div>

            {/* Content Section */}
            <CardContent className="p-5 flex-1 flex flex-col gap-4 relative z-10">
                <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-french-blue-600 uppercase tracking-widest text-[9px]">
                            {event.organizer_name}
                        </span>
                    </div>

                    <h3 className="font-extrabold text-xl leading-snug text-neutral-900 group-hover:text-french-blue-600 transition-colors">
                        {event.name}
                    </h3>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                        {(event.tracks?.split(",") || []).slice(0, 2).map(tag => (
                            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-100 border border-neutral-200 text-neutral-600 font-bold uppercase tracking-tight">
                                {tag.trim()}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Footer Info Row */}
                <div className="grid grid-cols-2 gap-3 text-sm pt-4 border-t border-dashed border-neutral-200/80">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] text-neutral-400 uppercase font-bold tracking-widest">Date</span>
                        <div className="flex items-center gap-2 text-neutral-800">
                            <Calendar className="w-3.5 h-3.5 text-french-blue-500" />
                            <span className="font-bold">{formatDate(event.start_date)}</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                        <span className="text-[9px] text-neutral-400 uppercase font-bold tracking-widest">Joined</span>
                        <div className="flex items-center gap-2 text-neutral-800">
                            <Users className="w-3.5 h-3.5 text-french-blue-500" />
                            <span className="font-bold">{event.participants_count || 0}</span>
                        </div>
                    </div>
                </div>
            </CardContent>

            {/* Action Footer */}
            <CardFooter className="p-5 pt-0 mt-auto relative z-10">
                <div className="w-full flex items-center justify-between gap-3">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] text-neutral-400 uppercase font-bold tracking-widest">Prize Pool</span>
                        <div className="flex items-center gap-1.5 text-blue-600 font-black text-base">
                            <Trophy className="w-4 h-4" />
                            <span>{event.prize_pool || "TBA"}</span>
                        </div>
                    </div>

                    <Button
                        size="sm"
                        className="rounded-xl bg-neutral-900 text-white hover:bg-french-blue-600 shadow-md hover:shadow-french-blue-200 transition-all duration-300 px-5 ml-auto font-bold"
                        onClick={() => onApply?.(event.slug)}
                    >
                        View
                        <ArrowRight className={`w-3.5 h-3.5 ml-1.5 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
                    </Button>
                </div>
            </CardFooter>

            {/* Subtle Glow */}
            <div className={`absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-french-blue-400/5 blur-2xl transition-opacity duration-500 ${isHovered ? "opacity-100" : "opacity-0"}`} />
        </Card>
    );
}

// --- Main Export ---

export function EventCard({ event, onApply, variant = "standard", bannerSide = "auto" }) {
    if (variant === "landscape") {
        return (
            <>
                <div className="md:hidden h-full">
                    <StandardCard event={event} onApply={onApply} />
                </div>
                <div className="hidden md:block h-full">
                    <LandscapeCard event={event} onApply={onApply} bannerSide={bannerSide} />
                </div>
            </>
        );
    }

    return <StandardCard event={event} onApply={onApply} />;
}
