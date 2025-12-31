"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Users,
    Calendar,
    Shield,
    AlertTriangle,
    CheckCircle2,
    Clock,
    MoreHorizontal,
    Eye,
    Trash2,
    Ban
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authAPI, adminAPI } from "@/lib/api";
import { toast } from "sonner";

export default function AdminDashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalEvents: 0,
        pendingEvents: 0,
        activeEvents: 0,
    });
    const [pendingEvents, setPendingEvents] = useState([]);
    const [recentUsers, setRecentUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            if (!authAPI.isAuthenticated()) {
                router.push("/auth");
                return;
            }

            const userData = authAPI.getUser();
            if (!userData?.is_staff) {
                router.push("/dashboard");
                toast.error("Unauthorized access");
                return;
            }

            setUser(userData);

            try {
                // Fetch admin stats
                const [statsRes, eventsRes, usersRes] = await Promise.all([
                    adminAPI.getStats?.() || Promise.resolve({ ok: true, data: {} }),
                    adminAPI.getPendingEvents?.() || Promise.resolve({ ok: true, data: [] }),
                    adminAPI.getRecentUsers?.() || Promise.resolve({ ok: true, data: [] }),
                ]);

                if (statsRes.ok) {
                    setStats(statsRes.data);
                }
                if (eventsRes.ok) {
                    setPendingEvents(eventsRes.data);
                }
                if (usersRes.ok) {
                    setRecentUsers(usersRes.data);
                }
            } catch (error) {
                console.error("Failed to fetch admin data:", error);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    const handleApproveEvent = async (eventId) => {
        try {
            const { ok } = await adminAPI.approveEvent?.(eventId) || { ok: false };
            if (ok) {
                toast.success("Event approved successfully");
                setPendingEvents((prev) => prev.filter((e) => e.id !== eventId));
            }
        } catch (error) {
            toast.error("Failed to approve event");
        }
    };

    const handleRejectEvent = async (eventId) => {
        try {
            const { ok } = await adminAPI.rejectEvent?.(eventId) || { ok: false };
            if (ok) {
                toast.success("Event rejected");
                setPendingEvents((prev) => prev.filter((e) => e.id !== eventId));
            }
        } catch (error) {
            toast.error("Failed to reject event");
        }
    };

    const statCards = [
        { label: "Total Users", value: stats.totalUsers || "150+", icon: Users, color: "text-primary" },
        { label: "Total Events", value: stats.totalEvents || "25", icon: Calendar, color: "text-success" },
        { label: "Pending Approval", value: stats.pendingEvents || "3", icon: Clock, color: "text-warning" },
        { label: "Active Events", value: stats.activeEvents || "8", icon: CheckCircle2, color: "text-bright-sky-600" },
    ];

    if (loading) {
        return (
            <DashboardLayout role="admin">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="admin">
            <div className="space-y-8">
                {/* Header */}
                <div>
                    <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-2">
                        <Shield className="h-8 w-8 text-primary" />
                        Admin Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage platform users, events, and system settings.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((stat) => (
                        <Card key={stat.label} className="shadow-soft hover:shadow-prominent transition-shadow duration-300">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl bg-neutral-100 ${stat.color}`}>
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

                {/* Main Content */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Pending Events */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-warning" />
                                    Pending Approvals
                                </CardTitle>
                                <Badge variant="warning">{pendingEvents.length || 3}</Badge>
                            </div>
                            <CardDescription>Events awaiting your review</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {(pendingEvents.length > 0 ? pendingEvents : [
                                    { id: 1, name: "AI Innovation Challenge", organizer: "Tech Club", date: "2024-02-15" },
                                    { id: 2, name: "Web Dev Workshop", organizer: "CS Society", date: "2024-02-20" },
                                    { id: 3, name: "Mobile App Hackathon", organizer: "App Dev Club", date: "2024-03-01" },
                                ]).map((event) => (
                                    <div
                                        key={event.id}
                                        className="flex items-center justify-between p-4 rounded-lg border"
                                    >
                                        <div>
                                            <h4 className="font-medium text-foreground">{event.name}</h4>
                                            <p className="text-sm text-muted-foreground">
                                                by {event.organizer || event.organizer_name} • {new Date(event.date || event.start_date).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleRejectEvent(event.id)}
                                            >
                                                <Ban className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => handleApproveEvent(event.id)}
                                            >
                                                <CheckCircle2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Users */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary" />
                                Recent Users
                            </CardTitle>
                            <CardDescription>Newly registered users</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Joined</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(recentUsers.length > 0 ? recentUsers : [
                                        { id: 1, name: "John Doe", email: "john@example.com", role: "student", joined: "2024-01-15" },
                                        { id: 2, name: "Jane Smith", email: "jane@example.com", role: "organizer", joined: "2024-01-14" },
                                        { id: 3, name: "Mike Johnson", email: "mike@example.com", role: "judge", joined: "2024-01-13" },
                                    ]).map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{user.name || `${user.first_name} ${user.last_name}`}</p>
                                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={user.role}>{user.role}</Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {new Date(user.joined || user.date_joined).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View Profile
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-destructive">
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete User
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
