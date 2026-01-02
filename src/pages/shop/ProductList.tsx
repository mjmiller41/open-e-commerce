import { useEffect, useState } from 'react';
import { supabase, type Product } from '../../lib/supabase';
import logger from '../../lib/logger';
import { ProductCard } from '../../components/features/products/ProductCard';
import { useCart } from '../../context/CartContext';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { SearchFilterBar, type FilterState, type SortOption } from '../../components/features/products/SearchFilterBar';
import { fetchCategories, buildCategoryTree, type CategoryNode } from '../../lib/categoryUtils';

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

	// ... imports remain the same, just adding the new component ...

	const [searchTerm, setSearchTerm] = useState('');
	const [filters, setFilters] = useState<FilterState>({ minPrice: '', maxPrice: '', category: '' });
	const [sortOption, setSortOption] = useState<SortOption>('newest');
	const [categories, setCategories] = useState<CategoryNode[]>([]);

	// Pagination State
	const [page, setPage] = useState(1);
	const PRODUCTS_PER_PAGE = 12;
	const [totalCount, setTotalCount] = useState(0);

	useEffect(() => {
		async function loadCategories() {
			const rawCategories = await fetchCategories();
			const tree = buildCategoryTree(rawCategories);
			setCategories(tree);
		}
		loadCategories();
	}, []);

	// useEffect(() => {
	// 	setPage(1);
	// }, [categoryPath, searchTerm, filters, sortOption]);

	useEffect(() => {
		async function fetchProducts() {
			setLoading(true);

			// Start building the query
			let query = supabase.from('products').select('*', { count: 'exact' }).eq('status', 'active');

			// If URL has a category path, it takes precedence as the "base" context, 
			// but we can refine it further with the local filter or override it.
			// Given user request for "Local Filter", we treat the dropdown as an additional filter.
			// However, usually detailed filters refine the broader context.
			// IF filter.category is set, use that.
			// IF NOT, use URL category.

			let activeCategoryIdentifier = filters.category;
			if (!activeCategoryIdentifier && categoryPath) {
				const decodedCategory = decodeURIComponent(categoryPath);
				activeCategoryIdentifier = decodedCategory.replace(/\//g, ' > ');
			}

			if (activeCategoryIdentifier) {
				query = query.ilike('category', `${activeCategoryIdentifier}%`);
			}

			if (searchTerm) {
				// Search in name or description
				query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
			}

			if (filters.minPrice) {
				query = query.gte('price', parseFloat(filters.minPrice));
			}

			if (filters.maxPrice) {
				query = query.lte('price', parseFloat(filters.maxPrice));
			}

			switch (sortOption) {
				case 'price_asc':
					query = query.order('price', { ascending: true });
					break;
				case 'price_desc':
					query = query.order('price', { ascending: false });
					break;
				case 'name_asc':
					query = query.order('name', { ascending: true });
					break;
				case 'newest':
				default:
					query = query.order('id', { ascending: false });
					break;
			}

			// Apply fallback sort if specific sort wasn't applied effectively (though the switch covers it)
			if (sortOption === 'newest') {
				query = query.order('id', { ascending: false });
			}

			// Apply Pagination
			const from = (page - 1) * PRODUCTS_PER_PAGE;
			const to = from + PRODUCTS_PER_PAGE - 1;
			query = query.range(from, to);

			const { data, count, error } = await query;
			if (error) {
				logger.error('Error fetching products:', error);
			} else {
				setProducts(data);
				setTotalCount(count || 0);
			}
			setLoading(false);
		}
		fetchProducts();
	}, [categoryPath, searchTerm, filters, sortOption, page]);

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

	const pageTitle = categoryPath
		? decodeURIComponent(categoryPath.split('/').pop() || 'Category')
		: 'Welcome to Open E-Commerce';

	const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE);

	return (
		<div className="animate-in fade-in duration-700">
			{renderBreadcrumbs()}

			<div className="text-center mb-12 max-w-2xl mx-auto">
				<h2 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent capitalize">
					{pageTitle}
				</h2>
				<p className="text-muted-foreground text-lg">
					{categoryPath
						? `Explore our collection of ${pageTitle}.`
						: 'Explore our premium selection of cutting-edge technology and accessories.'}
				</p>
			</div>

			<SearchFilterBar
				onSearch={(term) => { setSearchTerm(term); setPage(1); }}
				onFilterChange={(newFilters) => { setFilters(newFilters); setPage(1); }}
				onSortChange={(sort) => { setSortOption(sort); setPage(1); }}
				categories={categories}
			/>

			{loading ? (
				<div className="text-center py-16">
					<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
						<span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
					</div>
					<p className="mt-4 text-muted-foreground">Loading products...</p>
				</div>
			) : !products || products.length === 0 ? (
				<div className="text-center py-16 px-4 border border-dashed border-border rounded-lg">
					<p style={{ marginBottom: '1rem' }}>
						No products found {categoryPath ? 'in this category' : 'in the database'}.
					</p>
				</div>
			) : (
				<>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-[var(--grid-spacing-horizontal)] gap-y-[var(--grid-spacing-vertical)] mb-8">
						{products.map((product, index) => (
							<ProductCard
								key={product.id}
								product={product}
								cartQuantity={cartMap.get(product.id!) || 0}
								onAddToCart={addToCart}
								onUpdateQuantity={updateQuantity}
								onRemoveFromCart={removeFromCart}
								priority={index < 2} // First 2 products load eagerly
							/>
						))}
					</div>

					{/* Pagination Controls */}
					{totalPages > 1 && (
						<div className="flex justify-center items-center gap-4 mt-8 pb-8">
							<button
								onClick={() => setPage(p => Math.max(1, p - 1))}
								disabled={page === 1}
								className="px-4 py-2 text-sm font-medium border border-input rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
							>
								Previous
							</button>
							<span className="text-sm text-muted-foreground">
								Page {page} of {totalPages}
							</span>
							<button
								onClick={() => setPage(p => Math.min(totalPages, p + 1))}
								disabled={page === totalPages}
								className="px-4 py-2 text-sm font-medium border border-input rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
							>
								Next
							</button>
						</div>
					)}
				</>
			)}
		</div>
	);
}
