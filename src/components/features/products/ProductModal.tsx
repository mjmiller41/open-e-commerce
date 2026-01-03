import { useState, useEffect } from 'react';
import { supabase, type Product, uploadProductImageCustomName } from '../../../lib/supabase';
import { generateSKU } from '../../../lib/skuGenerator';
import { checkSkuExists, getSuggestedSku } from '../../../lib/productService';
import { X, Loader2, Upload, Image as ImageIcon } from 'lucide-react';
import logger from '../../../lib/logger';
import { resolveProductImage } from '../../../lib/utils';

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

		images: [],
		on_hand: 0,
		cost: 0,
		sku: '',
		variant: '',
		brand: '',
		weight: 0,
		gtin: '',
		mpn: '',
		condition: 'new',
		product_type: '',
		tags: [],
		status: 'draft'
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [suggestedSku, setSuggestedSku] = useState<string | null>(null);
	const [pendingFiles, setPendingFiles] = useState<File[]>([]);

	useEffect(() => {
		if (product) {
			setFormData(product);
		} else {
			setFormData({
				name: '',
				description: '',
				price: 0,
				category: '',

				images: [], // Init array
				on_hand: 0,
				cost: 0,
				sku: '',
				variant: '',
				brand: '',
				weight: 0,
				gtin: '',
				mpn: '',
				condition: 'new',
				product_type: '',
				tags: [],
				status: 'draft'
			});
		}
		setPendingFiles([]);
		setError(null);
		setSuggestedSku(null);
		setVisibleCategoriesCount(10);
	}, [product, isOpen]);

	const [taxonomy, setTaxonomy] = useState<string[]>([]);
	useEffect(() => {
		if (isOpen) {
			import('../../../data/taxonomy.json').then((mod) => {
				setTaxonomy(mod.default);
			});
		}
	}, [isOpen]);

	const [visibleCategoriesCount, setVisibleCategoriesCount] = useState(10);
	const filteredCategories = taxonomy
		.filter(c => c.toLowerCase().includes((formData.category || '').toLowerCase()))
		.slice(0, visibleCategoriesCount);

	const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
		const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
		if (scrollHeight - scrollTop <= clientHeight + 20) {
			setVisibleCategoriesCount(prev => prev + 10);
		}
	};

	const handleGenerateSKU = () => {
		const newSKU = generateSKU(
			formData.category || 'UNKNOWN',
			formData.brand || 'UNKNOWN',
			formData.name || 'UNKNOWN',
			formData.variant || 'UNKNOWN'
		);
		setFormData(prev => ({ ...prev, sku: newSKU }));
		return newSKU;
	};

	if (!isOpen) return null;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setSuggestedSku(null);

		try {
			let currentSku = formData.sku;

			// Auto-generate SKU if empty
			if (!currentSku) {
				currentSku = handleGenerateSKU();
				console.log('Generated SKU:', currentSku);
			}

			console.log('Current SKU:', currentSku);

			if (currentSku) {
				const excludeId = product?.id;
				const exists = await checkSkuExists(currentSku, excludeId);
				if (exists) {
					const suggestion = await getSuggestedSku(currentSku);
					setSuggestedSku(suggestion);
					throw new Error(`SKU "${currentSku}" already exists.`);
				}
			}

			let productId = product?.id;
			const submissionData = { ...formData, sku: currentSku };

			// Step 1: Create or Update initial product data (WITHOUT new images first)
			// We need the ID for filename generation
			if (productId) {
				const { error: updateError } = await supabase
					.from('products')
					.update(submissionData)
					.eq('id', productId);
				if (updateError) throw updateError;
			} else {
				const { data: newProduct, error: insertError } = await supabase
					.from('products')
					.insert([submissionData])
					.select('id')
					.single();
				if (insertError) throw insertError;
				productId = newProduct.id;
			}

			// Step 2: Upload Files if any
			if (pendingFiles.length > 0 && productId) {
				const uploadedUrls: string[] = [];
				const existingImageCount = formData.images?.length || 0;

				for (let i = 0; i < pendingFiles.length; i++) {
					const file = pendingFiles[i];
					const ext = file.name.split('.').pop();
					const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/\s+/g, "-");
					const sequenceNo = existingImageCount + i + 1;
					const fileName = `${cleanName}-${productId}-${sequenceNo}.${ext}`;

					const url = await uploadProductImageCustomName(file, fileName);
					uploadedUrls.push(url);
				}

				// Step 3: Update product with new image URLs
				const allImages = [...(formData.images || []), ...uploadedUrls];

				const { error: finalUpdateError } = await supabase
					.from('products')
					.update({ images: allImages })
					.eq('id', productId);

				if (finalUpdateError) throw finalUpdateError;
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
							<p>{error}</p>
							{suggestedSku && (
								<div className="mt-2 flex items-center gap-2">
									<span>Suggestion: <span className="font-mono font-bold">{suggestedSku}</span></span>
									<button
										type="button"
										onClick={() => {
											setFormData({ ...formData, sku: suggestedSku });
											setError(null);
											setSuggestedSku(null);
										}}
										className="text-xs bg-background/50 hover:bg-background px-2 py-1 rounded border border-destructive/20 ml-auto"
									>
										Use This
									</button>
								</div>
							)}
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
							<div className="flex gap-2">
								<input
									type="text"
									className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-mono"
									value={formData.sku || ''}
									onChange={e => setFormData({ ...formData, sku: e.target.value })}
									placeholder="Auto-generated"
								/>
								<button
									type="button"
									onClick={handleGenerateSKU}
									className="px-3 py-2 bg-secondary text-secondary-foreground rounded-md text-xs font-medium hover:bg-secondary/80 whitespace-nowrap"
									title="Generate SKU from attributes"
								>
									Generate
								</button>
							</div>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium">Variant</label>
							<input
								type="text"
								className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
								value={formData.variant || ''}
								onChange={e => setFormData({ ...formData, variant: e.target.value })}
								placeholder="e.g. Red, XL, 500GB"
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

					<div className="space-y-2 relative group">
						<label className="text-sm font-medium">Category</label>
						<div className="relative">
							<input
								type="text"
								required
								className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
								value={formData.category || ''}
								onChange={e => {
									setFormData({ ...formData, category: e.target.value });
									setVisibleCategoriesCount(10);
								}}
								placeholder="Start typing to search categories..."
							/>
							{filteredCategories.length > 0 && (
								<div
									className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto hidden group-focus-within:block"
									onScroll={handleScroll}
								>
									{filteredCategories.map(category => (
										<button
											key={category}
											type="button"
											className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground truncate block"
											title={category}
											onClick={() => setFormData({ ...formData, category })}
											// Prevent input blur matching
											onMouseDown={(e) => e.preventDefault()}
										>
											{category}
										</button>
									))}
								</div>
							)}
						</div>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium">Status</label>
						<select
							className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
							value={formData.status || 'draft'}
							onChange={e => setFormData({ ...formData, status: e.target.value as Product['status'] })}
						>
							<option value="active">Active</option>
							<option value="inactive">Inactive</option>
							<option value="draft">Draft</option>
							<option value="archived">Archived</option>
						</select>
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

					<div className="space-y-4">
						<label className="text-sm font-medium">Product Images</label>

						{/* Existing Images */}
						{formData.images && formData.images.length > 0 && (
							<div className="space-y-2">
								<h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Existing Images</h4>
								<div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
									{formData.images.map((url, i) => (
										<div key={`${url}-${i}`} className="relative group aspect-square rounded-lg border overflow-hidden bg-muted">
											<img
												src={resolveProductImage(url, { width: 1200 })}
												alt=""
												className="w-full h-full object-cover"
												loading="lazy"
											/>
											<button
												type="button"
												onClick={() => {
													const newImages = [...(formData.images || [])];
													newImages.splice(i, 1);
													setFormData({ ...formData, images: newImages });
												}}
												className="absolute top-1 right-1 p-1 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
												title="Remove image"
											>
												<X size={12} />
											</button>
										</div>
									))}
								</div>
							</div>
						)}

						{/* New File Upload */}
						<div className="space-y-2">
							<h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Add New Images</h4>

							{/* Drag & Drop Area */}
							<div
								onDragOver={(e) => {
									e.preventDefault();
									e.stopPropagation();
									e.currentTarget.classList.add('border-primary', 'bg-primary/5');
								}}
								onDragLeave={(e) => {
									e.preventDefault();
									e.stopPropagation();
									e.currentTarget.classList.remove('border-primary', 'bg-primary/5');
								}}
								onDrop={(e) => {
									e.preventDefault();
									e.stopPropagation();
									e.currentTarget.classList.remove('border-primary', 'bg-primary/5');
									if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
										const newFiles = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
										setPendingFiles(prev => [...prev, ...newFiles]);
									}
								}}
								className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/5"
							>
								<input
									type="file"
									multiple
									accept="image/*"
									className="hidden"
									id="file-upload"
									onChange={(e) => {
										const fileList = e.currentTarget.files;
										if (fileList && fileList.length > 0) {
											const newFiles = Array.from(fileList);
											setPendingFiles(prev => [...prev, ...newFiles]);
											e.currentTarget.value = ''; // Reset so same file can be selected again
										}
									}}
								/>
								<label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
									<div className="p-3 bg-secondary rounded-full text-muted-foreground">
										<Upload size={24} />
									</div>
									<div className="space-y-1">
										<p className="font-medium text-sm">Click to upload or drag and drop</p>
										<p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF (max 5MB)</p>
									</div>
								</label>
							</div>

							{/* Pending Files List */}
							{pendingFiles.length > 0 && (
								<div className="space-y-2 mt-4">
									{pendingFiles.map((file, i) => (
										<div key={`${file.name}-${i}`} className="flex items-center justify-between p-3 bg-card border border-border rounded-md shadow-sm">
											<div className="flex items-center gap-3 overflow-hidden">
												<div className="w-10 h-10 rounded bg-muted flex items-center justify-center shrink-0">
													<ImageIcon size={18} className="text-muted-foreground" />
												</div>
												<div className="min-w-0">
													<p className="text-sm font-medium truncate">{file.name}</p>
													<p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
												</div>
											</div>
											<button
												type="button"
												onClick={() => setPendingFiles(prev => prev.filter((_, idx) => idx !== i))}
												className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
											>
												<X size={16} />
											</button>
										</div>
									))}
								</div>
							)}
						</div>
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
