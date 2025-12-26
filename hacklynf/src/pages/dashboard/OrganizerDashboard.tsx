import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Users,
  Trophy,
  FileText,
  Plus,
  Settings,
  Loader2
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { eventsAPI, dashboardAPI } from "@/lib/api";

interface Event {
  id: number;
  name: string;
  organizer_name: string;
  status: string;
  participants_count?: number;
  start_date: string;
}

const OrganizerDashboard = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_events: 0,
    active_events: 0,
    total_registrations: 0,
    pending_reviews: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load my organized events
      const myEvents = await eventsAPI.myEvents();
      const eventsList = Array.isArray(myEvents) ? myEvents : (myEvents?.results || []);
      setEvents(eventsList);

      // Load stats
      try {
        const dashStats = await dashboardAPI.getStats();
        setStats({
          total_events: dashStats.organized_events_count || 0,
          active_events: dashStats.active_events_count || 0,
          total_registrations: 0,
          pending_reviews: dashStats.pending_applications_as_organizer || 0
        });
      } catch {
        // Stats not available
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
      case "ongoing":
        return <Badge variant="success">{status}</Badge>;
      case "draft":
        return <Badge variant="secondary">{status}</Badge>;
      case "completed":
        return <Badge variant="outline">{status}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-display">My Events</h1>
            <p className="text-muted-foreground">Create and manage your organized events</p>
          </div>
          <Button onClick={() => navigate('/dashboard/organize')} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Event
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{stats.total_events}</div>
              <div className="text-sm text-muted-foreground">Total Events</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{stats.active_events}</div>
              <div className="text-sm text-muted-foreground">Active Events</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{stats.total_registrations}</div>
              <div className="text-sm text-muted-foreground">Registrations</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <FileText className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold">{stats.pending_reviews}</div>
              <div className="text-sm text-muted-foreground">Pending Reviews</div>
            </CardContent>
          </Card>
        </div>

        {/* Events List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : events.length === 0 ? (
          <Card className="p-8 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No events yet</h3>
            <p className="text-muted-foreground mb-4">Create your first event to get started</p>
            <Button onClick={() => navigate('/dashboard/organize')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {events.map((event) => (
              <Card key={event.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-lg">{event.name}</h3>
                        {getStatusBadge(event.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(event.start_date)} • {event.participants_count || 0} participants
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/dashboard/organize/manage/${event.id}`)}
                      >
                        <Settings className="w-4 h-4 mr-1" />
                        Manage
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default OrganizerDashboard;
