import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase, type Product } from '../lib/supabase';
import { ArrowLeft, Save, Trash2, Loader2, Image as ImageIcon, AlertCircle, ImageOff } from 'lucide-react';
import logger from '../lib/logger';
import taxonomy from '../assets/taxonomy.json';
import { generateSKU } from '../lib/skuGenerator';
import { checkSkuExists, getSuggestedSku } from '../lib/productService';
import { resolveProductImage } from '../lib/utils';

export function AdminProductDetail() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<boolean>(false);
	const [suggestedSku, setSuggestedSku] = useState<string | null>(null);

	const [saveSource, setSaveSource] = useState<'top' | 'bottom' | null>(null);

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
		product_type: '',
		tags: [],
		status: 'active',
		variant: ''
	});

	const [visibleCategoriesCount, setVisibleCategoriesCount] = useState(10);

	// Reset visible count when search changes
	useEffect(() => {
		setVisibleCategoriesCount(10);
	}, [formData.category]);

	// Track indices of broken images
	const [brokenImageIndices, setBrokenImageIndices] = useState<Set<number>>(new Set());

	// Reset broken indices when images change
	useEffect(() => {
		setBrokenImageIndices(new Set());
	}, [formData.images]);

	const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
		const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
		if (scrollHeight - scrollTop <= clientHeight + 20) {
			setVisibleCategoriesCount(prev => prev + 10);
		}
	};

	useEffect(() => {
		async function fetchProduct() {
			if (!id) return;
			try {
				const { data, error } = await supabase
					.from('products')
					.select('*')
					.eq('id', id)
					.single();

				if (error) throw error;
				if (data) {
					setFormData(data);
				}
			} catch (err) {
				logger.error('Error fetching product:', err);
				setError('Failed to load product');
			} finally {
				setLoading(false);
			}
		}
		fetchProduct();
	}, [id]);

	const handleSave = async (source: 'top' | 'bottom') => {
		setSaving(true);
		setSaveSource(source);
		setError(null);
		setSuccess(false);
		setSuggestedSku(null);

		try {
			if (formData.sku && id) {
				const exists = await checkSkuExists(formData.sku, parseInt(id));
				if (exists) {
					const suggestion = await getSuggestedSku(formData.sku);
					setSuggestedSku(suggestion);
					throw new Error(`SKU "${formData.sku}" already exists.`);
				}
			}

			const { error: updateError } = await supabase
				.from('products')
				.update(formData)
				.eq('id', id);

			if (updateError) throw updateError;
			setSuccess(true);
			setTimeout(() => {
				setSuccess(false);
				setSaveSource(null);
			}, 3000);
		} catch (err) {
			logger.error('Error saving product:', err);
			setError(err instanceof Error ? err.message : 'Failed to save product');
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async () => {
		if (!confirm('Are you sure you want to delete this product? This cannot be undone.')) return;

		try {
			const { error: deleteError } = await supabase
				.from('products')
				.delete()
				.eq('id', id);

			if (deleteError) {
				if (deleteError.code === '23503') { // Foreign key violation
					if (confirm('This product cannot be deleted because it is part of existing orders. Would you like to archive it instead?')) {
						const { error: archiveError } = await supabase
							.from('products')
							.update({ status: 'archived' })
							.eq('id', id);

						if (archiveError) throw archiveError;

						const tempSource = saveSource || 'top';
						setSaveSource(tempSource);
						setSuccess(true);
						setTimeout(() => navigate('/admin?tab=inventory'), 1500);
						return;
					}
				}
				throw deleteError;
			}
			navigate('/admin?tab=inventory');
		} catch (err: unknown) {
			const error = err as Error;
			logger.error('Error deleting product:', error);
			setError(error.message || 'Failed to delete product');
		}
	};

	const handleGenerateSKU = () => {
		const newSKU = generateSKU(
			formData.category || '',
			formData.brand || '',
			formData.name || '',
			formData.variant || ''
		);
		setFormData(prev => ({ ...prev, sku: newSKU }));
	};

	if (loading) return <div className="p-8 text-center">Loading product...</div>;

	const filteredCategories = taxonomy
		.filter(c => c.toLowerCase().includes((formData.category || '').toLowerCase()))
		.slice(0, visibleCategoriesCount);

	return (
		<div className="max-w-4xl mx-auto pb-16 animate-in fade-in duration-500">
			<div className="flex items-center justify-between mb-6">
				<Link to="/admin?tab=inventory" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
					<ArrowLeft size={20} /> Back to Inventory
				</Link>
				<button
					onClick={handleDelete}
					className="text-destructive hover:bg-destructive/10 px-3 py-2 rounded-md transition-colors flex items-center gap-2 text-sm font-medium"
				>
					<Trash2 size={16} /> Delete Product
				</button>
			</div>

			<div className="flex items-center justify-between mb-8">
				<h2 className="text-3xl font-bold">Edit Product</h2>
				<div className="flex items-center gap-4">
					{success && saveSource === 'top' && (
						<span className="text-sm text-green-600 animate-in fade-in slide-in-from-right-2 flex items-center gap-1">
							<Save size={14} /> Saved!
						</span>
					)}
					<button
						onClick={() => handleSave('top')}
						disabled={saving}
						className="btn btn-primary flex items-center gap-2"
					>
						{saving && saveSource === 'top' ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
						Save Changes
					</button>
				</div>
			</div>

			{error && (
				<div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6 border border-destructive/20">
					<p>{error}</p>
					{suggestedSku && (
						<div className="mt-3 flex items-center gap-3">
							<span className="text-sm text-foreground/80">Suggestion:</span>
							<code className="text-sm font-mono bg-background/50 px-2 py-1 rounded border border-destructive/20">
								{suggestedSku}
							</code>
							<button
								type="button"
								onClick={() => {
									setFormData({ ...formData, sku: suggestedSku });
									setError(null);
									setSuggestedSku(null);
								}}
								className="text-xs px-3 py-1 bg-background hover:bg-muted border border-border rounded transition-colors"
							>
								Use Suggestion
							</button>
						</div>
					)}
				</div>
			)}

			<form onSubmit={(e) => { e.preventDefault(); handleSave('bottom'); }} className="space-y-8">
				{/* Basic Info Section */}
				<section className="bg-card border border-border rounded-xl p-6 shadow-sm">
					<h3 className="text-lg font-semibold mb-4 border-b border-border pb-2">Basic Information</h3>
					<div className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<label className="text-sm font-medium">Product Name</label>
								<input
									type="text"
									required
									className="input w-full"
									value={formData.name || ''}
									onChange={e => setFormData({ ...formData, name: e.target.value })}
								/>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">Brand</label>
								<input
									type="text"
									className="input w-full"
									value={formData.brand || ''}
									onChange={e => setFormData({ ...formData, brand: e.target.value })}
								/>
							</div>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium">Description</label>
							<textarea
								required
								className="input w-full min-h-[120px]"
								value={formData.description || ''}
								onChange={e => setFormData({ ...formData, description: e.target.value })}
							/>
						</div>
					</div>
				</section>

				{/* Pricing & Inventory */}
				<section className="bg-card border border-border rounded-xl p-6 shadow-sm">
					<h3 className="text-lg font-semibold mb-4 border-b border-border pb-2">Pricing & Inventory</h3>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="space-y-2">
							<label className="text-sm font-medium">Price ($)</label>
							<input
								type="number"
								min="0"
								step="0.01"
								required
								className="input w-full"
								value={formData.price || 0}
								onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
							/>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium text-muted-foreground">Cost ($)</label>
							<input
								type="number"
								min="0"
								step="0.01"
								className="input w-full"
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
								className="input w-full"
								value={formData.on_hand || 0}
								onChange={e => setFormData({ ...formData, on_hand: parseInt(e.target.value) })}
							/>
						</div>
					</div>
				</section>

				{/* Identification & Shipping */}
				<section className="bg-card border border-border rounded-xl p-6 shadow-sm">
					<h3 className="text-lg font-semibold mb-4 border-b border-border pb-2">Identification & Shipping</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						<div className="space-y-2">
							<label className="text-sm font-medium">SKU</label>
							<div className="flex gap-2">
								<input
									type="text"
									className="input w-full font-mono"
									value={formData.sku || ''}
									onChange={e => setFormData({ ...formData, sku: e.target.value })}
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
								className="input w-full"
								value={formData.variant || ''}
								onChange={e => setFormData({ ...formData, variant: e.target.value })}
								placeholder="e.g. Red, XL"
							/>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">GTIN / UPC</label>
							<input
								type="text"
								className="input w-full font-mono"
								value={formData.gtin || ''}
								onChange={e => setFormData({ ...formData, gtin: e.target.value })}
							/>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">MPN</label>
							<input
								type="text"
								className="input w-full font-mono"
								value={formData.mpn || ''}
								onChange={e => setFormData({ ...formData, mpn: e.target.value })}
							/>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">Weight (lb)</label>
							<input
								type="number"
								step="0.01"
								className="input w-full"
								value={formData.weight || 0}
								onChange={e => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
							/>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">Condition</label>
							<select
								className="input w-full"
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
								className="input w-full"
								value={formData.product_type || ''}
								onChange={e => setFormData({ ...formData, product_type: e.target.value })}
							/>
						</div>
					</div>
				</section>

				{/* Media */}
				<section className="bg-card border border-border rounded-xl p-6 shadow-sm">
					<h3 className="text-lg font-semibold mb-4 border-b border-border pb-2 flex items-center gap-2">
						<ImageIcon size={18} /> Media
					</h3>
					<div className="space-y-4">
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<label className="text-sm font-medium">Image URLs (One per line)</label>
								{brokenImageIndices.size > 0 && (
									<span className="text-xs text-destructive flex items-center gap-1 font-medium animate-in fade-in">
										<AlertCircle size={12} />
										{brokenImageIndices.size} broken URL{brokenImageIndices.size !== 1 ? 's' : ''} detected
									</span>
								)}
							</div>
							<textarea
								className={`input w-full min-h-[100px] font-mono text-xs ${brokenImageIndices.size > 0 ? 'border-destructive focus-visible:ring-destructive' : ''}`}
								placeholder="https://example.com/image1.jpg"
								value={formData.images?.join('\n') || ''}
								onChange={e => {
									const urls = e.target.value.split('\n').map(s => s.trim()).filter(Boolean);
									setFormData({ ...formData, images: urls, image: urls[0] || '' });
								}}
							/>
							{brokenImageIndices.size > 0 && (
								<p className="text-[11px] text-destructive">
									Lines with errors: {Array.from(brokenImageIndices).map(i => i + 1).join(', ')}
								</p>
							)}
						</div>

						{formData.images && formData.images.length > 0 && (
							<div className="flex gap-4 overflow-x-auto py-2">
								{formData.images.map((url, i) => (
									<div
										key={`${url}-${i}`}
										className={`relative w-24 h-24 shrink-0 rounded-lg border overflow-hidden bg-muted group ${brokenImageIndices.has(i) ? 'border-destructive ring-1 ring-destructive' : ''}`}
									>
										{brokenImageIndices.has(i) ? (
											<div className="w-full h-full flex flex-col items-center justify-center text-destructive bg-destructive/10">
												<ImageOff size={24} className="mb-1" />
												<span className="text-[10px] font-medium">Broken</span>
											</div>
										) : (
											<img
												src={resolveProductImage(url)}
												alt=""
												className="w-full h-full object-cover"
												onError={() => {
													setBrokenImageIndices(prev => new Set(prev).add(i));
												}}
												onLoad={() => {
													// If it was previously marked broken but now loads (e.g. slight url tweak), remove it
													if (brokenImageIndices.has(i)) {
														const next = new Set(brokenImageIndices);
														next.delete(i);
														setBrokenImageIndices(next);
													}
												}}
											/>
										)}
										<div className="absolute inset-x-0 bottom-0 bg-black/50 text-white text-[10px] p-1 text-center truncate px-2 opacity-0 group-hover:opacity-100 transition-opacity">
											Image {i + 1}
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</section>

				{/* Organization */}
				<section className="bg-card border border-border rounded-xl p-6 shadow-sm">
					<h3 className="text-lg font-semibold mb-4 border-b border-border pb-2">Organization</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2 relative group">
							<label className="text-sm font-medium">Category</label>
							<div className="relative">
								<input
									type="text"
									required
									className="input w-full"
									value={formData.category || ''}
									onChange={e => setFormData({ ...formData, category: e.target.value })}
									placeholder="Start typing to search categories..."
									title={formData.category}
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
											>
												{category}
											</button>
										))}
									</div>
								)}
							</div>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">Tags (comma separated)</label>
							<input
								type="text"
								className="input w-full"
								value={formData.tags?.join(', ') || ''}
								onChange={e => {
									const tags = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
									setFormData({ ...formData, tags });
								}}
							/>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">Status</label>
							<select
								className="input w-full"
								value={formData.status || 'draft'}
								onChange={e => setFormData({ ...formData, status: e.target.value as Product['status'] })}
							>
								<option value="active">Active</option>
								<option value="inactive">Inactive</option>
								<option value="draft">Draft</option>
								<option value="archived">Archived</option>
							</select>
						</div>
					</div>
				</section>

				<div className="flex justify-end gap-4 items-center">
					{success && saveSource === 'bottom' && (
						<span className="text-sm text-green-600 animate-in fade-in slide-in-from-right-2 flex items-center gap-1">
							<Save size={14} /> Saved!
						</span>
					)}
					<button
						type="button"
						onClick={() => handleSave('bottom')}
						disabled={saving}
						className="btn btn-primary flex items-center gap-2"
					>
						{saving && saveSource === 'bottom' ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
						Save Changes
					</button>
				</div>
			</form>
		</div>
	);
}
