"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
    Users,
    UserPlus,
    Trash2,
    Check,
    X,
    Loader2,
    Mail,
    Shield,
    Edit3,
    Clock,
    Crown
} from "lucide-react";
import { cohostsAPI } from "@/lib/api";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function CoOrganizerManager({ eventSlug, isMainOrganizer = false }) {
    const [cohosts, setCohosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [inviting, setInviting] = useState(false);
    const [identifier, setIdentifier] = useState("");
    const [permissions, setPermissions] = useState({
        canReviewApplications: true,
        canEditEvent: false,
    });
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        fetchCohosts();
    }, [eventSlug]);

    const fetchCohosts = async () => {
        try {
            const data = await cohostsAPI.list(eventSlug);
            // Handle paginated response
            const cohostsList = Array.isArray(data) ? data : (data?.results || []);
            setCohosts(cohostsList);
        } catch (error) {
            console.error("Failed to fetch co-hosts:", error);
            toast.error("Failed to load co-organizers");
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        if (!identifier.trim()) {
            toast.error("Please enter a username or email");
            return;
        }

        setInviting(true);
        try {
            await cohostsAPI.invite(eventSlug, identifier.trim(), permissions);
            toast.success("Invitation sent successfully");
            setIdentifier("");
            fetchCohosts();
        } catch (error) {
            console.error("Failed to invite co-host:", error);
            toast.error(error.response?.data?.error || "Failed to send invitation");
        } finally {
            setInviting(false);
        }
    };

    const handleUpdatePermissions = async (cohostId, newPermissions) => {
        setUpdatingId(cohostId);
        try {
            await cohostsAPI.updatePermissions(eventSlug, cohostId, newPermissions);
            toast.success("Permissions updated");
            fetchCohosts();
        } catch (error) {
            console.error("Failed to update permissions:", error);
            toast.error("Failed to update permissions");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleRemove = async (cohostId) => {
        try {
            await cohostsAPI.remove(eventSlug, cohostId);
            toast.success("Co-organizer removed");
            fetchCohosts();
        } catch (error) {
            console.error("Failed to remove co-host:", error);
            toast.error("Failed to remove co-organizer");
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "accepted":
                return <Badge variant="success" className="bg-green-100 text-green-800">Active</Badge>;
            case "pending":
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
            case "rejected":
                return <Badge variant="destructive">Declined</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with count */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span className="font-medium">
                        Co-Organizers ({cohosts.filter(c => c.status === "accepted").length})
                    </span>
                </div>
            </div>

            {/* Invite Form - Only shown to main organizer */}
            {isMainOrganizer && (
                <form onSubmit={handleInvite} className="bg-slate-50 rounded-lg p-4 space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <UserPlus className="h-4 w-4" />
                        Invite Co-Organizer
                    </div>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Username or email"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            className="flex-1 bg-white"
                        />
                        <Button type="submit" disabled={inviting || !identifier.trim()}>
                            {inviting ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Mail className="h-4 w-4 mr-2" />
                            )}
                            Invite
                        </Button>
                    </div>

                    {/* Permission toggles for new invite */}
                    <div className="flex flex-wrap gap-4 text-sm">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <Switch
                                checked={permissions.canReviewApplications}
                                onCheckedChange={(checked) =>
                                    setPermissions(p => ({ ...p, canReviewApplications: checked }))
                                }
                            />
                            <Shield className="h-4 w-4 text-muted-foreground" />
                            <span>Can review applications</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <Switch
                                checked={permissions.canEditEvent}
                                onCheckedChange={(checked) =>
                                    setPermissions(p => ({ ...p, canEditEvent: checked }))
                                }
                            />
                            <Edit3 className="h-4 w-4 text-muted-foreground" />
                            <span>Can edit event</span>
                        </label>
                    </div>
                </form>
            )}

            {/* Co-Organizer List */}
            <div className="space-y-3">
                {cohosts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No co-organizers yet</p>
                        {isMainOrganizer && (
                            <p className="text-sm mt-1">Invite team members to help manage this event</p>
                        )}
                    </div>
                ) : (
                    cohosts.map((cohost) => (
                        <div
                            key={cohost.id}
                            className="flex items-center justify-between p-4 bg-white rounded-lg border hover:border-primary/30 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                                    {cohost.user?.username?.[0]?.toUpperCase() || "?"}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">
                                            {cohost.user?.display_name || cohost.user?.username}
                                        </span>
                                        {getStatusBadge(cohost.status)}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                        <span>@{cohost.user?.username}</span>
                                        {cohost.status === "pending" && (
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                Invited {new Date(cohost.invited_at).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Actions - only if accepted and main organizer */}
                            {cohost.status === "accepted" && isMainOrganizer && (
                                <div className="flex items-center gap-4">
                                    {/* Permission toggles */}
                                    <div className="flex gap-3 text-sm">
                                        <label
                                            className="flex items-center gap-2 cursor-pointer"
                                            title="Can review applications"
                                        >
                                            <Switch
                                                checked={cohost.can_review_applications}
                                                onCheckedChange={(checked) =>
                                                    handleUpdatePermissions(cohost.id, {
                                                        canReviewApplications: checked,
                                                    })
                                                }
                                                disabled={updatingId === cohost.id}
                                            />
                                            <Shield className="h-4 w-4 text-muted-foreground" />
                                        </label>
                                        <label
                                            className="flex items-center gap-2 cursor-pointer"
                                            title="Can edit event"
                                        >
                                            <Switch
                                                checked={cohost.can_edit_event}
                                                onCheckedChange={(checked) =>
                                                    handleUpdatePermissions(cohost.id, {
                                                        canEditEvent: checked,
                                                    })
                                                }
                                                disabled={updatingId === cohost.id}
                                            />
                                            <Edit3 className="h-4 w-4 text-muted-foreground" />
                                        </label>
                                    </div>

                                    {/* Remove button */}
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Remove Co-Organizer?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will remove {cohost.user?.display_name || cohost.user?.username} from the co-organizer team. They will lose access to manage this event.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleRemove(cohost.id)}
                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                >
                                                    Remove
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            )}

                            {/* Pending status - show cancel for organizer */}
                            {cohost.status === "pending" && isMainOrganizer && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="sm" className="text-muted-foreground">
                                            Cancel Invite
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Cancel Invitation?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will cancel the pending invitation sent to {cohost.user?.display_name || cohost.user?.username}.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Keep</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleRemove(cohost.id)}>
                                                Cancel Invite
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Permission legend */}
            {isMainOrganizer && cohosts.some(c => c.status === "accepted") && (
                <div className="text-xs text-muted-foreground bg-slate-50 rounded-lg p-3 flex flex-wrap gap-4">
                    <span className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        Review: Approve/reject applications & teams
                    </span>
                    <span className="flex items-center gap-1">
                        <Edit3 className="h-3 w-3" />
                        Edit: Modify event details
                    </span>
                </div>
            )}
        </div>
    );
}
