import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Address } from '../lib/supabase';
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

	const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
	const [selectedAddressId, setSelectedAddressId] = useState<string>('new');
	const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

	// New Address Form State
	const [addressLine1, setAddressLine1] = useState('');
	const [addressLine2, setAddressLine2] = useState('');
	const [city, setCity] = useState('');
	const [state, setState] = useState('');
	const [zipCode, setZipCode] = useState('');
	const [shouldSaveAddress, setShouldSaveAddress] = useState(true);

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

	const handleCheckout = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user) return;

		setIsProcessing(true);
		setError(null);

		try {
			let shippingAddressString = '';

			if (selectedAddressId === 'new') {
				// Validate
				if (!addressLine1 || !city || !state || !zipCode) {
					throw new Error("Please fill in all required address fields.");
				}

				// Construct string
				shippingAddressString = `${addressLine1}, ${addressLine2 ? addressLine2 + ', ' : ''}${city}, ${state} ${zipCode}`;

				// Save if requested
				if (shouldSaveAddress) {
					const { error: saveError } = await supabase
						.from('addresses')
						.insert({
							user_id: user.id,
							address_line1: addressLine1,
							address_line2: addressLine2 || null,
							city,
							state,
							zip_code: zipCode,
							country: 'US', // Default
							is_default: savedAddresses.length === 0 // Make default if it's the first one
						});

					if (saveError) {
						logger.error('Failed to save address:', saveError);
						// Don't block checkout, just log
					}
				}
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

				<form onSubmit={handleCheckout} className="space-y-6">
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
							<div className="space-y-2">
								<input
									type="text"
									placeholder="Address Line 1"
									required
									className="form-input w-full"
									value={addressLine1}
									onChange={(e) => setAddressLine1(e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<input
									type="text"
									placeholder="Address Line 2 (Optional)"
									className="form-input w-full"
									value={addressLine2}
									onChange={(e) => setAddressLine2(e.target.value)}
								/>
							</div>
							<div className="grid grid-cols-2 gap-3">
								<input
									type="text"
									placeholder="City"
									required
									className="form-input w-full"
									value={city}
									onChange={(e) => setCity(e.target.value)}
								/>
								<input
									type="text"
									placeholder="State"
									required
									className="form-input w-full"
									value={state}
									onChange={(e) => setState(e.target.value)}
								/>
							</div>
							<div className="grid grid-cols-2 gap-3">
								<input
									type="text"
									placeholder="Zip Code"
									required
									className="form-input w-full"
									value={zipCode}
									onChange={(e) => setZipCode(e.target.value)}
								/>
								<div className="flex items-center">
									<label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
										<input
											type="checkbox"
											checked={shouldSaveAddress}
											onChange={(e) => setShouldSaveAddress(e.target.checked)}
											className="rounded border-input text-primary focus:ring-primary"
										/>
										Save for later
									</label>
								</div>
							</div>
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
