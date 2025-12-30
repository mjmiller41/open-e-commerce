import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase, type Order, type OrderItem } from "../lib/supabase";
import logger from "../lib/logger";
import { Badge } from "../components/ui/Badge";
import { PageHeader } from "../components/ui/PageHeader";

export default function OrderDetailPage() {
	const { id } = useParams();
	const { user, role } = useAuth();
	const navigate = useNavigate();
	const [order, setOrder] = useState<Order | null>(null);
	const [items, setItems] = useState<OrderItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [errorMsg, setErrorMsg] = useState("");

	useEffect(() => {
		if (!id) return;

		const fetchOrderDetails = async () => {
			setLoading(true);
			setErrorMsg("");

			try {
				// 1. Fetch Order
				const { data: orderData, error: orderError } = await supabase
					.from("orders")
					.select("*")
					.eq("id", id)
					.single();

				if (orderError) throw orderError;
				if (!orderData) throw new Error("Order not found");

				// 2. Check Permissions
				// If not admin and not owner, deny access
				if (role !== "admin" && orderData.user_id !== user?.id) {
					setErrorMsg("You do not have permission to view this order.");
					setLoading(false);
					return;
				}

				setOrder(orderData);

				// 3. Fetch Order Items
				const { data: itemsData, error: itemsError } = await supabase
					.from("order_items")
					.select("*")
					.eq("order_id", id);

				if (itemsError) throw itemsError;
				setItems(itemsData || []);
			} catch (err: unknown) {
				logger.error("Error fetching order details:", err);
				setErrorMsg((err as Error).message || "Failed to load order details.");
			} finally {
				setLoading(false);
			}
		};

		fetchOrderDetails();
	}, [id, user, role]);

	const updateStatus = async (newStatus: Order["status"]) => {
		if (!order) return;
		try {
			const { error } = await supabase
				.from("orders")
				.update({ status: newStatus })
				.eq("id", order.id);

			if (error) throw error;
			setOrder({ ...order, status: newStatus });
		} catch (err) {
			logger.error("Error updating status:", err);
			alert("Failed to update status.");
		}
	};

	if (loading) return <div className="text-center p-8">Loading order details...</div>;

	if (errorMsg) {
		return (
			<div className="max-w-4xl mx-auto p-8 text-center">
				<div className="text-destructive mb-4">{errorMsg}</div>
				<button onClick={() => navigate(-1)} className="btn btn-secondary">
					Go Back
				</button>
			</div>
		);
	}

	if (!order) return null;

	return (
		<div className="max-w-4xl mx-auto animate-in fade-in duration-500 py-8 px-4">
			<PageHeader
				title={
					<div className="flex items-center gap-4">
						<button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
							&larr; Back
						</button>
						<h1 className="text-3xl font-bold">Order #{order.id}</h1>
					</div>
				}
				className="mb-8"
			>
				{role === "admin" ? (
					<div className="flex items-center gap-2">
						<span className="text-sm font-medium">Status:</span>
						<select
							value={order.status}
							onChange={(e) => updateStatus(e.target.value as Order["status"])}
							className="h-9 px-3 rounded-md border border-input bg-background"
						>
							<option value="pending">Pending</option>
							<option value="processing">Processing</option>
							<option value="shipped">Shipped</option>
							<option value="cancelled">Cancelled</option>
						</select>
					</div>
				) : (
					<Badge variant={
						order.status === 'shipped' ? 'success' :
							order.status === 'processing' ? 'info' :
								order.status === 'cancelled' ? 'neutral' : 'warning'
					}>
						{order.status}
					</Badge>
				)}
			</PageHeader>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
				{/* Left Column: Items */}
				<div className="md:col-span-2 space-y-6">
					<div className="card">
						<div className="p-4 border-b border-border bg-muted/30">
							<h2 className="font-semibold">Order Items</h2>
						</div>
						<div className="divide-y divide-border">
							{items.map((item) => (
								<div key={item.id} className="p-4 flex items-center justify-between">
									<div className="flex items-center gap-4">
										{/* Placeholder for image if we had one in order_item join, or fetch separately. 
                                 For now, just name and quantity. order_items has product_name.
                             */}
										<div className="h-12 w-12 bg-secondary rounded flex items-center justify-center text-xs text-muted-foreground">
											Img
										</div>
										<div>
											<div className="font-medium text-foreground">{item.product_name}</div>
											<div className="text-sm text-muted-foreground">Qty: {item.quantity}</div>
										</div>
									</div>
									<div className="font-medium">
										${(item.price * item.quantity).toFixed(2)}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Right Column: Summary */}
				<div className="space-y-6">
					<div className="card p-6">
						<h2 className="font-semibold mb-4">Order Summary</h2>
						<div className="space-y-2 text-sm">
							<div className="flex justify-between">
								<span className="text-muted-foreground">Subtotal</span>
								<span>${items.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2)}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Shipping</span>
								<span>Free</span>
							</div>
							<div className="border-t border-border my-2 pt-2 flex justify-between font-bold text-base">
								<span>Total</span>
								<span>${order.total_amount.toFixed(2)}</span>
							</div>
						</div>
					</div>

					<div className="card p-6">
						<h2 className="font-semibold mb-4">Shipping Details</h2>
						<p className="text-sm text-muted-foreground whitespace-pre-line">
							{order.shipping_address}
						</p>
					</div>

					<div className="card p-6">
						<h2 className="font-semibold mb-4">Order Info</h2>
						<div className="space-y-2 text-sm">
							<div className="flex justify-between">
								<span className="text-muted-foreground">Date Placed</span>
								<span>{new Date(order.created_at).toLocaleDateString()}</span>
							</div>
							{/* Only Admin sees User ID for context */}
							{role === 'admin' && (
								<div className="flex justify-between">
									<span className="text-muted-foreground">Customer ID</span>
									<span className="font-mono text-xs">{order.user_id.split('-')[0]}...</span>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
