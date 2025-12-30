import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, type Order, type Profile } from '../lib/supabase';
import { X } from 'lucide-react';
import logger from '../lib/logger';
import { useSortableData } from '../hooks/useSortableData';
import { Badge } from './ui/Badge';
import { PageHeader } from './ui/PageHeader';
import { SortableHeader } from './ui/SortableHeader';

export function AdminOrders() {
	const [orders, setOrders] = useState<Order[]>([]);
	const [profiles, setProfiles] = useState<Record<string, Profile>>({});
	const [loading, setLoading] = useState(true);

	const [statusFilter, setStatusFilter] = useState<Order['status'][]>([]);
	const [customerFilter, setCustomerFilter] = useState<string[]>([]);

	useEffect(() => {
		const fetchOrdersAndProfiles = async () => {
			setLoading(true);
			try {
				// Fetch all orders
				const { data: ordersData, error: ordersError } = await supabase
					.from('orders')
					.select('*')
					.order('created_at', { ascending: false });

				if (ordersError) throw ordersError;

				const fetchedOrders = ordersData || [];
				setOrders(fetchedOrders);

				// Extract unique user IDs
				const userIds = Array.from(new Set(fetchedOrders.map(o => o.user_id)));

				if (userIds.length > 0) {
					const { data: profilesData, error: profilesError } = await supabase
						.from('profiles')
						.select('*')
						.in('id', userIds);

					if (profilesError) {
						logger.error('Error fetching profiles for orders:', profilesError);
					} else {
						const profilesMap = (profilesData || []).reduce((acc, p) => ({
							...acc,
							[p.id]: p
						}), {} as Record<string, Profile>);
						setProfiles(profilesMap);
					}
				}
			} catch (error) {
				logger.error('Error fetching data:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchOrdersAndProfiles();
	}, []);

	// Faceted Search Logic
	const getFilteredOrders = (ignoreType: 'status' | 'customer' | null) => {
		return orders.filter(order => {
			const matchesStatus = ignoreType === 'status' || statusFilter.length === 0 || statusFilter.includes(order.status);
			const matchesCustomer = ignoreType === 'customer' || customerFilter.length === 0 || customerFilter.includes(order.user_id);
			return matchesStatus && matchesCustomer;
		});
	};

	// Available options based on OTHER active filters
	// For "Status Filter" options, we look at orders filtered by Customer (ignoring Status)
	// For "Customer Filter" options, we look at orders filtered by Status (ignoring Customer)
	// Actually for simplicity in this specific UI (dropdowns), often we want to see valid options that would result in > 0 results.

	// const availableStatuses = ... (Since we hardcode status options, we might just keep them constant, or gray out unused ones. For now, let's keep status options static as they are enum vals).

	// For Customers, we SHOULD only show customers that match the current Status Filter (if any).
	const ordersForCustomerOptions = getFilteredOrders('customer'); // Filtered by Status
	const uniqueCustomers = Array.from(new Set(ordersForCustomerOptions.map(o => o.user_id)));

	const finalFilteredOrders = getFilteredOrders(null);

	const { items: sortedOrders, requestSort, sortConfig } = useSortableData(
		finalFilteredOrders,
		{ key: 'created_at', direction: 'descending' },
		{
			customer_name: (order) => profiles[order.user_id]?.full_name || profiles[order.user_id]?.email || order.user_id
		}
	);



	const addFilter = <T extends string>(
		currentFilters: T[],
		setFilter: (filters: T[]) => void,
		value: T
	) => {
		if (value && value !== 'all' && !currentFilters.includes(value)) {
			setFilter([...currentFilters, value]);
		}
	};

	const removeFilter = <T extends string>(
		currentFilters: T[],
		setFilter: (filters: T[]) => void,
		value: T
	) => {
		setFilter(currentFilters.filter(item => item !== value));
	};


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
			<PageHeader title="Order Management" />

			<div className="filter-section">
				<div className="space-y-2 w-full sm:flex-1">
					<label className="text-sm font-medium text-muted-foreground">Status</label>
					<select
						value=""
						onChange={(e) => addFilter(statusFilter, setStatusFilter, e.target.value as Order['status'])}
						className="input"
					>
						<option value="">Select Status...</option>
						{['pending', 'processing', 'shipped', 'cancelled']
							.filter(s => statusFilter.indexOf(s as Order['status']) === -1)
							.map(status => (
								<option key={status} value={status} className="capitalize">{status}</option>
							))}
					</select>
					{statusFilter.length > 0 && (
						<div className="flex flex-wrap gap-2">
							{statusFilter.map(status => (
								<div
									key={status}
									onClick={() => removeFilter(statusFilter, setStatusFilter, status)}
									className="filter-chip"
								>
									<span className="capitalize">{status}</span>
									<X size={14} className="opacity-50 group-hover:opacity-100" />
								</div>
							))}
						</div>
					)}
				</div>

				<div className="space-y-2 w-full sm:flex-1">
					<label className="text-sm font-medium text-muted-foreground">Customer</label>
					<select
						value=""
						onChange={(e) => addFilter(customerFilter, setCustomerFilter, e.target.value)}
						className="input"
					>
						<option value="">Select Customer...</option>
						{uniqueCustomers
							.filter(userId => !customerFilter.includes(userId))
							.map(userId => {
								const profile = profiles[userId];
								return (
									<option key={userId} value={userId}>
										{profile?.full_name || profile?.email || userId}
									</option>
								);
							})}
					</select>
					{customerFilter.length > 0 && (
						<div className="flex flex-wrap gap-2">
							{customerFilter.map(userId => {
								const profile = profiles[userId];
								return (
									<div
										key={userId}
										onClick={() => removeFilter(customerFilter, setCustomerFilter, userId)}
										className="filter-chip group"
									>
										{profile?.full_name || profile?.email || userId}
										<X size={14} className="opacity-50 group-hover:opacity-100" />
									</div>
								);
							})}
						</div>
					)}
				</div>

				<button
					onClick={() => {
						setStatusFilter([]);
						setCustomerFilter([]);
					}}
					className="btn btn-primary h-[38px] whitespace-nowrap shrink-0 mt-[28px]"
				>
					Clear Filters
				</button>
			</div>

			{loading ? (
				<div className="text-center p-8">Loading orders...</div>
			) : finalFilteredOrders.length === 0 ? (
				<div className="text-center p-8 text-muted-foreground">No orders found matching your filters.</div>
			) : (
				<div className="overflow-x-auto border border-border rounded-lg">
					<table className="w-full text-left">
						<thead>
							<tr className="bg-muted">
								<SortableHeader label="Order ID" sortKey="id" onSort={requestSort} currentSort={sortConfig} />
								<SortableHeader label="Date" sortKey="created_at" onSort={requestSort} currentSort={sortConfig} />
								<SortableHeader label="Customer" sortKey="customer_name" onSort={requestSort} currentSort={sortConfig} />
								<SortableHeader label="Total" sortKey="total_amount" onSort={requestSort} currentSort={sortConfig} />
								<SortableHeader label="Status" sortKey="status" onSort={requestSort} currentSort={sortConfig} />
								<th className="p-3 text-sm font-semibold text-muted-foreground border-b border-border">Actions</th>
							</tr>
						</thead>
						<tbody>
							{sortedOrders.map((order) => {
								const profile = profiles[order.user_id];
								return (
									<tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
										<td className="p-3 text-sm">
											<Link to={`/order/${order.id}`} className="hover:underline text-primary">
												#{order.id}
											</Link>
										</td>
										<td className="p-3 text-sm">{new Date(order.created_at).toLocaleDateString()}</td>
										<td className="p-3 text-sm">
											<div className="font-medium text-foreground">
												{profile?.full_name || 'Unknown User'}
											</div>
											<div className="text-xs text-muted-foreground font-mono">
												{profile?.email || order.user_id.split('-')[0]}
											</div>
										</td>
										<td className="p-3 text-sm font-medium">${order.total_amount.toFixed(2)}</td>
										<td className="p-3 text-sm">
											<Badge variant={
												order.status === 'shipped' ? 'success' :
													order.status === 'processing' ? 'info' :
														order.status === 'cancelled' ? 'neutral' : 'warning'
											}>
												{order.status}
											</Badge>
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
								);
							})}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
