/**
 * Utility Functions
 * 
 * Common helper functions used throughout the application.
 * Currently contains Tailwind CSS class merging utility.
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines and merges Tailwind CSS classes intelligently
 * 
 * This utility function combines clsx (for conditional classes) with
 * tailwind-merge (to resolve conflicting Tailwind classes).
 * 
 * Example:
 * ```tsx
 * cn("px-2 py-1", condition && "bg-blue-500", "px-4")
 * // Result: "py-1 bg-blue-500 px-4" (px-4 overrides px-2)
 * ```
 * 
 * @param inputs - Variable number of class values (strings, objects, arrays)
 * @returns Merged and deduplicated class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
