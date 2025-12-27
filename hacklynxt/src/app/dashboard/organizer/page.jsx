"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Calendar,
    Users,
    Plus,
    Eye,
    Edit,
    MoreHorizontal,
    CheckCircle2,
    Clock,
    AlertCircle
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authAPI, eventsAPI } from "@/lib/api";
import { toast } from "sonner";

export default function OrganizerDashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            if (!authAPI.isAuthenticated()) {
                router.push("/auth");
                return;
            }

            const userData = authAPI.getUser();
            setUser(userData);

            try {
                const { ok, data } = await eventsAPI.getMyEvents?.() || { ok: true, data: [] };
                if (ok) {
                    setEvents(data.results || data || []);
                }
            } catch (error) {
                console.error("Failed to fetch events:", error);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    const stats = [
        { label: "Total Events", value: events.length || 5, icon: Calendar, color: "text-primary" },
        { label: "Active Events", value: events.filter(e => e.status === 'active').length || 2, icon: CheckCircle2, color: "text-success" },
        { label: "Total Registrations", value: 150, icon: Users, color: "text-purple-500" },
        { label: "Pending Approval", value: events.filter(e => e.status === 'pending').length || 1, icon: Clock, color: "text-warning" },
    ];

    const getStatusBadge = (status) => {
        switch (status) {
            case "active":
                return <Badge variant="success">Active</Badge>;
            case "pending":
                return <Badge variant="warning">Pending</Badge>;
            case "completed":
                return <Badge variant="secondary">Completed</Badge>;
            case "rejected":
                return <Badge variant="destructive">Rejected</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    if (loading) {
        return (
            <DashboardLayout role="organizer">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </DashboardLayout>
        );
    }

    const sampleEvents = events.length > 0 ? events : [
        { id: 1, name: "AI Innovation Challenge", status: "active", registrations: 45, start_date: "2024-02-15" },
        { id: 2, name: "Web Dev Workshop", status: "pending", registrations: 0, start_date: "2024-02-20" },
        { id: 3, name: "Mobile App Hackathon", status: "completed", registrations: 80, start_date: "2024-01-10" },
    ];

    return (
        <DashboardLayout role="organizer">
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="font-display text-3xl font-bold text-foreground">
                            Organizer Dashboard
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Manage your events and track registrations.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/dashboard/organizer/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Event
                        </Link>
                    </Button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat) => (
                        <Card key={stat.label}>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl bg-secondary ${stat.color}`}>
                                        <stat.icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Events List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Your Events</CardTitle>
                        <CardDescription>Manage and monitor your created events</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {sampleEvents.map((event) => (
                                <div
                                    key={event.id}
                                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-secondary/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Calendar className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-foreground">{event.name}</h4>
                                            <p className="text-sm text-muted-foreground flex items-center gap-4">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {new Date(event.start_date).toLocaleDateString()}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Users className="h-3 w-3" />
                                                    {event.registrations || 0} registrations
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {getStatusBadge(event.status || "active")}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => router.push(`/dashboard/organizer/${event.id}`)}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => router.push(`/dashboard/organizer/${event.id}/edit`)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit Event
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
