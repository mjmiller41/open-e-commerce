import { useParams, Link } from 'react-router-dom';
import { supabase, type Product } from '../lib/supabase';
import { ShoppingCart, ArrowLeft, Package, Truck, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { QuantityControl } from '../components/QuantityControl';
import { useCart } from '../context/useCart';

/**
 * The product detail page.
 * Displays detailed information about a specific product identified by the route parameter `id`.
 *
 * @returns The rendered product detail page.
 */
export function ProductDetail() {
	const { id } = useParams<{ id: string }>();
	const productId = parseInt(id || '0');
	const [product, setProduct] = useState<Product | null>(null);
	const [loading, setLoading] = useState(true);

	const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();
	const cartItem = cartItems.find(item => item.productId === productId);

	useEffect(() => {
		async function fetchProduct() {
			if (!productId) return;
			const { data, error } = await supabase.from('products').select('*').eq('id', productId).single();
			if (error) {
				console.error('Error fetching product:', error);
			} else {
				setProduct(data);
			}
			setLoading(false);
		}
		fetchProduct();
	}, [productId]);

	const [isAdding, setIsAdding] = useState(false);

	const handleAddToCart = () => {
		if (!product) return;
		setIsAdding(true);
		addToCart(product);
		setTimeout(() => setIsAdding(false), 500);
	};

	if (productId === 0 || (!product && !loading)) {
		if (loading) return <div className="empty-cart">Loading...</div>;
		return <div className="empty-cart">Product not found</div>;
	}

	if (loading || !product) {
		return <div className="empty-cart">Loading...</div>;
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
							<span>{product.on_hand > 0 ? `In Stock (${product.on_hand} available)` : 'Out of Stock'}</span>
						</div>

						{cartItem ? (
							<QuantityControl
								quantity={cartItem.quantity}
								onDecrease={() => {
									if (cartItem.quantity > 1) {
										updateQuantity(productId, -1);
									} else {
										removeFromCart(productId);
									}
								}}
								onIncrease={() => updateQuantity(productId, 1)}
								maxQuantity={product.on_hand}
								className="w-full"
							/>
						) : (
							<button
								onClick={handleAddToCart}
								disabled={product.on_hand <= 0 || isAdding}
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
