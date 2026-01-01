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
  /** The name of the product. */
  name: string;
  price: number;
  description: string;
  /** @deprecated use images instead */
  image: string;
  images: string[];
  category: string;
  on_hand: number;
  cost?: number;
  sku?: string;
  tags?: string[];
  weight?: number;
  product_type?: string;
  brand?: string;
  gtin?: string;
  mpn?: string;
  condition?: string;
  variant?: string;
  status: "active" | "inactive" | "draft" | "archived";
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
  phone_number: string | null;
  updated_at?: string;
  email?: string;
  email_verified?: boolean;
}

export interface Address {
  id: string;
  user_id: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
}

export interface Review {
  id: number;
  user_id: string;
  product_id: number;
  order_id: number;
  rating: number;
  comment: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  profiles?: {
    full_name: string | null;
  };
  products?: {
    name: string;
  };
}
