"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Scale,
    Calendar,
    CheckCircle2,
    Clock,
    FileText,
    Star,
    ChevronRight
} from "lucide-react";
import { authAPI } from "@/lib/api";
import { toast } from "sonner";

export default function JudgeDashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            if (!authAPI.isAuthenticated()) {
                router.push("/auth");
                return;
            }

            const userData = authAPI.getUser();
            setUser(userData);
            setLoading(false);
        };

        checkAuth();
    }, [router]);

    const stats = [
        { label: "Assigned Events", value: 3, icon: Calendar, color: "text-primary" },
        { label: "Pending Reviews", value: 12, icon: Clock, color: "text-warning" },
        { label: "Completed Reviews", value: 28, icon: CheckCircle2, color: "text-success" },
        { label: "Avg. Score Given", value: "8.2", icon: Star, color: "text-purple-500" },
    ];

    const assignedEvents = [
        {
            id: 1,
            name: "AI Innovation Challenge",
            totalSubmissions: 15,
            reviewed: 8,
            deadline: "2024-02-15",
            status: "in-progress",
        },
        {
            id: 2,
            name: "Web Dev Hackathon",
            totalSubmissions: 20,
            reviewed: 20,
            deadline: "2024-02-10",
            status: "completed",
        },
        {
            id: 3,
            name: "Mobile App Challenge",
            totalSubmissions: 10,
            reviewed: 0,
            deadline: "2024-02-25",
            status: "pending",
        },
    ];

    if (loading) {
        return (
            <DashboardLayout role="judge">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="judge">
            <div className="space-y-8">
                {/* Header */}
                <div>
                    <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-2">
                        <Scale className="h-8 w-8 text-primary" />
                        Judge Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Review and score submissions for your assigned events.
                    </p>
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

                {/* Assigned Events */}
                <Card>
                    <CardHeader>
                        <CardTitle>Assigned Events</CardTitle>
                        <CardDescription>Events where you're assigned as a judge</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {assignedEvents.map((event) => (
                                <div
                                    key={event.id}
                                    className="p-4 rounded-lg border hover:bg-secondary/50 transition-colors cursor-pointer"
                                    onClick={() => router.push(`/dashboard/judge/${event.id}`)}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <FileText className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-foreground">{event.name}</h4>
                                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                    <Clock className="h-3 w-3" />
                                                    Deadline: {new Date(event.deadline).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Badge
                                                variant={
                                                    event.status === "completed"
                                                        ? "success"
                                                        : event.status === "in-progress"
                                                            ? "warning"
                                                            : "secondary"
                                                }
                                            >
                                                {event.status === "completed"
                                                    ? "Completed"
                                                    : event.status === "in-progress"
                                                        ? "In Progress"
                                                        : "Not Started"}
                                            </Badge>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-muted-foreground">
                                                {event.reviewed} of {event.totalSubmissions} reviewed
                                            </span>
                                            <span className="text-sm font-medium">
                                                {Math.round((event.reviewed / event.totalSubmissions) * 100)}%
                                            </span>
                                        </div>
                                        <Progress value={(event.reviewed / event.totalSubmissions) * 100} className="h-2" />
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
