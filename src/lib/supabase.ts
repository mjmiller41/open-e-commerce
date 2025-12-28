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

export type OrderStatus = "pending" | "processing" | "shipped" | "cancelled";

export interface Order {
  id: number;
  user_id: string;
  status: OrderStatus;
  total_amount: number;
  shipping_address: string;
  created_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  user_id: string;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
}

export interface Profile {
  id: string;
  role: "customer" | "admin";
  full_name: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  phone_number: string | null;
  updated_at?: string;
  email?: string;
  email_verified?: boolean;
}
