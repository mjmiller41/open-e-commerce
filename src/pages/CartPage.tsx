import { Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { QuantityControl } from '../components/QuantityControl';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useEffect, useState } from 'react';
import { supabase, type Product } from '../lib/supabase';

export function CartPage() {
	const { cartItems, updateQuantity, removeFromCart } = useCart();
	const [products, setProducts] = useState<Map<number, Product>>(new Map());
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchCartProducts() {
			if (cartItems.length === 0) {
				setLoading(false);
				return;
			}

			const productIds = cartItems.map(item => item.productId);
			const { data, error } = await supabase.from('products').select('*').in('id', productIds);

			if (error) {
				console.error('Error fetching cart products:', error);
			} else if (data) {
				const productMap = new Map();
				data.forEach(p => productMap.set(p.id, p));
				setProducts(productMap);
			}
			setLoading(false);
		}
		fetchCartProducts();
	}, [cartItems]); // Re-fetch if new items added that we might not have info for. Optimization could be better but this is simple.

	const handleUpdate = (productId: number, currentQty: number, delta: number) => {
		const newQty = currentQty + delta;
		if (newQty <= 0) {
			removeFromCart(productId);
		} else {
			updateQuantity(productId, delta);
		}
	};

	const removeItem = (productId: number) => removeFromCart(productId);

	if (loading) return <div className="empty-cart">Loading cart...</div>;

	// Enhance cart items with product data
	const enrichedCartItems = cartItems.map(item => {
		const product = products.get(item.productId);
		return product ? { ...item, product } : null;
	}).filter((item): item is NonNullable<typeof item> => item !== null);

	const total = enrichedCartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

	if (enrichedCartItems.length === 0) {
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
				<span className="cart-count">({enrichedCartItems.length} items)</span>
			</div>

			<div className="cart-layout">
				<div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
					{enrichedCartItems.map(({ productId, quantity, product }) => (
						<div key={productId} className="card cart-item">
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
								<QuantityControl
									quantity={quantity}
									onDecrease={() => handleUpdate(productId, quantity, -1)}
									onIncrease={() => handleUpdate(productId, quantity, 1)}
									maxQuantity={product.on_hand}
								/>
								<button
									onClick={() => removeItem(productId)}
									className="remove-btn"
								>
									<Trash2 size={16} /> Remove
								</button>
							</div>
						</div>
					))}
				</div>

				<div>
					<div className="card summary-card">
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
