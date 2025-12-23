import { Minus, Plus } from 'lucide-react';

/**
 * Props for the QuantityControl component.
 */
interface QuantityControlProps {
	/** The current quantity value. */
	quantity: number;
	/** Callback function when the decrease button is clicked. */
	onDecrease: () => void;
	/** Callback function when the increase button is clicked. */
	onIncrease: () => void;
	/** The maximum allowed quantity. Defaults to Infinity. */
	maxQuantity?: number;
	/** The size of the control. Defaults to 'sm'. */
	size?: 'sm' | 'lg';
	/** Additional CSS classes. */
	className?: string;
}

/**
 * A UI component for incrementing and decrementing a numerical quantity.
 *
 * @param props - The component props.
 * @returns The rendered quantity control.
 */
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
