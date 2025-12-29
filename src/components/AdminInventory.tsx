import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase, type Product } from '../lib/supabase';
import { Plus, Search, Edit2, Trash2, Package, Minus } from 'lucide-react';
import logger from '../lib/logger';
import { ProductModal } from './ProductModal';

export function AdminInventory() {
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

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

			if (error) throw error;
			fetchProducts();
		} catch (error) {
			logger.error('Error deleting product:', error);
			alert('Failed to delete product. Please try again.');
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

	const filteredProducts = products.filter(product =>
		product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
		product.category.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const handleEdit = (product: Product) => {
		setSelectedProduct(product);
		setIsModalOpen(true);
	};

	const handleAdd = () => {
		setSelectedProduct(null);
		setIsModalOpen(true);
	};

	if (loading) {
		return <div className="p-8 text-center">Loading inventory...</div>;
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
				<div className="relative w-full sm:w-72">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
					<input
						type="text"
						placeholder="Search products..."
						className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
				<button
					onClick={handleAdd}
					className="w-full sm:w-auto px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 font-medium"
				>
					<Plus size={18} />
					Add Product
				</button>
			</div>

			<div className="rounded-lg border border-border overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-muted/50">
							<tr className="text-left text-sm font-medium text-muted-foreground">
								<th className="px-4 py-3">Product</th>
								<th className="px-4 py-3">Category</th>
								<th className="px-4 py-3 text-right">Price</th>
								<th className="px-4 py-3 text-center">Stock</th>
								<th className="px-4 py-3 text-right">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border">
							{filteredProducts.map(product => (
								<tr key={product.id} className="hover:bg-muted/30 transition-colors">
									<td className="px-4 py-3">
										<Link to={`/product/${product.id}`} className="flex items-center gap-3 group">
											<div className="w-10 h-10 rounded-md bg-muted overflow-hidden shrink-0">
												<img
													src={product.image || 'https://placehold.co/100x100?text=No+Image'}
													alt={product.name}
													className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
													onError={(e) => {
														e.currentTarget.src = 'https://placehold.co/100x100?text=Error';
													}}
												/>
											</div>
											<div>
												<div className="font-medium text-foreground group-hover:text-primary transition-colors">{product.name}</div>
												<div className="text-xs text-muted-foreground truncate max-w-[200px]">
													{product.description}
												</div>
											</div>
										</Link>
									</td>
									<td className="px-4 py-3 text-sm">
										<span className="px-2 py-1 rounded-full bg-accent/50 text-accent-foreground text-xs font-medium">
											{product.category}
										</span>
									</td>
									<td className="px-4 py-3 text-sm text-right font-medium">
										${product.price.toFixed(2)}
									</td>
									<td className="px-4 py-3 text-center">
										<div className="flex items-center justify-center gap-2">
											<button
												onClick={() => handleStockAdjustment(product, -1)}
												disabled={product.on_hand <= 0}
												className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
											>
												<Minus size={14} />
											</button>
											<div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border min-w-[60px] justify-center ${product.on_hand > 10
												? 'bg-green-500/10 text-green-600 border-green-200'
												: product.on_hand > 0
													? 'bg-yellow-500/10 text-yellow-600 border-yellow-200'
													: 'bg-red-500/10 text-red-600 border-red-200'
												}`}>
												<Package size={12} />
												{product.on_hand}
											</div>
											<button
												onClick={() => handleStockAdjustment(product, 1)}
												className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
											>
												<Plus size={14} />
											</button>
										</div>
									</td>
									<td className="px-4 py-3 text-right">
										<div className="flex justify-end gap-2">
											<button
												onClick={() => handleEdit(product)}
												className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
												title="Edit Product"
											>
												<Edit2 size={16} />
											</button>
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

							{filteredProducts.length === 0 && (
								<tr>
									<td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
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
