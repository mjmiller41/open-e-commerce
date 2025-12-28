import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, type Order } from '../lib/supabase';
import logger from '../lib/logger';

export function AdminOrders() {
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState<Order['status'] | 'all'>('all');

	useEffect(() => {
		const fetchOrders = async () => {
			setLoading(true);
			let query = supabase
				.from('orders')
				.select('*')
				.order('created_at', { ascending: false });

			if (filter !== 'all') {
				query = query.eq('status', filter);
			}

			const { data, error } = await query;

			if (error) {
				logger.error('Error fetching orders:', error);
			} else {
				setOrders(data || []);
			}
			setLoading(false);
		};

		fetchOrders();
	}, [filter]);

	const updateStatus = async (orderId: number, newStatus: Order['status']) => {
		// Optimistic update
		const previousOrders = [...orders];
		setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

		const { data, error } = await supabase
			.from('orders')
			.update({ status: newStatus })
			.eq('id', orderId)
			.select();

		if (error) {
			logger.error('Error updating order:', error);
			alert('Failed to update status');
			// Revert on error
			setOrders(previousOrders);
		} else if (!data || data.length === 0) {
			logger.error('Error updating order: No rows affected. Check RLS policies.');
			alert('Failed to update status: You may not have permission to update this order.');
			// Revert if no rows updated (silent failure)
			setOrders(previousOrders);
		}
		// No need to trigger refresh if successful, as local state is already updated
	};

	return (

		<div className="space-y-6">
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-xl font-bold">Order Management</h2>
				<div className="flex items-center gap-2">
					<label className="text-sm font-medium">Filter by Status:</label>
					<select
						value={filter}
						onChange={(e) => setFilter(e.target.value as Order['status'] | 'all')}
						className="h-9 px-3 rounded-md border border-input bg-background text-sm"
					>
						<option value="all">All Statuses</option>
						<option value="pending">Pending</option>
						<option value="processing">Processing</option>
						<option value="shipped">Shipped</option>
						<option value="cancelled">Cancelled</option>
					</select>
				</div>
			</div>

			{loading ? (
				<div className="text-center p-8">Loading orders...</div>
			) : orders.length === 0 ? (
				<div className="text-center p-8 text-muted-foreground">No orders found.</div>
			) : (
				<div className="overflow-x-auto border border-border rounded-lg">
					<table className="w-full text-left">
						<thead>
							<tr className="bg-muted">
								<th className="p-3 text-sm font-semibold text-muted-foreground border-b border-border">Order ID</th>
								<th className="p-3 text-sm font-semibold text-muted-foreground border-b border-border">Date</th>
								<th className="p-3 text-sm font-semibold text-muted-foreground border-b border-border">Customer (ID)</th>
								<th className="p-3 text-sm font-semibold text-muted-foreground border-b border-border">Total</th>
								<th className="p-3 text-sm font-semibold text-muted-foreground border-b border-border">Status</th>
								<th className="p-3 text-sm font-semibold text-muted-foreground border-b border-border">Actions</th>
							</tr>
						</thead>
						<tbody>
							{orders.map((order) => (
								<tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
									<td className="p-3 text-sm">
										<Link to={`/order/${order.id}`} className="hover:underline text-primary">
											#{order.id}
										</Link>
									</td>
									<td className="p-3 text-sm">{new Date(order.created_at).toLocaleDateString()}</td>
									<td className="p-3 text-sm font-mono text-xs">{order.user_id.split('-')[0]}...</td>
									<td className="p-3 text-sm font-medium">${order.total_amount.toFixed(2)}</td>
									<td className="p-3 text-sm">
										<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
											${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
											${order.status === 'processing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : ''}
											${order.status === 'shipped' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
											${order.status === 'cancelled' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400' : ''}
										`}>
											{order.status}
										</span>
									</td>
									<td className="p-3 text-sm">
										<select
											name="status-select"
											value={order.status}
											onChange={(e) => updateStatus(order.id, e.target.value as Order['status'])}
											className="h-8 px-2 text-xs rounded border border-input bg-background focus:ring-2 focus:ring-ring"
										>
											<option value="pending">Pending</option>
											<option value="processing">Processing</option>
											<option value="shipped">Shipped</option>
											<option value="cancelled">Cancelled</option>
										</select>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
