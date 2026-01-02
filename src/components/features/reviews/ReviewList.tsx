
import { useEffect, useState, useCallback } from 'react';
import { supabase, type Review } from '../../../lib/supabase';
import { type User } from '@supabase/supabase-js';
import { StarRating } from '../../common/StarRating';
import { ReviewForm } from './ReviewForm';
import { formatDistanceToNow } from 'date-fns';
import logger from '../../../lib/logger';
import { MessageSquare } from 'lucide-react';

interface ReviewListProps {
	productId: number;
	hideWriteButton?: boolean;
}

export function ReviewList({ productId, hideWriteButton = false }: ReviewListProps) {
	const [reviews, setReviews] = useState<Review[]>([]);
	const [loading, setLoading] = useState(true);
	const [user, setUser] = useState<User | null>(null); // Fix implicit any
	const [eligibleOrder, setEligibleOrder] = useState<number | null>(null);
	const [showForm, setShowForm] = useState(false);
	const [averageRating, setAverageRating] = useState(0);

	const fetchReviews = useCallback(async () => {
		try {
			// Only fetch approved reviews for the public list
			const { data, error } = await supabase
				.from('reviews')
				.select(`
          *,
          profiles (full_name)
        `)
				.eq('product_id', productId)
				.eq('status', 'approved')
				.order('created_at', { ascending: false });

			if (error) throw error;
			setReviews(data || []);
		} catch (err) {
			logger.error('Error fetching reviews:', err);
		} finally {
			setLoading(false);
		}
	}, [productId]);

	const fetchAverageRating = useCallback(async () => {
		try {
			const { data, error } = await supabase.rpc('get_product_average_rating', { p_id: productId });
			if (error) {
				// Fallback if RPC fails or not exists (e.g. dev environment mismatch)
				// We can calculate from fetched reviews, but that misses hidden ones.
				// Ideally RPC works.
				logger.warn('Error fetching average rating RPC:', error);
			} else {
				setAverageRating(data);
			}
		} catch (err) {
			logger.error('Error in fetchAverageRating:', err);
		}
	}, [productId]);

	useEffect(() => {
		supabase.auth.getUser().then(({ data }) => setUser(data.user));
		fetchReviews();
		fetchAverageRating();
	}, [productId, fetchReviews, fetchAverageRating]); // Add fetchReviews and fetchAverageRating to dependencies

	useEffect(() => {
		const checkEligibility = async () => {
			try {
				if (!user?.id || hideWriteButton) return;

				// 1. Find orders for this user that contain this product
				// We need to join orders and order_items

				// Step A: Get Order Items for this product and user
				const { data: orderItems, error: itemsError } = await supabase
					.from('order_items')
					.select('order_id')
					.eq('user_id', user.id)
					.eq('product_id', productId);

				if (itemsError || !orderItems || orderItems.length === 0) return;

				const orderIds = orderItems.map(item => item.order_id);

				// Step B: Check Status of these orders
				const { data: orders, error: ordersError } = await supabase
					.from('orders')
					.select('id, status')
					.in('id', orderIds)
					.eq('status', 'shipped'); // STRICT REQUIREMENT: Status must be 'shipped'

				if (ordersError || !orders || orders.length === 0) return;

				// Step C: Check if already reviewed for this order?
				// Optional: Allow one review per order? Or one per product per user?
				// Let's check if they have already reviewed this product for ANY of these valid orders
				// or just check if they have a review for this product.

				const { data: existingReviews } = await supabase
					.from('reviews')
					.select('id')
					.eq('user_id', user.id)
					.eq('product_id', productId);

				if (existingReviews && existingReviews.length > 0) {
					// User has already reviewed this product.
					// If we want to allow multiple reviews for different orders, we'd check against order_id.
					// For now, let's assume 1 review per product per user for simplicity, or we can look for an unused order_id.

					// Find an order_id that hasn't been used in a review
					// const usedOrderIds = existingReviews.map(r => r.order_id);
					// const availableOrder = orders.find(o => !usedOrderIds.includes(o.id));
					// if (availableOrder) setEligibleOrder(availableOrder.id);

					// Let's stick to 1 review per user per product to avoid spam.
					return;
				}

				// If no existing review, pick the first valid order
				setEligibleOrder(orders[0].id);

			} catch (err) {
				logger.error('Error checking review eligibility:', err);
			}
		};

		if (user && productId) {
			checkEligibility();
		}
	}, [user, productId, hideWriteButton]);

	if (loading) return <div className="py-8 text-center text-muted-foreground">Loading reviews...</div>;

	return (
		<div id='reviews' className="space-y-8">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-2xl font-bold">Customer Reviews</h3>
					<div className="flex items-center gap-2 mt-1">
						<StarRating rating={averageRating} size={24} />
						<span className="text-lg font-medium">{averageRating?.toFixed(1) || 'No ratings'}</span>
						<span className="text-muted-foreground">({reviews.length} reviews)</span>
					</div>
				</div>

				{eligibleOrder && !showForm && !hideWriteButton && (
					<button
						onClick={() => setShowForm(true)}
						className="btn btn-primary"
					>
						Write a Review
					</button>
				)}
			</div>

			{showForm && eligibleOrder && user && (
				<div className="max-w-2xl">
					<ReviewForm
						productId={productId}
						userId={user.id}
						orderId={eligibleOrder}
						onReviewSubmitted={() => {
							setShowForm(false);
							setEligibleOrder(null); // Hide button after submission
							fetchReviews(); // Although it will be pending, so won't show up immediately in public list
							// maybe show a toast?
							alert("Review submitted for approval!");
						}}
						onCancel={() => setShowForm(false)}
					/>
				</div>
			)}

			<div className="space-y-6">
				{reviews.length === 0 ? (
					<div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
						<MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
						<h4 className="text-lg font-medium">No reviews yet</h4>
						<p className="text-muted-foreground">Be the first to review this product!</p>
					</div>
				) : (
					reviews.map((review) => (
						<div key={review.id} className="border-b border-border pb-6 last:border-0">
							<div className="flex items-center justify-between mb-2">
								<div className="flex items-center gap-3">
									<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
										{review.profiles?.full_name?.charAt(0) || 'U'}
									</div>
									<div>
										<div className="font-semibold">{review.profiles?.full_name || 'Anonymous User'}</div>
										<div className="text-xs text-muted-foreground">Verified Purchase</div>
									</div>
								</div>
								<div className="text-sm text-muted-foreground">
									{formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
								</div>
							</div>

							<div className="mb-2">
								<StarRating rating={review.rating} size={16} />
							</div>

							<p className="text-foreground/90 leading-relaxed">
								{review.comment}
							</p>
						</div>
					))
				)}
			</div>
		</div>
	);
}
