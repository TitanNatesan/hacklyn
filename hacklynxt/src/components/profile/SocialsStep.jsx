"use client";

import { useFormContext } from "react-hook-form";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Github, Linkedin, Twitter, Globe } from "lucide-react";

export function SocialsStep() {
    const { control } = useFormContext();

    return (
        <div className="space-y-6 animate-fade-up">
            <div className="text-center mb-6">
                <h3 className="text-lg font-medium">Connect your online presence</h3>
                <p className="text-sm text-muted-foreground">This helps others find you and see your work.</p>
            </div>

            <div className="grid gap-6">
                <FormField
                    control={control}
                    name="github"
                    rules={{ required: "GitHub URL is required" }}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center gap-2">
                                <Github className="w-4 h-4" /> GitHub <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                                <Input placeholder="https://github.com/username" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="linkedin"
                    rules={{ required: "LinkedIn URL is required" }}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center gap-2">
                                <Linkedin className="w-4 h-4 text-primary" /> LinkedIn <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                                <Input placeholder="https://linkedin.com/in/username" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="twitter"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center gap-2">
                                <Twitter className="w-4 h-4 text-accent" /> Twitter (Optional)
                            </FormLabel>
                            <FormControl>
                                <Input placeholder="https://twitter.com/username" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="website"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center gap-2">
                                <Globe className="w-4 h-4" /> Personal Website (Optional)
                            </FormLabel>
                            <FormControl>
                                <Input placeholder="https://yourwebsite.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    );
}
