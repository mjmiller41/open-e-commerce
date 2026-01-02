
import { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { StarRating } from '../../common/StarRating';
import logger from '../../../lib/logger';
import { Send } from 'lucide-react';

interface ReviewFormProps {
	productId: number;
	orderId: number;
	userId: string;
	onReviewSubmitted: () => void;
	onCancel: () => void;
}

export function ReviewForm({ productId, orderId, userId, onReviewSubmitted, onCancel }: ReviewFormProps) {
	const [rating, setRating] = useState(5);
	const [comment, setComment] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setError(null);

		try {
			const { error: insertError } = await supabase.from('reviews').insert({
				product_id: productId,
				order_id: orderId,
				user_id: userId,
				rating,
				comment,
				status: 'pending' // Default to pending
			});

			if (insertError) throw insertError;

			onReviewSubmitted();
		} catch (err) {
			logger.error('Error submitting review:', err);
			setError('Failed to submit review. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="bg-card p-6 rounded-xl border border-border shadow-sm animate-in fade-in zoom-in-95 duration-200">
			<h3 className="text-xl font-semibold mb-4">Write a Review</h3>

			{error && (
				<div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-4">
					{error}
				</div>
			)}

			<div className="mb-6">
				<label className="block text-sm font-medium mb-2">Rating</label>
				<StarRating
					rating={rating}
					interactive
					onRatingChange={setRating}
					size={32}
				/>
			</div>

			<div className="mb-6">
				<label htmlFor="comment" className="block text-sm font-medium mb-2">Review</label>
				<textarea
					id="comment"
					value={comment}
					onChange={(e) => setComment(e.target.value)}
					className="w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary focus:border-transparent min-h-[120px]"
					placeholder="Share your experience with this product..."
					required
				/>
			</div>

			<div className="flex justify-end gap-3">
				<button
					type="button"
					onClick={onCancel}
					disabled={isSubmitting}
					className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
				>
					Cancel
				</button>
				<button
					type="submit"
					disabled={isSubmitting}
					className="btn btn-primary flex items-center gap-2"
				>
					{isSubmitting ? 'Submitting...' : (
						<>
							<Send size={16} /> Submit Review
						</>
					)}
				</button>
			</div>
		</form>
	);
}
