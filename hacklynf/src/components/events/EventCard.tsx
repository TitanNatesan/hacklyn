import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export interface EventCardProps {
  id: string;
  title: string;
  type: "hackathon" | "workshop" | "tech-talk" | "competition";
  date: string;
  venue: string;
  participantsCount: number;
  maxParticipants?: number;
  image?: string;
  status: "upcoming" | "ongoing" | "completed" | "registration-open";
}

const typeColors = {
  hackathon: "default",
  workshop: "success",
  "tech-talk": "warning",
  competition: "secondary",
} as const;

const statusLabels = {
  "upcoming": "Upcoming",
  "ongoing": "Live Now",
  "completed": "Completed",
  "registration-open": "Registration Open",
};

export function EventCard({
  id,
  title,
  type,
  date,
  venue,
  participantsCount,
  maxParticipants,
  image,
  status,
}: EventCardProps) {
  return (
    <Card variant="interactive" className="overflow-hidden group">
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5 overflow-hidden">
        {image ? (
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Calendar className="w-12 h-12 text-primary/30" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <Badge 
            variant={status === "ongoing" ? "success" : status === "registration-open" ? "default" : "secondary"}
          >
            {statusLabels[status]}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg line-clamp-2">{title}</CardTitle>
        </div>
        <Badge variant={typeColors[type]} className="w-fit capitalize">
          {type.replace("-", " ")}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{venue}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>
              {participantsCount}
              {maxParticipants && ` / ${maxParticipants}`} participants
            </span>
          </div>
        </div>

        <Button variant="outline" className="w-full group" asChild>
          <Link to={`/events/${id}`}>
            View Details
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
