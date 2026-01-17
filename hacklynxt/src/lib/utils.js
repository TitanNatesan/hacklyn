import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, isValid, differenceInMonths, formatDistanceToNow } from "date-fns";

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function formatDate(dateString, formatStr = "MMM yyyy") {
    if (!dateString) return "";
    try {
        const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
        if (!isValid(date)) return dateString;
        return format(date, formatStr);
    } catch (e) {
        return dateString;
    }
}

export function formatDateRange(startDate, endDate, current = false) {
    if (!startDate) return "";

    const start = formatDate(startDate);
    const end = current ? "Present" : formatDate(endDate);

    // Calculate duration
    try {
        const startD = parseISO(startDate);
        const endD = current ? new Date() : (endDate ? parseISO(endDate) : null);

        if (isValid(startD) && endD && isValid(endD)) {
            const totalMonths = differenceInMonths(endD, startD) + 1; // Include start month
            const years = Math.floor(totalMonths / 12);
            const months = totalMonths % 12;

            let duration = "";
            if (years > 0) duration += `${years} yr${years > 1 ? 's' : ''} `;
            if (months > 0) duration += `${months} mo${months > 1 ? 's' : ''}`;
            if (duration) return `${start} — ${end} (${duration.trim()})`;
        }
    } catch (e) {
        // ignore
    }

    return `${start} — ${end}`;
}

export function formatEventDate(startDate, endDate) {
    if (!startDate) return "";
    try {
        const start = parseISO(startDate);
        const end = endDate ? parseISO(endDate) : null;

        if (!isValid(start)) return startDate;

        if (!end || !isValid(end)) {
            return format(start, "MMM d, yyyy");
        }

        const startYear = format(start, "yyyy");
        const endYear = format(end, "yyyy");

        if (startYear !== endYear) {
            return `${format(start, "MMM d, yyyy")} — ${format(end, "MMM d, yyyy")}`;
        }

        const startMonth = format(start, "MMM");
        const endMonth = format(end, "MMM");

        if (startMonth !== endMonth) {
            return `${format(start, "MMM d")} — ${format(end, "MMM d, yyyy")}`;
        }

        const startDay = format(start, "d");
        const endDay = format(end, "d");

        if (startDay !== endDay) {
            return `${format(start, "MMM d")} — ${endDay}, ${startYear}`;
        }

        return format(start, "MMM d, yyyy");
    } catch (e) {
        return startDate;
    }
}

export function getRelativeTime(dateString) {
    if (!dateString) return "";
    try {
        const date = parseISO(dateString);
        if (!isValid(date)) return dateString;
        return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
        return dateString;
    }
}
