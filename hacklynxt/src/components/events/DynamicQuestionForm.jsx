"use client";

import { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    FileText,
    Upload,
    X,
    CheckCircle2,
    AlertCircle,
    Link2,
    File,
    Loader2
} from "lucide-react";

function FileUploadField({ question, value, onChange, error }) {
    const fileInputRef = useRef(null);
    const [fileName, setFileName] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = (question.allowed_file_types || ".pdf,.doc,.docx")
            .split(",")
            .map(ext => ext.trim().toLowerCase());

        const fileExt = "." + file.name.split(".").pop().toLowerCase();
        if (!allowedTypes.some(ext => fileExt === ext.toLowerCase())) {
            alert(`Please upload a file with one of these formats: ${allowedTypes.join(", ")}`);
            return;
        }

        // Validate file size
        const maxSize = (question.max_file_size_mb || 10) * 1024 * 1024;
        if (file.size > maxSize) {
            alert(`File size must be less than ${question.max_file_size_mb || 10}MB`);
            return;
        }

        setFileName(file.name);
        onChange(file);
    };

    const handleRemove = () => {
        setFileName(null);
        onChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="space-y-2">
            {!value ? (
                <Card
                    className={`border-2 border-dashed hover:border-primary/50 transition-colors cursor-pointer ${error ? 'border-destructive' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <CardContent className="flex flex-col items-center justify-center py-6 px-4">
                        <div className="p-2 rounded-full bg-muted mb-3">
                            <Upload className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground text-center mb-1">
                            Click to upload
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {question.allowed_file_types || ".pdf,.doc,.docx"} (Max {question.max_file_size_mb || 10}MB)
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <Card className="border-2 border-primary/20 bg-primary/5">
                    <CardContent className="flex items-center justify-between py-3 px-4">
                        <div className="flex items-center gap-3">
                            <File className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-sm font-medium truncate max-w-[200px]">
                                    {fileName || "File uploaded"}
                                </p>
                                <div className="flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                                    <span className="text-xs text-muted-foreground">Ready</span>
                                </div>
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleRemove}
                            className="text-destructive hover:text-destructive"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>
            )}
            <input
                ref={fileInputRef}
                type="file"
                accept={question.allowed_file_types || ".pdf,.doc,.docx,.ppt,.pptx"}
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
    );
}

function QuestionField({ question, value, onChange, error }) {
    const fieldType = question.field_type;

    switch (fieldType) {
        case "text":
            return (
                <Input
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={question.placeholder || "Enter your answer..."}
                    className={error ? "border-destructive" : ""}
                />
            );

        case "textarea":
            return (
                <Textarea
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={question.placeholder || "Enter your answer..."}
                    rows={4}
                    className={error ? "border-destructive" : ""}
                />
            );

        case "url":
            return (
                <div className="relative">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="url"
                        value={value || ""}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={question.placeholder || "https://example.com"}
                        className={`pl-10 ${error ? "border-destructive" : ""}`}
                    />
                </div>
            );

        case "file":
            return (
                <FileUploadField
                    question={question}
                    value={value}
                    onChange={onChange}
                    error={error}
                />
            );

        case "select":
            return (
                <Select
                    value={value || ""}
                    onValueChange={onChange}
                >
                    <SelectTrigger className={error ? "border-destructive" : ""}>
                        <SelectValue placeholder={question.placeholder || "Select an option"} />
                    </SelectTrigger>
                    <SelectContent>
                        {(question.options || []).map((option, idx) => (
                            <SelectItem key={idx} value={option}>
                                {option}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            );

        case "multiselect":
            return (
                <div className={`space-y-2 p-4 border rounded-lg ${error ? "border-destructive" : ""}`}>
                    {(question.options || []).map((option, idx) => {
                        const selectedOptions = Array.isArray(value) ? value : [];
                        const isChecked = selectedOptions.includes(option);

                        return (
                            <div key={idx} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`${question.id}-option-${idx}`}
                                    checked={isChecked}
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            onChange([...selectedOptions, option]);
                                        } else {
                                            onChange(selectedOptions.filter(o => o !== option));
                                        }
                                    }}
                                />
                                <Label
                                    htmlFor={`${question.id}-option-${idx}`}
                                    className="cursor-pointer font-normal"
                                >
                                    {option}
                                </Label>
                            </div>
                        );
                    })}
                </div>
            );

        default:
            return (
                <Input
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Enter your answer..."
                />
            );
    }
}

export function DynamicQuestionForm({ questions = [], responses = {}, onResponseChange, errors = {} }) {
    if (questions.length === 0) {
        return null;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Additional Questions</h3>
            </div>

            {questions.map((question, index) => {
                const questionId = question.id;
                const value = responses[questionId];
                const error = errors[questionId];

                return (
                    <div key={questionId || index} className="space-y-2">
                        <div className="flex items-start gap-2">
                            <Label className="text-sm font-medium leading-relaxed">
                                {question.question_text}
                                {question.is_required && (
                                    <span className="text-destructive ml-1">*</span>
                                )}
                            </Label>
                        </div>

                        {question.description && (
                            <p className="text-sm text-muted-foreground -mt-1">
                                {question.description}
                            </p>
                        )}

                        <QuestionField
                            question={question}
                            value={value}
                            onChange={(newValue) => onResponseChange(questionId, newValue)}
                            error={error}
                        />

                        {error && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {error}
                            </p>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
