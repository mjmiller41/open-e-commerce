import { type Product } from '../lib/supabase';
import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { QuantityControl } from './QuantityControl';
import { Badge } from './ui/Badge';

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

	return (
		<div className="card flex flex-col h-full group hover:shadow-lg hover:border-accent/50 transition-all duration-300 relative">
			<Link to={`/product/${product.id}`} className="relative aspect-square bg-muted overflow-hidden block">
				<img
					src={product.images?.[0] || product.image || 'https://placehold.co/400x400?text=No+Image'}
					alt={product.name}
					className="w-full h-full object-cover transition-transform duration-500 mix-blend-multiply dark:mix-blend-normal group-hover:scale-105"
					loading="lazy"
					onError={(e) => {
						e.currentTarget.src = 'https://placehold.co/400x400?text=Error';
					}}
				/>
				{product.on_hand <= 0 && (
					<Badge variant="error" className="absolute top-2 right-2 backdrop-blur-sm tracking-wider">
						Out of Stock
					</Badge>
				)}
			</Link>

			<div className="p-4 flex flex-col flex-1">
				{categorySegments.length > 0 ? (
					<Link
						to={categoryUrl}
						className="text-primary font-semibold text-xs uppercase tracking-wider mb-2 hover:underline w-fit"
					>
						{leafCategory}
					</Link>
				) : (
					<div className="flex flex-col gap-0.5 mb-2">
						<div className="text-primary font-semibold text-xs uppercase tracking-wider">{product.category}</div>
						{product.variant && <div className="text-[10px] text-muted-foreground uppercase font-medium">{product.variant}</div>}
					</div>
				)}

				<Link to={`/product/${product.id}`} className="block mb-1">
					<h3 className="font-semibold text-lg leading-snug group-hover:text-primary transition-colors">
						{product.name}
					</h3>
				</Link>
				<div className="font-bold text-xl">${product.price.toFixed(2)}</div>

				<div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
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
