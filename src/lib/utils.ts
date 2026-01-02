import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { supabase } from "./supabase";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Resolves the full path for a product image.
 * If the path is a full URL (starts with http), it's returned as is.
 * If running in production, it returns the Supabase Storage URL.
 * If running in development, it returns the local path /images/products/[filename].
 * If null/undefined, returns the default placeholder.
 */
export function resolveProductImage(
  imagePath: string | null | undefined
): string {
  const baseUrl = import.meta.env.BASE_URL;
  console.log("imagePath:", imagePath);
  if (!imagePath) return `${baseUrl}logo.png`;
  if (imagePath.startsWith("http")) return imagePath; // Legacy remote URLs

  // Clean filename if it contains the legacy local path prefix
  let filename = imagePath;
  if (imagePath.startsWith("/images/products/")) {
    filename = imagePath.replace("/images/products/", "");
  } else if (imagePath.startsWith("images/products/")) {
    filename = imagePath.replace("images/products/", "");
  }

  // Use (Remote) Supabase Storage in Production
  if (import.meta.env.PROD) {
    const { data } = supabase.storage.from("products").getPublicUrl(filename);
    return data.publicUrl;
  }

  // Development: Use local public folder
  // Check if it already has the base prefix
  if (imagePath.startsWith(baseUrl)) return imagePath;

  // Handle paths that might have been hardcoded relative to root
  if (imagePath.startsWith("/images/products/")) {
    return `${baseUrl}${imagePath.slice(1)}`;
  }

  return `${baseUrl}images/products/${imagePath}`;
}
