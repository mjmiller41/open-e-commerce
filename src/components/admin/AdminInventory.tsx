import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase, type Product } from '../../lib/supabase';
import { Plus, Search, Edit2, Trash2, Package, Minus, X } from 'lucide-react';
import logger from '../../lib/logger';
import { ProductModal } from '../ProductModal';
import { useSortableData } from '../../hooks/useSortableData';
import Papa from 'papaparse';
import { Download, Upload } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { SectionHeader } from '../ui/SectionHeader';
import { SortableHeader } from '../ui/SortableHeader';
import { resolveProductImage } from '../../lib/utils';

// Internal component for handling sequential image fallback
const ProductThumbnail = ({ product }: { product: Product }) => {
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [hasError, setHasError] = useState(false);



	// Construct list of all possible images: [images array] + [legacy image field]
	const allImages = [
		...(product.images || []),
		product.image
	].filter(Boolean) as string[];

	const resolvedImages = allImages.map(img => resolveProductImage(img));

	// If no images at all, show fallback immediately
	if (allImages.length === 0) {
		return (
			<img
				src={`${import.meta.env.BASE_URL}logo.png`}
				alt={product.name}
				className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
			/>
		);
	}

	const handleError = () => {
		if (currentImageIndex < allImages.length - 1) {
			// Try next image
			setCurrentImageIndex(prev => prev + 1);
		} else {
			// All images failed
			setHasError(true);
		}
	};

	return (
		<img
			src={hasError ? `${import.meta.env.BASE_URL}logo.png` : resolvedImages[currentImageIndex]}
			alt={product.name}
			className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
			onError={handleError}
		/>
	);
};

