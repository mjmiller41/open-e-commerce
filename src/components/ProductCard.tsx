import { type Product } from '../lib/supabase';
import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { QuantityControl } from './QuantityControl';

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
	return (
		<Link to={`/product/${product.id}`} className="card flex flex-col h-full group hover:shadow-lg hover:border-accent/50 transition-all duration-300">
			<div className="relative aspect-square bg-muted overflow-hidden">
				<img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 mix-blend-multiply dark:mix-blend-normal group-hover:scale-105" loading="lazy" />
				{product.on_hand <= 0 && (
					<div className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-[10px] font-bold uppercase px-2 py-1 rounded backdrop-blur-sm tracking-wider">
						Out of Stock
					</div>
				)}
			</div>

			<div className="p-4 flex flex-col flex-1">
				<div className="text-primary font-semibold text-xs uppercase tracking-wider mb-2">{product.category}</div>
				<h3 className="font-semibold text-lg mb-1 leading-snug group-hover:text-primary transition-colors">
					{product.name}
				</h3>
				<div className="font-bold text-xl">${product.price.toFixed(2)}</div>

				<div className="mt-4 pt-4 border-t border-border flex items-center justify-between" onClick={e => e.preventDefault()}>
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
		</Link>
	);
}
