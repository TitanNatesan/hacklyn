
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

import { profileSchema, ProfileFormValues } from "@/components/profile/schema";
import { BasicInfoStep } from "@/components/profile/BasicInfoStep";
import { EducationWorkStep } from "@/components/profile/EducationWorkStep";
import { ProjectsStep } from "@/components/profile/ProjectsStep";
import { SocialsStep } from "@/components/profile/SocialsStep";

const steps = [
  { id: "basic", title: "Basic Info", description: "Let's start with the basics" },
  { id: "edu-work", title: "Experience", description: "Your academic and professional journey" },
  { id: "projects", title: "Projects", description: "Showcase your work and achievements" },
  { id: "socials", title: "Socials", description: "Where can people find you?" },
];

const CompleteProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = location.pathname.includes("profile") && location.pathname.includes("dashboard");
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      tagline: "",
      bio: "",
      skills: "",
      location: "",
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
      email: "",
    },
    mode: "onChange",
  });

  const { trigger, handleSubmit } = form;

  const nextStep = async () => {
    let fieldsToValidate: (keyof ProfileFormValues)[] = [];

    // Validate current step fields
    if (currentStep === 0) {
      fieldsToValidate = ["fullName", "tagline", "bio", "skills", "location", "email"];
    } else if (currentStep === 1) {
      // Arrays are harder to validate by key, checking if any required fields are missing inside arrays
      // But trigger("education") should work if schema covers it.
      fieldsToValidate = ["education", "workExperience"];
    } else if (currentStep === 2) {
      fieldsToValidate = ["projects", "hackathons", "openSource"];
    } else if (currentStep === 3) {
      fieldsToValidate = ["github", "linkedin", "twitter", "website"];
    }

    const isValid = await trigger(fieldsToValidate);

    if (isValid) {
      if (currentStep < steps.length - 1) {
        setCurrentStep((prev) => prev + 1);
        window.scrollTo(0, 0);
      } else {
        // If last step, submit
        onSubmit(form.getValues());
      }
    } else {
      toast.error("Please fix the errors before proceeding.");
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    console.log("Submitting profile data:", data);

    try {
      const { profileAPI } = await import("@/lib/api");
      await profileAPI.complete({
        tagline: data.tagline,
        bio: data.bio,
        skills: data.skills,
        location: data.location,
        achievements: data.achievements,
        github: data.github,
        linkedin: data.linkedin,
        twitter: data.twitter,
        website: data.website,
        education: data.education,
        work_experience: data.workExperience,
        projects: data.projects,
        hackathons: data.hackathons,
        open_source: data.openSource,
      });

      toast.success(isEditing ? "Profile updated successfully!" : "Profile completed successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Profile error:", error);
      toast.error("Failed to save profile. Please try again.");
    }

    setIsLoading(false);
  };


  const handleSkip = () => {
    toast.info("You can complete your profile later from the dashboard.");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container max-w-4xl py-12 px-4 mt-16">
        <div className="mb-8 text-center animate-fade-up relative">
          {!isEditing && (
            <Button
              variant="ghost"
              className="absolute right-0 top-0 hidden md:flex"
              onClick={handleSkip}
            >
              Skip for now
            </Button>
          )}
          <h1 className="text-3xl font-display font-bold mb-2">
            {isEditing ? "Edit Your Profile" : "Complete Your Profile"}
          </h1>
          <p className="text-muted-foreground mb-4">
            {isEditing
              ? "Update your information to keep your profile fresh."
              : "Tell us more about yourself to get the most out of Hacklyn."
            }
          </p>
          {!isEditing && (
            <Button variant="link" onClick={handleSkip} className="text-muted-foreground md:hidden">
              Skip for now
            </Button>
          )}
        </div>

        {/* Stepper */}
        <div className="mb-8">
          <div className="flex justify-between items-center relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-secondary -z-10 rounded-full" />
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            />

            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center gap-2 bg-background p-2">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                    ${index <= currentStep
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-background border-muted-foreground/30 text-muted-foreground"
                    }
                  `}
                >
                  {index < currentStep ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <span className="font-semibold">{index + 1}</span>
                  )}
                </div>
                <span className={`text-xs font-medium hidden md:block ${index <= currentStep ? "text-primary" : "text-muted-foreground"}`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Card className="border-muted/50 shadow-lg animate-fade-up">
          <CardHeader>
            <CardTitle>{steps[currentStep].title}</CardTitle>
            <CardDescription>{steps[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {currentStep === 0 && <BasicInfoStep />}
                {currentStep === 1 && <EducationWorkStep />}
                {currentStep === 2 && <ProjectsStep />}
                {currentStep === 3 && <SocialsStep />}
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-between border-t bg-muted/20 p-6">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0 || isLoading}
              className={currentStep === 0 ? "invisible" : ""}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <Button
              type="button"
              onClick={nextStep}
              disabled={isLoading}
              className="px-8"
              variant={currentStep === steps.length - 1 ? "default" : "secondary"}
            >
              {isLoading ? (
                "Saving..."
              ) : currentStep === steps.length - 1 ? (
                <>
                  {isEditing ? "Save Changes" : "Complete Profile"}
                  <CheckCircle2 className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Next Step
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default CompleteProfile;