export function AdminInventory() {
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Filters
	const [statusFilter, setStatusFilter] = useState<string[]>([]);
	const [typeFilter, setTypeFilter] = useState<string[]>([]);
	const [tagFilter, setTagFilter] = useState<string[]>([]);

	const fetchProducts = async () => {
		try {
			const { data, error } = await supabase
				.from('products')
				.select('*')
				.order('name', { ascending: true });

			if (error) throw error;
			setProducts(data || []);
		} catch (error) {
			logger.error('Error fetching inventory:', error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchProducts();
	}, []);

	const handleDelete = async (productId: number, productName: string) => {
		if (!confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) return;

		try {
			const { error } = await supabase
				.from('products')
				.delete()
				.eq('id', productId);

			if (error) {
				if (error.code === '23503') { // Foreign key violation
					if (confirm(`"${productName}" cannot be deleted because it is in existing orders. Would you like to archive (deactivate) it instead?`)) {
						const { error: archiveError } = await supabase
							.from('products')
							.update({ status: 'archived' })
							.eq('id', productId);

						if (archiveError) throw archiveError;
						fetchProducts();
						return;
					}
				}
				throw error;
			}
			fetchProducts();
		} catch (error: unknown) {
			logger.error('Error deleting product:', error);
			const message = error instanceof Error ? error.message : 'Failed to delete product. Please try again.';
			alert(message);
		}
	};

	const handleStockAdjustment = async (product: Product, amount: number) => {
		const newStock = product.on_hand + amount;
		if (newStock < 0) return;

		// Optimistic update
		setProducts(products.map(p => p.id === product.id ? { ...p, on_hand: newStock } : p));

		try {
			const { error } = await supabase
				.from('products')
				.update({ on_hand: newStock })
				.eq('id', product.id);

			if (error) throw error;
		} catch (error) {
			logger.error('Error updating stock:', error);
			// Revert on error
			setProducts(products.map(p => p.id === product.id ? { ...p, on_hand: product.on_hand } : p));
			alert('Failed to update stock');
		}
	};

	// Helper to get products filtered by active criteria, optionally ignoring one filter type
	const getFilteredCtx = (ignoreType: 'status' | 'type' | 'tag' | null) => {
		return products.filter(product => {
			const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				product.category.toLowerCase().includes(searchQuery.toLowerCase());

			const matchesStatus = ignoreType === 'status' || statusFilter.length === 0 || statusFilter.includes(product.status);
			const matchesType = ignoreType === 'type' || typeFilter.length === 0 || typeFilter.includes(product.product_type || '');
			const matchesTag = ignoreType === 'tag' || tagFilter.length === 0 || (product.tags && product.tags.some(tag => tagFilter.includes(tag)));

			return matchesSearch && matchesStatus && matchesType && matchesTag;
		});
	};

	// Derive available options based on other active filters (Faceted search)
	// For each filter, we use the context where that specific filter is IGNORED, 
	// so you see all *possible* options for that category given the *other* constraints.
	const availableStatuses = Array.from(new Set(getFilteredCtx('status').map(p => p.status)));
	const availableTypes = Array.from(new Set(getFilteredCtx('type').map(p => p.product_type || '').filter(Boolean)));
	const availableTags = Array.from(new Set(getFilteredCtx('tag').flatMap(p => p.tags || [])));

	const filteredProducts = getFilteredCtx(null);

	const { items: sortedProducts, requestSort, sortConfig } = useSortableData(
		filteredProducts,
		{ key: 'name', direction: 'ascending' },
		{
			image: (p) => p.images?.[0] || p.image || '',
			images_count: (p) => p.images?.length || 0,
			tags_string: (p) => p.tags?.join(', ') || ''
		}
	);



	const addFilter = (
		currentFilters: string[],
		setFilter: (filters: string[]) => void,
		value: string
	) => {
		if (value && value !== 'all' && !currentFilters.includes(value)) {
			setFilter([...currentFilters, value]);
		}
	};

	const removeFilter = (
		currentFilters: string[],
		setFilter: (filters: string[]) => void,
		value: string
	) => {
		setFilter(currentFilters.filter(item => item !== value));
	};

	const handleAdd = () => {
		setSelectedProduct(null);
		setIsModalOpen(true);
	};

	const handleExport = () => {
		const csvData = sortedProducts.map(p => ({
			id: p.id,
			name: p.name,
			sku: p.sku,
			variant: p.variant,
			category: p.category,
			price: p.price,
			cost: p.cost,
			on_hand: p.on_hand,
			brand: p.brand,
			description: p.description,
			status: p.status,
			image: p.image || p.images?.[0] || '',
			images: p.images?.join('|'),
			weight: p.weight,
			gtin: p.gtin,
			mpn: p.mpn,
			condition: p.condition,
			product_type: p.product_type,
			tags: p.tags?.join('|')
		}));

		const csv = Papa.unparse(csvData);
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.setAttribute('href', url);
		link.setAttribute('download', `inventory_export_${new Date().toISOString().split('T')[0]}.csv`);
		link.style.visibility = 'hidden';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	interface CSVRow {
		name?: string;
		sku?: string;
		variant?: string;
		category?: string;
		price?: string;
		cost?: string;
		on_hand?: string;
		brand?: string;
		description?: string;
		status?: string;
		image?: string;
		images?: string;
		weight?: string;
		gtin?: string;
		mpn?: string;
		condition?: string;
		product_type?: string;
		tags?: string;
	}

	const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		setLoading(true);
		Papa.parse(file, {
			header: true,
			skipEmptyLines: true,
			complete: async (results) => {
				const rows = results.data as CSVRow[];
				let successCount = 0;
				let failureCount = 0;

				for (const row of rows) {
					try {
						// Basic validation
						if (!row.name || !row.price) {
							console.warn('Skipping invalid row:', row);
							failureCount++;
							continue;
						}

						const productData: Partial<Product> = {
							name: row.name,
							sku: row.sku || undefined,
							variant: row.variant || undefined,
							category: row.category || '',
							price: parseFloat(row.price),
							cost: row.cost ? parseFloat(row.cost) : undefined,
							on_hand: row.on_hand ? parseInt(row.on_hand) : 0,
							brand: row.brand || undefined,
							description: row.description || '',
							status: (row.status as Product['status']) || 'draft',
							image: row.image || undefined,
							images: row.images ? row.images.split('|') : [],
							weight: row.weight ? parseFloat(row.weight) : undefined,
							gtin: row.gtin || undefined,
							mpn: row.mpn || undefined,
							condition: row.condition || 'new',
							product_type: row.product_type || undefined,
							tags: row.tags ? row.tags.split('|') : []
						};

						// Try to find existing product by SKU if provided
						let existingProduct = null;
						if (productData.sku) {
							const { data } = await supabase
								.from('products')
								.select('id')
								.eq('sku', productData.sku)
								.single();
							existingProduct = data;
						}

						if (existingProduct) {
							// Update
							const { error } = await supabase
								.from('products')
								.update(productData)
								.eq('id', existingProduct.id);
							if (error) throw error;
						} else {
							// Insert
							const { error } = await supabase
								.from('products')
								.insert([productData]);
							if (error) throw error;
						}
						successCount++;
					} catch (err) {
						console.error('Error importing row:', row, err);
						failureCount++;
					}
				}

				alert(`Import complete.\nSuccess: ${successCount}\nFailed: ${failureCount}`);
				fetchProducts();
				setLoading(false);
				// Reset input
				event.target.value = '';
			},
			error: (error) => {
				console.error('CSV Parse Error:', error);
				alert('Failed to parse CSV file.');
				setLoading(false);
			}
		});
	};

	if (loading) {
		return <div className="p-8 text-center">Loading inventory...</div>;
	}

	return (
		<div className="space-y-6">
			<SectionHeader title="Inventory Management">
				<div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto">
					<div className="relative w-full sm:w-72">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
						<input
							type="text"
							placeholder="Search products..."
							className="input pl-10"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
					<div className="flex gap-2 w-full sm:w-auto">
						<div className="relative">
							<input
								type="file"
								accept=".csv"
								onChange={handleImport}
								className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
								title="Import CSV"
							/>
							<button
								className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2 font-medium w-full"
							>
								<Upload size={18} />
								Import
							</button>
						</div>
						<button
							onClick={handleExport}
							className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2 font-medium"
						>
							<Download size={18} />
							Export
						</button>
						<button
							onClick={handleAdd}
							className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 font-medium flex-1 sm:flex-none"
						>
							<Plus size={18} />
							Add Product
						</button>
					</div>
				</div>
			</SectionHeader>

			{/* Filters */}
			<div className="filter-section">
				<div className="space-y-2 w-full sm:flex-1">
					<label className="text-sm font-medium text-muted-foreground">Status</label>
					<select
						className="input"
						value=""
						onChange={(e) => addFilter(statusFilter, setStatusFilter, e.target.value)}
					>
						<option value="">Select Status...</option>
						{['active', 'inactive', 'draft', 'archived']
							.filter(s => availableStatuses.includes(s as Product['status']) || statusFilter.includes(s))
							.map(status => (
								<option key={status} value={status} className="capitalize">{status}</option>
							))}
					</select>
					{statusFilter.length > 0 && (
						<div className="flex flex-wrap gap-2">
							{statusFilter.map(status => (
								<div
									key={status}
									onClick={() => removeFilter(statusFilter, setStatusFilter, status)}
									className="filter-chip group"
								>
									<span className="capitalize">{status}</span>
									<X size={14} className="opacity-50 group-hover:opacity-100" />
								</div>
							))}
						</div>
					)}
				</div>

				<div className="space-y-2 w-full sm:flex-1">
					<label className="text-sm font-medium text-muted-foreground">Type</label>
					<select
						className="input"
						value=""
						onChange={(e) => addFilter(typeFilter, setTypeFilter, e.target.value)}
					>
						<option value="">Select Type...</option>
						{availableTypes.map(type => (
							<option key={type} value={type}>{type}</option>
						))}
					</select>
					{typeFilter.length > 0 && (
						<div className="flex flex-wrap gap-2">
							{typeFilter.map(type => (
								<div
									key={type}
									onClick={() => removeFilter(typeFilter, setTypeFilter, type)}
									className="filter-chip group"
								>
									{type}
									<X size={14} className="opacity-50 group-hover:opacity-100" />
								</div>
							))}
						</div>
					)}
				</div>

				<div className="space-y-2 w-full sm:flex-1">
					<label className="text-sm font-medium text-muted-foreground">Tag</label>
					<select
						className="input"
						value=""
						onChange={(e) => addFilter(tagFilter, setTagFilter, e.target.value)}
					>
						<option value="">Select Tag...</option>
						{availableTags.map(tag => (
							<option key={tag} value={tag}>{tag}</option>
						))}
					</select>
					{tagFilter.length > 0 && (
						<div className="flex flex-wrap gap-2">
							{tagFilter.map(tag => (
								<div
									key={tag}
									onClick={() => removeFilter(tagFilter, setTagFilter, tag)}
									className="filter-chip group"
								>
									{tag}
									<X size={14} className="opacity-50 group-hover:opacity-100" />
								</div>
							))}
						</div>
					)}
				</div>

				<button
					onClick={() => {
						setStatusFilter([]);
						setTypeFilter([]);
						setTagFilter([]);
						setSearchQuery('');
					}}
					className="btn btn-primary h-[38px] whitespace-nowrap shrink-0 mt-[28px]"
				>
					Clear Filters
				</button>
			</div>

			<div className="rounded-lg border border-border overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full min-w-max">
						<thead className="bg-muted/50">
							<tr className="border-b border-border">
								<SortableHeader label="Image" sortKey="image" onSort={requestSort} currentSort={sortConfig} />
								<SortableHeader label="Title" sortKey="name" onSort={requestSort} currentSort={sortConfig} />
								<SortableHeader label="Description" sortKey="description" onSort={requestSort} currentSort={sortConfig} />
								<SortableHeader label="Images" sortKey="images_count" onSort={requestSort} currentSort={sortConfig} align="center" />
								<SortableHeader label="Category" sortKey="category" onSort={requestSort} currentSort={sortConfig} />
								<SortableHeader label="Brand" sortKey="brand" onSort={requestSort} currentSort={sortConfig} />
								<SortableHeader label="Price" sortKey="price" onSort={requestSort} currentSort={sortConfig} align="right" />
								<SortableHeader label="Cost" sortKey="cost" onSort={requestSort} currentSort={sortConfig} align="right" />
								<SortableHeader label="Stock" sortKey="on_hand" onSort={requestSort} currentSort={sortConfig} align="center" />
								<SortableHeader label="SKU" sortKey="sku" onSort={requestSort} currentSort={sortConfig} />
								<SortableHeader label="Variant" sortKey="variant" onSort={requestSort} currentSort={sortConfig} />
								<SortableHeader label="GTIN" sortKey="gtin" onSort={requestSort} currentSort={sortConfig} />
								<SortableHeader label="MPN" sortKey="mpn" onSort={requestSort} currentSort={sortConfig} />
								<SortableHeader label="Weight" sortKey="weight" onSort={requestSort} currentSort={sortConfig} />
								<SortableHeader label="Condition" sortKey="condition" onSort={requestSort} currentSort={sortConfig} />
								<SortableHeader label="Type" sortKey="product_type" onSort={requestSort} currentSort={sortConfig} />
								<SortableHeader label="Tags" sortKey="tags_string" onSort={requestSort} currentSort={sortConfig} />
								<SortableHeader label="Status" sortKey="status" onSort={requestSort} currentSort={sortConfig} />
								<th className="px-4 py-3 whitespace-nowrap text-right">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border">
							{sortedProducts.map(product => (
								<tr key={product.id} className="hover:bg-muted/30 transition-colors">
									<td className="px-4 py-3">
										<Link to={`/admin/product/${product.id}`} className="block w-10 h-10 rounded-md bg-muted overflow-hidden shrink-0 group">
											<ProductThumbnail key={`${product.id}-${product.images?.length || 0}-${product.image || ''}`} product={product} />
										</Link>
									</td>
									<td className="px-4 py-3 font-medium text-foreground max-w-[200px]">
										<Link to={`/admin/product/${product.id}`} className="hover:text-primary transition-colors truncate block" title={product.name}>
											{product.name}
										</Link>
									</td>
									<td className="px-4 py-3 text-sm text-muted-foreground max-w-[300px]">
										<div className="truncate" title={product.description}>
											{product.description}
										</div>
									</td>
									<td className="px-4 py-3 text-center text-sm">
										<span className="inline-flex items-center justify-center px-2 py-1 rounded-md bg-muted text-muted-foreground text-xs font-medium">
											{product.images?.length || 0}
										</span>
									</td>
									<td className="px-4 py-3 text-sm max-w-[200px]">
										<span
											className="px-2 py-1 rounded-full bg-accent/50 text-accent-foreground text-xs font-medium truncate block"
											title={product.category}
										>
											{product.category}
										</span>
									</td>
									<td className="px-4 py-3 text-sm whitespace-nowrap">
										{product.brand || '-'}
									</td>
									<td className="px-4 py-3 text-sm text-right font-medium whitespace-nowrap">
										${product.price.toFixed(2)}
									</td>
									<td className="px-4 py-3 text-sm text-right text-muted-foreground whitespace-nowrap">
										{product.cost ? `$${product.cost.toFixed(2)}` : '-'}
									</td>
									<td className="px-4 py-3 text-center whitespace-nowrap">
										<div className="flex items-center justify-center gap-2">
											<button
												onClick={() => handleStockAdjustment(product, -1)}
												disabled={product.on_hand <= 0}
												className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
											>
												<Minus size={14} />
											</button>
											<Badge variant={product.on_hand > 10 ? 'success' : product.on_hand > 0 ? 'warning' : 'error'} className="min-w-[60px] justify-center gap-1.5">
												<Package size={12} />
												{product.on_hand}
											</Badge>
											<button
												onClick={() => handleStockAdjustment(product, 1)}
												className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
											>
												<Plus size={14} />
											</button>
										</div>
									</td>
									<td className="px-4 py-3 text-sm font-mono whitespace-nowrap text-muted-foreground">
										{product.sku || '-'}
									</td>
									<td className="px-4 py-3 text-sm whitespace-nowrap text-muted-foreground">
										{product.variant || '-'}
									</td>
									<td className="px-4 py-3 text-sm font-mono whitespace-nowrap text-muted-foreground">
										{product.gtin || '-'}
									</td>
									<td className="px-4 py-3 text-sm font-mono whitespace-nowrap text-muted-foreground">
										{product.mpn || '-'}
									</td>
									<td className="px-4 py-3 text-sm whitespace-nowrap">
										{product.weight ? `${product.weight} lb` : '-'}
									</td>
									<td className="px-4 py-3 text-sm capitalize whitespace-nowrap">
										{product.condition || 'new'}
									</td>
									<td className="px-4 py-3 text-sm whitespace-nowrap">
										{product.product_type || '-'}
									</td>
									<td className="px-4 py-3 text-xs whitespace-nowrap max-w-[200px] overflow-hidden">
										{product.tags && product.tags.length > 0 ? (
											<div className="flex gap-1 overflow-x-auto no-scrollbar">
												{product.tags.map(tag => (
													<span key={tag} className="px-1 py-0.5 rounded bg-muted text-muted-foreground whitespace-nowrap">
														{tag}
													</span>
												))}
											</div>
										) : '-'}
									</td>
									<td className="px-4 py-3 text-center whitespace-nowrap">
										<Badge variant={product.status === 'active' ? 'success' : product.status === 'draft' ? 'warning' : product.status === 'archived' ? 'orange' : 'neutral'}>
											{product.status}
										</Badge>
									</td>
									<td className="px-4 py-3 text-right sticky right-0 bg-background/95 backdrop-blur-sm border-l shadow-sm">
										<div className="flex justify-end gap-2">
											<Link
												to={`/admin/product/${product.id}`}
												className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
												title="Edit Product"
											>
												<Edit2 size={16} />
											</Link>
											<button
												onClick={() => handleDelete(product.id, product.name)}
												className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
												title="Delete Product"
											>
												<Trash2 size={16} />
											</button>
										</div>
									</td>
								</tr>
							))}

							{sortedProducts.length === 0 && (
								<tr>
									<td colSpan={18} className="px-4 py-8 text-center text-muted-foreground">
										No products found matching your search.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			<ProductModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onSave={fetchProducts}
				product={selectedProduct}
			/>
		</div>
	);
}
