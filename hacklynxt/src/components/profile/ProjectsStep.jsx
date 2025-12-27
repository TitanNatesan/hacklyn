"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, FolderGit2, Trophy, Github } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

export function ProjectsStep() {
    const { control, formState: { errors } } = useFormContext();

    const { fields: projectFields, append: appendProject, remove: removeProject } = useFieldArray({
        control,
        name: "projects",
    });

    const { fields: hackathonFields, append: appendHackathon, remove: removeHackathon } = useFieldArray({
        control,
        name: "hackathons",
    });

    const { fields: ossFields, append: appendOss, remove: removeOss } = useFieldArray({
        control,
        name: "openSource",
    });

    return (
        <div className="space-y-10 animate-fade-up">
            {/* Projects Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FolderGit2 className="h-5 w-5 text-primary" />
                        <h3 className="text-xl font-semibold">Projects</h3>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendProject({ title: "", description: "", technologies: "", link: "", role: "" })}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Project
                    </Button>
                </div>

                {errors.projects && (
                    <p className="text-sm font-medium text-destructive">
                        {errors.projects.message || errors.projects.root?.message}
                    </p>
                )}

                {projectFields.length === 0 && !errors.projects && (
                    <div className="text-center p-8 border-2 border-dashed rounded-lg text-muted-foreground">
                        Showcase your best work. Add a project.
                    </div>
                )}

                <div className="grid gap-4">
                    {projectFields.map((field, index) => (
                        <Card key={field.id} className="relative group">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => removeProject(index)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-medium">Project #{index + 1}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={control}
                                        name={`projects.${index}.title`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Project Title</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="E-commerce Platform" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={control}
                                        name={`projects.${index}.role`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Your Role</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Lead Developer" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={control}
                                    name={`projects.${index}.technologies`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Technologies Used</FormLabel>
                                            <FormControl>
                                                <Input placeholder="React, Node.js, MongoDB..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name={`projects.${index}.description`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="What does this project do?" className="h-20" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name={`projects.${index}.link`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Project Link</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <Separator />

            {/* Hackathons Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-primary" />
                        <h3 className="text-xl font-semibold">Hackathons (Optional)</h3>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendHackathon({ name: "", role: "", awards: "", description: "" })}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Hackathon
                    </Button>
                </div>

                <div className="grid gap-4">
                    {hackathonFields.map((field, index) => (
                        <Card key={field.id} className="relative group">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => removeHackathon(index)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-medium">Hackathon #{index + 1}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={control}
                                        name={`hackathons.${index}.name`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Hackathon Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Global AI Hackathon" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={control}
                                        name={`hackathons.${index}.role`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Role</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Team Lead" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={control}
                                        name={`hackathons.${index}.awards`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Awards (Optional)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="1st Place, Best UI..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={control}
                                    name={`hackathons.${index}.description`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Project Description</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Briefly describe what you built..." className="h-20" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <Separator />

            {/* Open Source Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Github className="h-5 w-5 text-primary" />
                        <h3 className="text-xl font-semibold">Open Source (Optional)</h3>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendOss({ projectName: "", contribution: "", link: "" })}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Contribution
                    </Button>
                </div>

                <div className="grid gap-4">
                    {ossFields.map((field, index) => (
                        <Card key={field.id} className="relative group">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => removeOss(index)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-medium">Contribution #{index + 1}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={control}
                                        name={`openSource.${index}.projectName`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Project Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="React, TensorFlow..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={control}
                                        name={`openSource.${index}.link`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>PR / Issue Link</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="https://github.com/..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={control}
                                    name={`openSource.${index}.contribution`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Contribution Details</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="What did you contribute?" className="h-20" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
