import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CartPage() {
	const cartItems = useLiveQuery(async () => {
		const items = await db.cart.toArray();
		const productIds = items.map(i => i.productId);
		const products = await db.products.bulkGet(productIds);

		return items.map((item, idx) => {
			const product = products[idx];
			if (!product) return null;
			return {
				cartId: item.id!,
				quantity: item.quantity,
				product
			};
		}).filter((i): i is NonNullable<typeof i> => i !== null);
	}, []);

	const handleUpdate = async (id: number, currentQty: number, delta: number) => {
		const newQty = currentQty + delta;
		if (newQty <= 0) {
			await db.cart.delete(id);
		} else {
			await db.cart.update(id, { quantity: newQty });
		}
	};

	const removeItem = (id: number) => db.cart.delete(id);

	if (!cartItems) return <div className="empty-cart">Loading cart...</div>;

	const total = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

	if (cartItems.length === 0) {
		return (
			<div className="empty-cart fade-in">
				<div className="empty-icon">
					<ShoppingBag size={40} />
				</div>
				<h2 className="cart-title" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Your Cart is Empty</h2>
				<p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem auto' }}>
					Looks like you haven't added anything to your cart yet. Explore our products to find something you'll love.
				</p>
				<Link to="/" className="btn btn-primary">
					Start Shopping
				</Link>
			</div>
		);
	}

	return (
		<div className="fade-in">
			<div className="cart-header">
				<ShoppingBag className="text-[var(--accent)]" size={32} />
				<h1 className="cart-title">Shopping Cart</h1>
				<span className="cart-count">({cartItems.length} items)</span>
			</div>

			<div className="cart-layout">
				<div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
					{cartItems.map(({ cartId, quantity, product }) => (
						<div key={cartId} className="cart-item">
							<div className="cart-item-image">
								<img src={product.image} alt={product.name} className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal" />
							</div>

							<div className="cart-item-info">
								<Link to={`/product/${product.id}`} className="cart-item-title">
									{product.name}
								</Link>
								<div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{product.category}</div>
								<div className="cart-item-price">${product.price.toFixed(2)}</div>
							</div>

							<div className="cart-controls">
								<div className="qty-control">
									<button
										onClick={() => handleUpdate(cartId, quantity, -1)}
										className="qty-btn"
										aria-label="Decrease quantity"
									>
										<Minus size={16} />
									</button>
									<span className="qty-val">{quantity}</span>
									<button
										onClick={() => handleUpdate(cartId, quantity, 1)}
										className="qty-btn"
										aria-label="Increase quantity"
									>
										<Plus size={16} />
									</button>
								</div>
								<button
									onClick={() => removeItem(cartId)}
									className="remove-btn"
								>
									<Trash2 size={16} /> Remove
								</button>
							</div>
						</div>
					))}
				</div>

				<div>
					<div className="summary-card">
						<h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem' }}>Order Summary</h2>

						<div className="summary-row">
							<span>Subtotal</span>
							<span>${total.toFixed(2)}</span>
						</div>
						<div className="summary-row">
							<span>Shipping</span>
							<span style={{ color: 'green' }}>Free</span>
						</div>
						<div className="summary-row">
							<span>Tax</span>
							<span>Calculated at checkout</span>
						</div>

						<div className="summary-total">
							<span>Total</span>
							<span style={{ color: 'var(--accent)' }}>${total.toFixed(2)}</span>
						</div>

						<button className="btn btn-primary btn-full" onClick={() => alert('Checkout flow would start here!')}>
							Proceed to Checkout <ArrowRight size={18} />
						</button>

						<p style={{ fontSize: '0.75rem', textAlign: 'center', color: 'var(--text-secondary)', marginTop: '1rem' }}>
							Secure Checkout powered by OpenStore
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
