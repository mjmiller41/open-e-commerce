import { createContext, useContext } from "react";
import type { Product } from "../lib/supabase";

/**
 * Represents a single item in the shopping cart.
 */
export interface CartItem {
  /** The unique identifier for the cart item entry. */
  id: string; // generated uuid for cart item logic or just product id mapping? simplest is product id based
  /** The ID of the product. */
  productId: number;
  /** The quantity of the product in the cart. */
  quantity: number;
  /** The full product details, optionally populated. */
  product?: Product; // Optimistic or joined data
}

/**
 * The shape of the context provided by CartProvider.
 */
export interface CartContextType {
  /** The list of items currently in the cart. */
  cartItems: CartItem[];
  /** Adds a product to the cart. */
  addToCart: (product: Product) => void;
  /** Updates the quantity of a specific product in the cart. */
  updateQuantity: (productId: number, delta: number) => void;
  /** Removes a product from the cart completely. */
  removeFromCart: (productId: number) => void;
  /** Clears all items from the cart. */
  clearCart: () => void;
  /** The total number of items in the cart (sum of quantities). */
  cartCount: number;
}

/**
 * The React Context for the shopping cart.
 */
export const CartContext = createContext<CartContextType | undefined>(
  undefined
);

/**
 * Hook to access the cart context.
 * Must be used within a CartProvider.
 *
 * @returns The cart context definition.
 * @throws Error if used outside of a CartProvider.
 */
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
