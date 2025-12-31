"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Building2, Plus, GraduationCap } from "lucide-react";
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
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { commonAPI } from "@/lib/api";

export function OrganizationPicker({ value, onChange, onTypeChange }) {
    const [open, setOpen] = React.useState(false);
    const [options, setOptions] = React.useState([]);
    const [query, setQuery] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [isCompany, setIsCompany] = React.useState(false);

    // Debounce fetch
    React.useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length < 2) {
                setOptions([]);
                return;
            }
            setLoading(true);
            try {
                // Assuming commonAPI.autocomplete returns { results: [{ name: '...', type: '...' }] }
                // or similar list.
                const data = await commonAPI.autocomplete("organization", query);
                setOptions(Array.isArray(data) ? data : (data.results || []));
            } catch (error) {
                console.error("Failed to fetch organizations", error);
                setOptions([]);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = (currentValue, option) => {
        onChange(currentValue);
        // If it's an existing option, set type accordingly
        if (option) {
            const isComp = option.type === 'company' || option.is_company;
            setIsCompany(isComp);
            if (onTypeChange) onTypeChange(isComp);
        } else {
            // New entry, default to university (false) unless user checks box
            setIsCompany(false);
            if (onTypeChange) onTypeChange(false);
        }
        setOpen(false);
    };

    const handleCreate = () => {
        onChange(query);
        setIsCompany(false); // Default to university
        if (onTypeChange) onTypeChange(false);
        setOpen(false);
    };

    // Check if the current value matches any existing option exactly
    const existingMatch = options.find(opt => opt.name.toLowerCase() === (value || "").toLowerCase());
    const isNewEntry = value && !existingMatch;

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full justify-between"
                        >
                            {value ? (
                                <span className="flex items-center gap-2">
                                    {isCompany ? <Building2 className="w-4 h-4 text-blue-500" /> : <GraduationCap className="w-4 h-4 text-emerald-500" />}
                                    {value}
                                </span>
                            ) : (
                                "Select organization..."
                            )}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                        <Command shouldFilter={false}>
                            <CommandInput
                                placeholder="Search college or company..."
                                onValueChange={setQuery}
                            />
                            <CommandList>
                                {loading && <div className="py-6 text-center text-sm text-muted-foreground">Loading...</div>}
                                {!loading && options.length === 0 && query.length > 2 && (
                                    <CommandEmpty>
                                        <div className="flex flex-col items-center gap-2">
                                            <span>No results found.</span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="mt-2 text-xs"
                                                onClick={handleCreate}
                                            >
                                                <Plus className="w-3 h-3 mr-1" />
                                                Create "{query}"
                                            </Button>
                                        </div>
                                    </CommandEmpty>
                                )}
                                <CommandGroup>
                                    {options.map((option) => (
                                        <CommandItem
                                            key={option.id || option.name}
                                            value={option.name} // Important for selection
                                            onSelect={(currentValue) => handleSelect(option.name, option)}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    value === option.name ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            <div className="flex flex-col">
                                                <span>{option.name}</span>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    {option.type === 'company' || option.is_company
                                                        ? <><Building2 className="w-3 h-3" /> Company</>
                                                        : <><GraduationCap className="w-3 h-3" /> University</>}
                                                </span>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>

            {/* Checkbox for new entries */}
            {isNewEntry && (
                <div className="flex items-center space-x-2 animate-in fade-in-0 slide-in-from-top-1 bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                    <Checkbox
                        id="is_company"
                        checked={isCompany}
                        onCheckedChange={(checked) => {
                            setIsCompany(checked);
                            if (onTypeChange) onTypeChange(checked);
                        }}
                    />
                    <Label
                        htmlFor="is_company"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        This is a Company / Corporate Entity
                    </Label>
                </div>
            )}
        </div>
    );
}
