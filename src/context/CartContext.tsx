import { useEffect, useState, type ReactNode } from 'react';
import type { Product } from '../lib/supabase';
import { CartContext, type CartItem } from './useCart';

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

	return (
		<CartContext.Provider value={{ cartItems, addToCart, updateQuantity, removeFromCart, clearCart, cartCount }}>
			{children}
		</CartContext.Provider>
	);
}
