"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { profileAPI } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
    Loader2,
    MapPin,
    Link as LinkIcon,
    Github,
    Linkedin,
    Twitter,
    Building2,
    GraduationCap,
    Calendar,
    Mail,
    Edit2,
    ExternalLink,
    ChevronLeft,
    User,
    Cpu,
    Trophy,
    Rocket,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";

export default function ProfilePage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const loadProfileData = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                // Fetch profile data (includes nested education, work_experience, projects)
                const profileRes = await profileAPI.get();
                setProfile(profileRes);
            } catch (error) {
                console.error("Failed to load profile data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            loadProfileData();
        }
    }, [user, authLoading]);

    if (authLoading || loading) {
        return (
            <div className="flex flex-col items-center justify-center p-10 h-96">
                <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-french-blue-100 border-t-french-blue-500 animate-spin"></div>
                </div>
                <p className="text-muted-foreground mt-4 font-medium">Loading profile...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="relative flex flex-col items-center justify-center p-12 text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-french-blue-100 to-turquoise-surf-100 flex items-center justify-center mb-6 shadow-lg">
                    <Mail className="w-10 h-10 text-french-blue-400" />
                </div>
                <p className="text-lg text-muted-foreground mb-6">Please log in to view your profile.</p>
                <Button size="lg" className="rounded-xl px-8 font-bold bg-gradient-to-r from-french-blue-500 to-french-blue-600 shadow-lg shadow-french-blue-500/25" asChild>
                    <Link href="/auth">Sign In</Link>
                </Button>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="relative flex flex-col items-center justify-center p-12 text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-destructive/20 to-destructive/10 flex items-center justify-center mb-6">
                    <Mail className="w-10 h-10 text-destructive" />
                </div>
                <p className="text-lg text-muted-foreground">Failed to load profile. Please try again later.</p>
            </div>
        );
    }

    // Extract nested data from profile
    const education = profile.education || [];
    const experience = profile.work_experience || [];
    const projects = profile.projects || [];
    const skills = profile.skills || [];

    return (
        <div className="container max-w-5xl py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Navigation */}
            <div className="flex items-center gap-2 mb-4">
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground" asChild>
                    <Link href="/dashboard">
                        <ChevronLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>
                </Button>
            </div>

            {/* Header / Basic Info - Simplified Professional Look */}
            <div className="relative overflow-hidden bg-white border border-neutral-200 rounded-3xl shadow-sm">
                {/* Subtle background accent */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-french-blue-50 to-turquoise-surf-50" />

                <div className="relative z-10 p-8 pt-12">
                    <div className="flex flex-col md:flex-row gap-8 items-end md:items-center">
                        <div className="relative">
                            <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
                                <AvatarImage
                                    src={user.avatar || profile.profile_picture}
                                    alt={user.username}
                                    className="object-cover"
                                />
                                <AvatarFallback className="text-4xl bg-neutral-100 text-neutral-400 font-bold">
                                    {user.first_name?.[0] || user.username?.[0]?.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 w-9 h-9 bg-french-blue-600 rounded-xl flex items-center justify-center shadow-lg border-2 border-white">
                                <GraduationCap className="w-4 h-4 text-white" />
                            </div>
                        </div>

                        <div className="flex-1 space-y-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
                                        {user.first_name} {user.last_name}
                                    </h1>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-lg text-french-blue-600 font-semibold">
                                            @{user.username}
                                        </p>
                                        <Badge variant="secondary" className="bg-french-blue-50 text-french-blue-700 border-0 font-medium">Pro Member</Badge>
                                    </div>
                                </div>
                                <Button size="lg" className="bg-french-blue-600 hover:bg-french-blue-700 text-white font-bold rounded-xl shadow-md gap-2 h-12 px-6" asChild>
                                    <Link href="/complete-profile">
                                        <Edit2 className="w-4 h-4" />
                                        Edit Profile
                                    </Link>
                                </Button>
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm">
                                {profile.tagline && (
                                    <p className="w-full text-base text-neutral-700 font-medium bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-2.5">
                                        {profile.tagline}
                                    </p>
                                )}

                                <div className="flex items-center gap-2 text-neutral-600 bg-neutral-50 border border-neutral-100 rounded-lg px-3 py-1.5 font-medium">
                                    <Mail className="w-4 h-4 text-french-blue-500" />
                                    {user.email}
                                    {user.email_verified ? (
                                        <Badge variant="secondary" className="ml-1 bg-green-100 text-green-700 border-green-200 text-xs py-0 px-1.5">
                                            <CheckCircle2 className="w-3 h-3 mr-0.5" />
                                            Verified
                                        </Badge>
                                    ) : (
                                        <Link href="/complete-profile" className="ml-1">
                                            <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200 text-xs py-0 px-1.5 cursor-pointer hover:bg-amber-200">
                                                <AlertCircle className="w-3 h-3 mr-0.5" />
                                                Verify
                                            </Badge>
                                        </Link>
                                    )}
                                </div>
                                {profile.location && (
                                    <div className="flex items-center gap-2 text-neutral-600 bg-neutral-50 border border-neutral-100 rounded-lg px-3 py-1.5 font-medium">
                                        <MapPin className="w-4 h-4 text-french-blue-500" />
                                        {profile.location}
                                    </div>
                                )}
                            </div>

                            {/* Social Links - Simplified */}
                            <div className="flex gap-3 pt-2">
                                {[
                                    { icon: Github, href: profile.github },
                                    { icon: Linkedin, href: profile.linkedin },
                                    { icon: Twitter, href: profile.twitter },
                                    { icon: LinkIcon, href: profile.website }
                                ].map((social, i) => social.href && (
                                    <a
                                        key={i}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 hover:border-french-blue-300 flex items-center justify-center transition-all group shadow-sm"
                                    >
                                        <social.icon className="w-5 h-5 text-neutral-500 group-hover:text-french-blue-600" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <div className="border-b">
                    <TabsList className="h-auto w-full justify-start gap-6 bg-transparent p-0">
                        <TabsTrigger
                            value="overview"
                            className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                        >
                            Overview
                        </TabsTrigger>
                        <TabsTrigger
                            value="portfolio"
                            className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                        >
                            Projects
                        </TabsTrigger>
                        <TabsTrigger
                            value="resume"
                            className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                        >
                            Resume
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Overview Tab - Enhanced sections */}
                <TabsContent value="overview" className="space-y-6 animate-in slide-in-from-left-2 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Bio & About */}
                        <Card className="md:col-span-2 border-neutral-200/60 shadow-sm overflow-hidden group">
                            <CardHeader className="bg-neutral-50/50 border-b border-neutral-100 flex flex-row items-center gap-3 space-y-0">
                                <div className="w-10 h-10 rounded-xl bg-french-blue-100 flex items-center justify-center">
                                    <User className="w-5 h-5 text-french-blue-600" />
                                </div>
                                <CardTitle className="text-lg">About Me</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <p className="leading-relaxed text-neutral-600 whitespace-pre-line text-base">
                                    {profile.bio || "No bio added yet. Tell the world about yourself!"}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Skills */}
                        <Card className="border-neutral-200/60 shadow-sm overflow-hidden">
                            <CardHeader className="bg-neutral-50/50 border-b border-neutral-100 flex flex-row items-center gap-3 space-y-0">
                                <div className="w-10 h-10 rounded-xl bg-turquoise-surf-100 flex items-center justify-center">
                                    <Cpu className="w-5 h-5 text-turquoise-surf-600" />
                                </div>
                                <CardTitle className="text-lg">Skills</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="flex flex-wrap gap-2">
                                    {skills.length > 0 ? (
                                        skills.map((skill, i) => (
                                            <Badge
                                                key={skill.id || i}
                                                variant="secondary"
                                                className="px-3 py-1.5 bg-white border border-neutral-200 text-neutral-700 hover:border-french-blue-300 hover:bg-french-blue-50/30 transition-colors cursor-default capitalize font-medium"
                                            >
                                                {typeof skill === 'object' ? skill.name : skill}
                                            </Badge>
                                        ))
                                    ) : (
                                        <div className="text-center py-4 w-full">
                                            <p className="text-sm text-neutral-400">No skills listed yet.</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Achievements */}
                    {profile.achievements && (
                        <Card className="border-neutral-200/60 shadow-sm overflow-hidden">
                            <CardHeader className="bg-neutral-50/50 border-b border-neutral-100 flex flex-row items-center gap-3 space-y-0">
                                <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                                    <Trophy className="w-5 h-5 text-yellow-600" />
                                </div>
                                <CardTitle className="text-lg">Achievements</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <p className="leading-relaxed text-neutral-600 whitespace-pre-line">
                                    {profile.achievements}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Projects Tab - Simplified Cards */}
                <TabsContent value="portfolio" className="space-y-6 animate-in slide-in-from-right-2 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {projects.length > 0 ? (
                            projects.map((project) => (
                                <Card key={project.id} className="border-neutral-200 shadow-sm hover:border-french-blue-200 hover:shadow-xl transition-all duration-300 group overflow-hidden">
                                    <CardHeader className="p-6 pb-4">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <CardTitle className="text-xl font-bold text-neutral-900 group-hover:text-french-blue-600 transition-colors">
                                                    {project.title}
                                                </CardTitle>
                                                {project.role && (
                                                    <Badge variant="secondary" className="bg-french-blue-50 text-french-blue-600 border-french-blue-100 font-bold">
                                                        {project.role}
                                                    </Badge>
                                                )}
                                            </div>
                                            {project.link && (
                                                <Button variant="outline" size="icon" className="rounded-xl hover:text-french-blue-600 hover:border-french-blue-200" asChild>
                                                    <a href={project.link} target="_blank" rel="noopener noreferrer">
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                </Button>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6 pt-0 space-y-6">
                                        <p className="text-neutral-500 line-clamp-3 text-sm font-medium leading-relaxed">
                                            {project.description || "No description provided."}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {project.technologies && project.technologies.map((tech, i) => (
                                                <Badge key={tech.id || i} variant="outline" className="text-[10px] font-bold uppercase tracking-wider bg-neutral-50 text-neutral-500 border-neutral-200">
                                                    {typeof tech === 'object' ? tech.name : tech}
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-full border-2 border-dashed border-neutral-200 rounded-3xl py-16 text-center">
                                <Rocket className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-neutral-900">No Showcase Yet</h3>
                                <p className="text-neutral-500 mb-6 font-medium">Add your projects to showcase your technical expertise.</p>
                                <Button className="bg-french-blue-600 hover:bg-french-blue-700 font-bold rounded-xl" asChild>
                                    <Link href="/complete-profile">Build Portfolio</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* Resume Tab - Refined with Timelines */}
                <TabsContent value="resume" className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                    <div className="grid gap-8">
                        {/* Experience Section */}
                        <Card className="border-neutral-200 shadow-sm overflow-hidden">
                            <CardHeader className="bg-neutral-50/50 border-b border-neutral-100 flex flex-row items-center gap-4 py-6">
                                <div className="w-12 h-12 rounded-2xl bg-french-blue-100 flex items-center justify-center">
                                    <Building2 className="w-6 h-6 text-french-blue-600" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-xl">Work Experience</CardTitle>
                                    <CardDescription className="text-sm font-medium">Your professional journey and career path.</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {experience.length > 0 ? (
                                    <div className="divide-y divide-neutral-100">
                                        {experience.map((exp) => (
                                            <div key={exp.id} className="p-8 hover:bg-neutral-50/30 transition-colors">
                                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                                    <div className="space-y-2">
                                                        <h3 className="font-bold text-xl text-neutral-900">{exp.job_title}</h3>
                                                        <div className="flex flex-wrap items-center gap-3">
                                                            <span className="text-french-blue-600 font-bold text-lg">
                                                                {exp.company_name || (exp.company?.name) || 'Company'}
                                                            </span>
                                                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                                                            <span className="flex items-center gap-1.5 text-neutral-500 font-bold text-sm bg-neutral-100 px-3 py-1 rounded-full">
                                                                <Calendar className="w-3.5 h-3.5" />
                                                                {exp.start_date} — {exp.current ? "Present" : exp.end_date}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {exp.description && (
                                                    <p className="mt-4 text-neutral-600 text-sm font-medium leading-relaxed whitespace-pre-line max-w-3xl">
                                                        {exp.description}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-12 text-center">
                                        <p className="text-neutral-500 font-bold italic">Career history is currently empty.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Education Section */}
                        <Card className="border-neutral-200 shadow-sm overflow-hidden">
                            <CardHeader className="bg-neutral-50/50 border-b border-neutral-100 flex flex-row items-center gap-4 py-6">
                                <div className="w-12 h-12 rounded-2xl bg-turquoise-surf-100 flex items-center justify-center">
                                    <GraduationCap className="w-6 h-6 text-turquoise-surf-600" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-xl">Academic Background</CardTitle>
                                    <CardDescription className="text-sm font-medium">Degrees and certifications you've earned.</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {education.length > 0 ? (
                                    <div className="divide-y divide-neutral-100">
                                        {education.map((edu) => (
                                            <div key={edu.id} className="p-8 hover:bg-neutral-50/30 transition-colors">
                                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                                    <div className="space-y-2">
                                                        <h3 className="font-bold text-xl text-neutral-900">
                                                            {edu.institution_name || (edu.institution?.name) || 'Institution'}
                                                        </h3>
                                                        <div className="flex flex-wrap items-center gap-3">
                                                            <span className="text-turquoise-surf-600 font-bold text-lg">{edu.degree}</span>
                                                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                                                            <span className="flex items-center gap-1.5 text-neutral-500 font-bold text-sm bg-neutral-100 px-3 py-1 rounded-full">
                                                                <Calendar className="w-3.5 h-3.5" />
                                                                {edu.start_date} — {edu.current ? "Present" : edu.end_date}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-12 text-center">
                                        <p className="text-neutral-500 font-bold italic">Education details have not been added yet.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
