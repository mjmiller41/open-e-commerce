import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Loader2, Trash2, Image as ImageIcon, AlertTriangle, Wand2 } from 'lucide-react';

// Define a type that matches Supabase's response more loosely, then cast
interface StorageFile {
	name: string;
	id: string | null;
	updated_at: string;
	created_at: string;
	last_accessed_at: string;
	metadata: {
		eTag: string;
		size: number;
		mimetype: string;
		cacheControl: string;
		contentLength: number;
		httpStatusCode: number;
	};
}

interface Product {
	id: number;
	name: string;
	images: string[];
}

export function AdminImages() {
	const [images, setImages] = useState<StorageFile[]>([]);
	const [loading, setLoading] = useState(true);
	const [products, setProducts] = useState<Product[]>([]);

	// Stats
	const [totalSize, setTotalSize] = useState(0);

	// Delete Modal State
	const [deleteConfirm, setDeleteConfirm] = useState<{ file: StorageFile; usage: Product[] } | null>(null);
	const [deleting, setDeleting] = useState(false);

	// Optimization State
	const [optimizeTarget, setOptimizeTarget] = useState<StorageFile | null>(null);
	const [optimizing, setOptimizing] = useState(false);
	const [optimizationSettings, setOptimizationSettings] = useState({
		width: 800,
		quality: 80,
		format: 'webp' as 'webp' | 'jpeg' | 'png'
	});

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		setLoading(true);
		try {
			const [filesResponse, productsResponse] = await Promise.all([
				supabase.storage.from('products').list(),
				supabase.from('products').select('id, name, images')
			]);

			if (filesResponse.error) throw filesResponse.error;
			if (productsResponse.error) throw productsResponse.error;

			// Filter out folder placeholders
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const fileList = (filesResponse.data || []).filter((f: any) => f.name !== '.emptyFolderPlaceholder') as unknown as StorageFile[];
			setImages(fileList);
			setProducts(productsResponse.data || []);

			// Calculate stats
			const size = fileList.reduce((acc: number, file: StorageFile) => acc + (file.metadata?.size || 0), 0);
			setTotalSize(size);

		} catch (error) {
			console.error('Error fetching images:', error);
			// Ideally show a toast here
		} finally {
			setLoading(false);
		}
	};

	const getProductUsage = (fileName: string) => {
		return products.filter(p => p.images && p.images.includes(fileName));
	};

	const formatBytes = (bytes: number, decimals = 2) => {
		if (!+bytes) return '0 Bytes';
		const k = 1024;
		const dm = decimals < 0 ? 0 : decimals;
		const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
	};

	const handleDeleteClick = (file: StorageFile) => {
		const usage = getProductUsage(file.name);
		setDeleteConfirm({ file, usage });
	};

	const handleOptimizeClick = (file: StorageFile) => {
		setOptimizeTarget(file);
	};

	const confirmDelete = async () => {
		if (!deleteConfirm) return;
		setDeleting(true);

		try {
			// 1. Update products if used
			if (deleteConfirm.usage.length > 0) {
				for (const product of deleteConfirm.usage) {
					const newImages = (product.images || []).filter(img => img !== deleteConfirm.file.name);
					const { error: updateError } = await supabase
						.from('products')
						.update({ images: newImages })
						.eq('id', product.id);

					if (updateError) {
						console.error('Failed to update product', product.id, updateError);
						throw updateError;
					}
				}
			}

			// 2. Delete from storage
			const { error: deleteError } = await supabase
				.storage
				.from('products')
				.remove([deleteConfirm.file.name]);

			if (deleteError) throw deleteError;

			// 3. Update local state
			setImages(prev => prev.filter(f => f.name !== deleteConfirm.file.name));
			setProducts(prev => prev.map(p => {
				if (deleteConfirm.usage.find(u => u.id === p.id)) {
					return { ...p, images: p.images.filter(img => img !== deleteConfirm.file.name) };
				}
				return p;
			}));
			setTotalSize(prev => prev - (deleteConfirm.file.metadata?.size || 0));
			setDeleteConfirm(null);

		} catch (error) {
			console.error('Error deleting file:', error);
			alert('Failed to delete file. Check console for details.');
		} finally {
			setDeleting(false);
		}
	};

	const handleOptimize = async () => {
		if (!optimizeTarget) return;
		setOptimizing(true);
		try {
			const { error } = await supabase.functions.invoke('optimize-image', {
				body: {
					bucket: 'products',
					path: optimizeTarget.name,
					options: optimizationSettings
				}
			});

			if (error) throw error;

			// Refresh data to show new size/format if changed
			await fetchData(); // Simple refresh for now
			setOptimizeTarget(null);
			alert('Image optimized successfully!');

		} catch (error) {
			console.error('Error optimizing image:', error);
			alert('Failed to optimize image. Ensure the edge function is deployed.');
		} finally {
			setOptimizing(false);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	return (
		<div className="space-y-6 relative">
			{/* Delete Confirmation Modal */}
			{deleteConfirm && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
					<div className="bg-background border rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
						<h3 className="text-lg font-bold flex items-center gap-2 text-destructive">
							<AlertTriangle className="h-5 w-5" />
							Delete Image?
						</h3>

						<div className="mt-4 space-y-4">
							<div className="flex items-center gap-4 p-3 bg-muted rounded-md">
								<img
									src={supabase.storage.from('products').getPublicUrl(deleteConfirm.file.name).data.publicUrl}
									className="w-16 h-16 object-cover rounded bg-white"
									alt="Preview"
								/>
								<div>
									<p className="font-medium text-sm truncate max-w-[200px]">{deleteConfirm.file.name}</p>
									<p className="text-xs text-muted-foreground">{formatBytes(deleteConfirm.file.metadata?.size || 0)}</p>
								</div>
							</div>

							{deleteConfirm.usage.length > 0 ? (
								<div className="text-sm">
									<p className="font-semibold text-amber-600 mb-2">Warning: This image is used in {deleteConfirm.usage.length} product(s):</p>
									<ul className="list-disc list-inside space-y-1 text-muted-foreground max-h-32 overflow-y-auto">
										{deleteConfirm.usage.map(p => (
											<li key={p.id}>{p.name}</li>
										))}
									</ul>
									<p className="mt-4 text-xs text-muted-foreground">Deleting this image will automatically remove it from these products.</p>
								</div>
							) : (
								<p className="text-sm text-muted-foreground">This image is not currently used by any products. Safe to delete.</p>
							)}
						</div>

						<div className="mt-6 flex justify-end gap-3">
							<button
								onClick={() => setDeleteConfirm(null)}
								disabled={deleting}
								className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors"
							>
								Cancel
							</button>
							<button
								onClick={confirmDelete}
								disabled={deleting}
								className="px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md transition-colors flex items-center gap-2"
							>
								{deleting && <Loader2 className="h-4 w-4 animate-spin" />}
								{deleting ? 'Deleting...' : 'Confirm Delete'}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Optimization Modal */}
			{optimizeTarget && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
					<div className="bg-background border rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
						<h3 className="text-lg font-bold flex items-center gap-2">
							<Wand2 className="h-5 w-5 text-primary" />
							Optimize Image
						</h3>
						<p className="text-sm text-muted-foreground mt-1">
							Optimize <strong>{optimizeTarget.name}</strong> to reduce file size.
						</p>

						<div className="mt-4 space-y-4">
							<div>
								<label className="block text-sm font-medium mb-1">Max Width (px)</label>
								<input
									type="number"
									className="w-full px-3 py-2 border rounded-md"
									value={optimizationSettings.width}
									onChange={(e) => setOptimizationSettings(prev => ({ ...prev, width: parseInt(e.target.value) || 0 }))}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Quality (1-100)</label>
								<input
									type="number"
									className="w-full px-3 py-2 border rounded-md"
									value={optimizationSettings.quality}
									min="1" max="100"
									onChange={(e) => setOptimizationSettings(prev => ({ ...prev, quality: parseInt(e.target.value) || 80 }))}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Format</label>
								<select
									className="w-full px-3 py-2 border rounded-md"
									value={optimizationSettings.format}
									onChange={(e) => setOptimizationSettings(prev => ({ ...prev, format: e.target.value as any }))}
								>
									<option value="webp">WebP (Recommended)</option>
									<option value="jpeg">JPEG</option>
									<option value="png">PNG</option>
								</select>
							</div>
						</div>

						<div className="mt-6 flex justify-end gap-3">
							<button
								onClick={() => setOptimizeTarget(null)}
								disabled={optimizing}
								className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors"
							>
								Cancel
							</button>
							<button
								onClick={handleOptimize}
								disabled={optimizing}
								className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors flex items-center gap-2"
							>
								{optimizing && <Loader2 className="h-4 w-4 animate-spin" />}
								{optimizing ? 'Optimizing...' : 'Run Optimization'}
							</button>
						</div>
					</div>
				</div>
			)}

			<div className="flex items-center justify-between">
				<h3 className="text-xl font-semibold">Storage Management</h3>
				<div className="text-sm text-muted-foreground">
					Total Storage Used: <span className="font-medium text-foreground">{formatBytes(totalSize)}</span>
					<span className="mx-2">•</span>
					Total Images: <span className="font-medium text-foreground">{images.length}</span>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
				{images.map((file) => {
					const usage = getProductUsage(file.name);
					const isUsed = usage.length > 0;
					const url = supabase.storage.from('products').getPublicUrl(file.name).data.publicUrl;

					return (
						<div key={file.id || file.name} className="group relative border rounded-lg overflow-hidden bg-card transition-all hover:shadow-md">
							<div className="aspect-square relative bg-muted/20">
								<img
									src={url}
									alt={file.name}
									className="w-full h-full object-contain p-2"
									loading="lazy"
								/>
								<div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
									<button
										onClick={() => handleOptimizeClick(file)}
										className="p-2 bg-white text-black rounded-full hover:bg-gray-200 transition-colors"
										title="Optimize Image"
									>
										<Wand2 className="h-4 w-4" />
									</button>
									<button
										onClick={() => handleDeleteClick(file)}
										className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
										title="Delete Image"
									>
										<Trash2 className="h-4 w-4" />
									</button>
								</div>
							</div>

							<div className="p-3 space-y-2">
								<div className="flex items-start justify-between gap-2">
									<p className="font-medium text-sm truncate" title={file.name}>{file.name}</p>
								</div>

								<div className="flex items-center gap-2 text-xs text-muted-foreground">
									<span>{formatBytes(file.metadata?.size || 0)}</span>
									<span>•</span>
									<span>{file.metadata?.mimetype || 'unknown'}</span>
								</div>

								{isUsed ? (
									<div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
										<ImageIcon className="h-3 w-3" />
										<span>Used in {usage.length} product{usage.length !== 1 ? 's' : ''}</span>
									</div>
								) : (
									<div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
										<AlertTriangle className="h-3 w-3" />
										<span>Unused</span>
									</div>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
