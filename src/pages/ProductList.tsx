import { useEffect, useState } from 'react';
import { supabase, type Product } from '../lib/supabase';
import logger from '../lib/logger';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../context/useCart';

/**
 * The product listing page (Home page).
 * Fetches and displays a grid of products available for purchase.
 *
 * @returns The rendered product list.
 */
export function ProductList() {
	const [products, setProducts] = useState<Product[] | null>(null);
	const [loading, setLoading] = useState(true);
	const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();

	const cartMap = new Map(cartItems.map(item => [item.productId, item.quantity]));

	useEffect(() => {
		async function fetchProducts() {
			const { data, error } = await supabase.from('products').select('*');
			if (error) {
				logger.error('Error fetching products:', error);
			} else {
				setProducts(data);
			}
			setLoading(false);
		}
		fetchProducts();
	}, []);

	if (loading) return <div className="empty-cart">Loading products...</div>;
	if (!products) return <div className="empty-cart">No products found.</div>;

	return (
		<div className="animate-in fade-in duration-700">
			<div className="text-center mb-12 max-w-2xl mx-auto">
				<h1 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
					Featured Collection
				</h1>
				<p className="text-muted-foreground text-lg">
					Explore our premium selection of cutting-edge technology and accessories.
				</p>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
				{products.map(product => (
					<ProductCard
						key={product.id}
						product={product}
						cartQuantity={cartMap.get(product.id!) || 0}
						onAddToCart={addToCart}
						onUpdateQuantity={updateQuantity}
						onRemoveFromCart={removeFromCart}
					/>
				))}
			</div>

			{products.length === 0 && (
				<div className="text-center py-16 px-4 border border-dashed border-border rounded-lg">
					<p style={{ marginBottom: '1rem' }}>No products found in the database.</p>
				</div>
			)}
		</div>
	);
}
