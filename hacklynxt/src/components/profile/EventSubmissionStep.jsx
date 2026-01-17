"use client";

import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Users,
    User,
    Plus,
    Trash2,
    CheckCircle2,
    Loader2,
    Building2,
    Phone,
    Copy,
    UserPlus,
    Link2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { teamsAPI } from "@/lib/api";

export function EventSubmissionStep({ event, existingTeam }) {
    const { watch } = useFormContext();
    const profileData = watch();

    // Determine if event is solo-only (team_min == 1 && team_max == 1)
    const isSoloOnly = event?.team_min === 1 && event?.team_max === 1;
    // If team_min > 1, teams are required
    const isTeamRequired = event?.team_min > 1;

    const [mode, setMode] = useState(isSoloOnly ? "solo" : (isTeamRequired ? "createTeam" : "solo"));
    const [team, setTeam] = useState(null);
    const [teamCodeInput, setTeamCodeInput] = useState("");
    const [teamName, setTeamName] = useState("");
    const [loading, setLoading] = useState(false);
    const [teamPreview, setTeamPreview] = useState(null);

    const [individualDetails, setIndividualDetails] = useState({
        college: "",
        mobile: ""
    });

    // Initialize team state from existingTeam prop (for page reload persistence)
    useEffect(() => {
        if (existingTeam) {
            setTeam(existingTeam);
            // Set mode based on whether user is leader or member
            const isLeader = existingTeam.members?.some(m => m.is_leader && m.user?.id === profileData?.id);
            setMode(isLeader ? "createTeam" : "teamJoined");
        }
    }, [existingTeam, profileData?.id]);

    // Create a new team
    const handleCreateTeam = async () => {
        if (!teamName.trim()) {
            toast.error("Please enter a team name");
            return;
        }

        setLoading(true);
        try {
            const result = await teamsAPI.createWithCode(event.slug, { name: teamName });
            setTeam(result.team);
            toast.success(result.message || "Team created! Share the code with teammates.");
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to create team");
        } finally {
            setLoading(false);
        }
    };

    // Preview team before joining
    const handlePreviewTeam = async () => {
        if (!teamCodeInput.trim()) {
            toast.error("Please enter a team code");
            return;
        }

        setLoading(true);
        try {
            const preview = await teamsAPI.getByCode(teamCodeInput);
            setTeamPreview(preview);
        } catch (error) {
            toast.error(error.response?.data?.error || "Invalid team code");
            setTeamPreview(null);
        } finally {
            setLoading(false);
        }
    };

    // Join the team
    const handleJoinTeam = async () => {
        setLoading(true);
        try {
            const result = await teamsAPI.joinByCode(teamCodeInput, "Member");
            setTeam(result.team);
            setTeamPreview(null);
            toast.success(result.message || "Successfully joined the team!");
            setMode("teamJoined");
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to join team");
        } finally {
            setLoading(false);
        }
    };

    const copyTeamCode = () => {
        if (team?.team_code) {
            navigator.clipboard.writeText(team.team_code);
            toast.success("Team code copied to clipboard!");
        }
    };

    return (
        <div className="space-y-8 animate-fade-up">
            {/* Mode Selection - Only if both solo and team are options */}
            {!isSoloOnly && !isTeamRequired && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Participation Type</h3>
                    <RadioGroup
                        value={mode}
                        onValueChange={(val) => { setMode(val); setTeam(null); setTeamPreview(null); }}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    >
                        <div>
                            <RadioGroupItem value="solo" id="solo" className="peer sr-only" />
                            <Label
                                htmlFor="solo"
                                className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                            >
                                <User className="mb-3 h-6 w-6 text-muted-foreground" />
                                <span className="font-semibold">Apply as Solo</span>
                                <span className="text-xs text-muted-foreground mt-1">Participate individually</span>
                            </Label>
                        </div>
                        <div>
                            <RadioGroupItem value="createTeam" id="createTeam" className="peer sr-only" />
                            <Label
                                htmlFor="createTeam"
                                className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                            >
                                <Users className="mb-3 h-6 w-6 text-muted-foreground" />
                                <span className="font-semibold">Create a Team</span>
                                <span className="text-xs text-muted-foreground mt-1">Get a code to share</span>
                            </Label>
                        </div>
                    </RadioGroup>

                    {/* Join Team Option */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Have a team code?</span>
                        <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => setMode("joinTeam")}>
                            <UserPlus className="w-4 h-4 mr-1" /> Join existing team
                        </Button>
                    </div>
                </div>
            )}

            {/* Team Required Notice */}
            {isTeamRequired && !team && (
                <div className="space-y-4">
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                        <p className="text-sm text-amber-600 dark:text-amber-400">
                            <strong>This event requires teams.</strong> You need {event.team_min}-{event.team_max} members to apply.
                        </p>
                    </div>

                    <RadioGroup
                        value={mode}
                        onValueChange={(val) => { setMode(val); setTeam(null); setTeamPreview(null); }}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    >
                        <div>
                            <RadioGroupItem value="createTeam" id="createTeam" className="peer sr-only" />
                            <Label
                                htmlFor="createTeam"
                                className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                            >
                                <Users className="mb-3 h-6 w-6 text-muted-foreground" />
                                <span className="font-semibold">Create a Team</span>
                                <span className="text-xs text-muted-foreground mt-1">Become the team leader</span>
                            </Label>
                        </div>
                        <div>
                            <RadioGroupItem value="joinTeam" id="joinTeam" className="peer sr-only" />
                            <Label
                                htmlFor="joinTeam"
                                className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                            >
                                <UserPlus className="mb-3 h-6 w-6 text-muted-foreground" />
                                <span className="font-semibold">Join a Team</span>
                                <span className="text-xs text-muted-foreground mt-1">Enter team code</span>
                            </Label>
                        </div>
                    </RadioGroup>
                </div>
            )}

            {/* Solo Application */}
            {(mode === "solo" && (isSoloOnly || !isTeamRequired)) && (
                <div className="space-y-6 border-l-2 border-primary/20 pl-6 animate-in slide-in-from-left-2">
                    {isSoloOnly && (
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                            <p className="text-sm text-blue-600 dark:text-blue-400">
                                This is a <strong>solo-only</strong> event. You will be applying as an individual.
                            </p>
                        </div>
                    )}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input value={profileData.fullName || ""} disabled className="bg-muted" />
                            <p className="text-xs text-muted-foreground">Fetched from your profile</p>
                        </div>
                        <div className="space-y-2">
                            <Label>College / Organization</Label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    className="pl-9"
                                    placeholder="Institute Name"
                                    value={individualDetails.college}
                                    onChange={(e) => setIndividualDetails({ ...individualDetails, college: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input value={profileData.email || ""} disabled className="bg-muted" />
                            <p className="text-xs text-muted-foreground">Fetched from your profile</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Mobile</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    className="pl-9"
                                    placeholder="9876543210"
                                    value={individualDetails.mobile}
                                    onChange={(e) => setIndividualDetails({ ...individualDetails, mobile: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Team */}
            {mode === "createTeam" && !team && (
                <div className="space-y-6 border-l-2 border-primary/20 pl-6 animate-in slide-in-from-left-2">
                    <div className="space-y-4">
                        <Label className="text-base">Create Your Team</Label>
                        <div className="flex gap-3">
                            <Input
                                placeholder="Enter team name"
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                                className="flex-1"
                            />
                            <Button onClick={handleCreateTeam} disabled={loading || !teamName.trim()}>
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Team"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Team Created - Show Team Code */}
            {team && (
                <div className="space-y-6 border-l-2 border-green-500/40 pl-6 animate-in slide-in-from-left-2">
                    <Card className="border-green-500/30 bg-green-500/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                <CheckCircle2 className="w-5 h-5" />
                                Team Created!
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground mb-2">Share this code with your teammates:</p>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 bg-muted px-4 py-3 rounded-lg font-mono text-lg text-center">
                                        {team.team_code}
                                    </code>
                                    <Button variant="outline" size="icon" onClick={copyTeamCode}>
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="pt-2 border-t">
                                <p className="text-sm font-medium mb-2">Team: {team.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {team.member_count || 1} of {event?.team_max || 4} members
                                </p>
                            </div>
                            {team.members?.length > 0 && (
                                <div className="space-y-2">
                                    <Label className="text-sm">Members:</Label>
                                    {team.members.map((member) => (
                                        <div key={member.id} className="flex items-center gap-2 text-sm">
                                            <User className="w-4 h-4" />
                                            <span>{member.user.display_name || member.user.username}</span>
                                            {member.is_leader && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">Leader</span>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Document Upload Section for Team */}
                    {event?.requirements?.length > 0 && (
                        <Card className="mt-4">
                            <CardHeader>
                                <CardTitle className="text-base">Required Documents</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {event.requirements.map((req) => (
                                    <div key={req.id} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <Label className="font-medium">
                                                {req.field_name}
                                                {req.is_required && <span className="text-destructive ml-1">*</span>}
                                            </Label>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-3">{req.description}</p>
                                        {req.field_type === 'file' && (
                                            <Input type="file" className="cursor-pointer" />
                                        )}
                                        {req.field_type === 'url' && (
                                            <Input type="url" placeholder="Enter URL..." />
                                        )}
                                        {req.field_type === 'text' && (
                                            <Input type="text" placeholder="Enter text..." />
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* Join Team */}
            {mode === "joinTeam" && !team && (
                <div className="space-y-6 border-l-2 border-primary/20 pl-6 animate-in slide-in-from-left-2">
                    <div className="space-y-4">
                        <Label className="text-base">Join an Existing Team</Label>
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <Link2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    className="pl-9"
                                    placeholder="Enter team code (UUID)"
                                    value={teamCodeInput}
                                    onChange={(e) => { setTeamCodeInput(e.target.value); setTeamPreview(null); }}
                                />
                            </div>
                            <Button variant="outline" onClick={handlePreviewTeam} disabled={loading || !teamCodeInput.trim()}>
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Preview"}
                            </Button>
                        </div>

                        {/* Team Preview */}
                        {teamPreview && (
                            <Card className="border-blue-500/30 bg-blue-500/5">
                                <CardContent className="pt-4 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-semibold">{teamPreview.name}</h4>
                                            <p className="text-sm text-muted-foreground">Event: {teamPreview.event_name}</p>
                                        </div>
                                        <span className={`px-2 py-1 text-xs rounded ${teamPreview.is_full ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                            {teamPreview.is_full ? 'Full' : `${teamPreview.member_count} members`}
                                        </span>
                                    </div>
                                    {!teamPreview.is_full && (
                                        <Button className="w-full" onClick={handleJoinTeam} disabled={loading}>
                                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                            Join Team
                                        </Button>
                                    )}
                                    {teamPreview.is_full && (
                                        <p className="text-center text-sm text-red-500">This team is full.</p>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

