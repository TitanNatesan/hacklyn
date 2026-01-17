"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { OrganizationPicker } from "@/components/ui/OrganizationPicker";
import {
    MapPin, Trophy, Rocket, ArrowRight, Loader2,
    Upload, X, ImageIcon, Clock, CalendarIcon, Plus, Trash2, GripVertical, Save, Globe, Shield, FileQuestion, Users
} from "lucide-react";
import { eventsAPI } from "@/lib/api";
import { toast } from "sonner";
import { MarkdownEditor } from "@/components/ui/MarkdownEditor";
import { TagInput } from "@/components/ui/TagInput";
import { DateTimePicker } from "@/components/ui/DateTimePicker";
import { Switch } from "@/components/ui/switch";
import { QuestionBuilder } from "@/components/events/QuestionBuilder";
import { CoOrganizerManager } from "@/components/events/CoOrganizerManager";
import { authAPI } from "@/lib/api";

const eventSchema = z.object({
    name: z.string().min(5, "Name must be at least 5 characters"),
    tagline: z.string().max(300).optional(),
    description: z.string().min(50, "Description must be at least 50 characters"),
    organizer_name: z.string().min(2, "Organizer name is required"),
    is_company: z.boolean().default(false),
    mode: z.enum(["online", "offline", "hybrid"]),
    venue: z.string().optional(),
    city: z.string().optional(),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
    registration_start: z.string().optional(),
    registration_end: z.string().optional(),
    organizer_email: z.union([z.string().email("Enter a valid email"), z.literal("")]).optional(),
    website: z.union([z.string().url("Enter a valid URL"), z.literal("")]).optional(),
    discord_link: z.union([z.string().url("Enter a valid URL"), z.literal("")]).optional(),
    team_min: z.coerce.number().min(1).default(1),
    team_max: z.coerce.number().min(1).default(4),
    max_participants: z.union([
        z.coerce.number().min(1, "Must be at least 1"),
        z.literal("").transform(() => undefined)
    ]).optional(),
    prize_pool: z.string().optional(),
    prizes: z.array(z.object({
        position: z.string().min(1, "Title/Position is required"),
        reward: z.string().min(1, "Prize/Reward is required"),
    })).default([]),
    tracks: z.array(z.string()).default([]),
    themes: z.array(z.string()).default([]),
    rules: z.string().optional(),
    eligibility: z.string().optional(),
    status: z.enum(["draft", "published", "ongoing", "completed", "cancelled"]).default("draft"),
});

