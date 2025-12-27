"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import {
    Calendar,
    MapPin,
    Clock,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    ChevronDown,
    Trophy,
    Info,
    FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";

// Import Profile Steps for Inline Editing
import { BasicInfoStep } from "@/components/profile/BasicInfoStep";
import { EducationWorkStep } from "@/components/profile/EducationWorkStep";
import { ProjectsStep } from "@/components/profile/ProjectsStep";
import { SocialsStep } from "@/components/profile/SocialsStep";
import { EventSubmissionStep } from "@/components/profile/EventSubmissionStep";
import { eventsAPI, authAPI } from "@/lib/api";

export default function ApplyEventPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id;

    const [event, setEvent] = useState(null);
    const [activeTab, setActiveTab] = useState("application");
    const [activeSection, setActiveSection] = useState(null);
    const [submissionProgress, setSubmissionProgress] = useState(0);

    // Initialize form with Demo Data
    const form = useForm({
        defaultValues: {
            fullName: "Bala Surya",
            tagline: "Full Stack Developer | AI Enthusiast",
            bio: "Passionate developer building scalable web applications and exploring the frontiers of AI.",
            skills: "React, TypeScript, Node.js, Python, TailwindCSS",
            location: "Coimbatore, India",
            education: [],
            workExperience: [],
            projects: [],
            hackathons: [],
            achievements: "Winner of Smart India Hackathon 2024",
            openSource: [],
            github: "https://github.com/balasurya",
            linkedin: "https://linkedin.com/in/balasurya",
            twitter: "https://twitter.com/balasurya",
            website: "https://balasurya.dev",
            email: "bala.surya@example.com",
        },
        mode: "onChange",
    });

    const [profileSections, setProfileSections] = useState([
        { id: "basic", title: "About you", description: "Your personal details", completed: true },
        { id: "edu-work", title: "Experience", description: "Your domain expertise & skills", completed: true },
        { id: "projects", title: "Projects", description: "Showcase of your work", completed: true },
        { id: "socials", title: "Contact & Socials", description: "Where can we find you", completed: true },
        { id: "submission", title: "Team & Submission", description: "Team details and project PPT", completed: false },
    ]);

    useEffect(() => {
        // Check authentication
        if (!authAPI.isAuthenticated()) {
            toast.error("Please sign in to apply for events");
            router.push("/auth?mode=login");
            return;
        }

        // Calculate progress
        const completed = profileSections.filter(s => s.completed).length;
        setSubmissionProgress(Math.round((completed / profileSections.length) * 100));

        // Fetch event details
        const fetchEvent = async () => {
            try {
                const eventData = await eventsAPI.get(id);
                setEvent({
                    id: eventData.id,
                    eventName: eventData.name,
                    organizer: eventData.organizer_name,
                    organizerName: eventData.organizer_name,
                    startDate: eventData.start_date,
                    endDate: eventData.end_date,
                    mode: eventData.mode,
                    location: eventData.venue || eventData.city,
                    about: eventData.description,
                    prizes: eventData.prize_pool,
                    image: eventData.cover_image,
                });
            } catch (error) {
                // Use sample data for demo
                setEvent({
                    id: id,
                    eventName: "AI Innovation Challenge 2024",
                    organizer: "Tech University",
                    startDate: "2024-02-15",
                    endDate: "2024-02-17",
                    mode: "Hybrid",
                    location: "Tech Campus & Online",
                    about: "A national level hackathon focused on AI/ML solutions for real-world problems. Join us to build innovative solutions and compete for amazing prizes.",
                    prizes: "₹50,000",
                });
            }
        };

        fetchEvent();
    }, [id, router, profileSections]);

    if (!event) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    const handleSubmit = async () => {
        try {
            await eventsAPI.apply(event.id, {
                team_name: form.getValues("fullName") + "'s Team",
                role: "Participant",
                motivation: form.getValues("bio") || "Excited to participate!",
            });
            toast.success("Application submitted successfully!");
            router.push("/dashboard");
        } catch (error) {
            toast.error(error.message || "Failed to submit application");
        }
    };

    const toggleSection = (sectionId) => {
        setActiveSection(activeSection === sectionId ? null : sectionId);
    };

    const handleSectionSave = (sectionId) => {
        setProfileSections(prev => prev.map(s => s.id === sectionId ? { ...s, completed: true } : s));
        setActiveSection(null);
        toast.success("Section saved!");
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            {/* Event Header Banner */}
            <div className="bg-card border-b pt-24 pb-0 sticky top-0 z-30">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center gap-6 pb-6">
                        <div className="w-20 h-20 bg-card border rounded-xl shadow-sm flex items-center justify-center p-2">
                            {event.image ? (
                                <Image src={event.image} alt={event.eventName} width={64} height={64} className="object-contain rounded-lg" />
                            ) : (
                                <span className="text-3xl font-bold text-primary">{event.eventName?.[0]}</span>
                            )}
                        </div>
                        <div className="text-center md:text-left space-y-1">
                            <h1 className="text-3xl font-bold text-foreground">{event.eventName}</h1>
                            <p className="text-muted-foreground font-medium">
                                by <span className="text-foreground">{event.organizer || event.organizerName}</span>
                            </p>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="h-auto p-0 bg-transparent border-b-0 space-x-6 justify-start w-full overflow-x-auto">
                            {["overview", "prizes", "schedule", "application"].map((tab) => (
                                <TabsTrigger
                                    key={tab}
                                    value={tab}
                                    className="rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary bg-transparent shadow-none transition-none"
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            <div className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Content Column */}
                    <div className="lg:col-span-2">
                        <Tabs value={activeTab} className="space-y-6">
                            <TabsContent value="overview">
                                <Card className="border-none shadow-sm">
                                    <CardContent className="p-8 prose max-w-none text-muted-foreground">
                                        <h2 className="text-2xl font-bold text-foreground mb-4 not-prose">About the Event</h2>
                                        <p>{event.about || event.description || "No description provided."}</p>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="prizes">
                                <Card className="border-none shadow-sm">
                                    <CardContent className="p-8">
                                        <h2 className="text-2xl font-bold text-foreground mb-6">Prizes & Rewards</h2>
                                        <div className="p-6 bg-yellow-50 rounded-xl border border-yellow-100 flex items-start gap-4">
                                            <Trophy className="w-8 h-8 text-yellow-600 flex-shrink-0" />
                                            <div>
                                                <p className="font-semibold text-lg text-foreground">{event.prizes || "Prizes to be announced."}</p>
                                                <p className="text-muted-foreground mt-1">Compete for the grand prize pool!</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="schedule">
                                <Card className="border-none shadow-sm">
                                    <CardContent className="p-8">
                                        <h2 className="text-2xl font-bold text-foreground mb-6">Schedule</h2>
                                        <div className="space-y-6">
                                            <div className="flex gap-6">
                                                <div className="w-32 flex-shrink-0 text-right text-muted-foreground font-medium pt-1">
                                                    {event.startDate}
                                                </div>
                                                <div className="flex-1 pb-6 border-l-2 border-muted pl-6 relative">
                                                    <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-primary border-4 border-background shadow-sm" />
                                                    <h4 className="text-lg font-semibold text-foreground">Event Starts</h4>
                                                    <p className="text-muted-foreground">Opening Ceremony & Hacking Begins</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-6">
                                                <div className="w-32 flex-shrink-0 text-right text-muted-foreground font-medium pt-1">
                                                    {event.endDate}
                                                </div>
                                                <div className="flex-1 pl-6 relative border-l-2 border-transparent">
                                                    <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-foreground border-4 border-background shadow-sm" />
                                                    <h4 className="text-lg font-semibold text-foreground">Event Ends</h4>
                                                    <p className="text-muted-foreground">Submission Deadline & Closing</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="application" className="space-y-6">
                                {/* Discord Banner */}
                                <div className="bg-muted/50 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center shadow-sm text-muted-foreground">
                                            <Info className="w-6 h-6" />
                                        </div>
                                        <p className="text-muted-foreground max-w-md text-sm">
                                            Join the official Discord server to find teammates, get support, and clarify queries.
                                        </p>
                                    </div>
                                    <Button variant="outline" className="font-semibold shadow-sm">Join Discord</Button>
                                </div>

                                {/* Application Checklist - Accordion Style */}
                                <Form {...form}>
                                    <div className="rounded-xl shadow-sm border overflow-hidden divide-y bg-card">
                                        {profileSections.map((section) => (
                                            <div key={section.id} className="transition-all bg-card">
                                                <div
                                                    className={`p-6 flex items-center gap-6 cursor-pointer hover:bg-muted/50 transition-colors ${activeSection === section.id ? 'bg-muted/30' : ''}`}
                                                    onClick={() => toggleSection(section.id)}
                                                >
                                                    <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center ${section.completed ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                                                        {section.completed ? <CheckCircle2 className="w-6 h-6" /> : <div className="w-3 h-3 bg-current rounded-full" />}
                                                    </div>

                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-bold text-foreground">{section.title}</h3>
                                                        <p className="text-muted-foreground">{section.description}</p>
                                                    </div>

                                                    <div className="text-muted-foreground/50 transition-colors">
                                                        {activeSection === section.id ? <ChevronDown className="w-6 h-6 text-muted-foreground" /> : <ChevronRight className="w-6 h-6" />}
                                                    </div>
                                                </div>

                                                {/* Expanded Form Content */}
                                                {activeSection === section.id && (
                                                    <div className="px-6 pb-8 border-t animate-in slide-in-from-top-2">
                                                        <div className="pt-6">
                                                            {section.id === "basic" && <BasicInfoStep />}
                                                            {section.id === "edu-work" && <EducationWorkStep />}
                                                            {section.id === "projects" && <ProjectsStep />}
                                                            {section.id === "socials" && <SocialsStep />}
                                                            {section.id === "submission" && <EventSubmissionStep />}
                                                        </div>
                                                        <div className="flex justify-end pt-6 border-t mt-6">
                                                            <Button onClick={() => handleSectionSave(section.id)} className="px-8">
                                                                Save & Continue
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </Form>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6">
                        <Card className="border-none shadow-md overflow-hidden bg-card">
                            <CardContent className="p-0">
                                {/* Status Header */}
                                <div className="p-6 pb-0">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-16 bg-emerald-50 rounded-lg border border-emerald-100 flex flex-col items-center justify-center gap-1 flex-shrink-0">
                                            <div className="w-8 h-1 bg-emerald-500 rounded-full" />
                                            <div className="w-8 h-1 bg-emerald-500 rounded-full" />
                                            <div className="w-6 h-1 bg-emerald-500 rounded-full" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-muted-foreground tracking-wider uppercase mb-1">APPLICATION FILLED</p>
                                            <p className="text-4xl font-bold text-foreground">{submissionProgress}%</p>
                                        </div>
                                    </div>
                                    <Progress value={submissionProgress} className="h-1.5 mt-6 mb-2" />
                                </div>

                                {/* Timeline */}
                                <div className="p-6 space-y-0 relative">
                                    <div className="absolute left-[39px] top-8 bottom-12 w-0.5 bg-primary/20" />

                                    <div className="flex gap-4 relative mb-8">
                                        <div className="w-3 h-3 rounded-full border-2 border-primary bg-background relative z-10 mt-1.5 ml-1.5" />
                                        <div>
                                            <p className="text-xs font-bold text-primary tracking-wider uppercase mb-1">RUNS FROM</p>
                                            <p className="font-bold text-foreground text-lg">
                                                {event.startDate ? new Date(event.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'TBA'} - {event.endDate ? new Date(event.endDate).toLocaleDateString(undefined, { day: 'numeric', year: 'numeric' }) : ''}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 relative">
                                        <div className="w-3 h-3 rounded-full border-2 border-primary bg-background relative z-10 mt-1.5 ml-1.5" />
                                        <div>
                                            <p className="text-xs font-bold text-primary tracking-wider uppercase mb-1">HAPPENING</p>
                                            <p className="font-bold text-foreground text-lg">{event.mode === 'Offline' ? event.location : event.mode}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Counter */}
                                <div className="bg-primary/10 p-6 text-center border-t border-primary/20">
                                    <p className="text-xs font-bold text-primary tracking-wider uppercase mb-2">APPLICATIONS CLOSES IN</p>
                                    <p className="text-2xl font-bold text-primary font-mono">00d : 12h : 45m</p>
                                </div>

                                <div className="p-4">
                                    <Button
                                        className="w-full h-12 text-lg font-bold"
                                        size="lg"
                                        onClick={handleSubmit}
                                        disabled={activeTab !== 'application' || submissionProgress < 100}
                                    >
                                        Submit application
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
