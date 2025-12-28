import { useParams, Link } from 'react-router-dom';
import { supabase, type Product } from '../lib/supabase';
import logger from '../lib/logger';
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
				logger.error('Error fetching product:', error);
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
		<div className="max-w-5xl mx-auto animate-in fade-in duration-500">
			<Link to="/" className="inline-flex items-center gap-2 text-muted-foreground mb-8 font-medium hover:text-primary transition-colors">
				<ArrowLeft size={20} /> Back to Products
			</Link>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-12">
				<div className="rounded-2xl bg-muted overflow-hidden">
					<img src={product.image} alt={product.name} className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal" />
				</div>

				<div>
					<div className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">{product.category}</div>
					<h1 className="text-4xl font-bold mb-4 leading-tight">{product.name}</h1>
					<div className="text-3xl font-bold mb-6 text-foreground">${product.price.toFixed(2)}</div>

					<div className="text-lg text-muted-foreground leading-relaxed mb-8">
						{product.description}
					</div>

					<div className="bg-muted/50 p-6 rounded-lg mb-8">
						<div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
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
								className="w-full max-w-xs"
							/>
						) : (
							<button
								onClick={handleAddToCart}
								disabled={product.on_hand <= 0 || isAdding}
								className={`btn btn-primary w-full ${isAdding ? 'opacity-80' : ''}`}
							>
								{isAdding ? 'Added!' : (
									<>
										<ShoppingCart size={24} /> Add to Cart
									</>
								)}
							</button>
						)}

					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Truck size={18} />
							<span>Free Shipping</span>
						</div>
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<ShieldCheck size={18} />
							<span>2 Year Warranty</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
