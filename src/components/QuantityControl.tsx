import { Minus, Plus } from 'lucide-react';

interface QuantityControlProps {
	quantity: number;
	onDecrease: () => void;
	onIncrease: () => void;
	maxQuantity?: number;
	size?: 'sm' | 'lg';
	className?: string;
}

export function QuantityControl({
	quantity,
	onDecrease,
	onIncrease,
	maxQuantity = Infinity,
	size = 'sm',
	className = ''
}: QuantityControlProps) {
	const isSmall = size === 'sm';
	const iconSize = isSmall ? 16 : 20;

	return (
		<div className={`qty-control-primary ${isSmall ? 'sm' : 'lg'} ${className}`}>
			<button
				onClick={(e) => {
					e.preventDefault();
					onDecrease();
				}}
				className="qty-btn"
				aria-label="Decrease quantity"
			>
				<Minus size={iconSize} color="currentColor" />
			</button>

			<span className="qty-val">
				{quantity}
			</span>

			<button
				onClick={(e) => {
					e.preventDefault();
					onIncrease();
				}}
				className="qty-btn"
				aria-label="Increase quantity"
				disabled={quantity >= maxQuantity}
			>
				<Plus size={iconSize} color="currentColor" />
			</button>
		</div>
	);
}
