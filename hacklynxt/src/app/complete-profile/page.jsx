"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { profileAPI } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
    ChevronLeft,
    ChevronRight,
    Check,
    User,
    GraduationCap,
    FolderGit2,
    Share2,
    FileText,
    Loader2
} from "lucide-react";
import { toast } from "sonner";

import { profileSchema } from "@/components/profile/schema";
import { BasicInfoStep } from "@/components/profile/BasicInfoStep";
import { EducationWorkStep } from "@/components/profile/EducationWorkStep";
import { ProjectsStep } from "@/components/profile/ProjectsStep";
import { SocialsStep } from "@/components/profile/SocialsStep";
import { ResumeStep } from "@/components/profile/ResumeStep";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const steps = [
    { id: 1, title: "Basic Info", icon: User, component: BasicInfoStep },
    { id: 2, title: "Education & Work", icon: GraduationCap, component: EducationWorkStep },
    { id: 3, title: "Projects", icon: FolderGit2, component: ProjectsStep },
    { id: 4, title: "Resume", icon: FileText, component: ResumeStep },
    { id: 5, title: "Socials", icon: Share2, component: SocialsStep },
];

function CompleteProfileContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, loginSuccess, isLoading: authLoading } = useAuth();

    // Parse step from URL, default to 0
    const stepParam = searchParams.get("step");
    const initialStep = stepParam ? Math.max(0, Math.min(steps.length - 1, parseInt(stepParam) - 1)) : 0;

    const [currentStep, setCurrentStep] = useState(initialStep);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Sync step with URL if it changes
    useEffect(() => {
        if (stepParam) {
            const requestedStep = parseInt(stepParam) - 1;
            if (requestedStep >= 0 && requestedStep < steps.length && requestedStep !== currentStep) {
                setCurrentStep(requestedStep);
            }
        }
    }, [stepParam]);


    const methods = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            profilePicture: null,
            fullName: "",
            tagline: "",
            bio: "",
            skills: [],
            location: "",
            email: "",
            education: [],
            workExperience: [],
            projects: [],
            hackathons: [],
            achievements: "",
            openSource: [],
            resume: null,
            github: "",
            linkedin: "",
            twitter: "",
            website: "",
        },
        mode: "onChange",
    });

    // Load existing profile data
    useEffect(() => {
        const loadInitialData = async () => {
            // Wait for auth to initialize
            if (authLoading) return;

            // If still no user after auth loaded, we can't do much but let the page render 
            // and potentially redirect elsewhere if needed (handled by ProtectedRoute usually)
            if (!user) {
                setIsLoading(false);
                return;
            }

            try {
                // ... same as before but inside the try ...
                const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ");
                let initialData = {
                    ...methods.getValues(),
                    fullName: fullName || user.username || "",
                    email: user.email || "",
                    profilePicture: user.avatar || null,
                };

                try {
                    const profileData = await profileAPI.get();
                    if (profileData) {
                        initialData = {
                            ...initialData,
                            tagline: profileData.tagline || "",
                            bio: profileData.bio || "",
                            skills: (profileData.skills || []).map(s => s.name || s),
                            location: profileData.location || "",
                            achievements: profileData.achievements || "",
                            resume: profileData.resume || null,
                            github: profileData.github || "",
                            linkedin: profileData.linkedin || "",
                            twitter: profileData.twitter || "",
                            website: profileData.website || "",
                            education: (profileData.education || []).map(edu => ({
                                school: edu.institution_name || edu.school || "",
                                degree: edu.degree || "",
                                startDate: edu.start_date || "",
                                endDate: edu.end_date || "",
                                current: edu.current || false
                            })),
                            workExperience: (profileData.work_experience || []).map(work => ({
                                company: work.company_name || work.company || "",
                                jobTitle: work.job_title || "",
                                startDate: work.start_date || "",
                                endDate: work.end_date || "",
                                current: work.current || false,
                                description: work.description || ""
                            })),
                            projects: (profileData.projects || []).map(proj => ({
                                title: proj.title || "",
                                role: proj.role || "",
                                description: proj.description || "",
                                technologies: (proj.technologies || []).map(t => t.name || t),
                                link: proj.link || ""
                            })),
                        };
                    }
                } catch (profError) {
                    console.warn("Profile fetch failed or empty", profError);
                }

                methods.reset(initialData);
            } catch (error) {
                console.error("Failed to load initial data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, [user, authLoading, methods]);

    if (isLoading || authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <p className="text-muted-foreground animate-pulse font-medium">Setting up your profile editor...</p>
                </div>
            </div>
        );
    }

    const { handleSubmit, trigger, formState: { errors } } = methods;

    // Check if a specific step is completed based on data
    const isStepComplete = (stepIndex) => {
        const data = methods.getValues();

        // Safety check if data isn't loaded yet
        if (!data) return false;

        switch (stepIndex) {
            case 0: // Basic Info
                // Check required fields: fullName, email, location, and at least one skill
                return !!(
                    data.fullName?.trim() &&
                    data.email?.trim() &&
                    data.location?.trim() &&
                    data.skills?.length > 0
                );
            case 1: // Education & Work
                // Require at least one education entry (work experience is optional)
                return data.education?.length > 0;
            case 2: // Projects
                // Projects are FULLY OPTIONAL - always mark as complete
                return true;
            case 3: // Resume
                // Resume is optional but encouraged - always mark as complete
                return true;
            case 4: // Socials
                // Require BOTH GitHub AND LinkedIn (as per requirements)
                return !!(
                    data.github?.trim() &&
                    data.linkedin?.trim()
                );
            default:
                return false;
        }
    };

    const validateCurrentStep = async () => {
        let fieldsToValidate = [];

        switch (currentStep) {
            case 0:
                fieldsToValidate = ["fullName", "tagline", "bio", "skills", "location", "email"];
                break;
            case 1:
                fieldsToValidate = ["education"];
                break;
            case 2:
                fieldsToValidate = ["projects"];
                break;
            case 3:
                fieldsToValidate = ["resume"];
                break;
            case 4:
                fieldsToValidate = ["github", "linkedin"];
                break;
        }

        const isValid = await trigger(fieldsToValidate);
        return isValid;
    };

    // Save current step data to backend (incremental save)
    const saveCurrentStepData = async () => {
        const data = methods.getValues();

        try {
            // Build payload based on current step
            let payload = {};

            switch (currentStep) {
                case 0: // Basic Info
                    payload = {
                        fullName: data.fullName,
                        email: data.email,
                        tagline: data.tagline || '',
                        bio: data.bio || '',
                        location: data.location || '',
                        skills: Array.isArray(data.skills) ? data.skills : []
                    };
                    break;
                case 1: // Education & Work
                    payload = {
                        education: (data.education || []).map(edu => ({
                            school: edu.school,
                            degree: edu.degree,
                            startDate: edu.startDate,
                            endDate: edu.endDate,
                            current: edu.current
                        })),
                        workExperience: (data.workExperience || []).map(work => ({
                            company: work.company,
                            jobTitle: work.jobTitle,
                            startDate: work.startDate,
                            endDate: work.endDate,
                            current: work.current,
                            description: work.description
                        }))
                    };
                    break;
                case 2: // Projects
                    payload = {
                        projects: (data.projects || []).map(proj => ({
                            title: proj.title,
                            role: proj.role,
                            description: proj.description,
                            technologies: proj.technologies,
                            link: proj.link
                        }))
                    };
                    break;
                case 3: // Resume
                    // Resume is uploaded directly via profileAPI.update in ResumeStep
                    // No additional save needed here
                    payload = {};
                    break;
                case 4: // Socials
                    payload = {
                        github: data.github || '',
                        linkedin: data.linkedin || '',
                        twitter: data.twitter || '',
                        website: data.website || '',
                    };
                    break;
            }

            // Only save if we have data to save
            if (Object.keys(payload).length > 0) {
                // Use .complete for all steps as it handles nested updates and name splitting reliably
                await profileAPI.complete(payload);
                toast.success("Progress saved!", { duration: 1500 });
            }

            return true;
        } catch (error) {

            console.error("Failed to save step data:", error);
            // Don't block navigation on save failure
            toast.warning("Couldn't save progress, but you can continue.");
            return true;
        }
    };

    const handleStepClick = async (index) => {
        // Validate and save current step before leaving
        await saveCurrentStepData();
        setCurrentStep(index);
    };

    const handleNext = async () => {
        const isValid = await validateCurrentStep();
        if (isValid && currentStep < steps.length - 1) {
            // Save current step data before advancing
            await saveCurrentStepData();
            setCurrentStep(currentStep + 1);
        } else if (!isValid) {
            toast.error("Please fill in all required fields correctly.");
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const onSubmit = async (data) => {
        setIsSubmitting(true);

        try {
            // Call API to complete profile
            const result = await profileAPI.complete(data);

            // Update local storage tokens if returned
            if (result.tokens) {
                if (typeof window !== 'undefined') {
                    localStorage.setItem('accessToken', result.tokens.access);
                    localStorage.setItem('refreshToken', result.tokens.refresh);
                }
            }

            // Update user state
            if (result.user) {
                loginSuccess(result.user);
            }

            toast.success("Profile completed successfully!");
            router.push("/dashboard");
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || "Failed to save profile. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const CurrentStepComponent = steps[currentStep].component;

    // Calculate progress based on number of completed steps (strict validation)
    const progress = Math.round(((steps.findIndex((_, idx) => !isStepComplete(idx)) === -1 ? steps.length : steps.findIndex((_, idx) => !isStepComplete(idx))) / steps.length) * 100);

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-secondary to-background">
            <Header />

            <main className="flex-1 pt-24 pb-12 px-4">
                <div className="container mx-auto max-w-3xl">
                    {/* Progress Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="font-display text-2xl font-bold text-foreground">
                                Complete Your Profile
                            </h1>
                            <span className="text-sm text-muted-foreground">
                                Step {currentStep + 1} of {steps.length}
                            </span>
                        </div>
                        <Progress value={progress} className="h-2" indicatorClassName="bg-primary" />
                    </div>

                    {/* Step Indicators */}
                    <div className="flex justify-between mb-8">
                        {steps.map((step, index) => {
                            const isCompleted = isStepComplete(index);
                            const isActive = index === currentStep;

                            return (
                                <div
                                    key={step.id}
                                    onClick={() => handleStepClick(index)}
                                    className={`flex flex-col items-center gap-2 cursor-pointer group transition-colors ${isActive ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                                        }`}
                                >
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${isActive
                                            ? "border-primary text-primary bg-background ring-4 ring-primary/10"
                                            : isCompleted
                                                ? "bg-primary border-primary text-primary-foreground"
                                                : "border-muted text-muted-foreground bg-secondary/30 group-hover:border-primary/50"
                                            }`}
                                    >
                                        {isCompleted && !isActive ? (
                                            <Check className="w-5 h-5" />
                                        ) : (
                                            <step.icon className="w-5 h-5" />
                                        )}
                                    </div>
                                    <span className="text-xs font-medium hidden sm:block">{step.title}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Form Card */}
                    <Card className="shadow-elevated border-none bg-card/80 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {(() => {
                                    const StepIcon = steps[currentStep].icon;
                                    return <StepIcon className="h-5 w-5 text-primary" />;
                                })()}
                                {steps[currentStep].title}
                            </CardTitle>
                            <CardDescription>
                                {currentStep === 0 && "Tell us about yourself"}
                                {currentStep === 1 && "Add your educational background and work experience"}
                                {currentStep === 2 && "Showcase your projects and hackathon experience"}
                                {currentStep === 3 && "Upload your resume for event applications"}
                                {currentStep === 4 && "Connect your social profiles"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FormProvider {...methods}>
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <CurrentStepComponent />

                                    {/* Navigation Buttons */}
                                    <div className="flex items-center justify-between mt-8 pt-6 border-t">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handlePrevious}
                                            disabled={currentStep === 0}
                                        >
                                            <ChevronLeft className="w-4 h-4 mr-2" />
                                            Previous
                                        </Button>

                                        {currentStep === steps.length - 1 ? (
                                            <Button type="submit" disabled={isSubmitting}>
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        Complete Profile
                                                        <Check className="w-4 h-4 ml-2" />
                                                    </>
                                                )}
                                            </Button>
                                        ) : (
                                            <Button type="button" onClick={handleNext}>
                                                Next
                                                <ChevronRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        )}
                                    </div>
                                </form>
                            </FormProvider>
                        </CardContent>
                    </Card>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default function CompleteProfilePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-secondary to-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <p className="text-muted-foreground animate-pulse">Initializing profile editor...</p>
                </div>
            </div>
        }>
            <CompleteProfileContent />
        </Suspense>
    );
}

