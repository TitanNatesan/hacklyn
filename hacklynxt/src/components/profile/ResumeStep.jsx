"use client";

import { useState, useRef, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    FileText,
    Upload,
    X,
    CheckCircle2,
    Loader2,
    File,
    Eye
} from "lucide-react";
import { profileAPI } from "@/lib/api";
import { toast } from "sonner";

export function ResumeStep() {
    const { control, watch, setValue } = useFormContext();
    const [isUploading, setIsUploading] = useState(false);
    const [resumeUrl, setResumeUrl] = useState(null);
    const [resumeName, setResumeName] = useState(null);
    const [fileSize, setFileSize] = useState(null);
    const fileInputRef = useRef(null);

    // Get initial resume from form context
    useEffect(() => {
        const currentResume = watch("resume");
        if (currentResume && typeof currentResume === 'string') {
            setResumeUrl(currentResume);
            // Extract filename from URL
            const urlParts = currentResume.split('/');
            const fileName = urlParts[urlParts.length - 1];
            setResumeName(decodeURIComponent(fileName) || 'Resume.pdf');
        }
    }, [watch]);

    const formatFileSize = (bytes) => {
        if (!bytes || bytes === 0) return '';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (!allowedTypes.includes(file.type)) {
            toast.error("Please upload a PDF or Word document (.pdf, .doc, .docx)");
            return;
        }

        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            toast.error("File size must be less than 5MB");
            return;
        }

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append("resume", file);

            const response = await profileAPI.update(formData);

            if (response?.resume) {
                setResumeUrl(response.resume);
                setResumeName(file.name);
                setFileSize(file.size);
                setValue("resume", response.resume);
                toast.success("Resume uploaded successfully!");
            }
        } catch (error) {
            console.error("Upload failed:", error);
            toast.error("Failed to upload resume. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveResume = async () => {
        try {
            setIsUploading(true);
            await profileAPI.update({ resume: null });

            setResumeUrl(null);
            setResumeName(null);
            setFileSize(null);
            setValue("resume", null);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            toast.success("Resume removed");
        } catch (error) {
            console.error("Remove failed:", error);
            toast.error("Failed to remove resume");
        } finally {
            setIsUploading(false);
        }
    };

    const isPdf = resumeName?.toLowerCase().endsWith('.pdf');

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-primary/5 p-6 border border-primary/10">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <h3 className="text-xl font-display font-bold text-foreground">Profile Resume</h3>
                        <p className="text-sm text-muted-foreground max-w-md">
                            Your resume is essential for hackathon applications.
                            Organizers use it to understand your skills and background.
                        </p>
                    </div>
                    {!resumeUrl && (
                        <div className="flex -space-x-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-secondary flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-muted-foreground/50" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-1" />
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-1" />
            </div>

            <FormField
                control={control}
                name="resume"
                render={() => (
                    <FormItem className="space-y-4">
                        <FormControl>
                            <div className="transition-all duration-300">
                                {!resumeUrl ? (
                                    <div
                                        className={`group relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 ${isUploading ? "border-primary/50 cursor-wait" : "border-muted-foreground/20 hover:border-primary/40 cursor-pointer"
                                            }`}
                                        onClick={() => !isUploading && fileInputRef.current?.click()}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                        <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-6">
                                            {isUploading ? (
                                                <div className="space-y-4">
                                                    <div className="relative">
                                                        <div className="w-16 h-16 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                                                        <Upload className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="font-semibold text-foreground">Uploading your resume...</p>
                                                        <p className="text-xs text-muted-foreground">This will only take a moment</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="relative">
                                                        <div className="w-20 h-20 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                                                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shadow-inner">
                                                                <Upload className="h-6 w-6 text-primary" />
                                                            </div>
                                                        </div>
                                                        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-background border border-primary/20 flex items-center justify-center shadow-lg">
                                                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <p className="text-lg font-bold text-foreground">Drop your resume here</p>
                                                        <p className="text-sm text-muted-foreground max-w-[240px] mx-auto">
                                                            Support PDF, DOC or DOCX up to <span className="text-primary font-medium">5MB</span>
                                                        </p>
                                                    </div>

                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                        className="rounded-full px-8 shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                                                    >
                                                        Select File
                                                    </Button>
                                                </>
                                            )}
                                        </CardContent>
                                    </div>
                                ) : (
                                    <div className="group relative overflow-hidden rounded-2xl border border-primary/10 bg-card shadow-lg shadow-primary/5">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                                        <CardContent className="p-6">
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                                {/* File Indicator */}
                                                <div className="relative group/icon">
                                                    <div className={`w-16 h-20 rounded-lg flex items-center justify-center shadow-md transition-transform duration-500 group-hover/icon:-translate-y-1 ${isPdf ? "bg-red-50 text-red-500 border border-red-100" : "bg-blue-50 text-blue-500 border border-blue-100"
                                                        }`}>
                                                        <FileText className="h-10 w-10" />
                                                    </div>
                                                    <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-md bg-foreground text-[10px] font-bold text-background uppercase shadow-sm">
                                                        {isPdf ? 'PDF' : 'DOCX'}
                                                    </div>
                                                </div>

                                                {/* Details */}
                                                <div className="flex-1 min-w-0 space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                        </div>
                                                        <span className="text-sm font-bold text-green-600 uppercase tracking-wider">Verified Upload</span>
                                                    </div>
                                                    <h4 className="text-lg font-bold text-foreground truncate max-w-full" title={resumeName}>
                                                        {resumeName}
                                                    </h4>
                                                    <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
                                                        <span className="flex items-center gap-1.5 tras">
                                                            <File className="w-3.5 h-3.5" />
                                                            {formatFileSize(fileSize || 0)}
                                                        </span>
                                                        <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                                        <span>Updated just now</span>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex sm:flex-col gap-2 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex-1 sm:w-32 rounded-lg hover:bg-primary/5 hover:text-primary transition-colors"
                                                        onClick={() => window.open(resumeUrl, '_blank')}
                                                    >
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="flex-1 sm:w-32 rounded-lg text-destructive hover:bg-destructive/5 hover:text-destructive transition-colors shrink-0"
                                                        onClick={handleRemoveResume}
                                                        disabled={isUploading}
                                                    >
                                                        <X className="h-4 w-4 mr-2" />
                                                        Remove
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Preview Strip (Decorative) */}
                                            <div className="mt-6 flex gap-2">
                                                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                                    <div key={i} className="h-1.5 flex-1 rounded-full bg-muted/40" />
                                                ))}
                                            </div>
                                        </CardContent>
                                    </div>
                                )}

                                {/* Hidden File Input */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Resume Tips Section */}
            {!resumeUrl && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-4">
                    <div className="p-4 rounded-xl border border-primary/5 bg-primary/5 space-y-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                        </div>
                        <h5 className="font-bold text-sm">ATS Friendly</h5>
                        <p className="text-xs text-muted-foreground">Use a clean, standard format that's easy for systems (and humans) to read.</p>
                    </div>
                    <div className="p-4 rounded-xl border border-primary/5 bg-primary/5 space-y-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-primary" />
                        </div>
                        <h5 className="font-bold text-sm">Keep it Updated</h5>
                        <p className="text-xs text-muted-foreground">Make sure to include your latest projects and relevant experience.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
