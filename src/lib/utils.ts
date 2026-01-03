import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { supabase } from "./supabase";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ImageOptions {
  width?: number;
  height?: number;
  resize?: "cover" | "contain" | "fill";
}

/**
 * Resolves the full path for a product image.
 * If the path is a full URL (starts with http), it's returned as is.
 * If running in production, it returns the Supabase Storage URL (with optional transforms).
 * If running in development, it returns the local Supabase Storage URL (with optional transforms).
 * If null/undefined, returns the default placeholder.
 */
export function resolveProductImage(
  filename: string | null | undefined,
  options?: ImageOptions
): string {
  const baseUrl = import.meta.env.BASE_URL;
  if (!filename) return `${baseUrl}logo.png`;
  if (filename.startsWith("http")) return filename; // Legacy remote URLs
  // Use (Local or Remote) Supabase Storage
  // The URL is determined by the VITE_SUPABASE_URL environment variable used to initialize the supabase client
  const { data } = supabase.storage.from("products").getPublicUrl(filename, {
    transform: options
      ? {
          width: options.width,
          height: options.height,
          resize: options.resize,
          format: "webp" as any,
        }
      : undefined,
  });
  return data.publicUrl;
}
