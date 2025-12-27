"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Calendar,
    Trophy,
    Users,
    Clock,
    ArrowRight,
    CheckCircle2,
    Rocket,
    Star,
    Target
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { eventsAPI } from "@/lib/api";

function DashboardContent() {
    const router = useRouter();
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const { ok, data } = await eventsAPI.getEvents();
                if (ok) {
                    setEvents(data.results || data || []);
                }
            } catch (error) {
                console.error("Failed to fetch events:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const stats = [
        { label: "Events Participated", value: "3", icon: Calendar, color: "text-primary" },
        { label: "Hackathons Won", value: "1", icon: Trophy, color: "text-warning" },
        { label: "Teams Joined", value: "2", icon: Users, color: "text-success" },
        { label: "Certificates Earned", value: "3", icon: Star, color: "text-purple-500" },
    ];

    const upcomingEvents = events.slice(0, 3);

    if (loading) {
        return (
            <DashboardLayout role="student">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="student">
            <div className="space-y-8">
                {/* Welcome Section */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="font-display text-3xl font-bold text-foreground">
                            Welcome back, {user?.first_name || "Student"}! 👋
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Here's what's happening with your hackathon journey.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/events">
                            Browse Events
                            <ArrowRight className="ml-2 h-4 w-4" />
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

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Upcoming Events */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-primary" />
                                    Upcoming Events
                                </CardTitle>
                                <Link href="/events" className="text-sm text-primary hover:underline">
                                    View all
                                </Link>
                            </div>
                            <CardDescription>Events you might be interested in</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {upcomingEvents.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No upcoming events</p>
                                    <Button variant="link" asChild className="mt-2">
                                        <Link href="/events">Browse available events</Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {upcomingEvents.map((event) => (
                                        <div
                                            key={event.id}
                                            className="flex items-center gap-4 p-4 rounded-lg border hover:bg-secondary/50 transition-colors cursor-pointer"
                                            onClick={() => router.push(`/events/${event.id}`)}
                                        >
                                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <Rocket className="h-6 w-6 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-foreground truncate">{event.name}</h4>
                                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                    <Clock className="h-3 w-3" />
                                                    {new Date(event.start_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <Badge variant="secondary">{event.mode || "Online"}</Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Profile Completion */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5 text-primary" />
                                Profile Completion
                            </CardTitle>
                            <CardDescription>Complete your profile to stand out</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-muted-foreground">Progress</span>
                                        <span className="text-sm font-medium">75%</span>
                                    </div>
                                    <Progress value={75} className="h-2" />
                                </div>

                                <div className="space-y-3">
                                    {[
                                        { label: "Basic Info", completed: true },
                                        { label: "Education", completed: true },
                                        { label: "Projects", completed: true },
                                        { label: "Social Links", completed: false },
                                    ].map((item) => (
                                        <div key={item.label} className="flex items-center gap-3">
                                            <CheckCircle2
                                                className={`h-4 w-4 ${item.completed ? "text-success" : "text-muted-foreground"
                                                    }`}
                                            />
                                            <span
                                                className={`text-sm ${item.completed ? "text-foreground" : "text-muted-foreground"
                                                    }`}
                                            >
                                                {item.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <Button variant="outline" className="w-full" asChild>
                                    <Link href="/complete-profile">Complete Profile</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default function StudentDashboard() {
    return (
        <ProtectedRoute>
            <DashboardContent />
        </ProtectedRoute>
    );
}
