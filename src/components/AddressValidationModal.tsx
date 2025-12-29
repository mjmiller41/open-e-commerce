interface AddressData {
	address_line1: string;
	address_line2?: string | null;
	city: string;
	state: string;
	zip_code: string;
	country: string;
	is_default: boolean;
}

interface AddressValidationModalProps {
	isOpen: boolean;
	onClose: () => void; // User cancels or closes
	onConfirm: (address: AddressData) => void; // User selects an address
	enteredAddress: AddressData;
	suggestedAddress: AddressData;
}

export default function AddressValidationModal({
	isOpen,
	onClose,
	onConfirm,
	enteredAddress,
	suggestedAddress
}: AddressValidationModalProps) {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200] animate-in fade-in duration-300">
			<div className="bg-card w-full max-w-2xl p-6 rounded-lg shadow-xl border border-border animate-in zoom-in-95 duration-300">
				<h2 className="text-xl font-bold mb-2">Confirm Address</h2>
				<p className="text-muted-foreground mb-6">
					We found a standardized version of your address. Which one would you like to use?
				</p>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
					{/* Entered Address */}
					<div className="border border-border rounded-lg p-4 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => onConfirm(enteredAddress)}>
						<h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">You Entered</h3>
						<div className="space-y-1">
							<div className="font-medium">{enteredAddress.address_line1}</div>
							{enteredAddress.address_line2 && <div>{enteredAddress.address_line2}</div>}
							<div>{enteredAddress.city}, {enteredAddress.state} {enteredAddress.zip_code}</div>
						</div>
						<div className="mt-4">
							<button
								className="btn btn-outline w-full text-sm"
								onClick={(e) => { e.stopPropagation(); onConfirm(enteredAddress); }}
							>
								Use Original
							</button>
						</div>
					</div>

					{/* Suggested Address */}
					<div className="border border-primary rounded-lg p-4 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer relative" onClick={() => onConfirm(suggestedAddress)}>
						<div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg">
							Recommended
						</div>
						<h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-primary">Standardized</h3>
						<div className="space-y-1">
							<div className="font-medium">{suggestedAddress.address_line1}</div>
							{suggestedAddress.address_line2 && <div>{suggestedAddress.address_line2}</div>}
							<div>{suggestedAddress.city}, {suggestedAddress.state} {suggestedAddress.zip_code}</div>
						</div>
						<div className="mt-4">
							<button
								className="btn btn-primary w-full text-sm"
								onClick={(e) => { e.stopPropagation(); onConfirm(suggestedAddress); }}
							>
								Use Standardized
							</button>
						</div>
					</div>
				</div>

				<div className="flex justify-end">
					<button
						onClick={onClose}
						className="btn btn-ghost text-muted-foreground hover:text-foreground"
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	);
}
