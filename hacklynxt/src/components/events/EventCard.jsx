"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Trophy, ArrowRight } from "lucide-react";

export function EventCard({ event, onApply }) {
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

    return (
        <Card className="group hover:scale-105 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 border-border/50 overflow-hidden">
            <div className="aspect-[16/9] relative bg-muted overflow-hidden">
                <Image
                    src={getEventImage(event)}
                    alt={event.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-xs font-semibold text-primary-foreground/80 mb-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {event.mode} • {event.organizer_name}
                    </p>
                    <h3 className="text-xl font-bold text-white">{event.name}</h3>
                </div>
            </div>
            <CardContent className="p-4 space-y-4">
                <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(event.start_date)}</span>
                    </div>
                    <div className="font-semibold text-primary">
                        {event.prize_pool || "Prizes TBA"}
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {(event.tracks?.split(",") || ["Hackathon"]).slice(0, 2).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs bg-secondary/50">{tag.trim()}</Badge>
                    ))}
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Button
                    className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    onClick={() => onApply?.(event.id)}
                >
                    Apply Now
                    <ArrowRight className="w-4 h-4" />
                </Button>
            </CardFooter>
        </Card>
    );
}
