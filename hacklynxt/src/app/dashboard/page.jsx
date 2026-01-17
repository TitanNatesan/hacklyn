"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
import { eventsAPI, dashboardAPI, applicationsAPI, profileAPI, cohostsAPI } from "@/lib/api";
import { calculateProfileStrength, getNextRequiredAction } from "@/lib/profileUtils";
import { getRelativeTime } from "@/lib/utils";


import { toast } from "sonner";

function DashboardContent() {
    const router = useRouter();
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [organizedEvents, setOrganizedEvents] = useState([]);
    const [applications, setApplications] = useState([]);
    const [statsData, setStatsData] = useState(null);
    const [profileData, setProfileData] = useState(null);
    const [invites, setInvites] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleInviteResponse = async (inviteId, accept) => {
        try {
            if (accept) {
                await cohostsAPI.accept(inviteId);
                toast.success("Invitation accepted!");
            } else {
                await cohostsAPI.reject(inviteId);
                toast.success("Invitation declined.");
            }
            // Refresh invites and organized events
            const [invitesRes, organizedRes] = await Promise.all([
                cohostsAPI.myInvites(),
                eventsAPI.getMyEvents()
            ]);
            setInvites(invitesRes || []);
            setOrganizedEvents(organizedRes.results || organizedRes || []);
        } catch (error) {
            console.error("Failed to respond to invite:", error);
            toast.error("Failed to process invitation.");
        }
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [eventsRes, organizedRes, statsRes, appsRes, profileRes, invitesRes] = await Promise.all([
                    eventsAPI.list(),
                    eventsAPI.getMyEvents(),
                    dashboardAPI.getStats(),
                    applicationsAPI.myApplications(),
                    profileAPI.get(),
                    cohostsAPI.myInvites(),
                ]);

                setEvents(eventsRes.results || eventsRes || []);
                setOrganizedEvents(organizedRes.results || organizedRes || []);
                setStatsData(statsRes);
                setApplications(appsRes.results || appsRes || []);
                setProfileData(profileRes);
                setInvites(invitesRes || []);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);


    const stats = [
        {
            label: "Events Organized",
            value: statsData?.organized_events_count || "0",
            icon: Rocket,
            color: "text-primary"
        },
        {
            label: "Pending Apps",
            value: statsData?.pending_applications_count || "0",
            icon: Clock,
            color: "text-warning"
        },
        {
            label: "Approved",
            value: statsData?.approved_applications_count || "0",
            icon: CheckCircle2,
            color: "text-success"
        },
        {
            label: "Teams",
            value: statsData?.teams_count || "0",
            icon: Users,
            color: "text-accent"
        },
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
            <div className="space-y-8 max-w-7xl mx-auto">
                {/* Welcome Section */}
                <div className="relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-gradient-to-r from-french-blue-600 to-turquoise-surf-500 p-8 rounded-3xl shadow-lg border border-white/10 group">
                    <div className="absolute top-0 right-0 p-12 opacity-10 transform translate-x-1/3 -translate-y-1/3">
                        <Rocket className="w-64 h-64 text-white" />
                    </div>

                    <div className="relative z-10">
                        <h1 className="font-display text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                            Welcome back, {user?.first_name || "Titan"}!
                        </h1>
                        <p className="text-light-cyan-50 mt-2 text-lg max-w-xl">
                            Track your hackathons, manage your host activities, and optimize your profile for better opportunities.
                        </p>
                    </div>
                    <div className="relative z-10 flex gap-3">
                        <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm shadow-none" asChild>
                            <Link href="/events/create">Host an Event</Link>
                        </Button>
                        <Button asChild variant="secondary" className="bg-white text-french-blue-600 hover:bg-light-cyan-50 shadow-soft font-bold">
                            <Link href="/events">
                                Browse Events
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Invites Section - Only if pending invites exist */}
                        {invites.length > 0 && (
                            <Card className="border border-indigo-200/60 shadow-xl bg-white/80 backdrop-blur-2xl overflow-hidden rounded-2xl">
                                <CardHeader className="pb-4 pt-6 px-6 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                                            <Users className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl font-bold text-foreground tracking-tight">Pending Invitations</CardTitle>
                                            <CardDescription className="text-sm text-muted-foreground mt-0.5">You have been invited to co-host events</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-neutral-100">
                                        {invites.map((invite) => (
                                            <div key={invite.id} className="flex items-center justify-between p-5 hover:bg-indigo-50/30 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                                        {invite.event_name?.[0] || 'E'}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-foreground">{invite.event_name}</h4>
                                                        <p className="text-sm text-muted-foreground">Invited by organizer</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-destructive text-destructive hover:bg-destructive/10"
                                                        onClick={() => handleInviteResponse(invite.id, false)}
                                                    >
                                                        Decline
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                                        onClick={() => handleInviteResponse(invite.id, true)}
                                                    >
                                                        Accept
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* My Applications - Premium Redesign */}
                        <Card className="border border-white/60 shadow-xl bg-white/70 backdrop-blur-2xl overflow-hidden rounded-2xl">
                            <CardHeader className="pb-4 pt-6 px-6 bg-gradient-to-br from-french-blue-50/50 via-white to-turquoise-surf-50/30">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-french-blue-500 to-turquoise-surf-500 flex items-center justify-center shadow-lg shadow-french-blue-500/25">
                                                <Target className="h-6 w-6 text-white" />
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-white shadow-sm" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl font-bold text-foreground tracking-tight">My Applications</CardTitle>
                                            <CardDescription className="text-sm text-muted-foreground mt-0.5">Track your hackathon journey</CardDescription>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-french-blue-100 text-french-blue-700 border-0 font-bold px-3 py-1.5 text-sm rounded-full shadow-sm">
                                            {applications.length} Applied
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {applications.length === 0 ? (
                                    <div className="relative py-20 px-8">
                                        {/* Decorative background */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-french-blue-50/30 via-transparent to-turquoise-surf-50/20" />
                                        <div className="absolute top-10 left-10 w-32 h-32 bg-french-blue-100/30 rounded-full blur-3xl" />
                                        <div className="absolute bottom-10 right-10 w-24 h-24 bg-turquoise-surf-100/30 rounded-full blur-3xl" />

                                        <div className="relative flex flex-col items-center text-center max-w-md mx-auto">
                                            <div className="relative mb-8">
                                                <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-french-blue-100 to-turquoise-surf-100 flex items-center justify-center shadow-xl shadow-french-blue-100/50 rotate-3 group-hover:rotate-6 transition-transform">
                                                    <Target className="h-14 w-14 text-french-blue-400" />
                                                </div>
                                                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl border border-neutral-100 shadow-lg flex items-center justify-center rotate-12">
                                                    <Rocket className="h-5 w-5 text-turquoise-surf-500" />
                                                </div>
                                            </div>
                                            <h3 className="text-2xl font-bold text-foreground mb-3">Ready to start hacking?</h3>
                                            <p className="text-muted-foreground mb-8 text-base leading-relaxed">
                                                Discover exciting hackathons and submit your first application to kickstart your journey.
                                            </p>
                                            <Button size="lg" className="rounded-xl px-8 h-12 font-bold shadow-lg shadow-french-blue-500/25 bg-gradient-to-r from-french-blue-500 to-french-blue-600 hover:from-french-blue-600 hover:to-french-blue-700 transition-all hover:scale-105 active:scale-100" asChild>
                                                <Link href="/events">
                                                    <Rocket className="w-5 h-5 mr-2" />
                                                    Find Hackathons
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-neutral-100">
                                        {applications.map((app, idx) => (
                                            <div
                                                key={app.id}
                                                className="flex items-center gap-4 p-5 hover:bg-french-blue-50/30 transition-all cursor-pointer group"
                                                onClick={() => router.push(`/events/${app.event?.slug}`)}
                                                style={{ animationDelay: `${idx * 50}ms` }}
                                            >
                                                <div className="w-14 h-14 rounded-xl bg-white border border-neutral-100 shadow-md flex items-center justify-center shrink-0 overflow-hidden relative group-hover:shadow-lg group-hover:scale-105 transition-all">
                                                    {app.event?.logo ? (
                                                        <Image src={app.event.logo} alt={app.event.name} fill className="object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-french-blue-100 to-turquoise-surf-100 flex items-center justify-center text-french-blue-600 font-bold text-lg">
                                                            {app.event?.name?.[0] || 'H'}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-foreground truncate text-base group-hover:text-french-blue-600 transition-colors">
                                                        {app.event?.name}
                                                    </h4>
                                                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        Applied {getRelativeTime(app.applied_at)}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Badge className={`font-semibold capitalize px-3 py-1 rounded-full text-xs ${app.status === 'approved' ? 'bg-success/15 text-success border-0' :
                                                        app.status === 'rejected' ? 'bg-destructive/15 text-destructive border-0' :
                                                            'bg-warning/15 text-warning border-0'
                                                        }`}>
                                                        {app.status}
                                                    </Badge>
                                                    <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center group-hover:bg-french-blue-500 transition-colors">
                                                        <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Organizer Hub - Premium Redesign */}
                        <Card className="border border-white/60 shadow-xl bg-white/70 backdrop-blur-2xl overflow-hidden rounded-2xl">
                            <CardHeader className="pb-4 pt-6 px-6 bg-gradient-to-br from-deep-twilight-50/30 via-white to-french-blue-50/30">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-deep-twilight-500 to-french-blue-600 flex items-center justify-center shadow-lg shadow-deep-twilight-500/25">
                                                <Rocket className="h-6 w-6 text-white" />
                                            </div>
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl font-bold text-foreground tracking-tight">Organizer Hub</CardTitle>
                                            <CardDescription className="text-sm text-muted-foreground mt-0.5">Manage your events</CardDescription>
                                        </div>
                                    </div>
                                    <Badge className="bg-deep-twilight-100 text-deep-twilight-700 border-0 font-bold px-3 py-1.5 text-sm rounded-full shadow-sm">
                                        {organizedEvents.length} Events
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {organizedEvents.length === 0 ? (
                                    <div className="relative py-20 px-8">
                                        {/* Decorative background */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-deep-twilight-50/20 via-transparent to-french-blue-50/20" />
                                        <div className="absolute top-10 right-16 w-40 h-40 bg-deep-twilight-100/20 rounded-full blur-3xl" />

                                        <div className="relative flex flex-col items-center text-center max-w-md mx-auto">
                                            <div className="relative mb-8">
                                                <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-deep-twilight-100 to-french-blue-100 flex items-center justify-center shadow-xl shadow-deep-twilight-100/50 -rotate-3">
                                                    <Rocket className="h-14 w-14 text-deep-twilight-400" />
                                                </div>
                                                <div className="absolute -top-3 -right-3 w-12 h-12 bg-white rounded-2xl border border-neutral-100 shadow-lg flex items-center justify-center rotate-12">
                                                    <Star className="h-6 w-6 text-warning fill-warning" />
                                                </div>
                                            </div>
                                            <h3 className="text-2xl font-bold text-foreground mb-3">No organized events</h3>
                                            <p className="text-muted-foreground mb-8 text-base leading-relaxed">
                                                Launch your first hackathon and build an amazing community of developers!
                                            </p>
                                            <Button size="lg" variant="outline" className="rounded-xl px-8 h-12 font-bold border-2 border-deep-twilight-200 text-deep-twilight-600 hover:bg-deep-twilight-50 hover:border-deep-twilight-300 transition-all hover:scale-105 active:scale-100" asChild>
                                                <Link href="/events/create">
                                                    <Rocket className="w-5 h-5 mr-2" />
                                                    Host Your First Hackathon
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-neutral-100">
                                        {organizedEvents.map((event, idx) => (
                                            <div
                                                key={event.id}
                                                className="flex items-center gap-4 p-5 hover:bg-deep-twilight-50/30 transition-all group"
                                            >
                                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-deep-twilight-100 to-french-blue-100 flex items-center justify-center shrink-0 border border-deep-twilight-100/50 shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all overflow-hidden">
                                                    {event.logo ? (
                                                        <Image src={event.logo} alt={event.name} width={56} height={56} className="rounded-xl object-cover" />
                                                    ) : (
                                                        <Rocket className="h-7 w-7 text-deep-twilight-500" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-foreground truncate text-base group-hover:text-deep-twilight-600 transition-colors">
                                                        {event.name}
                                                    </h4>
                                                    <div className="flex items-center gap-3 mt-1.5">
                                                        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-neutral-100 px-2.5 py-1 rounded-full">
                                                            <Users className="w-3.5 h-3.5" />
                                                            {event.participants_count || 0}
                                                        </span>
                                                        <span className="flex items-center gap-1.5 text-xs font-semibold capitalize">
                                                            <div className={`w-2 h-2 rounded-full ${event.status === 'open' ? 'bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-neutral-300'}`} />
                                                            <span className={event.status === 'open' ? 'text-success' : 'text-muted-foreground'}>{event.status}</span>
                                                        </span>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="sm" asChild className="shrink-0 rounded-xl hover:bg-deep-twilight-100 hover:text-deep-twilight-700 font-semibold">
                                                    <Link href={`/events/${event.slug}/manage`} className="gap-2">
                                                        Manage
                                                        <ArrowRight className="w-4 h-4" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                    </div>

                    {/* Sidebar Area */}
                    <div className="space-y-6">
                        {/* Premium Stats Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {stats.map((stat, index) => {
                                const colorClasses = {
                                    'Events Organized': {
                                        bg: 'bg-gradient-to-br from-french-blue-500 to-french-blue-600',
                                        iconBg: 'bg-white/20',
                                        text: 'text-white',
                                        shadow: 'shadow-french-blue-500/30'
                                    },
                                    'Pending Apps': {
                                        bg: 'bg-gradient-to-br from-warning to-orange-500',
                                        iconBg: 'bg-white/20',
                                        text: 'text-white',
                                        shadow: 'shadow-warning/30'
                                    },
                                    'Approved': {
                                        bg: 'bg-gradient-to-br from-success to-emerald-600',
                                        iconBg: 'bg-white/20',
                                        text: 'text-white',
                                        shadow: 'shadow-success/30'
                                    },
                                    'Teams': {
                                        bg: 'bg-gradient-to-br from-turquoise-surf-500 to-blue-green-500',
                                        iconBg: 'bg-white/20',
                                        text: 'text-white',
                                        shadow: 'shadow-turquoise-surf-500/30'
                                    }
                                };
                                const colors = colorClasses[stat.label] || colorClasses['Teams'];

                                return (
                                    <div
                                        key={stat.label}
                                        className={`relative overflow-hidden rounded-2xl ${colors.bg} p-5 shadow-xl ${colors.shadow} hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-default group`}
                                    >
                                        {/* Decorative circle */}
                                        <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />

                                        <div className={`w-10 h-10 rounded-xl ${colors.iconBg} backdrop-blur-sm flex items-center justify-center mb-4`}>
                                            <stat.icon className={`h-5 w-5 ${colors.text}`} />
                                        </div>
                                        <div className="relative">
                                            <p className={`text-3xl font-black ${colors.text} tracking-tight`}>{stat.value}</p>
                                            <p className={`text-xs uppercase tracking-wider font-bold ${colors.text} opacity-80 mt-1`}>{stat.label}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Profile Completion - Only show if not 100% */}
                        {(() => {
                            const profileStrength = profileData
                                ? calculateProfileStrength(user, profileData)
                                : 0;

                            const nextAction = profileData
                                ? getNextRequiredAction(user, profileData)
                                : { label: "complete your profile", step: 1 };

                            if (profileStrength >= 100 || !nextAction) return null;

                            return (
                                <Card className="border-none shadow-elevated bg-gradient-primary text-white overflow-hidden relative group hover:shadow-xl transition-all rounded-2xl">
                                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Star className="w-32 h-32 transform rotate-12 translate-x-10 -translate-y-6" />
                                    </div>
                                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <CardHeader className="pb-2 relative z-10">
                                        <CardTitle className="text-lg flex items-center gap-2 font-display">
                                            <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                                                <Star className="h-4 w-4 text-light-cyan-100" />
                                            </div>
                                            Profile Strength
                                        </CardTitle>
                                        <CardDescription className="text-light-cyan-50 font-medium border-l-2 border-sky-aqua-300/50 pl-2 mt-2">
                                            Next: {nextAction.label}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="relative z-10">
                                        <div className="space-y-5">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-sm font-bold text-white/90">
                                                    <span>Strength</span>
                                                    <span>{profileStrength}%</span>
                                                </div>
                                                <Progress
                                                    value={profileStrength}
                                                    className="h-2.5 bg-black/20"
                                                    indicatorClassName="bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                                                />
                                            </div>
                                            <Button variant="secondary" size="sm" className="w-full font-bold shadow-soft bg-white text-primary hover:bg-light-cyan-50 border-none rounded-xl" asChild>
                                                <Link href={`/complete-profile?step=${nextAction.step}`}>
                                                    Optimize Profile
                                                    <ArrowRight className="w-4 h-4 ml-2" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })()}

                        {/* Discover Section - Premium Redesign */}
                        <Card className="border border-white/60 shadow-xl bg-white/70 backdrop-blur-2xl overflow-hidden rounded-2xl">
                            <CardHeader className="pb-3 pt-5 px-5 bg-gradient-to-r from-turquoise-surf-50/30 to-transparent">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-turquoise-surf-500 to-blue-green-500 flex items-center justify-center shadow-lg shadow-turquoise-surf-500/25">
                                            <Trophy className="h-4.5 w-4.5 text-white" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                                                Discover New
                                                <span className="relative flex h-2 w-2">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-turquoise-surf-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-turquoise-surf-500"></span>
                                                </span>
                                            </CardTitle>
                                            <CardDescription className="text-xs mt-0.5">Recommended for you</CardDescription>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-3 pt-0">
                                <div className="space-y-2">
                                    {events.slice(0, 3).map((event, idx) => (
                                        <Link
                                            href={`/events/${event.slug}`}
                                            key={event.id}
                                            className="flex items-center gap-3 group p-3 rounded-xl bg-white/50 hover:bg-turquoise-surf-50/50 transition-all border border-transparent hover:border-turquoise-surf-100 hover:shadow-md"
                                        >
                                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-neutral-50 to-neutral-100 flex-shrink-0 overflow-hidden relative border border-neutral-100 shadow-sm group-hover:shadow-lg group-hover:scale-105 transition-all">
                                                {event.logo ? (
                                                    <Image src={event.logo} alt={event.name} fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-turquoise-surf-100 to-blue-green-100">
                                                        <span className="text-sm font-bold text-turquoise-surf-600">{event.name?.[0]}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold truncate group-hover:text-turquoise-surf-600 transition-colors text-foreground">{event.name}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="secondary" className="text-[10px] px-2 py-0.5 bg-neutral-100 text-muted-foreground capitalize font-medium rounded-md">
                                                        {event.mode}
                                                    </Badge>
                                                    <span className="text-xs font-bold text-turquoise-surf-600">
                                                        {event.prize_pool ? `₹${event.prize_pool}` : "Goodies"}
                                                    </span>
                                                </div>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-turquoise-surf-500 transition-colors shrink-0" />
                                        </Link>
                                    ))}
                                </div>
                                <Button variant="ghost" size="sm" className="w-full mt-3 text-xs font-bold text-turquoise-surf-600 hover:bg-turquoise-surf-50 h-10 rounded-xl" asChild>
                                    <Link href="/events">
                                        Explore all hackathons
                                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
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
