
import { useState, useEffect } from "react";
import { useStoreSettings } from "../context/StoreSettingsContext";
import logger from "../lib/logger";

export function AdminSettings() {
	const { settings, updateSettings, loading } = useStoreSettings();
	const [formData, setFormData] = useState({
		store_name: "",
		support_email: "",
		logo_url: "",
		primary_color: "#2563eb",
		secondary_color: "#f8fafc",
	});
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

	useEffect(() => {
		if (settings) {
			setFormData({
				store_name: settings.store_name || "",
				support_email: settings.support_email || "",
				logo_url: settings.logo_url || "",
				primary_color: settings.primary_color || "#2563eb",
				secondary_color: settings.secondary_color || "#f8fafc",
			});
		}
	}, [settings]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		setMessage(null);

		try {
			await updateSettings(formData);
			setMessage({ type: 'success', text: 'Settings saved successfully' });
		} catch (err) {
			logger.error("Failed to save settings:", err);
			setMessage({ type: 'error', text: 'Failed to save settings' });
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return <div className="p-8 text-center text-muted-foreground">Loading settings...</div>;
	}

	return (
		<div className="max-w-4xl">
			<div className="mb-6">
				<h2 className="text-2xl font-bold tracking-tight">Store Settings</h2>
				<p className="text-muted-foreground">Manage your store's branding and configuration.</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-8">
				<div className="grid gap-6 md:grid-cols-2">
					{/* General Settings */}
					<div className="card p-6 space-y-4">
						<h3 className="font-semibold text-lg border-b pb-2">General</h3>

						<div className="space-y-2">
							<label className="text-sm font-medium">Store Name</label>
							<input
								type="text"
								name="store_name"
								value={formData.store_name}
								onChange={handleChange}
								className="input"
								placeholder="My Awesome Store"
								required
							/>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium">Support Email</label>
							<input
								type="email"
								name="support_email"
								value={formData.support_email}
								onChange={handleChange}
								className="input"
								placeholder="support@example.com"
							/>
						</div>
					</div>

					{/* Branding Settings */}
					<div className="card p-6 space-y-4">
						<h3 className="font-semibold text-lg border-b pb-2">Branding</h3>

						<div className="space-y-2">
							<label className="text-sm font-medium">Logo URL</label>
							<div className="flex gap-2">
								<input
									type="text"
									name="logo_url"
									value={formData.logo_url}
									onChange={handleChange}
									className="input flex-1"
									placeholder="https://example.com/logo.png"
								/>
								{formData.logo_url && (
									<div className="w-10 h-10 border rounded bg-muted flex items-center justify-center overflow-hidden shrink-0">
										<img src={formData.logo_url} alt="Logo Preview" className="w-full h-full object-contain" />
									</div>
								)}
							</div>
							<p className="text-xs text-muted-foreground">URL to your store logo (square or landscape recommended).</p>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<label className="text-sm font-medium">Primary Color</label>
								<div className="flex items-center gap-2">
									<input
										type="color"
										name="primary_color"
										value={/^#[0-9A-F]{6}$/i.test(formData.primary_color) ? formData.primary_color : "#000000"}
										onChange={handleChange}
										className="w-10 h-10 p-1 rounded cursor-pointer border border-input"
										title="Choose color"
									/>
									<input
										type="text"
										name="primary_color"
										value={formData.primary_color}
										onChange={handleChange}
										className="input font-mono"
										placeholder="#000000 or blue"
									/>
								</div>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium">Secondary Color</label>
								<div className="flex items-center gap-2">
									<input
										type="color"
										name="secondary_color"
										value={/^#[0-9A-F]{6}$/i.test(formData.secondary_color) ? formData.secondary_color : "#000000"}
										onChange={handleChange}
										className="w-10 h-10 p-1 rounded cursor-pointer border border-input"
										title="Choose color"
									/>
									<input
										type="text"
										name="secondary_color"
										value={formData.secondary_color}
										onChange={handleChange}
										className="input font-mono"
										placeholder="#000000 or red"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>

				{message && (
					<div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-destructive/10 text-destructive'}`}>
						{message.text}
					</div>
				)}

				<div className="flex justify-end pt-4">
					<button
						type="submit"
						disabled={saving}
						className="btn btn-primary min-w-[120px]"
					>
						{saving ? 'Saving...' : 'Save Settings'}
					</button>
				</div>
			</form>
		</div>
	);
}
