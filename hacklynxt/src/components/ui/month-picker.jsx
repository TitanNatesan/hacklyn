"use client"

import * as React from "react"
import { format, setMonth, setYear } from "date-fns"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
]

export function MonthPicker({ value, onChange, placeholder = "Select month" }) {
    const date = value ? new Date(value) : new Date()
    const [isOpen, setIsOpen] = React.useState(false)

    const currentYear = date.getFullYear()
    const currentMonth = date.getMonth()

    const handleYearChange = (offset) => {
        const newDate = setYear(date, currentYear + offset)
        onChange?.(newDate.toISOString())
    }

    const handleMonthSelect = (monthIndex) => {
        const newDate = setMonth(date, monthIndex)
        onChange?.(newDate.toISOString())
        setIsOpen(false)
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !value && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {value ? format(new Date(value), "MMM yyyy") : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3 border-none shadow-elevated" align="start">
                <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => { e.preventDefault(); handleYearChange(-1); }}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="text-sm font-bold">{currentYear}</div>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => { e.preventDefault(); handleYearChange(1); }}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {months.map((month, index) => (
                            <Button
                                key={month}
                                variant={currentMonth === index && value ? "default" : "ghost"}
                                size="sm"
                                className={cn(
                                    "h-9 w-full font-normal",
                                    currentMonth === index && value ? "bg-primary text-primary-foreground" : ""
                                )}
                                onClick={(e) => { e.preventDefault(); handleMonthSelect(index); }}
                            >
                                {month}
                            </Button>
                        ))}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
