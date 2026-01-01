import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase, type Order, type OrderItem } from "../lib/supabase";
import logger from "../lib/logger";
import { Badge } from "../components/ui/Badge";
import { PageHeader } from "../components/ui/PageHeader";
import { resolveProductImage } from "../lib/utils";
import { ReviewForm } from "../components/reviews/ReviewForm";
import { X } from "lucide-react";

// Extend OrderItem locally to include product image from join
interface ExtendedOrderItem extends OrderItem {
	products?: {
		image: string | null;
	};
}

export default function OrderDetailPage() {
	const { id } = useParams();
	const { user, role } = useAuth();
	const navigate = useNavigate();
	const [order, setOrder] = useState<Order | null>(null);
	const [items, setItems] = useState<ExtendedOrderItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [errorMsg, setErrorMsg] = useState("");

	// Review Modal State
	const [reviewModalOpen, setReviewModalOpen] = useState(false);
	const [selectedItemForReview, setSelectedItemForReview] = useState<{ productId: number; productName: string } | null>(null);

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

				// 3. Fetch Order Items with Product Image
				const { data: itemsData, error: itemsError } = await supabase
					.from("order_items")
					.select("*, products(image)")
					.eq("order_id", id);

				if (itemsError) throw itemsError;
				// Safely cast or assume structure based on query
				setItems((itemsData as unknown as ExtendedOrderItem[]) || []);
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

	const handleOpenReview = (item: ExtendedOrderItem) => {
		setSelectedItemForReview({ productId: item.product_id, productName: item.product_name });
		setReviewModalOpen(true);
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

	const isOwner = user?.id === order.user_id;

	return (
		<div className="max-w-4xl mx-auto animate-in fade-in duration-500 py-8 px-4">
			<PageHeader
				title={
					<div className="flex items-center gap-4">
						<button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
							&larr; Back
						</button>
						<span className="text-3xl font-bold">Order #{order.id}</span>
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
								<div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
									<div className="flex items-center gap-4">
										<div className="h-16 w-16 bg-secondary rounded overflow-hidden flex-shrink-0 border border-border">
											<img
												src={resolveProductImage(item.products?.image)}
												alt={item.product_name}
												className="w-full h-full object-cover"
											/>
										</div>
										<div>
											<Link
												to={`/product/${item.product_id}`}
												className="font-medium text-foreground hover:underline hover:text-primary transition-colors block"
											>
												{item.product_name}
											</Link>
											<div className="text-sm text-muted-foreground mt-1">Qty: {item.quantity} × ${item.price.toFixed(2)}</div>
										</div>
									</div>
									<div className="flex items-center gap-4 justify-between sm:justify-end w-full sm:w-auto">
										<div className="font-bold">
											${(item.price * item.quantity).toFixed(2)}
										</div>

										{/* Write Review Button - Only for Owner and if Owner matches */}
										{isOwner && (
											<button
												onClick={() => handleOpenReview(item)}
												className="btn btn-sm btn-primary"
											>
												Write Review
											</button>
										)}
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

			{/* Review Modal */}
			{reviewModalOpen && selectedItemForReview && order && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
					<div className="bg-card w-full max-w-lg rounded-lg shadow-xl border border-border p-6 relative animate-in zoom-in-95 duration-200">
						<button
							onClick={() => setReviewModalOpen(false)}
							className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
						>
							<X size={20} />
						</button>

						<h3 className="text-xl font-bold mb-4">Write a Review</h3>
						<p className="text-sm text-muted-foreground mb-6">
							Sharing your thoughts on <span className="font-medium text-foreground">{selectedItemForReview.productName}</span>
						</p>

						<ReviewForm
							productId={selectedItemForReview.productId}
							userId={user?.id || ''}
							orderId={order.id}
							onReviewSubmitted={() => {
								setReviewModalOpen(false);
								alert("Review submitted successfully!");
							}}
							onCancel={() => setReviewModalOpen(false)}
						/>
					</div>
				</div>
			)}
		</div>
	);
}
