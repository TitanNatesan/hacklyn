import { z } from "zod";

export const profileSchema = z.object({
    // Basic Info
    profilePicture: z.any().optional(),
    fullName: z.string().min(2, "Name is required"),
    tagline: z.string().min(2, "Tagline is required"),
    bio: z.string().min(10, "Bio should be at least 10 characters"),
    skills: z.string().min(1, "At least one skill is required"),
    location: z.string().min(2, "Location is required"),

    // Education
    education: z.array(z.object({
        degree: z.string().min(1, "Degree is required"),
        school: z.string().min(1, "School is required"),
        startDate: z.string().min(1, "Start date is required"),
        endDate: z.string().optional(),
        current: z.boolean().default(false),
    })).min(1, "Please add at least one education"),

    // Work Experience
    workExperience: z.array(z.object({
        jobTitle: z.string().min(1, "Job title is required"),
        company: z.string().min(1, "Company is required"),
        startDate: z.string().min(1, "Start date is required"),
        endDate: z.string().optional(),
        description: z.string().optional(),
        current: z.boolean().default(false),
    })).default([]),

    // Projects
    projects: z.array(z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string().min(1, "Description is required"),
        technologies: z.string().min(1, "Technologies are required"),
        link: z.string().url("Must be a valid URL").optional().or(z.literal("")),
        role: z.string().min(1, "Role is required"),
    })).min(1, "Please add at least one project"),

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

    // Socials
    github: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    linkedin: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    twitter: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    website: z.string().url("Must be a valid URL").optional().or(z.literal("")),

    // Contact
    email: z.string().email("Invalid email address"),
});
