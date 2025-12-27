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
import { Plus, Trash2, GraduationCap, Briefcase } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export function EducationWorkStep() {
    const { control, formState: { errors } } = useFormContext();

    const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({
        control,
        name: "education",
    });

    const { fields: workFields, append: appendWork, remove: removeWork } = useFieldArray({
        control,
        name: "workExperience",
    });

    return (
        <div className="space-y-10 animate-fade-up">
            {/* Education Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-primary" />
                        <h3 className="text-xl font-semibold">Education</h3>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendEdu({ degree: "", school: "", startDate: "", endDate: "", current: false })}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Education
                    </Button>
                </div>

                {errors.education && (
                    <p className="text-sm font-medium text-destructive">
                        {errors.education.message || errors.education.root?.message}
                    </p>
                )}

                {eduFields.length === 0 && !errors.education && (
                    <div className="text-center p-8 border-2 border-dashed rounded-lg text-muted-foreground">
                        No education added yet.
                    </div>
                )}

                <div className="grid gap-4">
                    {eduFields.map((field, index) => (
                        <Card key={field.id} className="relative group">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => removeEdu(index)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-medium">Education #{index + 1}</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={control}
                                    name={`education.${index}.school`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>School / University</FormLabel>
                                            <FormControl>
                                                <Input placeholder="University of Technology" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name={`education.${index}.degree`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Degree / Program</FormLabel>
                                            <FormControl>
                                                <Input placeholder="B.Sc. Computer Science" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name={`education.${index}.startDate`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Start Date</FormLabel>
                                            <FormControl>
                                                <Input type="month" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name={`education.${index}.endDate`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>End Date</FormLabel>
                                            <FormControl>
                                                <Input type="month" {...field} />
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

            <div className="h-px bg-border" />

            {/* Work Experience Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-primary" />
                        <h3 className="text-xl font-semibold">Work Experience</h3>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendWork({ jobTitle: "", company: "", startDate: "", endDate: "", description: "", current: false })}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Experience
                    </Button>
                </div>

                {workFields.length === 0 && (
                    <div className="text-center p-8 border-2 border-dashed rounded-lg text-muted-foreground">
                        No work experience added yet.
                    </div>
                )}

                <div className="grid gap-4">
                    {workFields.map((field, index) => (
                        <Card key={field.id} className="relative group">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => removeWork(index)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-medium">Experience #{index + 1}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={control}
                                        name={`workExperience.${index}.jobTitle`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Job Title</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Frontend Engineer" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={control}
                                        name={`workExperience.${index}.company`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Company Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Acme Corp" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={control}
                                        name={`workExperience.${index}.startDate`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Start Date</FormLabel>
                                                <FormControl>
                                                    <Input type="month" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={control}
                                        name={`workExperience.${index}.endDate`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>End Date</FormLabel>
                                                <FormControl>
                                                    <Input type="month" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={control}
                                    name={`workExperience.${index}.description`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Describe your responsibilities and achievements..." className="h-24" {...field} />
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
