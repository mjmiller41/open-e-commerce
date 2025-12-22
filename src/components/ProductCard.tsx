import { type Product } from '../lib/supabase';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProductCardProps {
	product: Product;
	cartQuantity: number;
	onAddToCart: (product: Product) => void;
	onUpdateQuantity: (productId: number, delta: number) => void;
}

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
						<div className="flex items-center gap-3 bg-[var(--background)] border border-[var(--border)] rounded-full px-1 py-1 w-full justify-between">
							<button
								onClick={(e) => {
									e.preventDefault();
									if (cartQuantity === 1) {
										// If quantity is 1, decrementing should remove it (handled by parent logic usually, 
										// but here we just pass -1)
										// We might want separate handler for remove vs decrement, but standardizing on delta is fine
										if (window.confirm('Remove from cart?')) {
											onUpdateQuantity(product.id!, -1);
										}
									} else {
										onUpdateQuantity(product.id!, -1);
									}
								}}
								className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--secondary)] text-[var(--foreground)] transition-colors"
								aria-label="Decrease quantity"
							>
								<Minus size={14} />
							</button>
							<span className="font-medium text-sm tabular-nums">{cartQuantity}</span>
							<button
								onClick={(e) => {
									e.preventDefault();
									onUpdateQuantity(product.id!, 1);
								}}
								disabled={cartQuantity >= product.on_hand}
								className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--secondary)] text-[var(--foreground)] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
								aria-label="Increase quantity"
							>
								<Plus size={14} />
							</button>
						</div>
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
