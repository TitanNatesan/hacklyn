"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export function DatePicker({ value, onChange, placeholder = "Pick a date" }) {
    const date = value ? new Date(value) : null

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-none shadow-elevated" align="start">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(selectedDate) => {
                        // Handle both null and Date cases
                        if (selectedDate) {
                            onChange?.(selectedDate.toISOString())
                        } else {
                            onChange?.(null)
                        }
                    }}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    )
}
