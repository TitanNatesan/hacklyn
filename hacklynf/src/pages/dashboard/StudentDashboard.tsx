import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  MapPin,
  Search,
  ArrowRight,
  Code,
  Loader2,
  Plus,
  Users,
  FileText
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { authAPI, eventsAPI, applicationsAPI, dashboardAPI } from "@/lib/api";

interface Event {
  id: number;
  name: string;
  tagline?: string;
  organizer_name: string;
  start_date: string;
  end_date: string;
  mode: string;
  city?: string;
  prize_pool?: string;
  tracks?: string;
  cover_image?: string;
  logo?: string;
  status: string;
  participants_count?: number;
}

interface Application {
  id: number;
  event: number;
  event_name: string;
  status: string;
  applied_at: string;
  team_name?: string;
}

interface DashboardStats {
  organized_events_count: number;
  active_events_count: number;
  pending_applications_as_organizer: number;
  my_applications_count: number;
  approved_applications_count: number;
  pending_applications_count: number;
  teams_count: number;
}

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [myApplications, setMyApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [modeFilter, setModeFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const user = authAPI.getUser();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load featured events (returns array or {count, results})
      const featured = await eventsAPI.featured();
      const featuredList = Array.isArray(featured) ? featured : (featured?.results || []);
      setFeaturedEvents(featuredList);

      // Load user's applications
      try {
        const apps = await applicationsAPI.myApplications();
        const appsList = Array.isArray(apps) ? apps : (apps?.results || []);
        setMyApplications(appsList);
      } catch {
        setMyApplications([]);
      }

      // Load dashboard stats
      try {
        const dashStats = await dashboardAPI.getStats();
        setStats(dashStats);
      } catch {
        setStats(null);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setFeaturedEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const events = await eventsAPI.list({
        search: searchQuery || undefined,
        mode: modeFilter !== "all" ? modeFilter as any : undefined,
        city: cityFilter !== "all" ? cityFilter : undefined,
      });
      setFeaturedEvents(events.results || []);
    } catch (error) {
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (eventId: number | string) => {
    navigate(`/dashboard/apply/${eventId}`);
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    } catch {
      return dateStr;
    }
  };

  const getEventImage = (event: Event) => {
    return event.cover_image ||
      `https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'waitlisted':
        return <Badge variant="secondary">Waitlisted</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <DashboardLayout role="student">
      <div className="space-y-16 animate-fade-in relative z-10">

        {/* Background Gradients */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -z-10" />
        <div className="absolute top-40 left-0 -translate-x-12 w-80 h-80 bg-purple-500/20 rounded-full blur-[100px] -z-10" />

        {/* Quick Stats */}
        {stats && (
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-border/50">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-primary">{stats.organized_events_count}</div>
                <div className="text-sm text-muted-foreground">Events Organized</div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-green-500">{stats.approved_applications_count}</div>
                <div className="text-sm text-muted-foreground">Approved Applications</div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-yellow-500">{stats.pending_applications_count}</div>
                <div className="text-sm text-muted-foreground">Pending Applications</div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-blue-500">{stats.teams_count}</div>
                <div className="text-sm text-muted-foreground">Teams Joined</div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Quick Actions */}
        <section className="flex flex-wrap gap-4">
          <Button size="lg" onClick={() => navigate('/dashboard/create-event')} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Event
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/dashboard/my-events')} className="gap-2">
            <Calendar className="w-4 h-4" />
            My Events
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/dashboard/applications')} className="gap-2">
            <FileText className="w-4 h-4" />
            My Applications
          </Button>
        </section>

        {/* Hero / Search Section */}
        <section className="text-center space-y-8 pt-4">
          <div className="space-y-4 max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-2">Discover New Opportunities</Badge>
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-foreground">
              {getGreeting()}, <span className="text-primary">{user?.first_name || user?.username || "Hacker"}!</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover hackathons, competitions, and workshops. Apply to participate or create your own events.
            </p>
          </div>

          {/* Search Bar Container */}
          <div className="bg-background/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 p-4 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search for Events, Hackathons..."
                  className="pl-10 h-12 text-base border-border/50 bg-secondary/30 focus:bg-background transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/20" onClick={handleSearch}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <Select value={modeFilter} onValueChange={setModeFilter}>
                <SelectTrigger className="h-10 bg-secondary/30 border-border/50">
                  <SelectValue placeholder="All Modes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modes</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>

              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger className="h-10 bg-secondary/30 border-border/50">
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  <SelectItem value="San Francisco">San Francisco</SelectItem>
                  <SelectItem value="Boston">Boston</SelectItem>
                  <SelectItem value="Virtual">Virtual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* My Applications */}
        {myApplications.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold font-display flex items-center gap-2">
                <FileText className="text-primary w-6 h-6" />
                Recent Applications
              </h2>
              <Button variant="link" asChild>
                <Link to="/dashboard/applications">View all</Link>
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myApplications.slice(0, 3).map((app) => (
                <Card key={app.id} className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold truncate flex-1">{app.event_name}</h3>
                      {getStatusBadge(app.status)}
                    </div>
                    {app.team_name && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {app.team_name}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Applied {formatDate(app.applied_at)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Featured Events */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold font-display text-primary">Featured Events</h2>
              <p className="text-sm text-muted-foreground">Hand-picked events for you to excel.</p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/events">View All Events</Link>
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : featuredEvents.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p>No events found. Check back soon!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredEvents.map((event) => (
                <Card key={event.id} className="group hover:scale-105 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 border-border/50 overflow-hidden">
                  <div className="aspect-[16/9] relative bg-muted overflow-hidden">
                    <img src={getEventImage(event)} alt={event.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
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
                      onClick={() => handleApply(event.id)}
                    >
                      Apply Now
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </section>

      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
