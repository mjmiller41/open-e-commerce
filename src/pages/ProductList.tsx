import { useEffect, useState } from 'react';
import { supabase, type Product } from '../lib/supabase';
import logger from '../lib/logger';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../context/useCart';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

/**
 * The product listing page (Home page).
 * Fetches and displays a grid of products available for purchase.
 * Supports filtering by category via URL wildcard.
 *
 * @returns The rendered product list.
 */
export function ProductList() {
	const [products, setProducts] = useState<Product[] | null>(null);
	const [loading, setLoading] = useState(true);
	const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();
	const params = useParams();
	// 'category' is the fixed part of the route, '*' is the wildcard part captured by react-router
	// However, in our route definition we'll likely use "category/*" so the param name for the wildcard might vary 
	// dependent on how we define it in App.tsx. 
	// If we define path="category/*", the param dict key is "*".
	const categoryPath = params['*'];

	const cartMap = new Map(cartItems.map(item => [item.productId, item.quantity]));

	useEffect(() => {
		async function fetchProducts() {
			setLoading(true);
			let query = supabase.from('products').select('*').eq('status', 'active');

			if (categoryPath) {
				// Decode the path segments to reconstruct the likely category string
				// Determine separator format: The DB likely uses " > " based on user request context.
				// We'll support flexible matching.
				const decodedCategory = decodeURIComponent(categoryPath);
				// We construct a query that matches products starting with this category path.
				// Assuming DB category format is "Level1 > Level2 > Level3"
				// If URL is "Level1/Level2", we match "Level1 > Level2%"

				// We try to match leniently. If the URL uses slashes, we replace them with the DB separator.
				// However, we must be careful not to replace legitimate slashes if they existed in names (unlikely but possible).
				// For now, assume standard mapping: URL '/' -> DB ' > '
				const dbCategoryPrefix = decodedCategory.replace(/\//g, ' > ');

				query = query.ilike('category', `${dbCategoryPrefix}%`);
			}

			const { data, error } = await query;
			if (error) {
				logger.error('Error fetching products:', error);
			} else {
				setProducts(data);
			}
			setLoading(false);
		}
		fetchProducts();
	}, [categoryPath]);

	// Generate breadcrumbs
	const renderBreadcrumbs = () => {
		if (!categoryPath) return null;

		const segments = categoryPath.split('/');
		let currentPath = '/category';

		return (
			<nav className="flex items-center text-sm text-muted-foreground mb-8 overflow-x-auto whitespace-nowrap pb-2">
				<Link to="/" className="hover:text-primary flex items-center gap-1 transition-colors">
					<Home size={14} />
					Home
				</Link>
				{segments.map((segment, index) => {
					currentPath += `/${segment}`;
					const isLast = index === segments.length - 1;
					const name = decodeURIComponent(segment);

					return (
						<div key={currentPath} className="flex items-center">
							<ChevronRight size={14} className="mx-2 shrink-0" />
							{isLast ? (
								<span className="font-medium text-foreground">{name}</span>
							) : (
								<Link to={currentPath} className="hover:text-primary transition-colors">
									{name}
								</Link>
							)}
						</div>
					);
				})}
			</nav>
		);
	};

	if (loading) return <div className="empty-cart">Loading products...</div>;
	if (!products) return <div className="empty-cart">No products found.</div>;

	const pageTitle = categoryPath
		? decodeURIComponent(categoryPath.split('/').pop() || 'Category')
		: 'Featured Collection';

	return (
		<div className="animate-in fade-in duration-700">
			{renderBreadcrumbs()}

			<div className="text-center mb-12 max-w-2xl mx-auto">
				<h1 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent capitalize">
					{pageTitle}
				</h1>
				<p className="text-muted-foreground text-lg">
					{categoryPath
						? `Explore our collection of ${pageTitle}.`
						: 'Explore our premium selection of cutting-edge technology and accessories.'}
				</p>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
				{products.map(product => (
					<ProductCard
						key={product.id}
						product={product}
						cartQuantity={cartMap.get(product.id!) || 0}
						onAddToCart={addToCart}
						onUpdateQuantity={updateQuantity}
						onRemoveFromCart={removeFromCart}
					/>
				))}
			</div>

			{products.length === 0 && (
				<div className="text-center py-16 px-4 border border-dashed border-border rounded-lg">
					<p style={{ marginBottom: '1rem' }}>
						No products found {categoryPath ? 'in this category' : 'in the database'}.
					</p>
				</div>
			)}
		</div>
	);
}
