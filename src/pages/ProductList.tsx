import { useEffect, useState } from 'react';
import { supabase, type Product } from '../lib/supabase';
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
				console.error('Error fetching products:', error);
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
		<div className="fade-in">
			<div className="hero-section">
				<h1 className="hero-title">
					Featured Collection
				</h1>
				<p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>
					Explore our premium selection of cutting-edge technology and accessories.
				</p>
			</div>

			<div className="product-grid">
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
				<div className="empty-cart" style={{ border: '1px dashed var(--border)', borderRadius: 'var(--radius)' }}>
					<p style={{ marginBottom: '1rem' }}>No products found in the database.</p>
				</div>
			)}
		</div>
	);
}
