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
    ChevronUp,
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
import { formatDate, formatDateRange, formatEventDate, getRelativeTime } from "@/lib/utils";

// Import Profile Steps for Inline Editing
import { BasicInfoStep } from "@/components/profile/BasicInfoStep";
import { EducationWorkStep } from "@/components/profile/EducationWorkStep";
import { ProjectsStep } from "@/components/profile/ProjectsStep";
import { SocialsStep } from "@/components/profile/SocialsStep";
import { EventSubmissionStep } from "@/components/profile/EventSubmissionStep";
import { DynamicQuestionForm } from "@/components/events/DynamicQuestionForm";
import { eventsAPI, authAPI, profileAPI, teamsAPI } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ApplyEventPage() {
    const params = useParams();
    const router = useRouter();
    const eventSlug = params.slug; // Route param is slug

    const [event, setEvent] = useState(null);
    const [activeTab, setActiveTab] = useState("overview"); // Default to overview
    const [activeSection, setActiveSection] = useState(null);
    const [submissionProgress, setSubmissionProgress] = useState(0);
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

    // Event questions state
    const [eventQuestions, setEventQuestions] = useState([]);
    const [questionResponses, setQuestionResponses] = useState({});
    const [questionErrors, setQuestionErrors] = useState({});

    // Team state - fetched from backend on page load
    const [existingTeam, setExistingTeam] = useState(null);

    // Initialize form with empty defaults (will be populated from backend)
    const form = useForm({
        defaultValues: {
            fullName: "",
            email: "",
            profilePicture: null,
            tagline: "",
            bio: "",
            skills: "",
            location: "",
            education: [],
            workExperience: [],
            projects: [],
            achievements: "",
            github: "",
            linkedin: "",
            twitter: "",
            website: "",
            resume: null,
        },
        mode: "onChange",
    });

    const [profileSections, setProfileSections] = useState([
        { id: "basic", title: "About you", description: "Your personal details", completed: true },
        { id: "edu-work", title: "Experience", description: "Your domain expertise & skills", completed: true },
        { id: "projects", title: "Projects", description: "Showcase of your work", completed: true },
        { id: "socials", title: "Contact & Socials", description: "Where can we find you", completed: true },
        { id: "questions", title: "Additional Questions", description: "Event-specific requirements", completed: false },
        { id: "submission", title: "Team & Submission", description: "Team details and final submit", completed: false },
    ]);

    useEffect(() => {
        // Check authentication
        if (!authAPI.isAuthenticated()) {
            toast.error("Please sign in to apply for events");
            router.push("/auth?mode=login");
            return;
        }

        // Fetch user profile data
        const fetchProfile = async () => {
            try {
                const profileData = await profileAPI.get();
                const user = authAPI.getUser();

                // Map education data for frontend
                const mappedEducation = (profileData?.education || []).map(edu => ({
                    ...edu,
                    school: edu.institution_name || edu.school || "",
                    startDate: edu.start_date || edu.startDate || "",
                    endDate: edu.end_date || edu.endDate || "",
                }));

                // Map work experience data for frontend
                const mappedWork = (profileData?.work_experience || []).map(work => ({
                    ...work,
                    company: work.company_name || work.company || "",
                    jobTitle: work.job_title || work.jobTitle || "",
                    startDate: work.start_date || work.startDate || "",
                    endDate: work.end_date || work.endDate || "",
                }));

                // Update form with profile data
                form.reset({
                    fullName: user?.first_name && user?.last_name
                        ? `${user.first_name} ${user.last_name}`
                        : user?.username || "",
                    email: user?.email || "",
                    profilePicture: profileData?.profile_picture || user?.avatar || null,
                    tagline: profileData?.tagline || "",
                    bio: profileData?.bio || "",
                    skills: profileData?.skills?.map(s => s.name).join(", ") || "",
                    location: profileData?.location || "",
                    education: mappedEducation,
                    workExperience: mappedWork,
                    projects: profileData?.projects || [],
                    achievements: profileData?.achievements || "",
                    github: profileData?.github || "",
                    linkedin: profileData?.linkedin || "",
                    twitter: profileData?.twitter || "",
                    website: profileData?.website || "",
                    resume: profileData?.resume || null,
                });

                // Calculate section completion dynamically
                const hasBasicInfo = !!(user?.first_name || profileData?.tagline || profileData?.bio);
                const hasEducation = mappedEducation.length > 0;
                const hasProjects = true; // Projects are optional
                const hasSocials = !!(profileData?.github && profileData?.linkedin);

                setProfileSections([
                    { id: "basic", title: "About you", description: "Your personal details", completed: hasBasicInfo },
                    {
                        id: "edu-work",
                        title: "Experience",
                        description: hasEducation || mappedWork.length > 0
                            ? `${mappedEducation.length} Education, ${mappedWork.length} Work`
                            : "Your domain expertise & skills",
                        completed: hasEducation
                    },
                    { id: "projects", title: "Projects", description: "Showcase of your work (Optional)", completed: hasProjects },
                    { id: "socials", title: "Contact & Socials", description: "Where can we find you", completed: hasSocials },
                    { id: "submission", title: "Team & Submission", description: "Team details and documents", completed: false },
                ]);
            } catch (error) {
                console.error("Failed to fetch profile:", error);
                toast.error("Failed to load profile data");
                // Keep default sections if profile fetch fails
            }
        };

        fetchProfile();

        // Fetch event details
        const fetchEvent = async () => {
            try {
                // Fetch event by slug
                const eventData = await eventsAPI.get(eventSlug);
                setEvent({
                    id: eventData.id,
                    slug: eventData.slug,
                    eventName: eventData.name,
                    organizer: eventData.organizer_name,
                    organizerName: eventData.organizer_name,
                    organizerEmail: eventData.organizer_email,
                    website: eventData.website,
                    community_link: eventData.discord_link,
                    startDate: eventData.start_date,
                    endDate: eventData.end_date,
                    registration_start: eventData.registration_start,
                    registration_end: eventData.registration_end,
                    mode: eventData.mode,
                    venue: eventData.venue,
                    city: eventData.city,
                    location: eventData.venue || eventData.city,
                    about: eventData.description,
                    prize_pool: eventData.prize_pool,
                    prizes: eventData.prizes || eventData.prize_details || [],
                    image: eventData.cover_image,
                    team_min: eventData.team_min,
                    team_max: eventData.team_max,
                    max_participants: eventData.max_participants,
                    tracks: eventData.tracks ? eventData.tracks.split(',').map(t => t.trim()).filter(Boolean) : [],
                    themes: eventData.themes ? eventData.themes.split(',').map(t => t.trim()).filter(Boolean) : [],
                    rules: eventData.rules,
                    eligibility: eventData.eligibility,
                    requirements: eventData.requirements || [],
                });

                // Fetch event questions
                try {
                    const questionsData = await eventsAPI.getQuestions(eventSlug);
                    const questionsArray = Array.isArray(questionsData)
                        ? questionsData
                        : (questionsData?.results || []);
                    setEventQuestions(questionsArray);

                    // Update profile sections to show/hide questions section
                    if (questionsArray && questionsArray.length > 0) {
                        setProfileSections(prev => prev.map(s =>
                            s.id === "questions" ? { ...s, description: `${questionsArray.length} question${questionsArray.length > 1 ? 's' : ''} to answer` } : s
                        ));
                    } else {
                        // Remove questions section if no questions
                        setProfileSections(prev => prev.filter(s => s.id !== "questions"));
                    }
                } catch (questionsError) {
                    console.warn("No questions found for this event:", questionsError);
                    // Remove questions section if fetch fails
                    setProfileSections(prev => prev.filter(s => s.id !== "questions"));
                }
            } catch (error) {
                // Use sample data for demo
                setEvent({
                    id: eventSlug,
                    slug: eventSlug,
                    eventName: "AI Innovation Challenge 2024",
                    organizer: "Tech University",
                    organizerEmail: "contact@techuniv.edu",
                    website: "https://techuniv.edu/hackathon",
                    discord_link: "https://discord.gg/example",
                    startDate: "2024-02-15",
                    endDate: "2024-02-17",
                    registration_start: "2024-01-10T09:00:00Z",
                    registration_end: "2024-02-10T23:59:00Z",
                    mode: "hybrid",
                    venue: "Tech Campus Main Hall",
                    city: "Coimbatore",
                    location: "Tech Campus & Online",
                    about: "A national level hackathon focused on AI/ML solutions for real-world problems. Join us to build innovative solutions and compete for amazing prizes.",
                    prize_pool: "₹1,00,000",
                    prizes: [
                        { position: "Overall Best Prize", reward: "₹20K" },
                        { position: "Best Software Project", reward: "₹10K" },
                    ],
                    team_min: 1,
                    team_max: 4,
                    max_participants: 200,
                    tracks: ["AI/ML", "IoT"],
                    themes: ["MedTech", "AgroTech"],
                    rules: "Follow code of conduct.",
                    eligibility: "Open to students and professionals.",
                    community_link: "https://discord.gg/example",
                    requirements: [],
                });
                // Remove questions section for demo data
                setProfileSections(prev => prev.filter(s => s.id !== "questions"));
            }
        };

        fetchEvent();

        // Fetch user's existing team for this event
        const fetchExistingTeam = async () => {
            try {
                const myTeams = await teamsAPI.myTeams();
                // Find team for this specific event
                const teamForEvent = myTeams.find(t => t.event_slug === eventSlug || t.event?.slug === eventSlug);
                if (teamForEvent) {
                    // Fetch full team details
                    const teamDetails = await teamsAPI.get(teamForEvent.id);
                    setExistingTeam(teamDetails);
                }
            } catch (error) {
                console.warn("No existing team found:", error);
            }
        };

        fetchExistingTeam();
    }, [eventSlug, router, form]);

    // Countdown timer effect
    useEffect(() => {
        if (!event?.endDate) return;

        const calculateCountdown = () => {
            const now = new Date().getTime();
            const registrationEnd = event.registration_end
                ? new Date(event.registration_end).getTime()
                : new Date(event.startDate).getTime();
            const diff = registrationEnd - now;

            if (diff <= 0) {
                setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            setCountdown({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((diff % (1000 * 60)) / 1000)
            });
        };

        calculateCountdown();
        const timer = setInterval(calculateCountdown, 1000);
        return () => clearInterval(timer);
    }, [event]);

    // Calculate progress when profileSections changes
    useEffect(() => {
        const completed = profileSections.filter(s => s.completed).length;
        setSubmissionProgress(Math.round((completed / profileSections.length) * 100));
    }, [profileSections]);

    if (!event) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Handle question response changes
    const handleQuestionResponseChange = (questionId, value) => {
        setQuestionResponses(prev => ({
            ...prev,
            [questionId]: value
        }));
        // Clear error when user provides input
        if (questionErrors[questionId]) {
            setQuestionErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[questionId];
                return newErrors;
            });
        }
    };

    // Validate question responses
    const validateQuestionResponses = () => {
        const errors = {};
        let isValid = true;

        eventQuestions.forEach(question => {
            if (question.is_required) {
                const response = questionResponses[question.id];
                let hasValue = false;

                if (question.field_type === 'file') {
                    hasValue = response instanceof File;
                } else if (question.field_type === 'multiselect') {
                    hasValue = Array.isArray(response) && response.length > 0;
                } else {
                    hasValue = response && String(response).trim() !== '';
                }

                if (!hasValue) {
                    errors[question.id] = "This field is required";
                    isValid = false;
                }
            }
        });

        setQuestionErrors(errors);
        return isValid;
    };

    const handleSubmit = async () => {
        // Validate question responses if there are any
        if (eventQuestions.length > 0 && !validateQuestionResponses()) {
            toast.error("Please fill in all required questions");
            setActiveTab("application");
            setActiveSection("questions");
            return;
        }

        try {
            // Build form data for submission with responses
            const formData = new FormData();
            formData.append("team_name", form.getValues("fullName") + "'s Team");
            formData.append("role", "Participant");
            formData.append("motivation", form.getValues("bio") || "Excited to participate!");
            formData.append("is_solo", "true");

            // Add question responses
            eventQuestions.forEach(question => {
                const response = questionResponses[question.id];
                if (response !== undefined && response !== null) {
                    if (question.field_type === 'file' && response instanceof File) {
                        formData.append(`response_file_${question.id}`, response);
                    } else if (question.field_type === 'multiselect' && Array.isArray(response)) {
                        response.forEach(opt => {
                            formData.append(`responses[${question.id}][]`, opt);
                        });
                    } else if (response) {
                        formData.append(`responses[${question.id}]`, response);
                    }
                }
            });

            // Use new endpoint if there are questions, otherwise use simple apply
            if (eventQuestions.length > 0) {
                await eventsAPI.applyWithResponses(event.slug, formData);
            } else {
                await eventsAPI.apply(event.slug, {
                    team_name: form.getValues("fullName") + "'s Team",
                    role: "Participant",
                    motivation: form.getValues("bio") || "Excited to participate!",
                });
            }

            toast.success("Application submitted successfully!");
            router.push("/dashboard");
        } catch (error) {
            toast.error(error.response?.data?.error || error.message || "Failed to submit application");
        }
    };

    const toggleSection = (sectionId) => {
        setActiveSection(activeSection === sectionId ? null : sectionId);
    };

    const handleSectionSave = (sectionId) => {
        // Special handling for questions section
        if (sectionId === "questions") {
            // Validate required questions
            if (!validateQuestionResponses()) {
                toast.error("Please fill in all required questions");
                return;
            }
        }

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
                                    <CardContent className="p-8 prose prose-neutral max-w-none dark:prose-invert">
                                        <h2 className="text-2xl font-bold text-foreground mb-4 not-prose">About the Event</h2>
                                        <div className="relative">
                                            <div
                                                className={`prose max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground prose-li:text-muted-foreground overflow-hidden transition-all duration-300 ${!isDescriptionExpanded ? 'max-h-[240px]' : ''}`}
                                            >
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    components={{
                                                        a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" />
                                                    }}
                                                >
                                                    {(event.about || event.description || "No description provided.").replace(/\n/g, "  \n")}
                                                </ReactMarkdown>
                                            </div>
                                            {!isDescriptionExpanded && (
                                                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-card to-transparent pointer-events-none" />
                                            )}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                            className="mt-4 text-primary hover:text-primary/80 not-prose"
                                        >
                                            {isDescriptionExpanded ? (
                                                <>
                                                    <ChevronUp className="w-4 h-4 mr-2" />
                                                    Show less
                                                </>
                                            ) : (
                                                <>
                                                    <ChevronDown className="w-4 h-4 mr-2" />
                                                    Read more
                                                </>
                                            )}
                                        </Button>

                                        {/* Quick Facts */}
                                        <div className="mt-8 grid md:grid-cols-2 gap-4">
                                            <div className="p-4 rounded-lg border bg-muted/40">
                                                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Mode</p>
                                                <p className="font-semibold text-foreground">{event.mode ? event.mode.charAt(0).toUpperCase() + event.mode.slice(1) : "-"}</p>
                                                <p className="text-sm text-muted-foreground">{event.venue || event.city || "Online"}</p>
                                            </div>
                                            <div className="p-4 rounded-lg border bg-muted/40">
                                                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Registration Window</p>
                                                <p className="font-semibold text-foreground">
                                                    {event.registration_start ? new Date(event.registration_start).toLocaleString() : "TBA"}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {event.registration_end ? `Closes ${new Date(event.registration_end).toLocaleString()}` : "Closing date TBA"}
                                                </p>
                                            </div>
                                            <div className="p-4 rounded-lg border bg-muted/40">
                                                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Team Size</p>
                                                <p className="font-semibold text-foreground">{event.team_min} - {event.team_max} members</p>
                                            </div>
                                            <div className="p-4 rounded-lg border bg-muted/40">
                                                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Max Participants</p>
                                                <p className="font-semibold text-foreground">{event.max_participants || "Unlimited"}</p>
                                            </div>
                                        </div>

                                        {/* Organizer Contacts */}
                                        {(event.organizerEmail || event.website || event.discord_link) && (
                                            <div className="mt-6 p-4 rounded-lg border bg-muted/40">
                                                <p className="text-sm font-semibold text-foreground mb-2">Organizer Contacts</p>
                                                <div className="space-y-2 text-sm text-muted-foreground">
                                                    {event.organizerEmail && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-foreground">Email:</span>
                                                            <a className="text-primary hover:underline" href={`mailto:${event.organizerEmail}`}>{event.organizerEmail}</a>
                                                        </div>
                                                    )}
                                                    {event.website && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-foreground">Website:</span>
                                                            <a className="text-primary hover:underline" href={event.website} target="_blank" rel="noopener noreferrer">{event.website}</a>
                                                        </div>
                                                    )}
                                                    {event.community_link && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-foreground">Community:</span>
                                                            <a className="text-primary hover:underline" href={event.community_link} target="_blank" rel="noopener noreferrer">Join server</a>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Tracks & Themes */}
                                        {(event.tracks?.length || event.themes?.length) ? (
                                            <div className="mt-8 grid md:grid-cols-2 gap-6">
                                                {event.themes?.length ? (
                                                    <div>
                                                        <p className="text-sm font-semibold text-foreground mb-2">Themes</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {event.themes.map((theme, idx) => (
                                                                <Badge key={idx} variant="secondary">{theme}</Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : null}
                                                {event.tracks?.length ? (
                                                    <div>
                                                        <p className="text-sm font-semibold text-foreground mb-2">Tracks</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {event.tracks.map((track, idx) => (
                                                                <Badge key={idx} variant="outline">{track}</Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : null}
                                            </div>
                                        ) : null}

                                        {/* Rules & Eligibility */}
                                        {(event.rules || event.eligibility) && (
                                            <div className="mt-8 grid md:grid-cols-2 gap-6">
                                                {event.rules && (
                                                    <div>
                                                        <p className="text-sm font-semibold text-foreground mb-2">Rules</p>
                                                        <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground prose-li:text-muted-foreground">
                                                            <ReactMarkdown
                                                                remarkPlugins={[remarkGfm]}
                                                                components={{
                                                                    a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" />
                                                                }}
                                                            >
                                                                {event.rules.replace(/\n/g, "  \n")}
                                                            </ReactMarkdown>
                                                        </div>
                                                    </div>
                                                )}
                                                {event.eligibility && (
                                                    <div>
                                                        <p className="text-sm font-semibold text-foreground mb-2">Eligibility</p>
                                                        <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground prose-li:text-muted-foreground">
                                                            <ReactMarkdown
                                                                remarkPlugins={[remarkGfm]}
                                                                components={{
                                                                    a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" />
                                                                }}
                                                            >
                                                                {event.eligibility.replace(/\n/g, "  \n")}
                                                            </ReactMarkdown>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="prizes">
                                <Card className="border-none shadow-sm">
                                    <CardContent className="p-8">
                                        <h2 className="text-2xl font-bold text-foreground mb-6">Prizes & Rewards</h2>

                                        {/* Total Prize Pool */}
                                        <div className="p-6 bg-warning/5 rounded-xl border border-warning/10 mb-6">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Trophy className="w-6 h-6 text-warning" />
                                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Total Prize Pool</p>
                                            </div>
                                            <p className="text-3xl font-bold text-warning">{event.prize_pool || event.prizes || "To be announced"}</p>
                                        </div>

                                        {/* Individual Prizes */}
                                        {event.prizes && Array.isArray(event.prizes) && event.prizes.length > 0 ? (
                                            <div className="space-y-3">
                                                <h3 className="text-lg font-semibold text-foreground mb-4">Prize Distribution</h3>
                                                {event.prizes.map((prize, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                                                    >
                                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${index === 0 ? 'bg-yellow-500/10 text-yellow-600' :
                                                            index === 1 ? 'bg-gray-400/10 text-gray-600' :
                                                                index === 2 ? 'bg-orange-600/10 text-orange-600' :
                                                                    'bg-primary/10 text-primary'
                                                            }`}>
                                                            <Trophy className="w-6 h-6" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-semibold text-foreground">{prize.position}</p>
                                                            <p className="text-sm text-muted-foreground">{prize.reward}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <p className="text-muted-foreground">Individual prize details will be announced soon.</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="schedule">
                                <Card className="border-none shadow-sm">
                                    <CardContent className="p-8">
                                        <h2 className="text-2xl font-bold text-foreground mb-6">Schedule</h2>
                                        <div className="space-y-6">
                                            <div className="flex gap-6">
                                                <div className="w-40 flex-shrink-0 text-right text-muted-foreground font-medium pt-1">
                                                    {event.registration_start ? formatEventDate(event.registration_start) : "TBA"}
                                                    <div className="text-[10px] text-muted-foreground font-mono">
                                                        {event.registration_start ? new Date(event.registration_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                                                    </div>
                                                </div>
                                                <div className="flex-1 pb-6 border-l-2 border-muted pl-6 relative">
                                                    <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-amber-500 border-4 border-background shadow-sm" />
                                                    <h4 className="text-lg font-semibold text-foreground">Registration Opens</h4>
                                                    <p className="text-muted-foreground">Start forming teams and apply {event.registration_start && `(${getRelativeTime(event.registration_start)})`}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-6">
                                                <div className="w-40 flex-shrink-0 text-right text-muted-foreground font-medium pt-1">
                                                    {event.registration_end ? formatEventDate(event.registration_end) : "TBA"}
                                                    <div className="text-[10px] text-muted-foreground font-mono">
                                                        {event.registration_end ? new Date(event.registration_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                                                    </div>
                                                </div>
                                                <div className="flex-1 pb-6 border-l-2 border-muted pl-6 relative">
                                                    <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-orange-500 border-4 border-background shadow-sm" />
                                                    <h4 className="text-lg font-semibold text-foreground">Registration Closes</h4>
                                                    <p className="text-muted-foreground">Ensure you submit your application in time {event.registration_end && `(${getRelativeTime(event.registration_end)})`}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-6">
                                                <div className="w-40 flex-shrink-0 text-right text-muted-foreground font-medium pt-1">
                                                    {event.startDate ? formatEventDate(event.startDate) : "TBA"}
                                                    <div className="text-[10px] text-muted-foreground font-mono">
                                                        {event.startDate ? new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                                                    </div>
                                                </div>
                                                <div className="flex-1 pb-6 border-l-2 border-muted pl-6 relative">
                                                    <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-primary border-4 border-background shadow-sm" />
                                                    <h4 className="text-lg font-semibold text-foreground">Event Starts</h4>
                                                    <p className="text-muted-foreground">Opening Ceremony & Hacking Begins {event.startDate && `(${getRelativeTime(event.startDate)})`}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-6">
                                                <div className="w-40 flex-shrink-0 text-right text-muted-foreground font-medium pt-1">
                                                    {event.endDate ? formatEventDate(event.endDate) : "TBA"}
                                                    <div className="text-[10px] text-muted-foreground font-mono">
                                                        {event.endDate ? new Date(event.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                                                    </div>
                                                </div>
                                                <div className="flex-1 pl-6 relative border-l-2 border-transparent">
                                                    <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-foreground border-4 border-background shadow-sm" />
                                                    <h4 className="text-lg font-semibold text-foreground">Event Ends</h4>
                                                    <p className="text-muted-foreground">Submission Deadline & Closing {event.endDate && `(${getRelativeTime(event.endDate)})`}</p>
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
                                            Join the official community server to find teammates, get support, and clarify queries.
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="font-semibold shadow-sm"
                                        asChild
                                        disabled={!event.community_link}
                                    >
                                        <a href={event.community_link || '#'} target="_blank" rel="noopener noreferrer">
                                            {event.community_link ? "Join Community" : "Link unavailable"}
                                        </a>
                                    </Button>
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
                                                    <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center ${section.completed ? 'bg-success text-white' : 'bg-muted text-muted-foreground'}`}>
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
                                                            {section.id === "questions" && eventQuestions.length > 0 && (
                                                                <DynamicQuestionForm
                                                                    questions={eventQuestions}
                                                                    responses={questionResponses}
                                                                    onResponseChange={handleQuestionResponseChange}
                                                                    errors={questionErrors}
                                                                />
                                                            )}
                                                            {section.id === "submission" && <EventSubmissionStep event={event} existingTeam={existingTeam} />}
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
                        {/* Email Verification Alert */}
                        {authAPI.getUser() && !authAPI.getUser().email_verified && (
                            <Card className="border-warning bg-warning/5 shadow-sm">
                                <CardContent className="p-4 flex items-start gap-4">
                                    <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-warning">Email Not Verified</p>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Your application status will remain <span className="font-bold text-foreground">Pending</span> until you verify your email address.
                                        </p>
                                        <Button variant="link" className="p-0 h-auto text-xs text-primary font-bold" onClick={() => router.push('/dashboard/profile')}>
                                            Verify Email Now
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Card className="border-none shadow-md overflow-hidden bg-card">
                            <CardContent className="p-0">
                                {/* Status Header */}
                                <div className="p-6 pb-0">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-16 bg-success/5 rounded-lg border border-success/10 flex flex-col items-center justify-center gap-1 flex-shrink-0">
                                            <div className="w-8 h-1 bg-success rounded-full" />
                                            <div className="w-8 h-1 bg-success rounded-full" />
                                            <div className="w-6 h-1 bg-success rounded-full" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-muted-foreground tracking-wider uppercase mb-1">APPLICATION FILLED</p>
                                            <p className="text-4xl font-bold text-foreground">{submissionProgress}%</p>
                                        </div>
                                    </div>
                                    <Progress value={submissionProgress} className="h-1.5 mt-6 mb-2" />
                                </div>

                                {/* Vertical Stepper Progress Bar - Redesigned */}
                                <div className="p-6 space-y-0">
                                    <p className="text-xs font-bold text-muted-foreground tracking-wider uppercase mb-4">PROFILE COMPLETION</p>
                                    <div className="relative space-y-0">
                                        {profileSections.map((section, index) => {
                                            const isLast = index === profileSections.length - 1;
                                            return (
                                                <div key={section.id} className="flex gap-4 relative">
                                                    {/* Connecting Line */}
                                                    {!isLast && (
                                                        <div className={`absolute left-[11px] top-6 w-0.5 h-[calc(100%-8px)] transition-colors duration-300 ${section.completed ? 'bg-primary' : 'bg-muted-foreground/20'
                                                            }`} />
                                                    )}

                                                    {/* Step Indicator */}
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center relative z-10 flex-shrink-0 transition-all duration-300 ${section.completed
                                                        ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30'
                                                        : activeSection === section.id
                                                            ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 animate-pulse'
                                                            : 'bg-muted border-2 border-muted-foreground/30 text-muted-foreground'
                                                        }`}>
                                                        {section.completed ? (
                                                            <CheckCircle2 className="w-4 h-4" />
                                                        ) : (
                                                            <span className="text-xs font-bold">{index + 1}</span>
                                                        )}
                                                    </div>

                                                    {/* Step Content */}
                                                    <div className="flex-1 pb-6">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className={`text-sm font-medium transition-colors ${section.completed
                                                                    ? 'text-foreground'
                                                                    : activeSection === section.id
                                                                        ? 'text-amber-600 dark:text-amber-400'
                                                                        : 'text-muted-foreground'
                                                                    }`}>
                                                                    {section.title}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground mt-0.5">{section.description}</p>
                                                            </div>
                                                            {/* Status Badge */}
                                                            {section.completed ? (
                                                                <span className="text-xs text-primary font-medium flex items-center gap-1">
                                                                    <CheckCircle2 className="w-3 h-3" /> Done
                                                                </span>
                                                            ) : activeSection === section.id ? (
                                                                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Editing</span>
                                                            ) : (
                                                                <span className="text-xs text-muted-foreground">Pending</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Event Timeline */}
                                <div className="p-6 pt-0 space-y-3 border-t mt-2">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-4 h-4 text-primary" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Event Dates</p>
                                            <p className="text-sm font-medium text-foreground">
                                                {formatEventDate(event.startDate, event.endDate)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <MapPin className="w-4 h-4 text-primary" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Location</p>
                                            <p className="text-sm font-medium text-foreground">
                                                {event.mode ? event.mode.charAt(0).toUpperCase() + event.mode.slice(1) : "-"}
                                                {event.venue || event.city ? ` • ${event.venue || event.city}` : ""}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Counter */}
                                <div className="bg-primary/10 p-6 text-center border-t border-primary/20">
                                    <p className="text-xs font-bold text-primary tracking-wider uppercase mb-2">APPLICATIONS CLOSES IN</p>
                                    <p className="text-2xl font-bold text-primary font-mono">
                                        {String(countdown.days).padStart(2, '0')}d : {String(countdown.hours).padStart(2, '0')}h : {String(countdown.minutes).padStart(2, '0')}m : {String(countdown.seconds).padStart(2, '0')}s
                                    </p>
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
