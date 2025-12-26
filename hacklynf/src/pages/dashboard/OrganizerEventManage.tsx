import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Settings,
    CheckCircle2,
    XCircle,
    Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { eventsAPI } from "@/lib/api";

const OrganizerEventManage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState<any>(null);
    const [applications, setApplications] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState("overview");
    const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [reviewReason, setReviewReason] = useState("");

    useEffect(() => {
        if (id) {
            loadEventData(id);
        }
    }, [id]);

    const loadEventData = async (eventId: string) => {
        try {
            setLoading(true);
            // Load event details
            const eventData = await eventsAPI.get(eventId);
            setEvent(eventData);

            // Load applications
            const appsData = await eventsAPI.getApplications(eventId);
            setApplications(Array.isArray(appsData) ? appsData : (appsData.results || []));
        } catch (error) {
            console.error("Failed to load event data", error);
            toast.error("Failed to load event details");
            navigate("/dashboard/organizer");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (appId: number, status: 'approve' | 'reject' | 'waitlist') => {
        if (!event) return;

        try {
            await eventsAPI.reviewApplication(event.id, appId, status, reviewReason);

            toast.success(`Application ${status}d successfully.`);

            // Update local state
            setApplications(prev => prev.map(app =>
                app.id === appId ? { ...app, status: status === 'approve' ? 'approved' : status === 'reject' ? 'rejected' : 'waitlisted' } : app
            ));

            setSelectedApplicant(null);
            setReviewReason("");
        } catch (error) {
            console.error("Review failed", error);
            toast.error("Failed to update application status");
        }
    };

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString();
        } catch { return dateStr; }
    };

    if (loading) return (
        <DashboardLayout>
            <div className="flex items-center justify-center h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        </DashboardLayout>
    );

    if (!event) return null;

    const approvedCount = applications.filter(a => a.status === 'approved').length;
    const pendingCount = applications.filter(a => a.status === 'pending').length;

    return (
        <DashboardLayout>
            <div className="space-y-6 pb-12 animate-fade-in">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/organizer")}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold font-display">{event.name}</h1>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant={event.status === 'approved' ? 'success' : 'secondary'}>{event.status}</Badge>
                            <span>•</span>
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(event.start_date)}</span>
                        </div>
                    </div>
                    <div className="ml-auto flex gap-2">
                        <Button variant="outline">
                            <Settings className="w-4 h-4 mr-2" /> Settings
                        </Button>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="applications">Applications ({applications.length})</TabsTrigger>
                        <TabsTrigger value="edit">Edit Details</TabsTrigger>
                    </TabsList>

                    {/* OVERVIEW TAB */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Applicants</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{applications.length}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-emerald-600">
                                        {approvedCount}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-amber-500">
                                        {pendingCount}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* APPLICATIONS TAB */}
                    <TabsContent value="applications">
                        <Card>
                            <CardHeader>
                                <CardTitle>Manage Applications</CardTitle>
                                <CardDescription>Review and manage participant applications.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Applicant</TableHead>
                                            <TableHead>Team</TableHead>
                                            <TableHead>Applied At</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {applications.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                    No applications received yet.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            applications.map((app) => (
                                                <TableRow key={app.id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-9 w-9">
                                                                <AvatarFallback>{app.user.first_name?.[0] || app.user.username[0]}</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="font-medium text-sm">
                                                                    {app.user.first_name} {app.user.last_name}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">@{app.user.username}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {app.team_name || <span className="text-muted-foreground text-xs font-style-italic">Individual</span>}
                                                    </TableCell>
                                                    <TableCell>{formatDate(app.applied_at)}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={
                                                            app.status === 'approved' ? 'success' :
                                                                app.status === 'rejected' ? 'destructive' : 'warning'
                                                        } className="capitalize">
                                                            {app.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button variant="ghost" size="sm" onClick={() => {
                                                                    setSelectedApplicant(app);
                                                                    setReviewReason(app.rejection_reason || "");
                                                                }}>
                                                                    Review
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent className="max-w-xl">
                                                                <DialogHeader>
                                                                    <DialogTitle>Application Review</DialogTitle>
                                                                    <DialogDescription>
                                                                        Applicant: {app.user.first_name} {app.user.last_name} (@{app.user.username})
                                                                    </DialogDescription>
                                                                </DialogHeader>

                                                                <div className="space-y-4 py-4">
                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div>
                                                                            <Label className="text-xs text-muted-foreground">Team Name</Label>
                                                                            <p className="font-medium">{app.team_name || "N/A"}</p>
                                                                        </div>
                                                                        <div>
                                                                            <Label className="text-xs text-muted-foreground">Role</Label>
                                                                            <p className="font-medium">{app.role || "N/A"}</p>
                                                                        </div>
                                                                        <div className="col-span-2">
                                                                            <Label className="text-xs text-muted-foreground">Motivation</Label>
                                                                            <p className="text-sm mt-1 p-2 bg-secondary/20 rounded-md">
                                                                                {app.motivation || "No motivation provided."}
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    <div className="space-y-2">
                                                                        <Label htmlFor="reason">Reason (for rejection/waitlist)</Label>
                                                                        <Textarea
                                                                            id="reason"
                                                                            placeholder="Optional reason or feedback..."
                                                                            value={reviewReason}
                                                                            onChange={(e) => setReviewReason(e.target.value)}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <DialogFooter className="gap-2 sm:gap-0">
                                                                    <Button
                                                                        variant="destructive"
                                                                        onClick={() => handleStatusChange(app.id, 'reject')}
                                                                        disabled={app.status === 'rejected'}
                                                                    >
                                                                        <XCircle className="w-4 h-4 mr-2" /> Reject
                                                                    </Button>
                                                                    <Button
                                                                        variant="default"
                                                                        className="bg-emerald-600 hover:bg-emerald-700"
                                                                        onClick={() => handleStatusChange(app.id, 'approve')}
                                                                        disabled={app.status === 'approved'}
                                                                    >
                                                                        <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                                                                    </Button>
                                                                </DialogFooter>
                                                            </DialogContent>
                                                        </Dialog>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* EDIT TAB (Simplified) */}
                    <TabsContent value="edit">
                        <Card>
                            <CardHeader>
                                <CardTitle>Edit Event</CardTitle>
                                <CardDescription>Update basic information.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Event Name</Label>
                                    <Input defaultValue={event?.name} disabled />
                                </div>
                                <p className="text-sm text-muted-foreground">Full editing functionality coming soon.</p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                </Tabs>
            </div>
        </DashboardLayout>
    );
};

export default OrganizerEventManage;
