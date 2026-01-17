"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { cohostsAPI } from "@/lib/api";
import {
    UserPlus,
    CheckCircle2,
    XCircle,
    Loader2,
    Mail,
    Trash2,
    Users,
    Shield,
    Edit,
    Eye
} from "lucide-react";
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

export function CoHostManager({ eventSlug, isMainOrganizer = true }) {
    const [cohosts, setCohosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [inviting, setInviting] = useState(false);
    const [identifier, setIdentifier] = useState("");
    const [canReviewApplications, setCanReviewApplications] = useState(true);
    const [canEditEvent, setCanEditEvent] = useState(false);
    const [removingId, setRemovingId] = useState(null);

    useEffect(() => {
        loadCohosts();
    }, [eventSlug]);

    const loadCohosts = async () => {
        try {
            setLoading(true);
            const data = await cohostsAPI.list(eventSlug);
            setCohosts(data);
        } catch (error) {
            console.error("Failed to load co-hosts:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async () => {
        if (!identifier.trim()) {
            toast.error("Please enter a username or email");
            return;
        }

        try {
            setInviting(true);
            await cohostsAPI.invite(eventSlug, identifier, {
                canReviewApplications,
                canEditEvent,
            });
            toast.success("Co-host invitation sent!");
            setIdentifier("");
            setCanReviewApplications(true);
            setCanEditEvent(false);
            loadCohosts();
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to invite co-host");
        } finally {
            setInviting(false);
        }
    };

    const handleUpdatePermission = async (cohostId, permission, value) => {
        try {
            await cohostsAPI.updatePermissions(eventSlug, cohostId, {
                [permission]: value,
            });
            setCohosts(prev => prev.map(c =>
                c.id === cohostId
                    ? { ...c, [permission === 'canReviewApplications' ? 'can_review_applications' : 'can_edit_event']: value }
                    : c
            ));
            toast.success("Permission updated");
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to update permission");
        }
    };

    const handleRemoveCohost = async (cohostId) => {
        try {
            setRemovingId(cohostId);
            await cohostsAPI.remove(eventSlug, cohostId);
            setCohosts(prev => prev.filter(c => c.id !== cohostId));
            toast.success("Co-host removed");
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to remove co-host");
        } finally {
            setRemovingId(null);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "accepted":
                return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Accepted</Badge>;
            case "pending":
                return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Pending</Badge>;
            case "rejected":
                return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Rejected</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Co-Host Management
                </CardTitle>
                <CardDescription>
                    Invite collaborators to help manage this event. Co-hosts can be given specific permissions.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Invite Form - Only visible to main organizer */}
                {isMainOrganizer && (
                    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <Label className="sr-only">Username or Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        className="pl-9"
                                        placeholder="Enter username or email address"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                                    />
                                </div>
                            </div>
                            <Button onClick={handleInvite} disabled={inviting || !identifier.trim()}>
                                {inviting ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                    <UserPlus className="w-4 h-4 mr-2" />
                                )}
                                Invite
                            </Button>
                        </div>

                        {/* Permission checkboxes */}
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="review-permission"
                                    checked={canReviewApplications}
                                    onCheckedChange={setCanReviewApplications}
                                />
                                <Label htmlFor="review-permission" className="text-sm flex items-center gap-1">
                                    <Eye className="w-3.5 h-3.5" />
                                    Can Review Applications
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="edit-permission"
                                    checked={canEditEvent}
                                    onCheckedChange={setCanEditEvent}
                                />
                                <Label htmlFor="edit-permission" className="text-sm flex items-center gap-1">
                                    <Edit className="w-3.5 h-3.5" />
                                    Can Edit Event
                                </Label>
                            </div>
                        </div>
                    </div>
                )}

                {/* Co-hosts List */}
                <div className="space-y-3">
                    <Label className="text-sm font-medium">Current Co-hosts</Label>

                    {cohosts.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
                            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No co-hosts yet. Invite someone to collaborate!</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {cohosts.map((cohost) => (
                                <div
                                    key={cohost.id}
                                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={cohost.user?.avatar || cohost.user?.profile_picture} />
                                            <AvatarFallback>
                                                {cohost.user?.username?.[0]?.toUpperCase() || "?"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-sm">
                                                {cohost.user?.display_name || cohost.user?.username}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {cohost.user?.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {/* Permission badges */}
                                        {cohost.status === "accepted" && (
                                            <div className="flex gap-1">
                                                {cohost.can_review_applications && (
                                                    <Badge variant="outline" className="text-xs gap-1">
                                                        <Eye className="w-3 h-3" />
                                                        Review
                                                    </Badge>
                                                )}
                                                {cohost.can_edit_event && (
                                                    <Badge variant="outline" className="text-xs gap-1">
                                                        <Edit className="w-3 h-3" />
                                                        Edit
                                                    </Badge>
                                                )}
                                            </div>
                                        )}

                                        {getStatusBadge(cohost.status)}

                                        {/* Edit permissions and remove - Only for main organizer */}
                                        {isMainOrganizer && cohost.status === "accepted" && (
                                            <div className="flex items-center gap-1 ml-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    onClick={() => handleUpdatePermission(
                                                        cohost.id,
                                                        'canReviewApplications',
                                                        !cohost.can_review_applications
                                                    )}
                                                    title={cohost.can_review_applications ? "Remove review permission" : "Grant review permission"}
                                                >
                                                    <Eye className={`w-4 h-4 ${cohost.can_review_applications ? 'text-green-500' : 'text-muted-foreground'}`} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    onClick={() => handleUpdatePermission(
                                                        cohost.id,
                                                        'canEditEvent',
                                                        !cohost.can_edit_event
                                                    )}
                                                    title={cohost.can_edit_event ? "Remove edit permission" : "Grant edit permission"}
                                                >
                                                    <Edit className={`w-4 h-4 ${cohost.can_edit_event ? 'text-blue-500' : 'text-muted-foreground'}`} />
                                                </Button>

                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                                            disabled={removingId === cohost.id}
                                                        >
                                                            {removingId === cohost.id ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="w-4 h-4" />
                                                            )}
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Remove Co-host</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to remove {cohost.user?.username} as a co-host?
                                                                They will lose access to manage this event.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleRemoveCohost(cohost.id)}
                                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                            >
                                                                Remove
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
