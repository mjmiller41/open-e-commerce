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
		<div className="modal-overlay">
			<div className="modal-content">
				<h2 className="modal-title">Checkout</h2>

				<form onSubmit={handleCheckout} className="checkout-form">
					<div className="form-field">
						<label className="form-label">
							Total Amount
						</label>
						<div className="form-value">
							${totalAmount.toFixed(2)}
						</div>
					</div>

					<div className="form-field">
						<label htmlFor="address" className="form-label">
							Shipping Address
						</label>
						<textarea
							id="address"
							required
							rows={3}
							className="form-textarea"
							value={address}
							onChange={(e) => setAddress(e.target.value)}
							placeholder="123 Main St, City, Country"
						/>
					</div>

					{/* Dummy Card Inputs for Visuals */}
					<div className="dummy-card-section">
						<p className="dummy-label">Payment Details (Dummy)</p>
						<div className="checkout-form" style={{ gap: '0.5rem' }}>
							<input
								type="text"
								placeholder="Card Number"
								disabled
								className="dummy-input"
								value="**** **** **** 4242"
							/>
							<div style={{ display: 'flex', gap: '0.5rem' }}>
								<input
									type="text"
									placeholder="MM/YY"
									disabled
									className="dummy-input"
									value="12/25"
								/>
								<input
									type="text"
									placeholder="CVC"
									disabled
									className="dummy-input"
									value="123"
								/>
							</div>
						</div>
					</div>

					{error && (
						<div className="auth-error">
							{error}
						</div>
					)}

					<div className="modal-actions">
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
