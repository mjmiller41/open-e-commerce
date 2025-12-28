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



		<div className={`flex items-center rounded-lg overflow-hidden border border-border ${isSmall ? 'h-8' : 'h-10'} ${className}`}>
			<button
				onClick={(e) => {
					e.preventDefault();
					onDecrease();
				}}
				className="btn btn-primary rounded-none border-r border-primary-foreground/20 px-3 h-full flex items-center justify-center hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-1"
				aria-label="Decrease quantity"
			>
				<Minus size={iconSize} />
			</button>

			<span className={`bg-primary text-primary-foreground font-medium min-w-[3rem] text-center flex items-center justify-center h-full flex-1 ${isSmall ? 'text-sm' : 'text-base'}`}>
				{quantity}
			</span>

			<button
				onClick={(e) => {
					e.preventDefault();
					onIncrease();
				}}
				className="btn btn-primary rounded-none border-l border-primary-foreground/20 px-3 h-full flex items-center justify-center hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-1"
				aria-label="Increase quantity"
				disabled={quantity >= maxQuantity}
			>
				<Plus size={iconSize} />
			</button>
		</div>
	);



}
