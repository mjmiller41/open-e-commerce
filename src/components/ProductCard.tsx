import { type Product } from '../lib/supabase';
import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { QuantityControl } from './QuantityControl';
import { Badge } from './ui/Badge';
import { useStoreSettings } from '../context/StoreSettingsContext';
import { formatCurrency } from '../lib/currency';
import { resolveProductImage } from '../lib/utils';
import { useProductRating } from '../hooks/useProductRating';
import { StarRating } from './StarRating';

/**
 * Props for the ProductCard component.
 */
interface ProductCardProps {
	/** The product object to display. */
	product: Product;
	/** The current quantity of this product in the cart. */
	cartQuantity: number;
	/** Callback to add the product to the cart. */
	onAddToCart: (product: Product) => void;
	/** Callback to update the quantity of the product in the cart. */
	onUpdateQuantity: (productId: number, delta: number) => void;
	/** Callback to remove the product from the cart. */
	onRemoveFromCart: (productId: number) => void;
}

/**
 * Displays a single product summary card.
 * Handles adding to cart and updating quantity directly from the card.
 *
 * @param props - The component props.
 * @returns The rendered product card.
 */
export function ProductCard({ product, cartQuantity, onAddToCart, onUpdateQuantity, onRemoveFromCart }: ProductCardProps) {
	const categorySegments = product.category ? product.category.split('>').map(s => s.trim()) : [];
	const leafCategory = categorySegments.length > 0 ? categorySegments[categorySegments.length - 1] : product.category;
	const categoryUrl = categorySegments.length > 0
		? `/category/${categorySegments.map(s => encodeURIComponent(s)).join('/')}`
		: '#';

	const { settings } = useStoreSettings();
	const { rating, count } = useProductRating(product.id);

	console.log(resolveProductImage(product.images?.[0] || product.image))

	return (
		<div className="card flex flex-col h-full group hover:shadow-lg hover:border-accent/50 transition-all duration-300 relative">
			<Link
				to={`/product/${product.id}`}
				className="relative bg-muted overflow-hidden block"
				style={{ aspectRatio: "var(--card-image-ratio, auto)" } as React.CSSProperties}
			>
				{/* Primary Image */}
				<div>{resolveProductImage(product.images?.[0] || product.image)}</div>
				<img
					src={resolveProductImage(product.images?.[0] || product.image)}
					alt={product.name}
					className="w-full h-full object-cover transition-all duration-500 mix-blend-multiply dark:mix-blend-normal group-hover:scale-105"
					loading="lazy"
					onError={(e) => {
						e.currentTarget.src = `${import.meta.env.BASE_URL}logo.png`;
						e.currentTarget.onerror = null;
					}}
				/>

				{/* Secondary Image (Absolute overlay) */}
				{product.images && product.images.length > 1 && (
					<img
						src={resolveProductImage(product.images[1])}
						alt={product.name}
						className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 mix-blend-multiply dark:mix-blend-normal opacity-0 group-hover:opacity-100"
						style={{ opacity: "calc(var(--card-show-secondary-image, 0) * 1)" } as React.CSSProperties}
						loading="lazy"
					/>
				)}

				{product.on_hand <= 0 && (
					<Badge variant="error" className="absolute top-2 right-2 backdrop-blur-sm tracking-wider z-10">
						Out of Stock
					</Badge>
				)}
			</Link>

			<div className="p-4 flex flex-col flex-1">
				{/* Category & Vendor */}
				<div className="mb-2">
					<div className="flex justify-between items-start gap-2">
						{categorySegments.length > 0 ? (
							<Link
								to={categoryUrl}
								className="font-semibold text-xs uppercase tracking-wider hover:underline block"
							>
								{leafCategory}
							</Link>
						) : (
							<div className="font-semibold text-xs uppercase tracking-wider">{product.category}</div>
						)}

						{/* Vendor Display - Controlled by CSS Variable */}
						<div
							className="text-[10px] text-muted-foreground uppercase font-medium"
							style={{ display: "var(--card-show-brand, none)" }}
						>
							{product.brand || "Brand"}
						</div>
					</div>
					{product.variant && <div className="text-[10px] text-muted-foreground uppercase font-medium mt-0.5">{product.variant}</div>}
				</div>

				<Link to={`/product/${product.id}`} className="block mb-1">
					<h3 className="font-semibold text-lg leading-snug group-hover:text-primary transition-colors">
						{product.name}
					</h3>
				</Link>

				{/* Rating Display */}
				<div
					className="flex items-center gap-1 mb-2 h-4"
					style={{ display: "var(--card-show-rating, flex)" }}
				>
					<div className="flex text-yellow-400 text-xs">
						<StarRating rating={rating} size={14} />
					</div>
					<span className="text-xs text-muted-foreground">({count})</span>
				</div>

				<div className="font-bold text-xl mt-auto">{formatCurrency(product.price, settings)}</div>

				{/* Quick Add / Quantity - Controlled by CSS Variable (partially) */}
				{/* We always show the "space" for it, but toggle visibility? Or remove from flow? 
				    The requirement is likely to HIDE the "Add to Cart" button if quick add is disabled, 
					BUT usually that means user must click product to go to details to add. 
					Let's wrap the entire footer in the variable control, OR just the 'Add to Cart' button.
					If disabled, we probably hide the whole footer or just the button?
					Let's hide the button container.
				*/}
				<div
					className="mt-4 pt-4 border-t border-border"
					style={{ display: "var(--card-show-quick-add, block)" }}
				>
					{cartQuantity > 0 ? (
						<QuantityControl
							quantity={cartQuantity}
							onIncrease={() => onUpdateQuantity(product.id, 1)}
							onDecrease={() => {
								if (cartQuantity > 1) {
									onUpdateQuantity(product.id!, -1);
								} else {
									onRemoveFromCart(product.id!);
								}
							}}
							maxQuantity={product.on_hand}
							className="w-full"
						/>
					) : (
						<button
							onClick={(e) => {
								e.preventDefault();
								onAddToCart(product);
							}}
							disabled={product.on_hand <= 0}
							className="btn btn-primary w-full flex items-center justify-center gap-2 py-2 text-sm"
						>
							<ShoppingCart size={16} />
							{product.on_hand > 0 ? 'Add to Cart' : 'Out of Stock'}
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
