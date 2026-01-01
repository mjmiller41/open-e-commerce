import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Resolves the full path for a product image.
 * If the path is a full URL (starts with http), it's returned as is.
 * If it's a filename, it returns the local path /images/products/[filename].
 * If null/undefined, returns the default placeholder.
 */
export function resolveProductImage(
  imagePath: string | null | undefined
): string {
  const baseUrl = import.meta.env.BASE_URL;
  if (!imagePath) return `${baseUrl}logo.png`;
  if (imagePath.startsWith("http")) return imagePath; // Legacy remote URLs

  // Check if it already has the base prefix
  if (imagePath.startsWith(baseUrl)) return imagePath;

  // Handle paths that might have been hardcoded relative to root
  if (imagePath.startsWith("/images/products/")) {
    return `${baseUrl}${imagePath.slice(1)}`;
  }

  return `${baseUrl}images/products/${imagePath}`;
}
