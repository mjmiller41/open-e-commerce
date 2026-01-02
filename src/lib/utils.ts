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
  filename: string | null | undefined
): string {
  const baseUrl = import.meta.env.BASE_URL;

  if (!filename) return `${baseUrl}logo.png`;
  if (filename.startsWith("http")) return filename; // Legacy remote URLs

  // Use (Local or Remote) Supabase Storage
  // The URL is determined by the VITE_SUPABASE_URL environment variable used to initialize the supabase client
  const { data } = supabase.storage.from("products").getPublicUrl(filename);
  return data.publicUrl;
}
