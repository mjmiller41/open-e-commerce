import { useState } from 'react';
import { validateAddress } from '../lib/googleAddress';
import AddressValidationModal from './AddressValidationModal';
import logger from '../lib/logger';

export interface AddressData {
	address_line1: string;
	address_line2?: string | null;
	city: string;
	state: string;
	zip_code: string;
	country: string;
	is_default: boolean;
}

interface AddressFormProps {
	initialData?: Partial<AddressData>;
	onSave: (address: AddressData) => Promise<void>;
	onCancel: () => void;
	isSaving?: boolean;
}

export default function AddressForm({ initialData, onSave, onCancel, isSaving = false }: AddressFormProps) {
	const [formData, setFormData] = useState<AddressData>({
		address_line1: initialData?.address_line1 || '',
		address_line2: initialData?.address_line2 || '',
		city: initialData?.city || '',
		state: initialData?.state || '',
		zip_code: initialData?.zip_code || '',
		country: initialData?.country || 'US',
		is_default: initialData?.is_default || false
	});

	const [isValidating, setIsValidating] = useState(false);
	const [showModal, setShowModal] = useState(false);

	const [suggestedAddress, setSuggestedAddress] = useState<AddressData | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsValidating(true);

		try {
			// 1. Validate via Google
			const result = await validateAddress(
				[formData.address_line1, formData.address_line2 || ''],
				formData.city,
				formData.state,
				formData.zip_code
			);



			// 2. Process Result
			if (result.isValid && result.components) {
				// Construct the suggested object
				const lines = result.components.street || [];
				const suggested: AddressData = {
					address_line1: lines[0] || formData.address_line1,
					address_line2: lines.length > 1 ? lines.slice(1).join(', ') : '', // Heuristic: join remaining lines
					city: result.components.city || formData.city,
					state: result.components.state || formData.state,
					zip_code: result.components.zip || formData.zip_code,
					country: 'US', // API defaults to US based on code
					is_default: formData.is_default
				};

				setSuggestedAddress(suggested);

				// 3. Logic: If it's a "perfect" match or very close, maybe auto-save? 
				// For now, let's ALWAYS show the modal if there's any difference to be safe and "wow" the user with the feature.
				// Or better: check if values are strictly equal.

				const isIdentical =
					suggested.address_line1.toLowerCase() === formData.address_line1.toLowerCase() &&
					(suggested.address_line2 || '').toLowerCase() === (formData.address_line2 || '').toLowerCase() &&
					suggested.city.toLowerCase() === formData.city.toLowerCase() &&
					suggested.state.toLowerCase() === formData.state.toLowerCase() &&
					suggested.zip_code === formData.zip_code;

				if (isIdentical) {
					await onSave(formData);
				} else {
					setShowModal(true);
				}
			} else {
				// Fallback for invalid/unconfirmed addresses: Just warn the user?
				// Or show modal with "We couldn't verify this address" (but modal expects a suggestion).
				// Let's just save for now if validation fails technically (allow user to override implicit in "Cancel" or try again?)
				// Actually, if !isValid, we might want to alert the user.
				// For this implementation, let's treat "no suggestion" as "just save what user typed" or "show error".
				// We'll show an alert or just proceed.
				// The requirements say "On success display a modal...".
				// If it fails to validate, maybe we assume the user knows best (or API limit) and just save?
				// check if we have components at all.
				if (result.components && (result.components.city || result.components.zip)) {
					// We largely have a suggestion even if not "fully valid".
					// Let's use the logic above.
					const lines = result.components.street || [];
					const suggested: AddressData = {
						address_line1: lines[0] || formData.address_line1,
						address_line2: lines.length > 1 ? lines.slice(1).join(', ') : '',
						city: result.components.city || formData.city,
						state: result.components.state || formData.state,
						zip_code: result.components.zip || formData.zip_code,
						country: 'US',
						is_default: formData.is_default
					};
					setSuggestedAddress(suggested);
					setShowModal(true);
				} else {
					// Truly unknown
					if (window.confirm("We could not verify this address. Save anyway?")) {
						await onSave(formData);
					}
				}
			}

		} catch (err) {
			logger.error("Address Validation Failed", err);
			// Fallback: Just save
			await onSave(formData);
		} finally {
			setIsValidating(false);
		}
	};

	const handleConfirm = async (address: AddressData) => {
		setShowModal(false);
		await onSave(address);
	};

	return (
		<>
			<form onSubmit={handleSubmit} className="space-y-4 animate-in slide-in-from-top-2 duration-200">
				<div>
					<label className="block text-sm font-medium text-muted-foreground mb-1">Address Line 1</label>
					<input
						type="text"
						required
						value={formData.address_line1}
						onChange={e => setFormData({ ...formData, address_line1: e.target.value })}
						className="form-input w-full"
						placeholder="123 Main St"
					/>
				</div>
				<div>
					<label className="block text-sm font-medium text-muted-foreground mb-1">Address Line 2 (Optional)</label>
					<input
						type="text"
						value={formData.address_line2 || ''}
						onChange={e => setFormData({ ...formData, address_line2: e.target.value })}
						className="form-input w-full"
						placeholder="Apt 4B"
					/>
				</div>
				<div className="grid grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-muted-foreground mb-1">City</label>
						<input
							type="text"
							required
							value={formData.city}
							onChange={e => setFormData({ ...formData, city: e.target.value })}
							className="form-input w-full"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-muted-foreground mb-1">State</label>
						<input
							type="text"
							required
							value={formData.state}
							onChange={e => setFormData({ ...formData, state: e.target.value })}
							className="form-input w-full"
						/>
					</div>
				</div>
				<div className="grid grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-muted-foreground mb-1">ZIP Code</label>
						<input
							type="text"
							required
							value={formData.zip_code}
							onChange={e => setFormData({ ...formData, zip_code: e.target.value })}
							className="form-input w-full"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-muted-foreground mb-1">Country</label>
						<input
							type="text"
							required
							value={formData.country}
							onChange={e => setFormData({ ...formData, country: e.target.value })}
							className="form-input w-full"
						/>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<input
						type="checkbox"
						id="default-address"
						checked={formData.is_default}
						onChange={e => setFormData({ ...formData, is_default: e.target.checked })}
						className="rounded border-gray-300 text-primary focus:ring-primary"
					/>
					<label htmlFor="default-address" className="text-sm font-medium text-foreground">
						Set as default address
					</label>
				</div>
				<div className="flex justify-end gap-3 mt-4">
					<button
						type="button"
						onClick={onCancel}
						className="btn btn-secondary"
						disabled={isValidating || isSaving}
					>
						Cancel
					</button>
					<button
						type="submit"
						className="btn btn-primary"
						disabled={isValidating || isSaving}
					>
						{isValidating ? "Validating..." : isSaving ? "Saving..." : "Verify & Save"}
					</button>
				</div>
			</form>

			<AddressValidationModal
				isOpen={showModal}
				onClose={() => setShowModal(false)}
				onConfirm={handleConfirm}
				enteredAddress={formData}
				suggestedAddress={suggestedAddress || formData}
			/>
		</>
	);
}
