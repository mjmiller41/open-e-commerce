import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Product } from '../db';
import { ProductCard } from '../components/ProductCard';

export function ProductList() {
	const products = useLiveQuery(() => db.products.toArray());
	const cartItems = useLiveQuery(() => db.cart.toArray());

	const cartMap = new Map(cartItems?.map(item => [item.productId, item.quantity]));

	const addToCart = async (product: Product) => {
		if (!product.id) return;
		try {
			await db.cart.add({ productId: product.id, quantity: 1 });
		} catch (error) {
			console.error("Failed to add to cart:", error);
		}
	};

	const updateQuantity = async (productId: number, delta: number) => {
		const currentQty = cartMap.get(productId) || 0;
		const newQty = currentQty + delta;
		const cartItem = await db.cart.where({ productId }).first();

		if (cartItem) {
			if (newQty <= 0) {
				await db.cart.delete(cartItem.id!);
			} else {
				await db.cart.update(cartItem.id!, { quantity: newQty });
			}
		}
	};

	if (!products) return <div className="empty-cart">Loading products...</div>;

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
					/>
				))}
			</div>

			{products.length === 0 && (
				<div className="empty-cart" style={{ border: '1px dashed var(--border)', borderRadius: 'var(--radius)' }}>
					<p style={{ marginBottom: '1rem' }}>No products found in the database.</p>
					<button
						onClick={() => window.location.reload()}
						className="btn btn-primary"
					>
						Refresh to Seed Data
					</button>
				</div>
			)}
		</div>
	);
}
