import { useParams, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { ShoppingCart, ArrowLeft, Package, Truck, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { QuantityControl } from '../components/QuantityControl';

export function ProductDetail() {
	const { id } = useParams<{ id: string }>();
	const productId = parseInt(id || '0');

	const product = useLiveQuery(() => db.products.get(productId), [productId]);
	const cartItem = useLiveQuery(
		async () => {
			if (!product?.id) return undefined;
			return await db.cart.where({ productId: product.id }).first();
		},
		[product?.id]
	);

	const [isAdding, setIsAdding] = useState(false);

	const addToCart = async () => {
		if (!product?.id) return;
		setIsAdding(true);
		try {
			await db.cart.add({ productId: product.id, quantity: 1 });
			setTimeout(() => setIsAdding(false), 500);
		} catch (error) {
			console.error(error);
			setIsAdding(false);
		}
	};

	const updateQuantity = async (id: number, delta: number) => {
		const item = await db.cart.get(id);
		if (item) {
			await db.cart.update(id, { quantity: item.quantity + delta });
		}
	};

	if (productId === 0 || !product) {
		if (product === undefined) return <div className="empty-cart">Loading...</div>;
		return <div className="empty-cart">Product not found</div>;
	}

	return (
		<div className="product-detail-container fade-in">
			<Link to="/" className="back-link">
				<ArrowLeft size={20} /> Back to Products
			</Link>

			<div className="detail-grid">
				<div className="detail-image">
					<img src={product.image} alt={product.name} className="product-image" />
				</div>

				<div>
					<div className="detail-category">{product.category}</div>
					<h1 className="detail-title">{product.name}</h1>
					<div className="detail-price">${product.price.toFixed(2)}</div>

					<div className="detail-desc">
						{product.description}
					</div>

					<div className="detail-actions">
						<div className="stock-indicator">
							<Package size={18} />
							<span>{product.onHand > 0 ? `In Stock (${product.onHand} available)` : 'Out of Stock'}</span>
						</div>

						{cartItem ? (
							<QuantityControl
								quantity={cartItem.quantity}
								onDecrease={() => {
									if (cartItem.quantity > 1) {
										updateQuantity(cartItem.id!, -1);
									} else {
										db.cart.delete(cartItem.id!);
									}
								}}
								onIncrease={() => updateQuantity(cartItem.id!, 1)}
								maxQuantity={product.onHand}
								className="w-full"
							/>
						) : (
							<button
								onClick={addToCart}
								disabled={product.onHand <= 0 || isAdding}
								className={`btn btn-primary btn-full ${isAdding ? 'opacity-80' : ''}`}
							>
								{isAdding ? 'Added!' : (
									<>
										<ShoppingCart size={24} /> Add to Cart
									</>
								)}
							</button>
						)}

					</div>

					<div className="feature-grid">
						<div className="feature-item">
							<Truck size={18} />
							<span>Free Shipping</span>
						</div>
						<div className="feature-item">
							<ShieldCheck size={18} />
							<span>2 Year Warranty</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
