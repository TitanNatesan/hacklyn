"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
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
    Upload, X, ImageIcon, Clock, CalendarIcon
} from "lucide-react";
import { eventsAPI } from "@/lib/api";
import { toast } from "sonner";
import { MarkdownEditor } from "@/components/ui/MarkdownEditor";
import { TagInput } from "@/components/ui/TagInput";
import { DateTimePicker } from "@/components/ui/DateTimePicker";

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
    registration_end: z.string().optional(),
    team_min: z.coerce.number().min(1).default(1),
    team_max: z.coerce.number().min(1).default(4),
    prize_pool: z.string().optional(),
    tracks: z.array(z.string()).default([]),
    themes: z.array(z.string()).default([]),
});

// Image upload component
function ImageUpload({ label, description, aspectRatio, value, onChange, accept = "image/*" }) {
    const inputRef = useRef(null);
    const [preview, setPreview] = useState(null);

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

export default function CreateEventPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [logo, setLogo] = useState(null);
    const [banner, setBanner] = useState(null);

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
            registration_end: "",
            prize_pool: "",
            team_min: 1,
            team_max: 4,
            tracks: [],
            themes: [],
        },
    });

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            // Prepare form data for multipart upload
            const formData = new FormData();

            // Add text fields
            Object.entries(data).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    if (Array.isArray(value)) {
                        // Convert arrays to comma-separated strings for backend
                        // Or keep as json string if backend supports it, but standard multipart usually expects simple values
                        // Keeping existing logic: join ", "
                        formData.append(key, value.join(", "));
                    } else if (typeof value === 'boolean') {
                        formData.append(key, value ? 'true' : 'false');
                    } else {
                        formData.append(key, value);
                    }
                }
            });

            // Add image files
            if (logo) formData.append("logo", logo);
            if (banner) formData.append("cover_image", banner);

            const response = await eventsAPI.create(formData, true); // true for multipart
            toast.success("Event created successfully!");
            router.push(`/events/${response.id}`);
        } catch (error) {
            console.error("Failed to create event:", error);
            toast.error(error.response?.data?.detail || "Failed to create event. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />

            <main className="flex-1 pt-24 pb-12">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-foreground mb-2">Host an Event</h1>
                        <p className="text-muted-foreground text-lg">
                            Fill in the details below to publish your hackathon or workshop on Hacklyn.
                        </p>
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
                                                            <Input placeholder="e.g. HackLocal 2024" {...field} />
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
                                                            <FormLabel>Tagline (One-liner)</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="e.g. Build for the future" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            {/* Markdown Editor for Description */}
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
                                                                placeholder="Describe your event, goals, and what participants will learn... (Supports Markdown)"
                                                                minHeight="200px"
                                                            />
                                                        </FormControl>
                                                        <FormDescription>
                                                            Use Markdown for rich formatting. Click Preview to see how it will look.
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Image Uploads */}
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <ImageUpload
                                                    label="Event Logo"
                                                    description="1080 × 1080 px (Square, will be compressed)"
                                                    aspectRatio="1/1"
                                                    value={logo}
                                                    onChange={setLogo}
                                                />
                                                <ImageUpload
                                                    label="Event Banner (Optional)"
                                                    description="2:1 ratio, landscape (e.g. 1200 × 600 px)"
                                                    aspectRatio="2/1"
                                                    value={banner}
                                                    onChange={setBanner}
                                                />
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Location & Time */}
                                <AccordionItem value="location-time" className="bg-white border text-card-foreground shadow-sm rounded-xl px-2">
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
                                                                <Input placeholder="e.g. IIT Madras Auditorium or Discord" {...field} />
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
                                                            <FormLabel>Start Date & Time</FormLabel>
                                                            <FormControl>
                                                                <DateTimePicker
                                                                    value={field.value}
                                                                    onChange={field.onChange}
                                                                    placeholder="Select start time"
                                                                />
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
                                                            <FormLabel>End Date & Time</FormLabel>
                                                            <FormControl>
                                                                <DateTimePicker
                                                                    value={field.value}
                                                                    onChange={field.onChange}
                                                                    placeholder="Select end time"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            {/* Registration Deadline */}
                                            <FormField
                                                control={form.control}
                                                name="registration_end"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="flex items-center gap-2">
                                                            <Clock className="h-4 w-4" />
                                                            Registration Deadline
                                                        </FormLabel>
                                                        <FormControl>
                                                            <DateTimePicker
                                                                value={field.value}
                                                                onChange={field.onChange}
                                                                placeholder="Select deadline"
                                                            />
                                                        </FormControl>
                                                        <FormDescription>
                                                            Last date and time for participants to register
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Themes & Prizes */}
                                <AccordionItem value="themes-prizes" className="bg-white border text-card-foreground shadow-sm rounded-xl px-2">
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
                                                            <FormLabel>Prize Pool</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="e.g. ₹50,000" {...field} />
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
                                            </div>

                                            {/* Tag Inputs for Themes and Tracks */}
                                            <FormField
                                                control={form.control}
                                                name="themes"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Themes</FormLabel>
                                                        <FormControl>
                                                            <TagInput
                                                                value={field.value || []}
                                                                onChange={field.onChange}
                                                                placeholder="Type a theme and press comma to add..."
                                                            />
                                                        </FormControl>
                                                        <FormDescription>
                                                            e.g. Healthcare, Education, Sustainability
                                                        </FormDescription>
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
                                                            <TagInput
                                                                value={field.value || []}
                                                                onChange={field.onChange}
                                                                placeholder="Type a track and press comma to add..."
                                                            />
                                                        </FormControl>
                                                        <FormDescription>
                                                            e.g. AI/ML, Web3, Mobile, Open Innovation
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                                <Button type="submit" size="lg" disabled={loading} className="px-8 gap-2">
                                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Create Event
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </main>

            <Footer />
        </div>
    );
}
