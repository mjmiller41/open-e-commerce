import { Star } from 'lucide-react';

interface StarRatingProps {
	rating: number;
	maxStars?: number;
	size?: number;
	interactive?: boolean;
	onRatingChange?: (rating: number) => void;
	className?: string;
}

export function StarRating({
	rating,
	maxStars = 5,
	size = 20,
	interactive = false,
	onRatingChange,
	className = '',
}: StarRatingProps) {
	const stars = [];

	for (let i = 1; i <= maxStars; i++) {
		stars.push(
			<button
				key={i}
				type="button"
				disabled={!interactive}
				onClick={() => interactive && onRatingChange?.(i)}
				className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} ${className}`}
				aria-label={`Rate ${i} stars`}
			>
				<Star
					size={size}
					className={`${i <= rating
						? 'fill-yellow-400 text-yellow-400'
						: 'fill-transparent text-muted-foreground/30'
						}`}
				/>
			</button>
		);
	}

	return <div className="flex items-center gap-0.5">{stars}</div>;
}
