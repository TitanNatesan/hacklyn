import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    CalendarIcon,
    Upload,
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    Info,
    CalendarDays,
    MapPin,
    Trophy,
    Users
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const steps = [
    { id: "details", title: "Event Details", icon: Info, description: "Basic Info & Organizer Details" },
    { id: "logistics", title: "Logistics", icon: CalendarDays, description: "Timeline, Venue & Format" },
    { id: "structure", title: "Structure", icon: MapPin, description: "Tracks, Rules & Eligibility" },
    { id: "rewards", title: "Rewards", icon: Trophy, description: "Prizes, Sponsors & Judges" },
];

const OrganizeEvent = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [date, setDate] = useState<Date>();

    // Basic state management (could be replaced with react-hook-form for better validation)
    const [formData, setFormData] = useState({
        // Step 1
        eventName: "HackSplash 2025",
        tagline: "Dive into Innovation",
        description: "A 24-hour hackathon focused on solving water scarcity and marine life challenges. Join us to build sustainable solutions.",
        organizerName: "Marine Tech Club",
        organizerContact: "contact@hacksplash.com",
        website: "https://hacksplash.com",
        socialLink: "https://discord.gg/hacksplash",

        // Step 2
        startDate: "2025-06-15T09:00",
        endDate: "2025-06-16T17:00",
        mode: "offline",
        venue: "Ocean Convention Center, Hall B",
        city: "Miami, Florida",
        teamMin: 1,
        teamMax: 4,

        // Step 3
        tracks: "Clean Water, Marine Robotics, Sustainable Fishing",
        rules: "1. Teams of 2-4. \n2. Fresh code only. \n3. Be respectful.",

        // Step 4
        prizePool: "$5,000",
        sponsors: "OceanOne, BlueTech Inc, DeepSea Ventures", // simplified for demo
        judges: "Dr. Alice Waters (Marine Biologist), Bob Fisher (CEO of FishTech)", // simplified for demo
    });

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
            window.scrollTo(0, 0);
        } else {
            handleSubmit();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
            window.scrollTo(0, 0);
        }
    };

    const handleSubmit = async () => {
        try {
            const { eventsAPI } = await import("@/lib/api");

            await eventsAPI.create({
                name: formData.eventName,
                tagline: formData.tagline,
                description: formData.description,
                organizer_name: formData.organizerName,
                organizer_contact: formData.organizerContact,
                website: formData.website,
                social_link: formData.socialLink,
                start_date: formData.startDate,
                end_date: formData.endDate,
                mode: formData.mode,
                venue: formData.venue,
                city: formData.city,
                team_min: formData.teamMin,
                team_max: formData.teamMax,
                tracks: formData.tracks,
                rules: formData.rules,
                prize_pool: formData.prizePool,
                prizes: [],
            });

            toast.success("Event created successfully! Sent to admin for approval.");
            navigate("/dashboard/organizer");
        } catch (error) {
            console.error("Error creating event:", error);
            toast.error("Failed to create event. Please try again.");
        }
    };


    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <DashboardLayout role="organizer">
            <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">

                {/* Header Section */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-display font-bold">Organize a New Event</h1>
                    <p className="text-muted-foreground">Complete the following steps to launch your hackathon or workshop.</p>
                </div>

                {/* Stepper */}
                <div className="relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-secondary -z-10 rounded-full" />
                    <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 rounded-full transition-all duration-500"
                        style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                    />

                    <div className="flex justify-between items-start">
                        {steps.map((step, index) => {
                            const StepIcon = step.icon;
                            const isActive = index <= currentStep;
                            const isCurrent = index === currentStep;

                            return (
                                <div key={step.id} className="flex flex-col items-center gap-2 bg-background p-2 rounded-lg">
                                    <div
                                        className={cn(
                                            "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                                            isActive ? "bg-primary border-primary text-primary-foreground" : "bg-secondary border-border text-muted-foreground",
                                            isCurrent && "ring-4 ring-primary/20"
                                        )}
                                    >
                                        <StepIcon className="w-5 h-5" />
                                    </div>
                                    <div className="text-center hidden md:block">
                                        <p className={cn("text-sm font-semibold", isActive ? "text-foreground" : "text-muted-foreground")}>
                                            {step.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground max-w-[120px]">{step.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Form Content */}
                <Card className="border-muted/50 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {steps[currentStep].title}
                            <span className="text-sm font-normal text-muted-foreground ml-auto">Step {currentStep + 1} of {steps.length}</span>
                        </CardTitle>
                        <CardDescription>Fill out the details below.</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* STEP 1: EVENT DETAILS */}
                        {currentStep === 0 && (
                            <div className="grid gap-6 animate-fade-in">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
                                    <div className="space-y-2">
                                        <Label htmlFor="eventName">Event Name *</Label>
                                        <Input
                                            id="eventName"
                                            placeholder="e.g. HackCampus 2025"
                                            value={formData.eventName}
                                            onChange={(e) => handleChange("eventName", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="tagline">Tagline</Label>
                                        <Input
                                            id="tagline"
                                            placeholder="A short punchy description"
                                            value={formData.tagline}
                                            onChange={(e) => handleChange("tagline", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Detailed Description *</Label>
                                        <Textarea
                                            id="description"
                                            placeholder="Describe the goals, theme, and what participants can expect..."
                                            className="min-h-[120px]"
                                            value={formData.description}
                                            onChange={(e) => handleChange("description", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Event Logo & Cover</Label>
                                        <div className="flex gap-4">
                                            <div className="w-24 h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center bg-secondary/30 cursor-pointer hover:bg-secondary/50 transition-colors">
                                                <Upload className="w-5 h-5 text-muted-foreground mb-1" />
                                                <span className="text-[10px] text-muted-foreground">Logo</span>
                                            </div>
                                            <div className="flex-1 h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center bg-secondary/30 cursor-pointer hover:bg-secondary/50 transition-colors">
                                                <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                                                <span className="text-xs text-muted-foreground">Upload Cover Image (1920x1080)</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold border-b pb-2">Organizer & Links</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="organizerName">Organizer / Org Name *</Label>
                                            <Input
                                                id="organizerName"
                                                value={formData.organizerName}
                                                onChange={(e) => handleChange("organizerName", e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="organizerContact">Contact Email *</Label>
                                            <Input
                                                id="organizerContact"
                                                type="email"
                                                value={formData.organizerContact}
                                                onChange={(e) => handleChange("organizerContact", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="website">Official Website</Label>
                                            <Input
                                                id="website"
                                                placeholder="https://"
                                                value={formData.website}
                                                onChange={(e) => handleChange("website", e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="social">Community Link</Label>
                                            <Input
                                                id="social"
                                                placeholder="Discord/Slack invite"
                                                value={formData.socialLink}
                                                onChange={(e) => handleChange("socialLink", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: LOGISTICS */}
                        {currentStep === 1 && (
                            <div className="grid gap-6 animate-fade-in">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold border-b pb-2">Timeline</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Registration Start</Label>
                                            <Input type="datetime-local" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Registration End</Label>
                                            <Input type="datetime-local" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Event Start *</Label>
                                            <Input
                                                type="datetime-local"
                                                value={formData.startDate}
                                                onChange={(e) => handleChange("startDate", e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Event End *</Label>
                                            <Input
                                                type="datetime-local"
                                                value={formData.endDate}
                                                onChange={(e) => handleChange("endDate", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold border-b pb-2">Format & Location</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Mode *</Label>
                                            <Select
                                                value={formData.mode}
                                                onValueChange={(val) => handleChange("mode", val)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Mode" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="online">Online</SelectItem>
                                                    <SelectItem value="offline">Offline</SelectItem>
                                                    <SelectItem value="hybrid">Hybrid</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="city">City & Country</Label>
                                            <Input
                                                id="city"
                                                placeholder="e.g. San Francisco, USA"
                                                value={formData.city}
                                                onChange={(e) => handleChange("city", e.target.value)}
                                                disabled={formData.mode === "online"}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="venue">Venue Details</Label>
                                        <Textarea
                                            id="venue"
                                            placeholder="Specific address or platform details..."
                                            value={formData.venue}
                                            onChange={(e) => handleChange("venue", e.target.value)}
                                            disabled={formData.mode === "online"}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: STRUCTURE */}
                        {currentStep === 2 && (
                            <div className="grid gap-6 animate-fade-in">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold border-b pb-2">Participants & Teams</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="space-y-2">
                                            <Label>Min Team Size</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={formData.teamMin}
                                                onChange={(e) => handleChange("teamMin", parseInt(e.target.value))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Max Team Size</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={formData.teamMax}
                                                onChange={(e) => handleChange("teamMax", parseInt(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" id="individual" className="rounded border-gray-300" />
                                        <Label htmlFor="individual" className="font-normal">Allow individual participation (Solo)</Label>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold border-b pb-2">Tracks & Rules</h3>
                                    <div className="space-y-2">
                                        <Label>Tracks / Themes</Label>
                                        <Input
                                            placeholder="e.g. AI, Fintech, Healthcare (comma separated)"
                                            value={formData.tracks}
                                            onChange={(e) => handleChange("tracks", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Rules & Code of Conduct</Label>
                                        <Textarea
                                            placeholder="Paste your rules or link to a document..."
                                            className="min-h-[150px]"
                                            value={formData.rules}
                                            onChange={(e) => handleChange("rules", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 4: REWARDS & PEOPLE */}
                        {currentStep === 3 && (
                            <div className="grid gap-6 animate-fade-in">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold border-b pb-2">Prizes</h3>
                                    <div className="space-y-2">
                                        <Label>Total Prize Pool Amount</Label>
                                        <Input
                                            placeholder="e.g. $10,000"
                                            value={formData.prizePool}
                                            onChange={(e) => handleChange("prizePool", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Prize Breakdown</Label>
                                        <Textarea placeholder="1st Place: $5000&#10;2nd Place: $3000&#10;..." />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold border-b pb-2">Sponsors & Judges</h3>
                                    <div className="space-y-2">
                                        <Label>Sponsors</Label>
                                        <Textarea
                                            placeholder="List sponsor names..."
                                            value={formData.sponsors}
                                            onChange={(e) => handleChange("sponsors", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Judges & Speakers</Label>
                                        <Textarea
                                            placeholder="Name - Bio..."
                                            value={formData.judges}
                                            onChange={(e) => handleChange("judges", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                    </CardContent>

                    <CardFooter className="flex justify-between border-t bg-muted/20 p-6">
                        <Button
                            variant="outline"
                            onClick={handlePrev}
                            disabled={currentStep === 0}
                            className={currentStep === 0 ? "invisible" : ""}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                        <Button
                            onClick={handleNext}
                            className="min-w-[120px]"
                        >
                            {currentStep === steps.length - 1 ? (
                                <>Publish Event <CheckCircle2 className="w-4 h-4 ml-2" /></>
                            ) : (
                                <>Next Step <ArrowRight className="w-4 h-4 ml-2" /></>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default OrganizeEvent;