// Enhanced ImageUpload dealing with initial URLs
function ImageUpload({ label, description, aspectRatio, value, onChange, initialPreview, accept = "image/*" }) {
    const inputRef = useRef(null);
    const [preview, setPreview] = useState(initialPreview);

    useEffect(() => {
        if (initialPreview) {
            setPreview(initialPreview);
        }
    }, [initialPreview]);

    const handleChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            onChange(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleRemove = () => {
        onChange(null);
        setPreview(null);
        if (inputRef.current) inputRef.current.value = "";
    };

    return (
        <div className="space-y-2">
            <div className="text-sm font-medium">{label}</div>
            <div
                className={`border-2 border-dashed rounded-lg transition-colors hover:border-primary/50 ${preview ? "border-primary" : "border-muted-foreground/25"
                    }`}
                style={{ aspectRatio }}
            >
                {preview ? (
                    <div className="relative w-full h-full min-h-[120px]">
                        <Image
                            src={preview}
                            alt="Preview"
                            fill
                            className="object-cover rounded-lg"
                            unoptimized
                        />
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <div
                        className="flex flex-col items-center justify-center h-full min-h-[120px] cursor-pointer p-4"
                        onClick={() => inputRef.current?.click()}
                    >
                        <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground text-center">{description}</p>
                        <Button type="button" variant="ghost" size="sm" className="mt-2">
                            <Upload className="h-4 w-4 mr-2" />
                            Choose File
                        </Button>
                    </div>
                )}
            </div>
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                onChange={handleChange}
                className="hidden"
            />
        </div>
    );
}

export default function EditEventPage() {
    const params = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // File states (separate from form which handles text)
    const [logo, setLogo] = useState(null);
    const [banner, setBanner] = useState(null);

    // Initial image URLs for preview
    const [initialLogo, setInitialLogo] = useState(null);
    const [initialBanner, setInitialBanner] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [isMainOrganizer, setIsMainOrganizer] = useState(false);

    const form = useForm({
        resolver: zodResolver(eventSchema),
        defaultValues: {
            name: "",
            tagline: "",
            description: "",
            organizer_name: "",
            is_company: false,
            mode: "online",
            venue: "",
            city: "",
            start_date: "",
            end_date: "",
            registration_start: "",
            registration_end: "",
            organizer_email: "",
            website: "",
            discord_link: "",
            prize_pool: "",
            prizes: [],
            team_min: 1,
            team_max: 4,
            max_participants: "",
            tracks: [],
            themes: [],
            rules: "",
            eligibility: "",
            status: "draft",
        },
    });

    const { fields: prizeFields, append: appendPrize, remove: removePrize } = useFieldArray({
        control: form.control,
        name: "prizes",
    });

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const data = await eventsAPI.get(params.slug);
                // Pre-fill form
                form.reset({
                    name: data.name,
                    tagline: data.tagline || "",
                    description: data.description,
                    organizer_name: data.organizer_name,
                    is_company: false, // Backend doesn't strictly store this on Event, only on Organization? Assuming false or need check
                    mode: data.mode,
                    venue: data.venue || "",
                    city: data.city || "",
                    start_date: data.start_date,
                    end_date: data.end_date,
                    registration_start: data.registration_start || "",
                    registration_end: data.registration_end || "",
                    organizer_email: data.organizer_email || "",
                    website: data.website || "",
                    discord_link: data.discord_link || "",
                    prize_pool: data.prize_pool || "",
                    prizes: data.prizes || [],
                    team_min: data.team_min,
                    team_max: data.team_max,
                    max_participants: data.max_participants ?? "",
                    tracks: data.tracks ? data.tracks.split(',').map(s => s.trim()).filter(Boolean) : [],
                    themes: data.themes ? data.themes.split(',').map(s => s.trim()).filter(Boolean) : [],
                    rules: data.rules || "",
                    eligibility: data.eligibility || "",
                    status: data.status,
                });

                setInitialLogo(data.logo);
                setInitialBanner(data.cover_image);

                // Check if current user is the main organizer
                try {
                    const currentUser = await authAPI.getMe();
                    setIsMainOrganizer(data.organizer?.id === currentUser?.id);
                } catch (userError) {
                    console.warn("Could not verify organizer status:", userError);
                }

                // Fetch event questions
                try {
                    const questionsData = await eventsAPI.getQuestions(params.slug);
                    // Handle paginated response if applicable
                    const questionsArray = Array.isArray(questionsData)
                        ? questionsData
                        : (questionsData?.results || []);
                    setQuestions(questionsArray);
                } catch (qError) {
                    console.error("Failed to fetch questions:", qError);
                }
            } catch (error) {
                console.error("Failed to fetch event:", error);
                toast.error("Failed to load event details");
                router.push("/events");
            } finally {
                setLoading(false);
            }
        };

        if (params.slug) {
            fetchEvent();
        }
    }, [params.slug, form, router]);

    const onSubmit = async (data) => {
        setSaving(true);
        try {
            const formData = new FormData();

            // Add text fields
            Object.entries(data).forEach(([key, value]) => {
                if (value !== undefined && value !== null && key !== 'prizes') {
                    if (Array.isArray(value)) {
                        formData.append(key, value.join(", "));
                    } else if (typeof value === 'boolean') {
                        formData.append(key, value ? 'true' : 'false');
                    } else {
                        formData.append(key, value);
                    }
                }
            });

            if (data.prizes) {
                formData.append("prizes_data", JSON.stringify(data.prizes));
            }

            // Add new images if selected
            if (logo) formData.append("logo", logo);
            if (banner) formData.append("cover_image", banner);

            // Using commonAPI or eventsAPI.update (need to verify if update supports multipart in `api.js`)
            await eventsAPI.update(params.slug, formData);

            // Save questions if any were added
            try {
                await eventsAPI.bulkSaveQuestions(params.slug, questions);
            } catch (questionError) {
                console.error("Failed to save questions:", questionError);
                toast.warning("Event updated but questions could not be saved.");
            }

            toast.success("Event updated successfully!");
            router.push(`/events/${params.slug}`);
        } catch (error) {
            console.error("Failed to update event:", error);
            toast.error("Failed to update event");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />

            <main className="flex-1 pt-24 pb-12">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground mb-2">Edit Event</h1>
                            <p className="text-muted-foreground">
                                Update details for <span className="font-semibold text-primary">{form.getValues('name')}</span>
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                        </div>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">


                            <Accordion type="single" collapsible defaultValue="basic-info" className="w-full space-y-4">

                                {/* Basic Information */}
                                <AccordionItem value="basic-info" className="bg-white border text-card-foreground shadow-sm rounded-xl px-2">
                                    <AccordionTrigger className="px-4 hover:no-underline">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                                <Rocket className="w-5 h-5" />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-semibold text-lg leading-none">Basic Information</p>
                                                <p className="text-sm text-muted-foreground font-normal mt-1">The core details of your event</p>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-6 pt-2">
                                        <div className="space-y-6">
                                            <FormField
                                                control={form.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Event Name</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <FormField
                                                    control={form.control}
                                                    name="organizer_name"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Organizer Name</FormLabel>
                                                            <FormControl>
                                                                <OrganizationPicker
                                                                    value={field.value}
                                                                    onChange={field.onChange}
                                                                    onTypeChange={(isCompany) => form.setValue('is_company', isCompany)}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="tagline"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Tagline</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <FormField
                                                control={form.control}
                                                name="description"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Full Description</FormLabel>
                                                        <FormControl>
                                                            <MarkdownEditor
                                                                value={field.value || ""}
                                                                onChange={field.onChange}
                                                                minHeight="200px"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="grid md:grid-cols-3 gap-6">
                                                <FormField
                                                    control={form.control}
                                                    name="organizer_email"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Organizer Email</FormLabel>
                                                            <FormControl>
                                                                <Input type="email" placeholder="contact@yourorg.com" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="website"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Website</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="https://example.com" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="discord_link"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Discord / Community Link</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="https://discord.gg/your-event" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-6">
                                                <ImageUpload
                                                    label="Event Logo"
                                                    description="1080 × 1080 px (Square, will be compressed)"
                                                    aspectRatio="1/1"
                                                    value={logo}
                                                    onChange={setLogo}
                                                    initialPreview={initialLogo}
                                                />
                                                <ImageUpload
                                                    label="Event Banner"
                                                    description="2:1 ratio, landscape (e.g. 1200 × 600 px)"
                                                    aspectRatio="2/1"
                                                    value={banner}
                                                    onChange={setBanner}
                                                    initialPreview={initialBanner}
                                                />
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Rules & Eligibility */}
                                <AccordionItem value="rules" className="bg-white border text-card-foreground shadow-sm rounded-xl px-2">
                                    <AccordionTrigger className="px-4 hover:no-underline">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                                <Shield className="w-5 h-5" />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-semibold text-lg leading-none">Rules & Eligibility</p>
                                                <p className="text-sm text-muted-foreground font-normal mt-1">Guidelines and participant requirements</p>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-6 pt-2">
                                        <div className="space-y-6">
                                            <FormField
                                                control={form.control}
                                                name="rules"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Rules</FormLabel>
                                                        <FormControl>
                                                            <MarkdownEditor
                                                                value={field.value || ""}
                                                                onChange={field.onChange}
                                                                minHeight="150px"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="eligibility"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Eligibility</FormLabel>
                                                        <FormControl>
                                                            <MarkdownEditor
                                                                value={field.value || ""}
                                                                onChange={field.onChange}
                                                                minHeight="150px"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Location & Time */}
                                <AccordionItem value="location" className="bg-white border text-card-foreground shadow-sm rounded-xl px-2">
                                    <AccordionTrigger className="px-4 hover:no-underline">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                                <MapPin className="w-5 h-5" />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-semibold text-lg leading-none">Location & Time</p>
                                                <p className="text-sm text-muted-foreground font-normal mt-1">When and where is it happening?</p>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-6 pt-2">
                                        <div className="space-y-6">
                                            <div className="grid md:grid-cols-3 gap-6">
                                                <FormField
                                                    control={form.control}
                                                    name="mode"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Mode</FormLabel>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select mode" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="online">Online</SelectItem>
                                                                    <SelectItem value="offline">Offline</SelectItem>
                                                                    <SelectItem value="hybrid">Hybrid</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="venue"
                                                    render={({ field }) => (
                                                        <FormItem className="md:col-span-2">
                                                            <FormLabel>Venue / Platform</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <FormField
                                                    control={form.control}
                                                    name="start_date"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Start Date</FormLabel>
                                                            <FormControl>
                                                                <DateTimePicker value={field.value} onChange={field.onChange} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="end_date"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>End Date</FormLabel>
                                                            <FormControl>
                                                                <DateTimePicker value={field.value} onChange={field.onChange} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <FormField
                                                    control={form.control}
                                                    name="registration_start"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Registration Opens</FormLabel>
                                                            <FormControl>
                                                                <DateTimePicker value={field.value} onChange={field.onChange} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="registration_end"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Registration Deadline</FormLabel>
                                                            <FormControl>
                                                                <DateTimePicker value={field.value} onChange={field.onChange} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Themes & Prizes */}
                                <AccordionItem value="themes" className="bg-white border text-card-foreground shadow-sm rounded-xl px-2">
                                    <AccordionTrigger className="px-4 hover:no-underline">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                                <Trophy className="w-5 h-5" />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-semibold text-lg leading-none">Themes, Tracks & Prizes</p>
                                                <p className="text-sm text-muted-foreground font-normal mt-1">Define your event categories and rewards</p>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-6 pt-2">
                                        <div className="space-y-6">
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <FormField
                                                    control={form.control}
                                                    name="prize_pool"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Total Prize Pool Display</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="e.g. 100000" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <div className="grid grid-cols-2 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="team_min"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Min Team Size</FormLabel>
                                                                <FormControl>
                                                                    <Input type="number" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="team_max"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Max Team Size</FormLabel>
                                                                <FormControl>
                                                                    <Input type="number" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                                <FormField
                                                    control={form.control}
                                                    name="max_participants"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Max Participants (overall)</FormLabel>
                                                            <FormControl>
                                                                <Input type="number" placeholder="Leave blank for unlimited" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <FormLabel className="text-base font-semibold">Individual Prizes</FormLabel>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => appendPrize({ position: "", reward: "" })}
                                                        className="h-8 border-dashed"
                                                    >
                                                        <Plus className="w-4 h-4 mr-2" />
                                                        Add Prize
                                                    </Button>
                                                </div>

                                                {prizeFields.length === 0 && (
                                                    <div className="text-sm text-muted-foreground text-center py-4 border-2 border-dashed rounded-lg bg-slate-50/50">
                                                        No specific prizes added yet.
                                                    </div>
                                                )}

                                                <div className="space-y-3">
                                                    {prizeFields.map((field, index) => (
                                                        <div key={field.id} className="flex gap-3 items-start p-3 bg-white rounded-lg border group shadow-sm">
                                                            <GripVertical className="w-5 h-5 text-muted-foreground mt-2.5 opacity-20" />
                                                            <div className="grid md:grid-cols-2 gap-3 flex-1">
                                                                <FormField
                                                                    control={form.control}
                                                                    name={`prizes.${index}.position`}
                                                                    render={({ field }) => (
                                                                        <FormItem className="space-y-0">
                                                                            <FormControl>
                                                                                <Input placeholder="Position (e.g. 1st Place)" {...field} />
                                                                            </FormControl>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                                <FormField
                                                                    control={form.control}
                                                                    name={`prizes.${index}.reward`}
                                                                    render={({ field }) => (
                                                                        <FormItem className="space-y-0">
                                                                            <FormControl>
                                                                                <Input placeholder="Reward (e.g. ₹50,000 + Swags)" {...field} />
                                                                            </FormControl>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => removePrize(index)}
                                                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <FormField
                                                control={form.control}
                                                name="themes"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Themes</FormLabel>
                                                        <FormControl>
                                                            <TagInput value={field.value || []} onChange={field.onChange} placeholder="Add themes..." />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="tracks"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Tracks</FormLabel>
                                                        <FormControl>
                                                            <TagInput value={field.value || []} onChange={field.onChange} placeholder="Add tracks..." />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Application Questions */}
                                <AccordionItem value="questions" className="bg-white border text-card-foreground shadow-sm rounded-xl px-2">
                                    <AccordionTrigger className="px-4 hover:no-underline">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                                <FileQuestion className="w-5 h-5" />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-semibold text-lg leading-none">Application Questions</p>
                                                <p className="text-sm text-muted-foreground font-normal mt-1">
                                                    Custom fields like PPT submission, research papers, etc.
                                                </p>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-6 pt-2">
                                        <QuestionBuilder
                                            questions={questions}
                                            onChange={setQuestions}
                                        />
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Co-Organizer Management - Only for main organizer or those with view access */}
                                <AccordionItem value="cohosts" className="bg-white border text-card-foreground shadow-sm rounded-xl px-2">
                                    <AccordionTrigger className="px-4 hover:no-underline">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                                <Users className="w-5 h-5" />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-semibold text-lg leading-none">Co-Organizers</p>
                                                <p className="text-sm text-muted-foreground font-normal mt-1">
                                                    {isMainOrganizer ? "Invite team members to help manage this event" : "View event co-organizers"}
                                                </p>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-6 pt-2">
                                        <CoOrganizerManager
                                            eventSlug={params.slug}
                                            isMainOrganizer={isMainOrganizer}
                                        />
                                    </AccordionContent>
                                </AccordionItem>

                            </Accordion>

                            {/* Publish / Status Section */}
                            <div className="bg-white border p-6 rounded-xl shadow-sm flex items-center justify-between mt-8">
                                <div>
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <Globe className="w-5 h-5 text-primary" />
                                        Visibility Status
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {form.watch('status') === 'published'
                                            ? "Your event is live and visible to everyone."
                                            : "Your event is hidden. Publish it to accept registrations."}
                                    </p>
                                </div>
                                <div className="flex items-center gap-8">
                                    <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center space-y-0 gap-3">
                                                <FormControl>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-sm font-medium ${field.value === 'draft' ? 'text-foreground' : 'text-muted-foreground'}`}>Draft</span>
                                                        <Switch
                                                            checked={field.value === 'published'}
                                                            onCheckedChange={(checked) => field.onChange(checked ? 'published' : 'draft')}
                                                        />
                                                        <span className={`text-sm font-medium ${field.value === 'published' ? 'text-primary' : 'text-muted-foreground'}`}>Published</span>
                                                    </div>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <div className="flex gap-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => router.back()}
                                            disabled={saving}
                                        >
                                            Discard
                                        </Button>
                                        <Button type="submit" size="lg" disabled={saving} className="px-8 gap-2 shadow-lg">
                                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            Save Changes
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </Form>
                </div>
            </main>

            <Footer />
        </div>
    );
}
