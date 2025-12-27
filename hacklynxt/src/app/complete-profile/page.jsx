"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
    Loader2
} from "lucide-react";
import { toast } from "sonner";

import { profileSchema } from "@/components/profile/schema";
import { BasicInfoStep } from "@/components/profile/BasicInfoStep";
import { EducationWorkStep } from "@/components/profile/EducationWorkStep";
import { ProjectsStep } from "@/components/profile/ProjectsStep";
import { SocialsStep } from "@/components/profile/SocialsStep";

const steps = [
    { id: 1, title: "Basic Info", icon: User, component: BasicInfoStep },
    { id: 2, title: "Education & Work", icon: GraduationCap, component: EducationWorkStep },
    { id: 3, title: "Projects", icon: FolderGit2, component: ProjectsStep },
    { id: 4, title: "Socials", icon: Share2, component: SocialsStep },
];

export default function CompleteProfilePage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const methods = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            profilePicture: null,
            fullName: "",
            tagline: "",
            bio: "",
            skills: "",
            location: "",
            email: "",
            education: [],
            workExperience: [],
            projects: [],
            hackathons: [],
            achievements: "",
            openSource: [],
            github: "",
            linkedin: "",
            twitter: "",
            website: "",
        },
        mode: "onChange",
    });

    const { handleSubmit, trigger, formState: { errors } } = methods;

    const progress = ((currentStep + 1) / steps.length) * 100;

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
                fieldsToValidate = ["github", "linkedin"];
                break;
        }

        const isValid = await trigger(fieldsToValidate);
        return isValid;
    };

    const handleNext = async () => {
        const isValid = await validateCurrentStep();
        if (isValid && currentStep < steps.length - 1) {
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
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            toast.success("Profile completed successfully!");
            router.push("/dashboard");
        } catch (error) {
            toast.error("Failed to save profile. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const CurrentStepComponent = steps[currentStep].component;

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-secondary/30 to-background">
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
                        <Progress value={progress} className="h-2" />
                    </div>

                    {/* Step Indicators */}
                    <div className="flex justify-between mb-8">
                        {steps.map((step, index) => (
                            <div
                                key={step.id}
                                className={`flex flex-col items-center gap-2 ${index <= currentStep ? "text-primary" : "text-muted-foreground"
                                    }`}
                            >
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${index < currentStep
                                            ? "bg-primary border-primary text-primary-foreground"
                                            : index === currentStep
                                                ? "border-primary text-primary"
                                                : "border-muted text-muted-foreground"
                                        }`}
                                >
                                    {index < currentStep ? (
                                        <Check className="w-5 h-5" />
                                    ) : (
                                        <step.icon className="w-5 h-5" />
                                    )}
                                </div>
                                <span className="text-xs font-medium hidden sm:block">{step.title}</span>
                            </div>
                        ))}
                    </div>

                    {/* Form Card */}
                    <Card>
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
                                {currentStep === 3 && "Connect your social profiles"}
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
