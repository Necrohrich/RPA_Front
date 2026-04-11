import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function resolveLabel(
    label: unknown,
    lang:  string,
): string {
    if (typeof label === 'string') return label
    if (typeof label === 'object' && label !== null) {
        const l = label as Record<string, string>
        return l[lang] ?? l['ru'] ?? l['en'] ?? ''
    }
    return ''
}