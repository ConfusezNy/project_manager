/**
 * Shared image utilities
 * ⚠️ Use this everywhere instead of declaring API_URL / getImageSrc locally.
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

/**
 * Convert a relative or absolute image URL to a full URL.
 * Returns null when the input is falsy.
 */
export function getImageSrc(url?: string | null): string | null {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${API_URL}${url}`;
}
