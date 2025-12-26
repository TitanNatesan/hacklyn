import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { profileSchema, ProfileFormValues } from "@/components/profile/schema";
import { BasicInfoStep } from "@/components/profile/BasicInfoStep";
import { EducationWorkStep } from "@/components/profile/EducationWorkStep";
import { ProjectsStep } from "@/components/profile/ProjectsStep";
import { SocialsStep } from "@/components/profile/SocialsStep";
import { EventSubmissionStep } from "@/components/profile/EventSubmissionStep"; // Import New Step

const ApplyEvent = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState<any>(null);
    const [activeTab, setActiveTab] = useState("application");
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const [submissionProgress, setSubmissionProgress] = useState(0);

    // Initialize form with Demo Data
    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            fullName: "Bala Surya",
            tagline: "Full Stack Developer | AI Enthusiast",
            bio: "Passionate developer building scalable web applications and exploring the frontiers of AI. Love to participate in hackathons and solve real-world problems.",
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
        { id: "submission", title: "Team & Submission", description: "Team details and project PPT", completed: false }, // New Section
    ]);

    useEffect(() => {
        // Calculate progress
        const completed = profileSections.filter(s => s.completed).length;
        setSubmissionProgress(Math.round((completed / profileSections.length) * 100));

        // Fetch event details
        const allEvents = JSON.parse(localStorage.getItem("hacklyn_events") || "[]");

        // Fallback for mock IDs
        const mockEvents = [
            {
                id: "3",
                eventName: "YODHA National Hackathon",
                organizer: "Jyothi Engineering College",
                startDate: "2025-01-09",
                endDate: "2025-01-10",
                mode: "Offline",
                about: "A national level hackathon focused on AI/ML solutions...",
                prizes: "₹50,000",
                location: "Thrissur, Kerala"
            },
            // ... same mock data as before
        ];

        const foundEvent = allEvents.find((e: any) => e.id === id) || mockEvents.find(e => e.id === id);

        if (foundEvent) {
            setEvent(foundEvent);
        } else {
            // Fetch from API
            import("@/lib/api").then(({ eventsAPI }) => {
                eventsAPI.get(id!).then(data => {
                    setEvent({
                        id: data.id,
                        eventName: data.name,
                        organizer: data.organizer_name,
                        organizerName: data.organizer_name,
                        startDate: data.start_date,
                        endDate: data.end_date,
                        mode: data.mode,
                        location: data.venue || data.city,
                        about: data.description,
                        prizes: data.prize_pool,
                    });
                }).catch(() => {
                    setEvent({
                        id: id,
                        eventName: "Sample Event Name",
                        organizer: "Sample Organizer",
                        startDate: "2025-01-30",
                        endDate: "2025-01-31",
                        mode: "Hybrid",
                        location: "Pune, India",
                        about: "This is a detailed description of the event.",
                        prizes: "Prize Pool of ₹1,00,000",
                    });
                });
            });
        }

        // Check local storage for previously saved profile data to auto-fill
        // In a real app, this would fetch from backend API
        const saved = localStorage.getItem("profileCompleted");
        if (saved === "true") {
            setProfileSections(prev => prev.map(s => ({ ...s, completed: true })));
        }

    }, [id]);

    if (!event) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    const handleSubmit = async () => {
        try {
            const { eventsAPI } = await import("@/lib/api");
            await eventsAPI.apply(event.id, {
                team_name: form.getValues("fullName") + "'s Team",
                role: "Participant", // Default role
                motivation: form.getValues("bio") || "Excited to participate!",
            });
            toast.success("Application submitted successfully!");
            navigate("/dashboard");
        } catch (error: any) {
            toast.error(error.message || "Failed to submit application");
        }
    };

    const toggleSection = (sectionId: string) => {
        setActiveSection(activeSection === sectionId ? null : sectionId);
    };

    const handleSectionSave = (sectionId: string) => {
        // Here we would ideally trigger section specific validation
        // form.trigger(["field1", "field2"])

        setProfileSections(prev => prev.map(s => s.id === sectionId ? { ...s, completed: true } : s));
        setActiveSection(null);
        toast.success("Section saved!");
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB] flex flex-col font-sans">
            <Header />

            {/* Event Header Banner */}
            <div className="bg-white border-b border-gray-200 pt-24 pb-0 sticky top-0 z-30">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center gap-6 pb-6">
                        <div className="w-20 h-20 bg-white border border-gray-100 rounded-xl shadow-sm flex items-center justify-center p-2">
                            {/* Placeholder Logo if no image */}
                            {event.image ? (
                                <img src={event.image} alt={event.eventName} className="w-full h-full object-contain rounded-lg" />
                            ) : (
                                <span className="text-3xl font-bold text-primary">{event.eventName?.[0]}</span>
                            )}
                        </div>
                        <div className="text-center md:text-left space-y-1">
                            <h1 className="text-3xl font-bold text-gray-900">{event.eventName}</h1>
                            <p className="text-gray-500 font-medium">by <span className="text-gray-900">{event.organizer || event.organizerName}</span></p>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="h-auto p-0 bg-transparent border-b-0 space-x-6 justify-start w-full overflow-x-auto">
                            {["overview", "prizes", "schedule", "application"].map((tab) => (
                                <TabsTrigger
                                    key={tab}
                                    value={tab}
                                    className="rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 data-[state=active]:border-primary data-[state=active]:text-primary bg-transparent shadow-none transition-none"
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
                                    <CardContent className="p-8 prose max-w-none text-gray-600">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-4 not-prose">About the Event</h2>
                                        <p>{event.about || event.description || "No description provided."}</p>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="prizes">
                                <Card className="border-none shadow-sm">
                                    <CardContent className="p-8">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Prizes & Rewards</h2>
                                        <div className="p-6 bg-yellow-50 rounded-xl border border-yellow-100 flex items-start gap-4">
                                            <Trophy className="w-8 h-8 text-yellow-600 flex-shrink-0" />
                                            <div>
                                                <p className="font-semibold text-lg text-gray-900">{event.prizes || "Prizes to be announced."}</p>
                                                <p className="text-gray-600 mt-1"> compete for the grand prize pool!</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="schedule">
                                <Card className="border-none shadow-sm">
                                    <CardContent className="p-8">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Schedule</h2>
                                        <div className="space-y-6">
                                            <div className="flex gap-6">
                                                <div className="w-32 flex-shrink-0 text-right text-gray-500 font-medium pt-1">
                                                    {event.startDate}
                                                </div>
                                                <div className="flex-1 pb-6 border-l-2 border-gray-100 pl-6 relative">
                                                    <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-primary border-4 border-white shadow-sm" />
                                                    <h4 className="text-lg font-semibold text-gray-900">Event Starts</h4>
                                                    <p className="text-gray-500">Opening Ceremony & Hacking Begins</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-6">
                                                <div className="w-32 flex-shrink-0 text-right text-gray-500 font-medium pt-1">
                                                    {event.endDate}
                                                </div>
                                                <div className="flex-1 pl-6 relative border-l-2 border-transparent">
                                                    <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-gray-900 border-4 border-white shadow-sm" />
                                                    <h4 className="text-lg font-semibold text-gray-900">Event Ends</h4>
                                                    <p className="text-gray-500">Submission Deadline & Closing</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="application" className="space-y-6">
                                {/* Discord Banner */}
                                <div className="bg-gray-100/50 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-400">
                                            <Info className="w-6 h-6" />
                                        </div>
                                        <p className="text-gray-600 max-w-md text-sm">Join the official Discord server to find teammates, get support, and clarify queries.</p>
                                    </div>
                                    <Button variant="outline" className="bg-white border-gray-200 text-gray-900 hover:bg-gray-50 font-semibold shadow-sm">Join Discord</Button>
                                </div>

                                {/* Application Checklist - Accordion Style */}
                                <Form {...form}>
                                    <div className="rounded-xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100 bg-white">
                                        {profileSections.map((section) => (
                                            <div key={section.id} className="transition-all bg-white">
                                                <div
                                                    className={`p-6 flex items-center gap-6 cursor-pointer hover:bg-gray-50 transition-colors ${activeSection === section.id ? 'bg-gray-50/80' : ''}`}
                                                    onClick={() => toggleSection(section.id)}
                                                >
                                                    <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center ${section.completed ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'
                                                        }`}>
                                                        {section.completed ? <CheckCircle2 className="w-6 h-6" /> : <div className="w-3 h-3 bg-current rounded-full" />}
                                                    </div>

                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-bold text-gray-900">{section.title}</h3>
                                                        <p className="text-gray-500">{section.description}</p>
                                                    </div>

                                                    <div className="text-gray-300 transition-colors">
                                                        {activeSection === section.id ? <ChevronDown className="w-6 h-6 text-gray-500" /> : <ChevronRight className="w-6 h-6" />}
                                                    </div>
                                                </div>

                                                {/* Expanded Form Content */}
                                                {activeSection === section.id && (
                                                    <div className="px-6 pb-8 border-t border-gray-100 animate-slide-in-from-top-2">
                                                        <div className="pt-6">
                                                            {section.id === "basic" && <BasicInfoStep />}
                                                            {section.id === "edu-work" && <EducationWorkStep />}
                                                            {section.id === "projects" && <ProjectsStep />}
                                                            {section.id === "socials" && <SocialsStep />}
                                                            {section.id === "submission" && <EventSubmissionStep />}
                                                        </div>
                                                        <div className="flex justify-end pt-6 border-t border-gray-100 mt-6">
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
                        <Card className="border-none shadow-md overflow-hidden bg-white">
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
                                            <p className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-1">APPLICATION FILLED</p>
                                            <p className="text-4xl font-bold text-gray-900">{submissionProgress}%</p>
                                        </div>
                                    </div>
                                    <Progress value={submissionProgress} className="h-1.5 mt-6 mb-2 bg-gray-100" />
                                </div>

                                {/* Timeline */}
                                <div className="p-6 space-y-0 relative">
                                    {/* Vertical Line */}
                                    <div className="absolute left-[39px] top-8 bottom-12 w-0.5 bg-blue-100" />

                                    <div className="flex gap-4 relative mb-8">
                                        <div className="w-3 h-3 rounded-full border-2 border-blue-500 bg-white relative z-10 mt-1.5 ml-1.5" />
                                        <div>
                                            <p className="text-xs font-bold text-blue-500 tracking-wider uppercase mb-1">RUNS FROM</p>
                                            <p className="font-bold text-gray-900 text-lg">{event.startDate ? new Date(event.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'TBA'} - {event.endDate ? new Date(event.endDate).toLocaleDateString(undefined, { day: 'numeric', year: 'numeric' }) : ''}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 relative">
                                        <div className="w-3 h-3 rounded-full border-2 border-blue-500 bg-white relative z-10 mt-1.5 ml-1.5" />
                                        <div>
                                            <p className="text-xs font-bold text-blue-500 tracking-wider uppercase mb-1">HAPPENING</p>
                                            <p className="font-bold text-gray-900 text-lg">{event.mode === 'Offline' ? event.location : event.mode}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Counter */}
                                <div className="bg-blue-50 p-6 text-center border-t border-blue-100">
                                    <p className="text-xs font-bold text-blue-600 tracking-wider uppercase mb-2">APPLICATIONS CLOSES IN</p>
                                    <p className="text-2xl font-bold text-blue-900 font-mono">00d : 12h : 45m</p>
                                </div>

                                <div className="p-4">
                                    <Button
                                        className="w-full h-12 text-lg font-bold shadow-lg shadow-blue-500/20"
                                        size="lg"
                                        variant="hero"
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
};

export default ApplyEvent;
