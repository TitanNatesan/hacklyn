"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
    PopoverAnchor,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { commonAPI } from "@/lib/api";
import { useDebounce } from "@/hooks/use-debounce";

/**
 * AutocompleteSingle: For single selection (School, Company)
 */
export function AutocompleteSingle({
    value,
    onChange,
    placeholder = "Select...",
    type = "institution",
    className,
}) {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState(value || "");
    const [results, setResults] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const debouncedQuery = useDebounce(query, 500);

    // Sync query with value if changed externally
    React.useEffect(() => {
        if (value !== undefined) setQuery(value || "");
    }, [value]);

    const loadOptions = React.useCallback(async (q) => {
        if (!q) {
            setResults([]);
            return;
        }
        setIsLoading(true);
        try {
            const data = await commonAPI.autocomplete(type, q);
            setResults(data || []);
        } catch (error) {
            console.error("Autocomplete fetch failed", error);
        } finally {
            setIsLoading(false);
        }
    }, [type]);

    React.useEffect(() => {
        loadOptions(debouncedQuery);
    }, [debouncedQuery, loadOptions]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverAnchor asChild>
                <div className={cn("relative", className)}>
                    <input
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder={placeholder}
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            onChange(e.target.value);
                            if (!open) setOpen(true);
                        }}
                        onFocus={() => setOpen(true)}
                        onBlur={() => {
                            // Delay to allow clicking results
                            setTimeout(() => setOpen(false), 200);
                        }}
                    />
                    <ChevronsUpDown className="absolute right-3 top-3 h-4 w-4 shrink-0 opacity-50 pointer-events-none" />
                </div>
            </PopoverAnchor>
            <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] p-0"
                align="start"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <Command shouldFilter={false}>
                    <CommandList>
                        {isLoading && <div className="p-4 text-xs text-center text-muted-foreground">Searching...</div>}

                        {/* Show "Create" option if query doesn't exactly match any result (case-insensitive) */}
                        {!isLoading && query && (
                            <CommandGroup>
                                {!results.some(r => r.name.toLowerCase() === query.trim().toLowerCase()) && (
                                    <CommandItem
                                        value={query + "___create"} // Unique value to prevent collision
                                        onSelect={() => {
                                            onChange(query);
                                            setOpen(false);
                                        }}
                                        className="cursor-pointer font-medium text-primary"
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create "{query}"
                                    </CommandItem>
                                )}
                            </CommandGroup>
                        )}

                        <CommandGroup>
                            {results.map((item) => (
                                <CommandItem
                                    key={item.id}
                                    value={item.name}
                                    onSelect={() => {
                                        onChange(item.name);
                                        setQuery(item.name);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === item.name ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {item.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

/**
 * AutocompleteMulti: For multiple selection (Skills, Technologies)
 */
export function AutocompleteMulti({
    value = [], // Array of strings or objects {id, name}
    onChange,
    placeholder = "Select skills...",
    type = "skill",
    className,
}) {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [results, setResults] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const debouncedQuery = useDebounce(query, 500);

    const inputRef = React.useRef(null);

    // Normalize value to array of strings for easy comparison
    const selectedNames = React.useMemo(() => {
        if (!Array.isArray(value)) return [];
        return value.map(item => typeof item === 'string' ? item : (item?.name || ""));
    }, [value]);

    const loadOptions = React.useCallback(async (q) => {
        if (!q) {
            setResults([]);
            return;
        }
        setIsLoading(true);
        try {
            const data = await commonAPI.autocomplete(type, q);
            setResults(data || []);
        } catch (error) {
            console.error("Autocomplete fetch failed", error);
        } finally {
            setIsLoading(false);
        }
    }, [type]);

    React.useEffect(() => {
        loadOptions(debouncedQuery);
    }, [debouncedQuery, loadOptions]);

    const handleSelect = (name) => {
        if (!selectedNames.includes(name)) {
            onChange([...value, name]);
        }
        setQuery("");
        inputRef.current?.focus();
    };

    const handleRemove = (name) => {
        onChange(value.filter(item => (typeof item === 'string' ? item : item.name) !== name));
    };

    return (
        <div className={cn("space-y-2", className)}>
            <div
                className="flex flex-wrap gap-2 min-h-[2.5rem] p-2 rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-all cursor-text"
                onClick={() => inputRef.current?.focus()}
            >
                {selectedNames.map((name) => (
                    <Badge key={name} variant="secondary" className="gap-1 px-2 py-1">
                        {name}
                        <button
                            type="button"
                            className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleRemove(name);
                            }}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                            onClick={() => handleRemove(name)}
                        >
                            <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                        </button>
                    </Badge>
                ))}

                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverAnchor asChild>
                        <input
                            ref={inputRef}
                            id={`autocomplete-input-${type}`}
                            className="flex-1 bg-transparent border-none outline-none text-sm min-w-[120px] h-7"
                            placeholder={selectedNames.length === 0 ? placeholder : ""}
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                if (!open) setOpen(true);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && query.trim()) {
                                    e.preventDefault();
                                    handleSelect(query.trim());
                                    setOpen(false);
                                }
                            }}
                            onFocus={() => setOpen(true)}
                            onBlur={() => {
                                // Delay close to allow clicking on results
                                setTimeout(() => setOpen(false), 200);
                            }}
                        />
                    </PopoverAnchor>
                    <PopoverContent
                        className="w-[var(--radix-popover-trigger-width)] p-0 shadow-xl"
                        align="start"
                        onOpenAutoFocus={(e) => e.preventDefault()}
                    >
                        <Command shouldFilter={false}>
                            <CommandList>
                                {isLoading && <div className="p-4 text-xs text-center text-muted-foreground">Searching...</div>}

                                {!isLoading && query && (
                                    <CommandGroup>
                                        {!results.some(r => r.name.toLowerCase() === query.trim().toLowerCase()) && (
                                            <CommandItem
                                                value={query + "___create"}
                                                onSelect={() => handleSelect(query.trim())}
                                                className="cursor-pointer font-medium text-primary"
                                            >
                                                <Plus className="mr-2 h-4 w-4" />
                                                Create "{query}"
                                            </CommandItem>
                                        )}
                                    </CommandGroup>
                                )}

                                <CommandGroup>
                                    {results
                                        .filter(item => !selectedNames.includes(item.name))
                                        .map((item) => (
                                            <CommandItem
                                                key={item.id}
                                                value={item.name}
                                                onSelect={() => handleSelect(item.name)}
                                            >
                                                {item.name}
                                            </CommandItem>
                                        ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>

                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
}
