import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

/**
 * The Supabase client instance using environment variables for configuration.
 * Throws an error if required environment variables are missing.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Represents a product in the e-commerce system.
 */
export interface Product {
  /** The unique identifier of the product. */
  id: number;
  /** The name of the product. */
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  on_hand: number;
}
