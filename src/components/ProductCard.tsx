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
}

/**
 * Displays a single product summary card.
 * Handles adding to cart and updating quantity directly from the card.
 *
 * @param props - The component props.
 * @returns The rendered product card.
 */
export function ProductCard({ product, cartQuantity, onAddToCart, onUpdateQuantity }: ProductCardProps) {
	return (
		<Link to={`/product/${product.id}`} className="card product-card group">
			<div className="product-image-container">
				<img src={product.image} alt={product.name} className="product-image" loading="lazy" />
				{product.on_hand <= 0 && (
					<div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
						Out of Stock
					</div>
				)}
			</div>

			<div className="product-info">
				<div className="product-category">{product.category}</div>
				<h3 className="product-title group-hover:text-[var(--accent)] transition-colors">
					{product.name}
				</h3>
				<div className="product-price">${product.price.toFixed(2)}</div>

				<div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center justify-between" onClick={e => e.preventDefault()}>
					{cartQuantity > 0 ? (
						<QuantityControl
							quantity={cartQuantity}
							onIncrease={() => onUpdateQuantity(product.id, 1)}
							onDecrease={() => {
								if (cartQuantity === 1) {
									if (window.confirm('Remove from cart?')) {
										onUpdateQuantity(product.id!, -1);
									}
								} else {
									onUpdateQuantity(product.id!, -1);
								}
							}}
							maxQuantity={product.on_hand}
							className="w-full justify-between"
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
