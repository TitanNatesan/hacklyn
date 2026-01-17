"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Plus,
    Trash2,
    GripVertical,
    Type,
    FileUp,
    Link2,
    List,
    CheckSquare,
    AlignLeft,
    ChevronUp,
    ChevronDown,
    Copy,
    Settings2
} from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const FIELD_TYPES = [
    { value: "text", label: "Short Text", icon: Type, description: "Single line text input" },
    { value: "textarea", label: "Long Text", icon: AlignLeft, description: "Multi-line text area" },
    { value: "file", label: "File Upload", icon: FileUp, description: "PDF, DOC, PPT uploads" },
    { value: "url", label: "URL Link", icon: Link2, description: "Website or video link" },
    { value: "select", label: "Single Select", icon: List, description: "Choose one option" },
    { value: "multiselect", label: "Multiple Select", icon: CheckSquare, description: "Choose multiple options" },
];

function QuestionCard({ question, index, onUpdate, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const fieldType = FIELD_TYPES.find(f => f.value === question.field_type);
    const FieldIcon = fieldType?.icon || Type;

    const handleChange = (field, value) => {
        onUpdate(index, { ...question, [field]: value });
    };

    const handleOptionChange = (optionIndex, value) => {
        const newOptions = [...(question.options || [])];
        newOptions[optionIndex] = value;
        onUpdate(index, { ...question, options: newOptions });
    };

    const addOption = () => {
        const newOptions = [...(question.options || []), `Option ${(question.options?.length || 0) + 1}`];
        onUpdate(index, { ...question, options: newOptions });
    };

    const removeOption = (optionIndex) => {
        const newOptions = (question.options || []).filter((_, i) => i !== optionIndex);
        onUpdate(index, { ...question, options: newOptions });
    };

    return (
        <Card className={`border-l-4 ${question.is_required ? 'border-l-primary' : 'border-l-muted'}`}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="cursor-grab text-muted-foreground hover:text-foreground">
                            <GripVertical className="h-5 w-5" />
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-primary/10">
                                <FieldIcon className="h-4 w-4 text-primary" />
                            </div>
                            <Badge variant={question.is_required ? "default" : "secondary"} className="text-xs">
                                {question.is_required ? "Required" : "Optional"}
                            </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">Q{index + 1}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => onMoveUp(index)}
                            disabled={isFirst}
                            className="h-8 w-8"
                        >
                            <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => onMoveDown(index)}
                            disabled={isLast}
                            className="h-8 w-8"
                        >
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(index)}
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Question Text */}
                <div className="space-y-2">
                    <Label>Question</Label>
                    <Input
                        value={question.question_text || ""}
                        onChange={(e) => handleChange("question_text", e.target.value)}
                        placeholder="Enter your question..."
                        className="font-medium"
                    />
                </div>

                {/* Field Type Selector */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Answer Type</Label>
                        <Select
                            value={question.field_type}
                            onValueChange={(value) => handleChange("field_type", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                {FIELD_TYPES.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                        <div className="flex items-center gap-2">
                                            <type.icon className="h-4 w-4" />
                                            <span>{type.label}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center justify-between pt-6">
                        <Label htmlFor={`required-${index}`} className="cursor-pointer">Required</Label>
                        <Switch
                            id={`required-${index}`}
                            checked={question.is_required}
                            onCheckedChange={(checked) => handleChange("is_required", checked)}
                        />
                    </div>
                </div>

                {/* Description / Help Text */}
                <div className="space-y-2">
                    <Label>Description (optional)</Label>
                    <Textarea
                        value={question.description || ""}
                        onChange={(e) => handleChange("description", e.target.value)}
                        placeholder="Add instructions or context for this question..."
                        rows={2}
                    />
                </div>

                {/* Placeholder for text inputs */}
                {["text", "textarea", "url"].includes(question.field_type) && (
                    <div className="space-y-2">
                        <Label>Placeholder Text</Label>
                        <Input
                            value={question.placeholder || ""}
                            onChange={(e) => handleChange("placeholder", e.target.value)}
                            placeholder="e.g., Enter your answer here..."
                        />
                    </div>
                )}

                {/* Options for select/multiselect */}
                {["select", "multiselect"].includes(question.field_type) && (
                    <div className="space-y-3">
                        <Label>Options</Label>
                        <div className="space-y-2">
                            {(question.options || []).map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full border flex items-center justify-center text-xs text-muted-foreground">
                                        {optionIndex + 1}
                                    </div>
                                    <Input
                                        value={option}
                                        onChange={(e) => handleOptionChange(optionIndex, e.target.value)}
                                        placeholder={`Option ${optionIndex + 1}`}
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeOption(optionIndex)}
                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addOption}
                                className="w-full"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Option
                            </Button>
                        </div>
                    </div>
                )}

                {/* File upload settings */}
                {question.field_type === "file" && (
                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                        <div className="space-y-2">
                            <Label>Allowed File Types</Label>
                            <Input
                                value={question.allowed_file_types || ".pdf,.doc,.docx,.ppt,.pptx"}
                                onChange={(e) => handleChange("allowed_file_types", e.target.value)}
                                placeholder=".pdf,.doc,.docx"
                            />
                            <p className="text-xs text-muted-foreground">Comma-separated extensions</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Max File Size (MB)</Label>
                            <Input
                                type="number"
                                value={question.max_file_size_mb || 10}
                                onChange={(e) => handleChange("max_file_size_mb", parseInt(e.target.value) || 10)}
                                min={1}
                                max={50}
                            />
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export function QuestionBuilder({ questions = [], onChange }) {
    const handleAddQuestion = (type = "text") => {
        const newQuestion = {
            question_text: "",
            field_type: type,
            description: "",
            placeholder: "",
            is_required: false,
            options: type === "select" || type === "multiselect" ? ["Option 1", "Option 2"] : [],
            allowed_file_types: ".pdf,.doc,.docx,.ppt,.pptx",
            max_file_size_mb: 10,
            order: questions.length,
        };
        onChange([...questions, newQuestion]);
    };

    const handleUpdateQuestion = (index, updatedQuestion) => {
        const newQuestions = [...questions];
        newQuestions[index] = updatedQuestion;
        onChange(newQuestions);
    };

    const handleDeleteQuestion = (index) => {
        const newQuestions = questions.filter((_, i) => i !== index);
        // Update order
        newQuestions.forEach((q, i) => q.order = i);
        onChange(newQuestions);
    };

    const handleMoveUp = (index) => {
        if (index === 0) return;
        const newQuestions = [...questions];
        [newQuestions[index - 1], newQuestions[index]] = [newQuestions[index], newQuestions[index - 1]];
        newQuestions.forEach((q, i) => q.order = i);
        onChange(newQuestions);
    };

    const handleMoveDown = (index) => {
        if (index === questions.length - 1) return;
        const newQuestions = [...questions];
        [newQuestions[index], newQuestions[index + 1]] = [newQuestions[index + 1], newQuestions[index]];
        newQuestions.forEach((q, i) => q.order = i);
        onChange(newQuestions);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Application Questions</h3>
                    <p className="text-sm text-muted-foreground">
                        Add custom questions for applicants to answer when registering
                    </p>
                </div>
                <Badge variant="outline">{questions.length} question{questions.length !== 1 ? 's' : ''}</Badge>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
                {questions.map((question, index) => (
                    <QuestionCard
                        key={index}
                        question={question}
                        index={index}
                        onUpdate={handleUpdateQuestion}
                        onDelete={handleDeleteQuestion}
                        onMoveUp={handleMoveUp}
                        onMoveDown={handleMoveDown}
                        isFirst={index === 0}
                        isLast={index === questions.length - 1}
                    />
                ))}
            </div>

            {/* Empty State */}
            {questions.length === 0 && (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-10">
                        <Settings2 className="h-10 w-10 text-muted-foreground mb-4" />
                        <p className="text-sm text-muted-foreground text-center mb-4">
                            No custom questions yet. Add questions to collect more information from applicants.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Add Question Buttons */}
            <div className="flex flex-wrap gap-2 pt-4 border-t">
                <span className="text-sm text-muted-foreground self-center mr-2">Add question:</span>
                {FIELD_TYPES.map((type) => (
                    <Button
                        key={type.value}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddQuestion(type.value)}
                        className="gap-2"
                    >
                        <type.icon className="h-4 w-4" />
                        {type.label}
                    </Button>
                ))}
            </div>
        </div>
    );
}
