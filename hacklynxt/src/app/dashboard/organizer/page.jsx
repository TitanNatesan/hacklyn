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
        { label: "Total Registrations", value: 150, icon: Users, color: "text-accent" },
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
            <div className="space-y-8 max-w-6xl mx-auto">
                {/* Header - Simplified */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white border border-neutral-200 p-8 rounded-3xl shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-french-blue-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-french-blue-600 flex items-center justify-center shadow-lg shadow-french-blue-500/20">
                                <Calendar className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="font-display text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight">
                                Organizer Dashboard
                            </h1>
                        </div>
                        <p className="text-neutral-500 font-medium ml-13">
                            Manage your events and monitor participant engagement in real-time.
                        </p>
                    </div>
                    <Button size="lg" className="relative z-10 bg-neutral-900 hover:bg-neutral-800 text-white font-bold h-12 px-8 rounded-2xl shadow-xl transition-all active:scale-95" asChild>
                        <Link href="/dashboard/organizer/create">
                            <Plus className="mr-2 h-5 w-5" />
                            Create New Event
                        </Link>
                    </Button>
                </div>

                {/* Stats Grid - Accented Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => {
                        const accents = [
                            { icon: 'text-french-blue-600', bg: 'bg-french-blue-50', border: 'border-french-blue-100' },
                            { icon: 'text-success', bg: 'bg-green-50', border: 'border-green-100' },
                            { icon: 'text-turquoise-surf-600', bg: 'bg-turquoise-surf-50', border: 'border-turquoise-surf-100' },
                            { icon: 'text-warning', bg: 'bg-orange-50', border: 'border-orange-100' },
                        ];
                        const accent = accents[index % 4];

                        return (
                            <Card key={stat.label} className="border-neutral-200 shadow-sm hover:border-french-blue-200 transition-all duration-300">
                                <CardContent className="p-6">
                                    <div className={`w-12 h-12 rounded-2xl ${accent.bg} ${accent.border} border flex items-center justify-center mb-4`}>
                                        <stat.icon className={`h-6 w-6 ${accent.icon}`} />
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold text-neutral-900 tracking-tight">{stat.value}</p>
                                        <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider mt-1">{stat.label}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Events List - Refined Card */}
                <Card className="border-neutral-200 shadow-xl rounded-3xl overflow-hidden">
                    <CardHeader className="bg-neutral-50/50 border-b border-neutral-100">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-xl font-bold">Active Events</CardTitle>
                                <CardDescription className="font-medium">Track and manage your published events.</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" className="rounded-xl font-bold border-2" asChild>
                                <Link href="/events">View All</Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        {sampleEvents.map((event) => (
                            <div
                                key={event.id}
                                className="flex items-center justify-between p-5 rounded-2xl border border-neutral-100 hover:border-french-blue-200 hover:bg-neutral-50/50 transition-all group"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-neutral-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                                        <div className="text-center">
                                            <p className="text-[10px] font-bold text-neutral-400 leading-none">JAN</p>
                                            <p className="text-lg font-black text-french-blue-600 leading-none mt-0.5">24</p>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-neutral-900 group-hover:text-french-blue-600 transition-colors text-lg">{event.name}</h4>
                                        <div className="flex items-center gap-4 mt-1">
                                            <span className="flex items-center gap-1.5 text-sm text-neutral-500 font-medium">
                                                <Users className="h-4 w-4 text-neutral-400" />
                                                {event.registrations || 0} participants
                                            </span>
                                            <span className="w-1 h-1 rounded-full bg-neutral-300" />
                                            {getStatusBadge(event.status)}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Button variant="ghost" className="hidden md:flex rounded-xl font-bold text-french-blue-600 hover:bg-french-blue-50" asChild>
                                        <Link href={`/dashboard/organizer/${event.id}`}>Manage</Link>
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="icon" className="rounded-xl hover:bg-neutral-100">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="rounded-2xl shadow-xl border-neutral-200 p-2">
                                            <DropdownMenuItem onClick={() => router.push(`/dashboard/organizer/${event.id}`)} className="rounded-xl font-medium focus:bg-french-blue-50 focus:text-french-blue-600 h-10">
                                                <Eye className="mr-2 h-4 w-4" />
                                                View Analytics
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => router.push(`/dashboard/organizer/${event.id}/edit`)} className="rounded-xl font-medium focus:bg-french-blue-50 focus:text-french-blue-600 h-10">
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit Configuration
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
