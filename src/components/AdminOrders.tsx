import { useEffect, useState } from 'react';
import { supabase, type Order } from '../lib/supabase';

export function AdminOrders() {
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState<'all' | 'pending'>('all');

	useEffect(() => {
		const fetchOrders = async () => {
			setLoading(true);
			let query = supabase
				.from('orders')
				.select('*')
				.order('created_at', { ascending: false });

			if (filter === 'pending') {
				query = query.eq('status', 'pending');
			}

			const { data, error } = await query;

			if (error) {
				console.error('Error fetching orders:', error);
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

		const { error } = await supabase
			.from('orders')
			.update({ status: newStatus })
			.eq('id', orderId);

		if (error) {
			console.error('Error updating order:', error);
			alert('Failed to update status');
			// Revert on error
			setOrders(previousOrders);
		}
		// No need to trigger refresh if successful, as local state is already updated
	};

	return (
		<div className="checkout-form" style={{ gap: '1.5rem' }}>
			<div className="admin-header">
				<h2 className="admin-subtitle">Order Management</h2>
				<div className="filter-group">
					<button
						onClick={() => setFilter('all')}
						className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
					>
						All
					</button>
					<button
						onClick={() => setFilter('pending')}
						className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
					>
						Pending
					</button>
				</div>
			</div>

			{loading ? (
				<div style={{ textAlign: 'center', padding: '2rem' }}>Loading orders...</div>
			) : orders.length === 0 ? (
				<div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No orders found.</div>
			) : (
				<div className="orders-table-container">
					<table className="orders-table">
						<thead>
							<tr>
								<th>Order ID</th>
								<th>Date</th>
								<th>Customer (ID)</th>
								<th>Total</th>
								<th>Status</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{orders.map((order) => (
								<tr key={order.id}>
									<td>#{order.id}</td>
									<td>{new Date(order.created_at).toLocaleDateString()}</td>
									<td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{order.user_id.split('-')[0]}...</td>
									<td>${order.total_amount.toFixed(2)}</td>
									<td>
										<span className={`status-badge status-${order.status}`}>
											{order.status}
										</span>
									</td>
									<td>
										<select
											name="status-select"
											value={order.status}
											onChange={(e) => updateStatus(order.id, e.target.value as Order['status'])}
											className="status-select"
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
