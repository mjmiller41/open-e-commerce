import { useEffect, useState } from 'react';
import { X, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/useCart';
import { formatCurrency } from '../lib/currency';
import { useStoreSettings } from '../context/StoreSettingsContext';
import { QuantityControl } from './QuantityControl';
import { supabase, type Product } from '../lib/supabase';
import { resolveProductImage } from '../lib/utils';

export function CartDrawer() {
	const { cartItems, isCartOpen, closeCart, updateQuantity, removeFromCart } = useCart();
	const { settings } = useStoreSettings();
	const navigate = useNavigate();
	const [products, setProducts] = useState<Map<number, Product>>(new Map());

	useEffect(() => {
		if (isCartOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => {
			document.body.style.overflow = '';
		};
	}, [isCartOpen]);

	useEffect(() => {
		async function fetchCartProducts() {
			if (cartItems.length === 0) return;

			// Only fetch if we don't have them all
			const missingIds = cartItems.filter(item => !products.has(item.productId)).map(i => i.productId);
			if (missingIds.length === 0) return;

			const { data } = await supabase.from('products').select('*').in('id', missingIds);
			if (data) {
				setProducts(prev => {
					const next = new Map(prev);
					data.forEach(p => next.set(p.id, p));
					return next;
				});
			}
		}
		if (isCartOpen) {
			fetchCartProducts();
		}
	}, [cartItems, isCartOpen, products]);

	if (!isCartOpen) return null;

	const enrichedItems = cartItems.map(item => {
		const product = item.product || products.get(item.productId);
		return product ? { ...item, product } : null;
	}).filter((item): item is NonNullable<typeof item> => item !== null);

	const total = enrichedItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

	const handleCheckout = () => {
		navigate('/cart'); // Navigate to full cart for checkout or directly to checkout modal if we want
		closeCart();
	};

	return (
		<div className="fixed inset-0 z-50 flex justify-end">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
				onClick={closeCart}
			/>

			{/* Drawer */}
			<div className="relative w-full max-w-md bg-background h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
				<div className="flex items-center justify-between p-4 border-b border-border">
					<h2 className="text-lg font-bold flex items-center gap-2">
						<ShoppingBag size={20} />
						Your Cart
						<span className="text-sm font-normal text-muted-foreground ml-2">({cartItems.reduce((a, c) => a + c.quantity, 0)})</span>
					</h2>
					<button onClick={closeCart} className="btn btn-ghost p-2 h-auto">
						<X size={20} />
					</button>
				</div>

				<div className="flex-1 overflow-y-auto p-4 space-y-4">
					{enrichedItems.length === 0 ? (
						<div className="text-center py-12 text-muted-foreground">
							<ShoppingBag size={48} className="mx-auto mb-4 opacity-50" />
							<p>Your cart is empty.</p>
							<button onClick={closeCart} className="text-primary hover:underline mt-2">Continue Shopping</button>
						</div>
					) : (
						enrichedItems.map(({ productId, quantity, product }) => (
							<div key={productId} className="flex gap-4 p-2 rounded-lg hover:bg-muted/30 transition-colors">
								<div className="w-20 h-20 rounded-md bg-muted overflow-hidden shrink-0 border border-border">
									<img
										src={resolveProductImage(product.images?.[0] || product.image)}
										alt={product.name}
										className="w-full h-full object-cover"
										onError={(e) => {
											e.currentTarget.src = `${import.meta.env.BASE_URL}logo.png`;
											e.currentTarget.onerror = null;
										}}
									/>
								</div>
								<div className="flex-1 flex flex-col justify-between">
									<div>
										<h3 className="font-medium line-clamp-1">{product.name}</h3>
										<div className="text-sm text-muted-foreground">{product.variant}</div>
									</div>
									<div className="flex items-center justify-between mt-2">
										<QuantityControl
											quantity={quantity}
											onDecrease={() => {
												if (quantity > 1) updateQuantity(productId, -1);
												else removeFromCart(productId);
											}}
											onIncrease={() => updateQuantity(productId, 1)}
											maxQuantity={product.on_hand}
											className="scale-90 origin-left"
										/>
										<div className="font-bold text-sm">
											{formatCurrency(product.price * quantity, settings)}
										</div>
									</div>
								</div>
							</div>
						))
					)}
				</div>

				{enrichedItems.length > 0 && (
					<div className="p-4 border-t border-border bg-muted/20">
						<div className="flex justify-between items-center mb-4 text-lg font-bold">
							<span>Subtotal</span>
							<span>{formatCurrency(total, settings)}</span>
						</div>
						<div className="grid grid-cols-2 gap-3">
							<Link
								to="/cart"
								className="btn btn-outline w-full text-center"
								onClick={closeCart}
							>
								View Cart
							</Link>
							<button
								onClick={handleCheckout}
								className="btn btn-primary w-full"
							>
								Checkout
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
