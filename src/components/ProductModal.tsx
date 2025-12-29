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
		on_hand: 0,
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
				on_hand: 0,
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

				<form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
					{error && (
						<div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
							{error}
						</div>
					)}

					<div className="space-y-2">
						<label className="text-sm font-medium">Name</label>
						<input
							type="text"
							required
							className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
							value={formData.name || ''}
							onChange={e => setFormData({ ...formData, name: e.target.value })}
						/>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium">Description</label>
						<textarea
							required
							className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
							value={formData.description || ''}
							onChange={e => setFormData({ ...formData, description: e.target.value })}
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
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
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium">Category</label>
						<input
							type="text"
							required
							className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
							value={formData.category || ''}
							onChange={e => setFormData({ ...formData, category: e.target.value })}
						/>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium">Image URL</label>
						<input
							type="url"
							required
							className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
							value={formData.image || ''}
							onChange={e => setFormData({ ...formData, image: e.target.value })}
						/>
						{formData.image && (
							<div className="mt-2 relative aspect-video rounded-md overflow-hidden bg-muted border border-border">
								<img
									src={formData.image}
									alt="Preview"
									className="object-cover w-full h-full"
									onError={(e) => (e.currentTarget.style.display = 'none')}
								/>
							</div>
						)}
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
