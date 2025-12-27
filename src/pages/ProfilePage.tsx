import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase, type Order } from "../lib/supabase";

export default function ProfilePage() {
	const { user, role } = useAuth();
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchOrders = async () => {
			setLoading(true);
			const { data, error } = await supabase
				.from("orders")
				.select("*")
				.eq("user_id", user?.id)
				.order("created_at", { ascending: false });

			if (error) {
				console.error("Error fetching orders:", error);
			} else {
				setOrders(data || []);
			}
			setLoading(false);
		};

		if (user) {
			fetchOrders();
		}
	}, [user]);

	return (
		<div className="profile-container fade-in">
			<h1 className="profile-title">My Profile</h1>
			<div className="profile-card mb-8">
				<div>
					<label className="profile-field-label">Email</label>
					<div className="profile-field-value">{user?.email}</div>
				</div>
				<div>
					<label className="profile-field-label">Role</label>
					<div className="profile-field-value capitalize">{role || "User"}</div>
				</div>
				<div>
					<label className="profile-field-label">User ID</label>
					<div className="profile-field-value mono">{user?.id}</div>
				</div>
			</div>

			<h2 className="profile-title" style={{ fontSize: '1.5rem', marginTop: '3rem' }}>My Orders</h2>

			{loading ? (
				<div style={{ textAlign: 'center', padding: '2rem' }}>Loading orders...</div>
			) : orders.length === 0 ? (
				<div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
					You haven't placed any orders yet.
				</div>
			) : (
				<div className="orders-table-container">
					<table className="orders-table">
						<thead>
							<tr>
								<th>Order ID</th>
								<th>Date</th>
								<th>Total</th>
								<th>Status</th>
								<th>Shipping Address</th>
							</tr>
						</thead>
						<tbody>
							{orders.map((order) => (
								<tr key={order.id}>
									<td>#{order.id}</td>
									<td>{new Date(order.created_at).toLocaleDateString()}</td>
									<td>${order.total_amount.toFixed(2)}</td>
									<td>
										<span className={`status-badge status-${order.status}`}>
											{order.status}
										</span>
									</td>
									<td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
										{order.shipping_address}
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
