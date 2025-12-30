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




	// State for active image in gallery
	const [activeImage, setActiveImage] = useState<string>('');

	const [isAdding, setIsAdding] = useState(false);

	useEffect(() => {
		async function fetchProduct() {
			if (!productId) return;
			const { data, error } = await supabase.from('products').select('*').eq('id', productId).eq('status', 'active').single();
			if (error) {
				logger.error('Error fetching product:', error);
			} else {
				setProduct(data);
				setActiveImage(data.images?.[0] || data.image || `${import.meta.env.BASE_URL}logo.png`);
			}
			setLoading(false);
		}
		fetchProduct();
	}, [productId]);


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

	// JSON-LD Structured Data
	const structuredData = {
		"@context": "https://schema.org/",
		"@type": "Product",
		"name": product.name,
		"image": product.images && product.images.length > 0 ? product.images : [product.image],
		"description": product.description,
		"sku": product.sku,
		"mpn": product.mpn,
		"brand": {
			"@type": "Brand",
			"name": product.brand || "Open E-Commerce"
		},
		"offers": {
			"@type": "Offer",
			"url": window.location.href,
			"priceCurrency": "USD",
			"price": product.price,
			"itemCondition": product.condition === 'new' ? "https://schema.org/NewCondition" :
				product.condition === 'used' ? "https://schema.org/UsedCondition" :
					"https://schema.org/RefurbishedCondition",
			"availability": product.on_hand > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
		},
		"gtin": product.gtin,
		"category": product.category,
		"weight": product.weight ? {
			"@type": "QuantitativeValue",
			"value": product.weight,
			"unitCode": "LBR"
		} : undefined
	};

	// State for active image in gallery


	return (
		<div className="max-w-6xl mx-auto animate-in fade-in duration-500 pb-16">
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

			<Link to="/" className="inline-flex items-center gap-2 text-muted-foreground mb-8 font-medium hover:text-primary transition-colors">
				<ArrowLeft size={20} /> Back to Products
			</Link>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-12">
				{/* Image Gallery */}
				<div className="space-y-4">
					<div className="rounded-2xl bg-muted overflow-hidden aspect-square border border-border">
						<img
							src={activeImage || `${import.meta.env.BASE_URL}logo.png`}
							alt={product.name}
							className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal"
							onError={(e) => {
								e.currentTarget.src = `${import.meta.env.BASE_URL}logo.png`;
								e.currentTarget.onerror = null;
							}}
						/>
					</div>
					{product.images && product.images.length > 1 && (
						<div className="flex gap-4 overflow-x-auto pb-2">
							{product.images.map((img, idx) => (
								<button
									key={idx}
									onClick={() => setActiveImage(img)}
									className={`relative w-24 h-24 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${activeImage === img ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-muted-foreground/50'}`}
								>
									<img
										src={img}
										alt={`${product.name} view ${idx + 1}`}
										className="w-full h-full object-cover"
										onError={(e) => {
											e.currentTarget.src = `${import.meta.env.BASE_URL}logo.png`;
											e.currentTarget.onerror = null;
										}}
									/>
								</button>
							))}
						</div>
					)}
				</div>

				<div className="flex flex-col">
					<div className="flex flex-col gap-1 mb-2">
						<Link
							to={`/category/${product.category.split('>').map(s => encodeURIComponent(s.trim())).join('/')}`}
							className="text-primary font-bold text-sm uppercase tracking-wider hover:underline"
						>
							{product.category}
						</Link>
						{product.brand && <div className="text-muted-foreground font-medium text-sm">{product.brand}</div>}
						{product.variant && <span className="inline-block px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs font-medium w-fit mt-1">{product.variant}</span>}
					</div>

					<h1 className="text-4xl font-bold mb-4 leading-tight">{product.name}</h1>

					<div className="flex items-baseline gap-4 mb-6">
						<div className="text-3xl font-bold text-foreground">${product.price.toFixed(2)}</div>
						{product.on_hand > 0 ? (
							<span className="text-green-600 dark:text-green-400 font-medium text-sm flex items-center gap-1">
								<span className="w-2 h-2 rounded-full bg-current"></span>
								In Stock
							</span>
						) : (
							<span className="text-destructive font-medium text-sm flex items-center gap-1">
								<span className="w-2 h-2 rounded-full bg-current"></span>
								Out of Stock
							</span>
						)}
					</div>

					<div className="text-lg text-muted-foreground leading-relaxed mb-8 prose dark:prose-invert">
						{product.description}
					</div>

					{/* Key Details Grid */}
					<div className="grid grid-cols-2 gap-4 mb-8 text-sm p-4 bg-muted/30 rounded-lg border border-border/50">
						{product.sku && (
							<div>
								<span className="text-muted-foreground block text-xs uppercase tracking-wide opacity-70">SKU</span>
								<span className="font-medium font-mono">{product.sku}</span>
							</div>
						)}
						{product.weight && (
							<div>
								<span className="text-muted-foreground block text-xs uppercase tracking-wide opacity-70">Weight</span>
								<span className="font-medium">{product.weight} lb</span>
							</div>
						)}
						{product.condition && (
							<div>
								<span className="text-muted-foreground block text-xs uppercase tracking-wide opacity-70">Condition</span>
								<span className="font-medium capitalize">{product.condition}</span>
							</div>
						)}
						{product.gtin && (
							<div>
								<span className="text-muted-foreground block text-xs uppercase tracking-wide opacity-70">Barcode/GTIN</span>
								<span className="font-medium font-mono text-xs">{product.gtin}</span>
							</div>
						)}
						{product.mpn && (
							<div>
								<span className="text-muted-foreground block text-xs uppercase tracking-wide opacity-70">MPN</span>
								<span className="font-medium font-mono text-xs">{product.mpn}</span>
							</div>
						)}
					</div>

					{/* Tags */}
					{product.tags && product.tags.length > 0 && (
						<div className="flex flex-wrap gap-2 mb-8">
							{product.tags.map(tag => (
								<span key={tag} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium">#{tag}</span>
							))}
						</div>
					)}

					<div className="bg-card border border-border p-6 rounded-xl shadow-sm mb-8">
						<div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
							<Package size={18} />
							<span>{product.on_hand > 0 ? `${product.on_hand} units available` : 'Currently unavailable'}</span>
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
								className={`btn btn-primary w-full shadow-md hover:shadow-lg transition-all ${isAdding ? 'opacity-80 scale-[0.98]' : 'hover:scale-[1.01]'}`}
							>
								{isAdding ? 'Added to Cart!' : (
									<>
										<ShoppingCart size={20} /> Add to Cart
									</>
								)}
							</button>
						)}
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 text-sm text-foreground/80">
							<Truck size={20} className="text-primary" />
							<div>
								<div className="font-semibold">Free Shipping</div>
								<div className="text-xs text-muted-foreground">On orders over $50</div>
							</div>
						</div>
						<div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 text-sm text-foreground/80">
							<ShieldCheck size={20} className="text-primary" />
							<div>
								<div className="font-semibold">Secure Payment</div>
								<div className="text-xs text-muted-foreground">100% Request Protection</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
