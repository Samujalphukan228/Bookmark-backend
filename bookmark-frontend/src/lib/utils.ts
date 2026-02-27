import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    })
}

export function getDomain(url: string): string {
    try {
        return new URL(url).hostname
    } catch {
        return url
    }
}

export function truncate(str: string, length: number): string {
    if (str.length <= length) return str
    return str.slice(0, length) + "..."
}