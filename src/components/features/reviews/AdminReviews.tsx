
import { useEffect, useState, useCallback } from 'react';
import { supabase, type Review } from '../../../lib/supabase';
import { StarRating } from '../../common/StarRating';
import logger from '../../../lib/logger';
import { Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AdminReviews() {
	const [reviews, setReviews] = useState<Review[]>([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

	const fetchReviews = useCallback(async () => {
		setLoading(true);
		try {
			let query = supabase
				.from('reviews')
				.select(`
          *,
          profiles (full_name),
          products (name)
        `)
				.order('created_at', { ascending: false });

			if (filter !== 'all') {
				query = query.eq('status', filter);
			}

			const { data, error } = await query;

			if (error) throw error;
			setReviews(data || []);
		} catch (err) {
			logger.error('Error fetching admin reviews:', err);
		} finally {
			setLoading(false);
		}
	}, [filter]);

	useEffect(() => {
		fetchReviews();
	}, [fetchReviews]);

	const updateStatus = async (id: number, status: 'approved' | 'rejected') => {
		try {
			const { error } = await supabase
				.from('reviews')
				.update({ status })
				.eq('id', id);

			if (error) throw error;

			// Optimistic update
			setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r));
		} catch (err) {
			logger.error('Error updating review status:', err);
			alert('Failed to update status');
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold">Product Reviews</h2>

				<div className="flex items-center gap-2 bg-card border border-border rounded-lg p-1">
					{(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
						<button
							key={f}
							onClick={() => setFilter(f)}
							className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalized ${filter === f
								? 'bg-primary text-primary-foreground shadow-sm'
								: 'text-muted-foreground hover:bg-muted'
								}`}
						>
							{f.charAt(0).toUpperCase() + f.slice(1)}
						</button>
					))}
				</div>
			</div>

			<div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left text-sm">
						<thead className="bg-muted/50 border-b border-border">
							<tr>
								<th className="p-4 font-medium text-muted-foreground">Product</th>
								<th className="p-4 font-medium text-muted-foreground">User</th>
								<th className="p-4 font-medium text-muted-foreground">Rating</th>
								<th className="p-4 font-medium text-muted-foreground w-1/3">Comment</th>
								<th className="p-4 font-medium text-muted-foreground">Date</th>
								<th className="p-4 font-medium text-muted-foreground">Status</th>
								<th className="p-4 font-medium text-muted-foreground text-right w-32">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border">
							{loading ? (
								<tr>
									<td colSpan={7} className="p-8 text-center text-muted-foreground">Loading reviews...</td>
								</tr>
							) : reviews.length === 0 ? (
								<tr>
									<td colSpan={7} className="p-8 text-center text-muted-foreground">No reviews found matching filter.</td>
								</tr>
							) : (
								reviews.map(review => (
									<tr key={review.id} className="group hover:bg-muted/30 transition-colors">
										<td className="p-4 font-medium truncate max-w-[150px]" title={review.products?.name}>
											<Link to={`/product/${review.product_id}`} className="hover:underline text-primary">
												{review.products?.name || `Product #${review.product_id}`}
											</Link>
										</td>
										<td className="p-4 whitespace-nowrap">
											{review.profiles?.full_name || 'Anonymous'}
										</td>
										<td className="p-4">
											<div className="flex items-center gap-1">
												<span className="font-bold">{review.rating}</span>
												<StarRating rating={review.rating} size={14} />
											</div>
										</td>
										<td className="p-4">
											<p className="line-clamp-2 text-muted-foreground group-hover:text-foreground transition-colors" title={review.comment || ''}>
												{review.comment}
											</p>
										</td>
										<td className="p-4 whitespace-nowrap text-muted-foreground">
											{new Date(review.created_at).toLocaleDateString()}
										</td>
										<td className="p-4">
											<span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${review.status === 'approved' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
												review.status === 'rejected' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
													'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
												}`}>
												{review.status}
											</span>
										</td>
										<td className="p-4 text-right">
											{review.status === 'pending' ? (
												<div className="flex justify-end gap-2">
													<button
														onClick={() => updateStatus(review.id, 'approved')}
														className="p-1.5 rounded-md hover:bg-green-100 text-green-600 transition-colors"
														title="Approve"
													>
														<Check size={18} />
													</button>
													<button
														onClick={() => updateStatus(review.id, 'rejected')}
														className="p-1.5 rounded-md hover:bg-red-100 text-red-600 transition-colors"
														title="Reject"
													>
														<X size={18} />
													</button>
												</div>
											) : (
												<div className="flex justify-end gap-2 opacity-0 group-hover:opacity-50 transition-opacity">
													{/* Allow changing mind? */}
													{review.status === 'rejected' && (
														<button onClick={() => updateStatus(review.id, 'approved')} className="text-xs hover:underline">Approve</button>
													)}
													{review.status === 'approved' && (
														<button onClick={() => updateStatus(review.id, 'rejected')} className="text-xs hover:underline">Reject</button>
													)}
												</div>
											)}
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
