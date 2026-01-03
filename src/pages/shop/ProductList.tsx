import { useEffect, useState, useRef } from 'react';
import { supabase, type Product } from '../../lib/supabase';
import logger from '../../lib/logger';
import { ProductCard } from '../../components/features/products/ProductCard';
import { useCart } from '../../context/CartContext';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Home, ArrowUp } from 'lucide-react';
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
	const [hasMore, setHasMore] = useState(false);
	const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();
	const params = useParams();
	const categoryPath = params['*'];

	const cartMap = new Map(cartItems.map(item => [item.productId, item.quantity]));

	const [searchTerm, setSearchTerm] = useState('');
	const [filters, setFilters] = useState<FilterState>({ minPrice: '', maxPrice: '', category: '' });
	const [sortOption, setSortOption] = useState<SortOption>('newest');
	const [categories, setCategories] = useState<CategoryNode[]>([]);

	// Pagination State
	const [page, setPage] = useState(1);
	const PRODUCTS_PER_PAGE = 9;

	// Ref for the sentinel element
	const observerTarget = useRef<HTMLDivElement>(null);

	// Track previous category for reset
	const [prevCategory, setPrevCategory] = useState(categoryPath);
	if (categoryPath !== prevCategory) {
		setPrevCategory(categoryPath);
		setPage(1);
		setProducts([]);
		setLoading(true);
	}

	useEffect(() => {
		async function loadCategories() {
			const rawCategories = await fetchCategories();
			const tree = buildCategoryTree(rawCategories);
			setCategories(tree);
		}
		loadCategories();
	}, []);

	// Removed useEffect that resets page on filters change as it caused render loops. 
	// Filter changes are now handled in SearchFilterBar callbacks.
	// Category changes are handled by the render-time check above.


	useEffect(() => {
		async function fetchProducts() {
			setLoading(true);

			// Start building the query
			let query = supabase.from('products').select('*', { count: 'exact' }).eq('status', 'active');

			let activeCategoryIdentifier = filters.category;
			if (!activeCategoryIdentifier && categoryPath) {
				const decodedCategory = decodeURIComponent(categoryPath);
				activeCategoryIdentifier = decodedCategory.replace(/\//g, ' > ');
			}

			if (activeCategoryIdentifier) {
				query = query.ilike('category', `${activeCategoryIdentifier}%`);
			}

			if (searchTerm) {
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

			// Apply fallback sort
			if (sortOption === 'newest') {
				query = query.order('id', { ascending: false });
			}

			const from = (page - 1) * PRODUCTS_PER_PAGE;
			const to = from + PRODUCTS_PER_PAGE - 1;
			query = query.range(from, to);

			const { data, count, error } = await query;
			if (error) {
				logger.error('Error fetching products:', error);
			} else {
				if (page === 1) {
					setProducts(data);
				} else {
					setProducts(prev => (prev ? [...prev, ...data] : data));
				}

				// Check if there are more products to load
				if (count !== null) {
					setHasMore(to < count - 1);
				}
			}
			setLoading(false);
		}
		fetchProducts();
	}, [page, categoryPath, searchTerm, filters, sortOption]);

	// Intersection Observer for infinite scroll
	useEffect(() => {
		const observer = new IntersectionObserver(
			entries => {
				if (entries[0].isIntersecting && hasMore && !loading) {
					setPage(prev => prev + 1);
				}
			},
			{ threshold: 0.1 }
		);

		const currentTarget = observerTarget.current;
		if (currentTarget) {
			observer.observe(currentTarget);
		}

		return () => {
			if (currentTarget) {
				observer.unobserve(currentTarget);
			}
		};
	}, [hasMore, loading]);

	// Back to Top Button Logic
	const [showScrollTop, setShowScrollTop] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			if (window.scrollY > 300) {
				setShowScrollTop(true);
			} else {
				setShowScrollTop(false);
			}
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

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
				onSearch={(term) => {
					if (term !== searchTerm) {
						setSearchTerm(term);
						setPage(1);
						setProducts([]);
						setLoading(true);
					}
				}}
				onFilterChange={(newFilters) => {
					// Simple shallow check for filter changes
					const isDifferent =
						newFilters.category !== filters.category ||
						newFilters.minPrice !== filters.minPrice ||
						newFilters.maxPrice !== filters.maxPrice;

					if (isDifferent) {
						setFilters(newFilters);
						setPage(1);
						setProducts([]);
						setLoading(true);
					}
				}}
				onSortChange={(sort) => {
					if (sort !== sortOption) {
						setSortOption(sort);
						setPage(1);
						setProducts([]);
						setLoading(true);
					}
				}}
				categories={categories}
			/>

			{loading && page === 1 ? (
				<div className="text-center py-16">
					<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
						<span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
					</div>
					<p className="mt-4 text-muted-foreground">Loading products...</p>
				</div>
			) : !products || (products.length === 0 && !loading) ? (
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
								key={`${product.id}-${index}`} // Fallback uniqueness
								product={product}
								cartQuantity={cartMap.get(product.id!) || 0}
								onAddToCart={addToCart}
								onUpdateQuantity={updateQuantity}
								onRemoveFromCart={removeFromCart}
								priority={index < 2}
							/>
						))}
					</div>

					{/* Sentinel element for infinite scroll */}
					<div ref={observerTarget} className="h-10 w-full flex justify-center items-center mt-4">
						{loading && page > 1 && (
							<div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
						)}
					</div>

					{/* Back to Top Button */}
					{showScrollTop && (
						<button
							onClick={scrollToTop}
							className="fixed bottom-8 right-8 p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all duration-300 z-50 animate-in fade-in slide-in-from-bottom-4"
							aria-label="Scroll to top"
						>
							<ArrowUp size={24} />
						</button>
					)}
				</>
			)}
		</div>
	);
}
