import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Product } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useToast } from './ToastContext';
import { useStoreSettings } from './StoreSettingsContext';

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
	/** Whether the cart drawer is currently open. */
	isCartOpen: boolean;
	/** Opens the cart drawer. */
	openCart: () => void;
	/** Closes the cart drawer. */
	closeCart: () => void;
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

const CART_STORAGE_KEY = 'open-ecommerce-cart';

/**
 * Provides the cart context to its children.
 * Manages cart state including adding, updating, and removing items, as well as persistence to local storage.
 *
 * @param props - The component props.

 * @returns The provider component.
 */
export function CartProvider(props: { children: ReactNode }) {
	const { children } = props;
	const [cartItems, setCartItems] = useState<CartItem[]>(() => {
		const stored = localStorage.getItem(CART_STORAGE_KEY);
		return stored ? JSON.parse(stored) : [];
	});
	const { settings } = useStoreSettings();
	const { addToast } = useToast();
	const navigate = useNavigate();

	useEffect(() => {
		localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
	}, [cartItems]);

	const addToCart = (product: Product) => {
		setCartItems(prev => {
			const existing = prev.find(item => item.productId === product.id);
			if (existing) {
				return prev.map(item =>
					item.productId === product.id
						? { ...item, quantity: item.quantity + 1 }
						: item
				);
			}
			return [...prev, { id: crypto.randomUUID(), productId: product.id, quantity: 1, product }];
		});

		if (settings?.cart_type === 'drawer') {
			setIsCartOpen(true);
		} else if (settings?.cart_type === 'notification') {
			addToast(`Added ${product.name} to cart`, 'success');
		} else if (settings?.cart_type === 'page') {
			navigate('/cart');
		}
	};

	const updateQuantity = (productId: number, delta: number) => {
		setCartItems(prev => {
			return prev.map(item => {
				if (item.productId === productId) {
					const newQty = item.quantity + delta;
					return newQty > 0 ? { ...item, quantity: newQty } : item;
				}
				return item;
			}).filter(item => item.quantity > 0);
		});
	};

	const removeFromCart = (productId: number) => {
		setCartItems(prev => prev.filter(item => item.productId !== productId));
	};

	const clearCart = () => {
		setCartItems([]);
	};

	const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

	const [isCartOpen, setIsCartOpen] = useState(false);
	const openCart = () => setIsCartOpen(true);
	const closeCart = () => setIsCartOpen(false);

	return (
		<CartContext.Provider value={{ cartItems, addToCart, updateQuantity, removeFromCart, clearCart, cartCount, isCartOpen, openCart, closeCart }}>
			{children}
		</CartContext.Provider>
	);
}
