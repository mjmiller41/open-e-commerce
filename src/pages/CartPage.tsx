import { Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { QuantityControl } from '../components/QuantityControl';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useStoreSettings } from '../context/StoreSettingsContext';
import { formatCurrency } from '../lib/currency';
import { useEffect, useState } from 'react';
import { supabase, type Product } from '../lib/supabase';
import logger from '../lib/logger';
import { CheckoutModal } from '../components/CheckoutModal';
import { PageHeader } from '../components/ui/PageHeader';
import { resolveProductImage } from '../lib/utils';
/**
 * The shopping cart page.
 * Displays the list of items in the cart, allows quantity adjustment and removal,
 * and shows the order summary.
 *
 * @returns The rendered cart page.
 */
export function CartPage() {
	const { cartItems, updateQuantity, removeFromCart } = useCart();
	const { settings } = useStoreSettings();
	const [products, setProducts] = useState<Map<number, Product>>(new Map());
	const [loading, setLoading] = useState(true);
	const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

	useEffect(() => {
		async function fetchCartProducts() {
			if (cartItems.length === 0) {
				setLoading(false);
				return;
			}

			const productIds = cartItems.map(item => item.productId);
			const { data, error } = await supabase.from('products').select('*').in('id', productIds);

			if (error) {
				logger.error('Error fetching cart products:', error);
			} else if (data) {
				const productMap = new Map();
				data.forEach(p => productMap.set(p.id, p));
				setProducts(productMap);
			}
			setLoading(false);
		}
		fetchCartProducts();
	}, [cartItems]); // Re-fetch if new items added that we might not have info for. Optimization could be better but this is simple.

	const handleUpdate = (productId: number, currentQty: number, delta: number) => {
		const newQty = currentQty + delta;
		if (newQty <= 0) {
			removeFromCart(productId);
		} else {
			updateQuantity(productId, delta);
		}
	};

	const removeItem = (productId: number) => removeFromCart(productId);

	if (loading) return <div className="empty-cart">Loading cart...</div>;

	// Enhance cart items with product data
	const enrichedCartItems = cartItems.map(item => {
		const product = products.get(item.productId);
		return product ? { ...item, product } : null;
	}).filter((item): item is NonNullable<typeof item> => item !== null);

	const total = enrichedCartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

	if (enrichedCartItems.length === 0) {
		return (

			<div className="text-center py-16 px-4 animate-in fade-in duration-500">
				<div className="w-20 h-20 bg-muted text-muted-foreground rounded-full flex items-center justify-center mx-auto mb-6">
					<ShoppingBag size={40} />
				</div>
				<h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
				<p className="text-muted-foreground mb-8 max-w-md mx-auto">
					Looks like you haven't added anything to your cart yet. Explore our products to find something you'll love.
				</p>
				<Link to="/" className="btn btn-primary">
					Start Shopping
				</Link>
			</div>
		);

	}

	return (

		<div className="animate-in fade-in duration-500">
			<PageHeader
				title={
					<span className="flex items-center gap-4">
						<ShoppingBag className="text-primary" size={32} />
						<span>Shopping Cart</span>
						<span className="text-xl text-muted-foreground font-normal">({enrichedCartItems.length} items)</span>
					</span>
				}
				className="mb-8"
			/>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<div className="lg:col-span-2 flex flex-col gap-4">
					{enrichedCartItems.map(({ productId, quantity, product }) => (
						<div key={productId} className="card flex items-center gap-6 p-6">
							<div className="w-24 h-24 rounded-lg bg-muted object-cover overflow-hidden shrink-0">
								<img
									src={resolveProductImage(product.image)}
									alt={product.name}
									className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal"
									onError={(e) => {
										e.currentTarget.src = `${import.meta.env.BASE_URL}logo.png`;
										e.currentTarget.onerror = null;
									}}
								/>
							</div>

							<div className="flex-1">
								<Link to={`/product/${product.id}`} className="block mb-1 group">
									<h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{product.name}</h3>
								</Link>
								<Link to={`/category/${product.category.split('>').map(s => encodeURIComponent(s.trim())).join('/')}`} className="text-sm text-muted-foreground">{product.category}</Link>
								<div className="text-primary font-bold mt-1">{formatCurrency(product.price, settings)}</div>
							</div>

							<div className="flex flex-col items-end gap-4">
								<QuantityControl
									quantity={quantity}
									onDecrease={() => handleUpdate(productId, quantity, -1)}
									onIncrease={() => handleUpdate(productId, quantity, 1)}
									maxQuantity={product.on_hand}
									className="w-32"
								/>
								<button
									onClick={() => removeItem(productId)}
									className="text-destructive text-sm flex items-center gap-1 hover:underline"
								>
									<Trash2 size={16} /> Remove
								</button>
							</div>
						</div>
					))}
				</div>

				<div>
					<div className="card p-6 sticky top-24">
						<h2 className="text-xl font-bold mb-4">Order Summary</h2>

						<div className="flex justify-between mb-2 text-sm text-muted-foreground">
							<span>Subtotal</span>
							<span>{formatCurrency(total, settings)}</span>
						</div>
						<div className="flex justify-between mb-2 text-sm text-muted-foreground">
							<span>Shipping</span>
							<span className="text-green-600">Free</span>
						</div>
						<div className="flex justify-between mb-6 text-sm text-muted-foreground">
							<span>Tax</span>
							<span>Calculated at checkout</span>
						</div>

						<div className="flex justify-between border-t border-border pt-4 mb-6 font-bold text-xl">
							<span>Total</span>
							<span className="text-primary">{formatCurrency(total, settings)}</span>
						</div>

						<button className="btn btn-primary w-full" onClick={() => setIsCheckoutOpen(true)}>
							Proceed to Checkout <ArrowRight size={18} />
						</button>

						<p className="text-xs text-center text-muted-foreground mt-4">
							Secure Checkout powered by OpenStore
						</p>
					</div>
				</div>
			</div>

			<CheckoutModal
				isOpen={isCheckoutOpen}
				onClose={() => setIsCheckoutOpen(false)}
				totalAmount={total}
			/>
		</div>
	);
}
