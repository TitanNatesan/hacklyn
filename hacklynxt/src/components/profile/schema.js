import { z } from "zod";

export const profileSchema = z.object({
    // Basic Info
    profilePicture: z.any().optional(),
    fullName: z.string().min(2, "Name is required"),
    tagline: z.string().min(2, "Tagline is required"),
    bio: z.string().min(10, "Bio should be at least 10 characters"),
    skills: z.array(z.string()).min(1, "At least one skill is required"),
    location: z.string().min(2, "Location is required"),

    // Education - REQUIRED for profile completion
    education: z.array(z.object({
        degree: z.string().min(1, "Degree is required"),
        school: z.string().min(1, "School is required"),
        startDate: z.string().min(1, "Start date is required"),
        endDate: z.string().optional(),
        current: z.boolean().default(false),
    })).min(1, "At least one education entry is required"),

    // Work Experience
    workExperience: z.array(z.object({
        jobTitle: z.string().min(1, "Job title is required"),
        company: z.string().min(1, "Company is required"),
        startDate: z.string().min(1, "Start date is required"),
        endDate: z.string().optional(),
        description: z.string().optional(),
        current: z.boolean().default(false),
    })).default([]),

    // Projects - FULLY OPTIONAL
    projects: z.array(z.object({
        title: z.string().optional().default(""),
        description: z.string().optional().default(""),
        technologies: z.array(z.string()).optional().default([]),
        link: z.string().url("Must be a valid URL").optional().or(z.literal("")),
        role: z.string().optional().default(""),
    })).optional().default([]),

    // Hackathons
    hackathons: z.array(z.object({
        name: z.string().min(1, "Name is required"),
        role: z.string().min(1, "Role is required"),
        awards: z.string().optional(),
        description: z.string().optional(),
    })).default([]),

    // Achievements
    achievements: z.string().optional(),

    // Open Source
    openSource: z.array(z.object({
        projectName: z.string().min(1, "Project name is required"),
        contribution: z.string().min(1, "Contribution details required"),
        link: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    })).default([]),

    // Resume - REQUIRED for hosting/applying to events
    resume: z.any()
        .refine((val) => val !== null && val !== undefined && val !== "", {
            message: "Resume is required for hosting or applying to events",
        }),

    // Socials - GitHub and LinkedIn are REQUIRED
    github: z.string().min(1, "GitHub URL is required").url("Must be a valid GitHub URL"),
    linkedin: z.string().min(1, "LinkedIn URL is required").url("Must be a valid LinkedIn URL"),
    twitter: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    website: z.string().url("Must be a valid URL").optional().or(z.literal("")),

    // Contact
    email: z.string().email("Invalid email address"),
});
