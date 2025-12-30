import { useState, useEffect } from 'react';
import { supabase, type Product } from '../lib/supabase';
import { X, Loader2 } from 'lucide-react';
import logger from '../lib/logger';

interface ProductModalProps {
	product?: Product | null;
	isOpen: boolean;
	onClose: () => void;
	onSave: () => void;
}

export function ProductModal({ product, isOpen, onClose, onSave }: ProductModalProps) {
	const [formData, setFormData] = useState<Partial<Product>>({
		name: '',
		description: '',
		price: 0,
		category: '',
		image: '',
		images: [],
		on_hand: 0,
		cost: 0,
		sku: '',
		brand: '',
		weight: 0,
		gtin: '',
		mpn: '',
		condition: 'new',
		product_type: '',
		tags: []
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (product) {
			setFormData(product);
		} else {
			setFormData({
				name: '',
				description: '',
				price: 0,
				category: '',
				image: '',
				images: [], // Init array
				on_hand: 0,
				cost: 0,
				sku: '',
				brand: '',
				weight: 0,
				gtin: '',
				mpn: '',
				condition: 'new',
				product_type: '',
				tags: []
			});
		}
		setError(null);
	}, [product, isOpen]);

	if (!isOpen) return null;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			if (product && product.id) {
				// Update existing product
				const { error: updateError } = await supabase
					.from('products')
					.update(formData)
					.eq('id', product.id);

				if (updateError) throw updateError;
			} else {
				// Create new product
				const { error: insertError } = await supabase
					.from('products')
					.insert([formData]);

				if (insertError) throw insertError;
			}

			onSave();
			onClose();
		} catch (err) {
			logger.error('Error saving product:', err);
			const message = err instanceof Error ? err.message : 'Failed to save product';
			setError(message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
			<div className="bg-card w-full max-w-lg rounded-lg shadow-lg border border-border flex flex-col max-h-[90vh]">
				<div className="flex items-center justify-between p-6 border-b border-border">
					<h2 className="text-xl font-semibold">
						{product ? 'Edit Product' : 'Add New Product'}
					</h2>
					<button
						onClick={onClose}
						className="text-muted-foreground hover:text-foreground transition-colors"
					>
						<X size={20} />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
					{error && (
						<div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
							{error}
						</div>
					)}

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2 col-span-2">
							<label className="text-sm font-medium">Name</label>
							<input
								type="text"
								required
								className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
								value={formData.name || ''}
								onChange={e => setFormData({ ...formData, name: e.target.value })}
							/>
						</div>

						<div className="space-y-2 col-span-2">
							<label className="text-sm font-medium">Description</label>
							<textarea
								required
								className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
								value={formData.description || ''}
								onChange={e => setFormData({ ...formData, description: e.target.value })}
							/>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium">Price ($)</label>
							<input
								type="number"
								min="0"
								step="0.01"
								required
								className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
								value={formData.price || 0}
								onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
							/>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">Cost ($)</label>
							<input
								type="number"
								min="0"
								step="0.01"
								className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
								value={formData.cost || 0}
								onChange={e => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
							/>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium">Stock (On Hand)</label>
							<input
								type="number"
								min="0"
								required
								className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
								value={formData.on_hand || 0}
								onChange={e => setFormData({ ...formData, on_hand: parseInt(e.target.value) })}
							/>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">SKU</label>
							<input
								type="text"
								className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
								value={formData.sku || ''}
								onChange={e => setFormData({ ...formData, sku: e.target.value })}
							/>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium">Brand</label>
							<input
								type="text"
								className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
								value={formData.brand || ''}
								onChange={e => setFormData({ ...formData, brand: e.target.value })}
							/>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">Weight (lb)</label>
							<input
								type="number"
								step="0.01"
								className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
								value={formData.weight || 0}
								onChange={e => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
							/>
						</div>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium">Category</label>
						<input
							type="text"
							required
							placeholder="Google Product Category"
							className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
							value={formData.category || ''}
							onChange={e => setFormData({ ...formData, category: e.target.value })}
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<label className="text-sm font-medium">Barcode / GTIN / UPC</label>
							<input
								type="text"
								className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
								value={formData.gtin || ''}
								onChange={e => setFormData({ ...formData, gtin: e.target.value })}
							/>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">MPN</label>
							<input
								type="text"
								className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
								value={formData.mpn || ''}
								onChange={e => setFormData({ ...formData, mpn: e.target.value })}
							/>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">Condition</label>
							<select
								className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
								value={formData.condition || 'new'}
								onChange={e => setFormData({ ...formData, condition: e.target.value })}
							>
								<option value="new">New</option>
								<option value="used">Used</option>
								<option value="refurbished">Refurbished</option>
							</select>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">Product Type</label>
							<input
								type="text"
								placeholder="e.g. Physical, Digital"
								className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
								value={formData.product_type || ''}
								onChange={e => setFormData({ ...formData, product_type: e.target.value })}
							/>
						</div>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium">Image URLs (one per line)</label>
						<textarea
							className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
							value={formData.images?.join('\n') || ''}
							onChange={e => {
								const val = e.target.value;
								const urls = val.split('\n').map(s => s.trim()).filter(Boolean);
								setFormData({ ...formData, images: urls, image: urls[0] || '' });
							}}
							placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
						/>
						{formData.images && formData.images.length > 0 && (
							<div className="flex gap-2 overflow-x-auto py-2">
								{formData.images.map((url, i) => (
									<div key={i} className="relative w-16 h-16 shrink-0 rounded border overflow-hidden">
										<img src={url} alt="" className="w-full h-full object-cover" />
									</div>
								))}
							</div>
						)}
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium">Tags (comma separated)</label>
						<input
							type="text"
							className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
							value={formData.tags?.join(', ') || ''}
							onChange={e => {
								const val = e.target.value;
								const tags = val.split(',').map(s => s.trim()).filter(Boolean);
								setFormData({ ...formData, tags });
							}}
							placeholder="summer, sale, featured"
						/>
					</div>
				</form>

				<div className="p-6 border-t border-border flex justify-end gap-4">
					<button
						type="button"
						onClick={onClose}
						disabled={loading}
						className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
					>
						Cancel
					</button>
					<button
						onClick={handleSubmit}
						disabled={loading}
						className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hovered:bg-primary/90 transition-colors flex items-center gap-2"
					>
						{loading && <Loader2 size={16} className="animate-spin" />}
						{product ? 'Update Product' : 'Create Product'}
					</button>
				</div>
			</div>
		</div>
	);
}
