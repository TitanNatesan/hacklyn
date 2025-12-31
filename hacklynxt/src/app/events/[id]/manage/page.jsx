"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    Users,
    Settings,
    CheckCircle2,
    XCircle,
    Clock,
    BarChart3,
    ArrowLeft,
    Loader2,
    Mail,
    ExternalLink
} from "lucide-react";
import { eventsAPI } from "@/lib/api";
import { toast } from "sonner";
import Image from "next/image";

export default function ManageEventPage() {
    const params = useParams();
    const router = useRouter();
    const [event, setEvent] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [eventData, appsData] = await Promise.all([
                    eventsAPI.get(params.id),
                    eventsAPI.getApplications(params.id)
                ]);

                setEvent(eventData);
                const apps = appsData.results || appsData || [];
                setApplications(apps);

                // Calculate stats
                setStats({
                    total: apps.length,
                    pending: apps.filter(a => a.status === 'pending').length,
                    approved: apps.filter(a => a.status === 'approved').length,
                    rejected: apps.filter(a => a.status === 'rejected').length
                });
            } catch (error) {
                console.error("Failed to fetch event data:", error);
                toast.error("Failed to load management dashboard");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [params.id]);

    const handleReview = async (appId, action) => {
        try {
            await eventsAPI.reviewApplication(params.id, appId, action);
            toast.success(`Application ${action}ed`);

            // Update local state
            setApplications(apps => apps.map(a =>
                a.id === appId ? { ...a, status: action === 'approve' ? 'approved' : 'rejected' } : a
            ));

            // Recalculate stats
            setStats(prev => ({
                ...prev,
                pending: prev.pending - 1,
                [action === 'approve' ? 'approved' : 'rejected']: prev[action === 'approve' ? 'approved' : 'rejected'] + 1
            }));
        } catch (error) {
            toast.error("Failed to review application");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-neutral-50">
            <Header />

            <main className="flex-1 pt-24 pb-12">
                <div className="container mx-auto px-4">
                    {/* Header */}
                    <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" onClick={() => router.back()}>
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold font-display">{event?.name}</h1>
                                <p className="text-muted-foreground">Organizer Dashboard</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => router.push(`/events/${params.id}`)}>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                View Public Page
                            </Button>
                            <Button onClick={() => router.push(`/events/${params.id}/edit`)}>
                                <Settings className="w-4 h-4 mr-2" />
                                Edit Event
                            </Button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <Card>
                            <CardContent className="p-6">
                                <p className="text-sm text-muted-foreground mb-1">Total Applicants</p>
                                <p className="text-3xl font-bold">{stats.total}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <p className="text-sm text-muted-foreground mb-1">Pending</p>
                                <p className="text-3xl font-bold text-warning">{stats.pending}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <p className="text-sm text-muted-foreground mb-1">Approved</p>
                                <p className="text-3xl font-bold text-success">{stats.approved}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <p className="text-sm text-muted-foreground mb-1">Rejected</p>
                                <p className="text-3xl font-bold text-destructive">{stats.rejected}</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs defaultValue="applicants" className="space-y-6">
                        <TabsList className="bg-white border p-1 h-12">
                            <TabsTrigger value="applicants" className="px-6 gap-2">
                                <Users className="w-4 h-4" />
                                Applicants
                            </TabsTrigger>
                            <TabsTrigger value="analytics" className="px-6 gap-2">
                                <BarChart3 className="w-4 h-4" />
                                Analytics
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="applicants">
                            <Card className="border-none shadow-sm overflow-hidden">
                                <div className="divide-y">
                                    {applications.length === 0 ? (
                                        <div className="p-12 text-center text-muted-foreground">
                                            <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                            <p>No applications yet</p>
                                        </div>
                                    ) : (
                                        applications.map((app) => (
                                            <div key={app.id} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white hover:bg-neutral-50 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                                                        {app.user?.avatar ? (
                                                            <Image src={app.user.avatar} alt={app.user.username} width={48} height={48} className="object-cover" />
                                                        ) : (
                                                            <span className="text-lg font-bold text-primary">{app.user?.username?.[0]?.toUpperCase()}</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-lg">{app.user?.first_name} {app.user?.last_name || `@${app.user?.username}`}</h3>
                                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                            <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {app.user?.email}</span>
                                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(app.applied_at).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 w-full md:w-auto">
                                                    <Badge className={
                                                        app.status === 'approved' ? 'bg-success/10 text-success' :
                                                            app.status === 'rejected' ? 'bg-destructive/10 text-destructive' :
                                                                'bg-warning/10 text-warning'
                                                    }>
                                                        {app.status.toUpperCase()}
                                                    </Badge>

                                                    {app.status === 'pending' && (
                                                        <div className="flex gap-2 ml-auto md:ml-0">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-destructive border-destructive/20 hover:bg-destructive/5"
                                                                onClick={() => handleReview(app.id, 'reject')}
                                                            >
                                                                <XCircle className="w-4 h-4 mr-1" />
                                                                Reject
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                className="bg-success hover:bg-success/90"
                                                                onClick={() => handleReview(app.id, 'approve')}
                                                            >
                                                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                                                Approve
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </Card>
                        </TabsContent>

                        <TabsContent value="analytics">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Registration Trends</CardTitle>
                                    <CardDescription>Visualizing your event's growth</CardDescription>
                                </CardHeader>
                                <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
                                    <div className="text-center">
                                        <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                        <p>Analytics visualization coming soon</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>

            <Footer />
        </div>
    );
}
