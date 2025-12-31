"use client";

import { useState, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * TagInput - A comma-separated tag input with chip display
 * 
 * Features:
 * - Adds tag when comma is typed or Enter is pressed
 * - Removes last tag on Backspace when input is empty
 * - Click X to remove individual tags
 */
export function TagInput({
    value = [],
    onChange,
    placeholder = "Type and press comma to add...",
    className,
    disabled = false,
    ...props
}) {
    const [inputValue, setInputValue] = useState("");
    const inputRef = useRef(null);

    // Ensure value is always an array
    const tags = Array.isArray(value) ? value : (typeof value === 'string' && value ? value.split(',').map(t => t.trim()).filter(Boolean) : []);

    const addTag = useCallback((tag) => {
        const trimmedTag = tag.trim();
        if (trimmedTag && !tags.includes(trimmedTag)) {
            const newTags = [...tags, trimmedTag];
            onChange?.(newTags);
        }
    }, [tags, onChange]);

    const removeTag = useCallback((indexToRemove) => {
        const newTags = tags.filter((_, index) => index !== indexToRemove);
        onChange?.(newTags);
    }, [tags, onChange]);

    const handleKeyDown = (e) => {
        if (disabled) return;

        // Add tag on comma or Enter
        if (e.key === "," || e.key === "Enter") {
            e.preventDefault();
            if (inputValue.trim()) {
                addTag(inputValue);
                setInputValue("");
            }
        }

        // Remove last tag on Backspace when input is empty
        if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
            removeTag(tags.length - 1);
        }
    };

    const handleChange = (e) => {
        const val = e.target.value;
        // If comma is pasted or typed, split and add tags
        if (val.includes(",")) {
            const parts = val.split(",");
            parts.forEach((part, idx) => {
                if (idx < parts.length - 1) {
                    // Complete tags before the last comma
                    addTag(part);
                } else {
                    // Keep the last part in input
                    setInputValue(part);
                }
            });
        } else {
            setInputValue(val);
        }
    };

    const handleBlur = () => {
        // Add remaining text as tag on blur
        if (inputValue.trim()) {
            addTag(inputValue);
            setInputValue("");
        }
    };

    return (
        <div
            className={cn(
                "flex flex-wrap gap-2 p-2 border rounded-md bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 min-h-[42px]",
                disabled && "opacity-50 cursor-not-allowed",
                className
            )}
            onClick={() => inputRef.current?.focus()}
        >
            {tags.map((tag, index) => (
                <Badge
                    key={`${tag}-${index}`}
                    variant="secondary"
                    className="flex items-center gap-1 px-2 py-1"
                >
                    {tag}
                    {!disabled && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                removeTag(index);
                            }}
                            className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    )}
                </Badge>
            ))}
            <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                placeholder={tags.length === 0 ? placeholder : ""}
                disabled={disabled}
                className="flex-1 min-w-[120px] bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                {...props}
            />
        </div>
    );
}

export default TagInput;
