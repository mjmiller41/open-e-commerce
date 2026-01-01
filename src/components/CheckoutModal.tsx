import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Address } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import logger from '../lib/logger';
import AddressForm from './AddressForm';

interface CheckoutModalProps {
	isOpen: boolean;
	onClose: () => void;
	totalAmount: number;
}

export function CheckoutModal({ isOpen, onClose, totalAmount }: CheckoutModalProps) {
	const { user } = useAuth();
	const { cartItems, clearCart } = useCart();

	const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
	const [selectedAddressId, setSelectedAddressId] = useState<string>('new');
	const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

	// New Address Form State


	const [isProcessing, setIsProcessing] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchAddresses = async () => {
			if (!user) return;
			setIsLoadingAddresses(true);
			try {
				const { data, error } = await supabase
					.from('addresses')
					.select('*')
					.eq('user_id', user.id)
					.order('is_default', { ascending: false })
					.order('created_at', { ascending: false });

				if (error) throw error;

				setSavedAddresses(data || []);

				if (data && data.length > 0) {
					// Select the first one (which will be default if exists, or most recent)
					setSelectedAddressId(data[0].id);
				} else {
					setSelectedAddressId('new');
				}
			} catch (err) {
				logger.error('Failed to fetch addresses:', err);
			} finally {
				setIsLoadingAddresses(false);
			}
		};

		if (isOpen && user) {
			fetchAddresses();
		}
	}, [isOpen, user]);

	if (!isOpen) return null;

	const handleCheckout = async (e: React.FormEvent | React.MouseEvent) => {
		e.preventDefault();
		if (!user) return;

		setIsProcessing(true);
		setError(null);

		try {
			let shippingAddressString = '';


			if (selectedAddressId === 'new') {
				throw new Error("Please add and save a new address before checking out.");
			} else {
				// Use selected address
				const addr = savedAddresses.find(a => a.id === selectedAddressId);
				if (!addr) throw new Error("Selected address not found.");
				shippingAddressString = `${addr.address_line1}, ${addr.address_line2 ? addr.address_line2 + ', ' : ''}${addr.city}, ${addr.state} ${addr.zip_code}`;
			}

			// 1. Simulate Payment Delay
			await new Promise((resolve) => setTimeout(resolve, 2000));

			// 2. Create Order
			const { data: order, error: orderError } = await supabase
				.from('orders')
				.insert({
					user_id: user.id,
					total_amount: totalAmount,
					shipping_address: shippingAddressString,
					status: 'pending'
				})
				.select()
				.single();

			if (orderError) throw orderError;

			// 3. Create Order Items
			const orderItems = cartItems
				.filter(item => item.product)
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
			<div className="bg-card w-full max-w-lg p-6 rounded-lg shadow-xl animate-in zoom-in-95 duration-300 border border-border max-h-[90vh] overflow-y-auto">
				<h2 className="text-xl font-bold mb-6">Checkout</h2>

				<div className="space-y-6">
					<div className="space-y-2">
						<label className="block text-sm font-medium text-muted-foreground">
							Total Amount
						</label>
						<div className="text-lg font-bold text-foreground">
							${totalAmount.toFixed(2)}
						</div>
					</div>

					{/* Address Selection */}
					<div className="space-y-4">
						<label className="block text-sm font-medium text-muted-foreground">
							Shipping Address
						</label>

						{isLoadingAddresses ? (
							<div className="text-sm text-muted-foreground">Loading addresses...</div>
						) : (
							<div className="space-y-3">
								{savedAddresses.map((addr) => (
									<div key={addr.id} className="flex items-start gap-3 p-3 rounded-md border border-input hover:bg-accent/50 transition-colors">
										<input
											type="radio"
											id={`addr-${addr.id}`}
											name="shippingAddress"
											value={addr.id}
											checked={selectedAddressId === addr.id}
											onChange={(e) => setSelectedAddressId(e.target.value)}
											className="mt-1"
										/>
										<label htmlFor={`addr-${addr.id}`} className="text-sm cursor-pointer flex-1 user-select-none">
											<div className="font-medium">{addr.address_line1}</div>
											{addr.address_line2 && <div>{addr.address_line2}</div>}
											<div className="text-muted-foreground">{addr.city}, {addr.state} {addr.zip_code}</div>
										</label>
									</div>
								))}

								<div className="flex items-center gap-3 p-3 rounded-md border border-input hover:bg-accent/50 transition-colors">
									<input
										type="radio"
										id="addr-new"
										name="shippingAddress"
										value="new"
										checked={selectedAddressId === 'new'}
										onChange={(e) => setSelectedAddressId(e.target.value)}
									/>
									<label htmlFor="addr-new" className="text-sm font-medium cursor-pointer">
										Use a new address
									</label>
								</div>
							</div>
						)}
					</div>

					{/* New Address Form */}
					{selectedAddressId === 'new' && (
						<div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border animate-in slide-in-from-top-2 duration-200">
							<AddressForm
								onSave={async (addressData) => {
									try {
										const { data, error } = await supabase
											.from('addresses')
											.insert({
												user_id: user!.id,
												...addressData,
												is_default: savedAddresses.length === 0 ? true : addressData.is_default
											})
											.select()
											.single();

										if (error) throw error;

										setSavedAddresses(prev => [data, ...prev]);
										setSelectedAddressId(data.id);
									} catch (err) {
										logger.error("Failed to save address", err);
										alert("Failed to save address");
									}
								}}
								onCancel={() => setSelectedAddressId(savedAddresses.length > 0 ? savedAddresses[0].id : '')}
							/>
						</div>
					)}

					{/* Dummy Card Inputs for Visuals */}
					<div className="p-4 bg-muted/50 rounded-lg border border-border">
						<p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Payment Details (Dummy)</p>
						<div className="space-y-2">
							<input
								type="text"
								placeholder="Card Number"
								disabled
								className="form-input bg-background/50 text-muted-foreground cursor-not-allowed w-full"
								value="**** **** **** 4242"
							/>
							<div className="flex gap-2">
								<input
									type="text"
									placeholder="MM/YY"
									disabled
									className="form-input bg-background/50 text-muted-foreground cursor-not-allowed w-1/2"
									value="12/25"
								/>
								<input
									type="text"
									placeholder="CVC"
									disabled
									className="form-input bg-background/50 text-muted-foreground cursor-not-allowed w-1/2"
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
							type="button"
							onClick={handleCheckout}
							disabled={isProcessing}
							className="btn btn-primary"
						>
							{isProcessing ? 'Processing...' : 'Pay Now'}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
