"use client"

import * as React from "react"
import { Calendar as CalendarIcon, Clock } from "lucide-react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

export function DateTimePicker({ value, onChange, placeholder = "Pick date & time" }) {
    const [date, setDate] = React.useState(value ? new Date(value) : undefined)
    const [time, setTime] = React.useState(value ? format(new Date(value), "HH:mm") : "12:00")

    // Update internal state when value prop changes externally
    React.useEffect(() => {
        if (value) {
            try {
                const d = new Date(value)
                if (!isNaN(d.getTime())) {
                    setDate(d)
                    setTime(format(d, "HH:mm"))
                }
            } catch (e) {
                console.error("Invalid date value:", value)
            }
        }
    }, [value])

    const handleDateSelect = (selectedDate) => {
        if (!selectedDate) {
            setDate(undefined)
            onChange(undefined)
            return
        }

        // Merge time
        const [hours, minutes] = time.split(':').map(Number)
        selectedDate.setHours(hours)
        selectedDate.setMinutes(minutes)

        setDate(selectedDate)
        onChange(selectedDate.toISOString())
    }

    const handleTimeChange = (e) => {
        const newTime = e.target.value
        setTime(newTime)

        if (date) {
            const [hours, minutes] = newTime.split(':').map(Number)
            const newDate = new Date(date)
            newDate.setHours(hours)
            newDate.setMinutes(minutes)
            setDate(newDate)
            onChange(newDate.toISOString())
        }
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal border shadow-sm bg-white h-11 rounded-xl",
                        !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP p") : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-xl" align="start">
                <div className="p-3 border-b border-border">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleDateSelect}
                        initialFocus
                        className="p-0"
                    />
                </div>
                <div className="p-3 flex items-center gap-2 bg-muted/20">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <Input
                        type="time"
                        value={time}
                        onChange={handleTimeChange}
                        className="w-full bg-white"
                    />
                </div>
            </PopoverContent>
        </Popover>
    )
}
