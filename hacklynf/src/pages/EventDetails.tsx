import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Trophy,
  ArrowLeft,
  Share2,
  Heart,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { eventsAPI } from "@/lib/api";

interface Event {
  id: number;
  name: string;
  tagline?: string;
  description: string;
  organizer_name: string;
  organizer_contact?: string;
  website?: string;
  start_date: string;
  end_date: string;
  registration_start?: string;
  registration_end?: string;
  mode: string;
  venue?: string;
  city?: string;
  team_min: number;
  team_max: number;
  tracks?: string;
  rules?: string;
  prize_pool?: string;
  prizes?: { position: string; reward: string }[];
  status: string;
  participants_count?: number;
}

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (id) {
      loadEvent();
    }
  }, [id]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      const data = await eventsAPI.get(id!);
      setEvent(data);
    } catch (error) {
      console.error("Error loading event:", error);
      toast.error("Failed to load event details");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    const isProfileCompleted = localStorage.getItem("profileCompleted") === "true";
    if (!isProfileCompleted) {
      toast.error("Please complete your profile first to apply for events.");
      navigate("/complete-profile");
    } else {
      navigate(`/dashboard/apply/${id}`);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Event link copied to clipboard!");
  };

  const handleSave = async () => {
    try {
      const result = await eventsAPI.save(id!);
      setIsSaved(result.is_saved);
      toast.success(result.message);
    } catch (error) {
      toast.error("Please login to save events");
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
            <p className="text-muted-foreground mb-4">The event you're looking for doesn't exist.</p>
            <Button asChild>
              <Link to="/events">Browse Events</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const rules = event.rules?.split("\n").filter(r => r.trim()) || [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Events
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Header */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="default" className="capitalize">{event.mode}</Badge>
                  <Badge variant="success">
                    {event.status === "approved" || event.status === "active" ? "Registration Open" : event.status}
                  </Badge>
                </div>
                <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
                  {event.name}
                </h1>
                {event.tagline && (
                  <p className="text-lg text-muted-foreground">{event.tagline}</p>
                )}
              </div>

              {/* Quick Info */}
              <div className="grid sm:grid-cols-2 gap-4">
                <Card className="border-border/50">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-semibold">{formatDate(event.start_date)} - {formatDate(event.end_date)}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border/50">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Venue</p>
                      <p className="font-semibold">{event.venue || event.city || "Online"}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border/50">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Team Size</p>
                      <p className="font-semibold">{event.team_min} - {event.team_max} members</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border/50">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Prize Pool</p>
                      <p className="font-semibold">{event.prize_pool || "Prizes TBA"}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Description */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>About This Event</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {event.description}
                  </p>
                </CardContent>
              </Card>

              {/* Rules */}
              {rules.length > 0 && (
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle>Rules & Guidelines</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {rules.map((rule, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Prizes */}
              {event.prizes && event.prizes.length > 0 && (
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle>Prizes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {event.prizes.map((prize, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Trophy className="w-5 h-5 text-primary" />
                            </div>
                            <span className="font-semibold">{prize.position}</span>
                          </div>
                          <span className="text-muted-foreground">{prize.reward}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <Card className="border-border/50 sticky top-24">
                <CardContent className="p-6 space-y-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Organized by</p>
                    <p className="font-semibold">{event.organizer_name}</p>
                  </div>

                  {event.registration_end && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 text-warning">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">
                        Registration ends {formatDate(event.registration_end)}
                      </span>
                    </div>
                  )}

                  <Button
                    variant="hero"
                    className="w-full"
                    onClick={handleRegister}
                  >
                    Register Now
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleShare}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleSave}
                    >
                      <Heart className={`w-4 h-4 mr-2 ${isSaved ? "fill-red-500 text-red-500" : ""}`} />
                      {isSaved ? "Saved" : "Save"}
                    </Button>
                  </div>

                  <div className="text-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 inline mr-1" />
                    {event.participants_count || 0} already registered
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
};

export default EventDetails;
