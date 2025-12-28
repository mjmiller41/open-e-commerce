import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/useCart';
import logger from '../lib/logger';

interface CheckoutModalProps {
	isOpen: boolean;
	onClose: () => void;
	totalAmount: number;
}

export function CheckoutModal({ isOpen, onClose, totalAmount }: CheckoutModalProps) {
	const { user } = useAuth();
	const { cartItems, clearCart } = useCart();
	const [address, setAddress] = useState('');
	const [isProcessing, setIsProcessing] = useState(false);
	const [error, setError] = useState<string | null>(null);

	if (!isOpen) return null;

	const handleCheckout = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user) return; // Should be protected by route, but safety check

		setIsProcessing(true);
		setError(null);

		try {
			// 1. Simulate Payment Delay
			await new Promise((resolve) => setTimeout(resolve, 2000));

			// 2. Create Order
			const { data: order, error: orderError } = await supabase
				.from('orders')
				.insert({
					user_id: user.id,
					total_amount: totalAmount,
					shipping_address: address,
					status: 'pending' // Default
				})
				.select()
				.single();

			if (orderError) throw orderError;

			// 3. Create Order Items
			const orderItems = cartItems
				.filter(item => item.product) // Ensure product data exists
				.map((item) => ({
					order_id: order.id,
					user_id: user.id,
					product_id: item.productId,
					product_name: item.product!.name,
					quantity: item.quantity,
					price: item.product!.price
				}));

			if (orderItems.length === 0) {
				throw new Error("No valid items in cart");
			}

			const { error: itemsError } = await supabase
				.from('order_items')
				.insert(orderItems);

			if (itemsError) throw itemsError;

			// 4. Success
			clearCart();
			alert('Order placed successfully!');
			onClose();
		} catch (err: unknown) {
			logger.error('Checkout error:', err);
			const errorMessage = err instanceof Error ? err.message : 'Failed to place order. Please try again.';
			setError(errorMessage);
		} finally {
			setIsProcessing(false);
		}
	};

	return (

		<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-300">
			<div className="bg-card w-full max-w-md p-6 rounded-lg shadow-xl animate-in zoom-in-95 duration-300 border border-border">
				<h2 className="text-xl font-bold mb-6">Checkout</h2>

				<form onSubmit={handleCheckout} className="space-y-4">
					<div className="space-y-2">
						<label className="block text-sm font-medium text-muted-foreground">
							Total Amount
						</label>
						<div className="text-lg font-bold text-foreground">
							${totalAmount.toFixed(2)}
						</div>
					</div>

					<div className="space-y-2">
						<label htmlFor="address" className="block text-sm font-medium text-muted-foreground">
							Shipping Address
						</label>
						<textarea
							id="address"
							required
							rows={3}
							className="form-input min-h-[80px] resize-none"
							value={address}
							onChange={(e) => setAddress(e.target.value)}
							placeholder="123 Main St, City, Country"
						/>
					</div>

					{/* Dummy Card Inputs for Visuals */}
					<div className="p-4 bg-muted/50 rounded-lg border border-border">
						<p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Payment Details (Dummy)</p>
						<div className="space-y-2">
							<input
								type="text"
								placeholder="Card Number"
								disabled
								className="form-input bg-background/50 text-muted-foreground cursor-not-allowed"
								value="**** **** **** 4242"
							/>
							<div className="flex gap-2">
								<input
									type="text"
									placeholder="MM/YY"
									disabled
									className="form-input bg-background/50 text-muted-foreground cursor-not-allowed"
									value="12/25"
								/>
								<input
									type="text"
									placeholder="CVC"
									disabled
									className="form-input bg-background/50 text-muted-foreground cursor-not-allowed"
									value="123"
								/>
							</div>
						</div>
					</div>

					{error && (
						<div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
							{error}
						</div>
					)}

					<div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
						<button
							type="button"
							onClick={onClose}
							disabled={isProcessing}
							className="btn btn-ghost"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isProcessing}
							className="btn btn-primary"
						>
							{isProcessing ? 'Processing...' : 'Pay Now'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
