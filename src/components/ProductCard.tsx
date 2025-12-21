import { type Product } from '../db';
import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { QuantityControl } from './QuantityControl';

interface ProductCardProps {
	product: Product;
	cartQuantity?: number;
	onAddToCart: (product: Product) => void;
	onUpdateQuantity?: (productId: number, delta: number) => void;
}

export function ProductCard({ product, cartQuantity = 0, onAddToCart, onUpdateQuantity }: ProductCardProps) {
	return (
		<div className="card product-card group">
			<Link to={`/product/${product.id}`} className="product-image-container block">
				<img
					src={product.image}
					alt={product.name}
					className="product-image"
					loading="lazy"
				/>
				<div className="product-badge">
					{product.category}
				</div>
			</Link>

			<div className="product-content">
				<Link to={`/product/${product.id}`} className="product-title hover:text-[var(--accent)] transition-colors block">
					{product.name}
				</Link>
				<p className="product-desc">
					{product.description}
				</p>

				<div className="product-footer">
					<div>
						<span className="product-price">${product.price.toFixed(2)}</span>
						<span className="product-stock">{product.onHand > 0 ? `${product.onHand} in stock` : 'Out of stock'}</span>
					</div>

					{cartQuantity > 0 && onUpdateQuantity ? (
						<QuantityControl
							quantity={cartQuantity}
							onDecrease={() => onUpdateQuantity(product.id!, -1)}
							onIncrease={() => onUpdateQuantity(product.id!, 1)}
							maxQuantity={product.onHand}
						/>
					) : (
						<button
							onClick={() => onAddToCart(product)}
							className="btn btn-primary"
							disabled={product.onHand <= 0}
						>
							<ShoppingCart size={16} />
							Add
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
