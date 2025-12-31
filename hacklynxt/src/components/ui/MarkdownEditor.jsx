"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
    Bold,
    Italic,
    Heading1,
    Heading2,
    List,
    ListOrdered,
    Link,
    Quote,
    Code,
    Eye,
    Edit3
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * MarkdownEditor - A simple markdown editor with toolbar and preview
 * 
 * Features:
 * - Formatting toolbar (Bold, Italic, Headers, Lists, Links, Code, Quote)
 * - Write/Preview tabs
 * - Markdown preview rendering
 */
export function MarkdownEditor({
    value = "",
    onChange,
    placeholder = "Write your description in Markdown...",
    className,
    minHeight = "200px",
    disabled = false,
}) {
    const [activeTab, setActiveTab] = useState("write");

    const insertFormatting = useCallback((prefix, suffix = "", placeholder = "") => {
        const textarea = document.getElementById("markdown-editor-textarea");
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = value.substring(start, end) || placeholder;

        const newText =
            value.substring(0, start) +
            prefix +
            selectedText +
            suffix +
            value.substring(end);

        onChange?.(newText);

        // Restore cursor position after update
        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + prefix.length + selectedText.length + suffix.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    }, [value, onChange]);

    const toolbarButtons = [
        { icon: Bold, action: () => insertFormatting("**", "**", "bold text"), title: "Bold" },
        { icon: Italic, action: () => insertFormatting("*", "*", "italic text"), title: "Italic" },
        { icon: Heading1, action: () => insertFormatting("\n# ", "\n", "Heading 1"), title: "Heading 1" },
        { icon: Heading2, action: () => insertFormatting("\n## ", "\n", "Heading 2"), title: "Heading 2" },
        { icon: List, action: () => insertFormatting("\n- ", "", "List item"), title: "Bullet List" },
        { icon: ListOrdered, action: () => insertFormatting("\n1. ", "", "List item"), title: "Numbered List" },
        { icon: Quote, action: () => insertFormatting("\n> ", "", "Quote"), title: "Quote" },
        { icon: Code, action: () => insertFormatting("`", "`", "code"), title: "Inline Code" },
        { icon: Link, action: () => insertFormatting("[", "](url)", "link text"), title: "Link" },
    ];

    // Simple markdown to HTML renderer (basic)
    const renderMarkdown = (text) => {
        if (!text) return "<p class='text-muted-foreground'>Nothing to preview</p>";

        let html = text
            // Escape HTML first
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            // Headers
            .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
            .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>')
            .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
            // Bold and Italic
            .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            // Code blocks
            .replace(/```([\s\S]*?)```/g, '<pre class="bg-muted p-3 rounded-md my-2 overflow-x-auto"><code>$1</code></pre>')
            // Inline code
            .replace(/`(.+?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
            // Blockquotes
            .replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-primary pl-4 my-2 italic text-muted-foreground">$1</blockquote>')
            // Unordered lists
            .replace(/^\- (.*$)/gim, '<li class="ml-4">$1</li>')
            // Ordered lists
            .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>')
            // Links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline hover:no-underline" target="_blank" rel="noopener">$1</a>')
            // Line breaks
            .replace(/\n/g, '<br/>');

        return html;
    };

    return (
        <div className={cn("border rounded-md", className)}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex items-center justify-between border-b px-2 py-1 bg-muted/30">
                    {/* Toolbar */}
                    <div className="flex items-center gap-1 flex-wrap">
                        {toolbarButtons.map((btn, idx) => (
                            <Button
                                key={idx}
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={btn.action}
                                disabled={disabled || activeTab === "preview"}
                                title={btn.title}
                            >
                                <btn.icon className="h-4 w-4" />
                            </Button>
                        ))}
                    </div>

                    {/* Tab switcher */}
                    <TabsList className="h-8">
                        <TabsTrigger value="write" className="text-xs px-3 py-1 gap-1">
                            <Edit3 className="h-3 w-3" />
                            Write
                        </TabsTrigger>
                        <TabsTrigger value="preview" className="text-xs px-3 py-1 gap-1">
                            <Eye className="h-3 w-3" />
                            Preview
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="write" className="m-0">
                    <Textarea
                        id="markdown-editor-textarea"
                        value={value}
                        onChange={(e) => onChange?.(e.target.value)}
                        placeholder={placeholder}
                        disabled={disabled}
                        className="border-0 rounded-none focus-visible:ring-0 resize-none"
                        style={{ minHeight }}
                    />
                </TabsContent>

                <TabsContent value="preview" className="m-0">
                    <div
                        className="p-4 prose prose-sm max-w-none overflow-auto"
                        style={{ minHeight }}
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default MarkdownEditor;
