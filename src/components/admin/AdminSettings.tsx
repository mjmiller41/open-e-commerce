
import { useState, useEffect } from "react";
import { useStoreSettings } from "../../context/StoreSettingsContext";
import logger from "../../lib/logger";
import { SectionHeader } from "../ui/SectionHeader";
import { SubSectionHeader } from "../ui/SubSectionHeader";
import { AVAILABLE_FONTS } from "../../constants/fonts";

export function AdminSettings() {
	const { settings, updateSettings, loading } = useStoreSettings();
	const [formData, setFormData] = useState({
		store_name: "",
		support_email: "",
		logo_url: "",

		// Global Colors - Brand
		primary_color: "#2563eb",
		secondary_color: "#f8fafc",

		// Global Colors - Theme
		colors_background_light: "#FFFFFF",
		colors_background_dark: "#09090b",
		colors_text_light: "#121212",
		colors_text_dark: "#f8fafc",
		colors_solid_button_labels: "#FFFFFF",
		colors_accent_1: "#000000",
		colors_accent_2: "#334FB4",
		gradient_background_1: "",

		// Typography
		type_header_font: "Assistant",
		type_body_font: "Inter",

		// Layout
		page_width: 1200,
		spacing_grid_horizontal: 8,
		spacing_grid_vertical: 8,

		// Buttons & Inputs
		buttons_border_thickness: 1,
		buttons_opacity: 100,
		buttons_radius: 0,
		buttons_shadow_opacity: 0,
		buttons_shadow_horizontal_offset: 0,

		// Product Card
		image_ratio: "adapt",
		show_secondary_image: true,
		show_brand: false,
		show_rating: false,
		enable_quick_add: true,

		// Social Media
		social_facebook_link: "",
		social_instagram_link: "",
		social_youtube_link: "",
		social_tiktok_link: "",
		social_twitter_link: "",
		social_pinterest_link: "",
		social_snapchat_link: "",
		social_tumblr_link: "",
		social_vimeo_link: "",
		social_github_link: "",

		// Miscellaneous
		favicon_url: "",
		currency_code_enabled: true,
		cart_type: "drawer",
		predictive_search_enabled: true,
	});
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

	useEffect(() => {
		if (settings) {
			setFormData((prev) => ({
				...prev,
				...settings,
				// Ensure nulls are handled for controlled inputs
				support_email: settings.support_email || "",
				logo_url: settings.logo_url || "",
				gradient_background_1: settings.gradient_background_1 || "",
				favicon_url: settings.favicon_url || "",
				social_facebook_link: settings.social_facebook_link || "",
				social_instagram_link: settings.social_instagram_link || "",
				social_youtube_link: settings.social_youtube_link || "",
				social_tiktok_link: settings.social_tiktok_link || "",
				social_twitter_link: settings.social_twitter_link || "",
				social_pinterest_link: settings.social_pinterest_link || "",
				social_snapchat_link: settings.social_snapchat_link || "",
				social_tumblr_link: settings.social_tumblr_link || "",
				social_vimeo_link: settings.social_vimeo_link || "",
				social_github_link: settings.social_github_link || "",
			}));
		}
	}, [settings]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value, type } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
				type === 'number' || type === 'range' ? Number(value) : value
		}));
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

	const uniqueFonts = Array.from(new Set(AVAILABLE_FONTS.map(f => f.family))).sort();

	return (
		<div className="max-w-5xl">
			<SectionHeader title="Store Settings">
				<p className="text-muted-foreground">Manage your store's branding and configuration.</p>
			</SectionHeader>

			<form onSubmit={handleSubmit} className="space-y-8 pb-20">

				<div className="card p-6 space-y-4">
					<SubSectionHeader title="General Info"></SubSectionHeader>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<TextInput label="Store Name" name="store_name" value={formData.store_name} onChange={handleChange} required />
						<TextInput label="Support Email" name="support_email" value={formData.support_email} onChange={handleChange} type="email" />
						<TextInput label="Logo URL" name="logo_url" value={formData.logo_url} onChange={handleChange} />
					</div>
				</div>

				{/* 1. Global Colors */}
				<div className="card p-6 space-y-6">
					<SubSectionHeader title="Global Colors"></SubSectionHeader>

					{/* Brand Colors */}
					<div className="space-y-4">
						<SubSectionHeader title="Brand Identity" level={2}></SubSectionHeader>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<ColorInput label="Primary Color" name="primary_color" value={formData.primary_color} onChange={handleChange} />
							<ColorInput label="Secondary Color" name="secondary_color" value={formData.secondary_color} onChange={handleChange} />
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
						{/* Light Mode */}
						<div className="space-y-4">
							<SubSectionHeader title="Light Mode" level={2}></SubSectionHeader>
							<ColorInput label="Background" name="colors_background_light" value={formData.colors_background_light} onChange={handleChange} />
							<ColorInput label="Text" name="colors_text_light" value={formData.colors_text_light} onChange={handleChange} />
						</div>

						{/* Dark Mode */}
						<div className="space-y-4">
							<SubSectionHeader title="Dark Mode" level={2}></SubSectionHeader>
							<ColorInput label="Background" name="colors_background_dark" value={formData.colors_background_dark} onChange={handleChange} />
							<ColorInput label="Text" name="colors_text_dark" value={formData.colors_text_dark} onChange={handleChange} />
						</div>
					</div>

					{/* Theme Accents */}
					<div className="space-y-4 pt-4">
						<SubSectionHeader title="Theme Accents" level={2}></SubSectionHeader>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<ColorInput label="Accent 1" name="colors_accent_1" value={formData.colors_accent_1} onChange={handleChange} />
							<ColorInput label="Accent 2" name="colors_accent_2" value={formData.colors_accent_2} onChange={handleChange} />
							<ColorInput label="Solid Button Labels" name="colors_solid_button_labels" value={formData.colors_solid_button_labels} onChange={handleChange} />
							<div className="space-y-2">
								<label className="text-sm font-medium">Gradient Background</label>
								<input type="text" name="gradient_background_1" value={formData.gradient_background_1} onChange={handleChange} className="input" placeholder="linear-gradient(...)" />
							</div>
						</div>
					</div>
				</div>

				{/* 2. Typography */}
				<div className="card p-6 space-y-4">
					<SubSectionHeader title="Typography"></SubSectionHeader>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<label className="text-sm font-medium">Header Font</label>
							<select name="type_header_font" value={formData.type_header_font} onChange={handleChange} className="input">
								{uniqueFonts.map(font => (
									<option key={font} value={font}>{font}</option>
								))}
								<option value="sans-serif">System Sans</option>
							</select>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">Body Font</label>
							<select name="type_body_font" value={formData.type_body_font} onChange={handleChange} className="input">
								{uniqueFonts.map(font => (
									<option key={font} value={font}>{font}</option>
								))}
								<option value="sans-serif">System Sans</option>
							</select>
						</div>
					</div>
				</div>

				{/* 3. Layout */}
				<div className="card p-6 space-y-4">
					<SubSectionHeader title="Layout"></SubSectionHeader>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<RangeInput label="Page Width (px)" name="page_width" value={formData.page_width} min={800} max={1600} step={10} onChange={handleChange} />
						<RangeInput label="Grid Spacing Horizontal (px)" name="spacing_grid_horizontal" value={formData.spacing_grid_horizontal} min={0} max={100} step={1} onChange={handleChange} />
						<RangeInput label="Grid Spacing Vertical (px)" name="spacing_grid_vertical" value={formData.spacing_grid_vertical} min={0} max={100} step={1} onChange={handleChange} />
					</div>
				</div>

				{/* 4. Buttons & Inputs */}
				<div className="card p-6 space-y-4">
					<SubSectionHeader title="Buttons & Inputs"></SubSectionHeader>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<RangeInput label="Border Thickness (px)" name="buttons_border_thickness" value={formData.buttons_border_thickness} min={0} max={10} step={1} onChange={handleChange} />
						<RangeInput label="Opacity (%)" name="buttons_opacity" value={formData.buttons_opacity} min={0} max={100} step={5} onChange={handleChange} />
						<RangeInput label="Corner Radius (px)" name="buttons_radius" value={formData.buttons_radius} min={0} max={40} step={1} onChange={handleChange} />
						<RangeInput label="Shadow Opacity (%)" name="buttons_shadow_opacity" value={formData.buttons_shadow_opacity} min={0} max={100} step={5} onChange={handleChange} />
						<RangeInput label="Shadow Offset X (px)" name="buttons_shadow_horizontal_offset" value={formData.buttons_shadow_horizontal_offset} min={-20} max={20} step={1} onChange={handleChange} />
					</div>
				</div>

				{/* 5. Product Card */}
				<div className="card p-6 space-y-4">
					<SubSectionHeader title="Product Card"></SubSectionHeader>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<label className="text-sm font-medium">Image Ratio</label>
							<select name="image_ratio" value={formData.image_ratio} onChange={handleChange} className="input">
								<option value="adapt">Adapt to Image</option>
								<option value="portrait">Portrait</option>
								<option value="square">Square</option>
							</select>
						</div>
						<div className="flex flex-col gap-2 pt-6">
							<CheckboxInput label="Show Secondary Image on Hover" name="show_secondary_image" checked={formData.show_secondary_image} onChange={handleChange} />
							<CheckboxInput label="Show Brand" name="show_brand" checked={formData.show_brand} onChange={handleChange} />
							<CheckboxInput label="Show Rating" name="show_rating" checked={formData.show_rating} onChange={handleChange} />
							<CheckboxInput label="Enable Quick Add" name="enable_quick_add" checked={formData.enable_quick_add} onChange={handleChange} />
						</div>
					</div>
				</div>

				{/* 6. Social Media */}
				<div className="card p-6 space-y-4">
					<SubSectionHeader title="Social Media"></SubSectionHeader>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<TextInput label="Facebook Link" name="social_facebook_link" value={formData.social_facebook_link} onChange={handleChange} placeholder="https://facebook.com/..." />
						<TextInput label="Instagram Link" name="social_instagram_link" value={formData.social_instagram_link} onChange={handleChange} placeholder="https://instagram.com/..." />
						<TextInput label="YouTube Link" name="social_youtube_link" value={formData.social_youtube_link} onChange={handleChange} placeholder="https://youtube.com/..." />
						<TextInput label="TikTok Link" name="social_tiktok_link" value={formData.social_tiktok_link} onChange={handleChange} placeholder="https://tiktok.com/..." />
						<TextInput label="Twitter (X) Link" name="social_twitter_link" value={formData.social_twitter_link} onChange={handleChange} placeholder="https://twitter.com/..." />
						<TextInput label="Pinterest Link" name="social_pinterest_link" value={formData.social_pinterest_link} onChange={handleChange} placeholder="https://pinterest.com/..." />
						<TextInput label="GitHub Link" name="social_github_link" value={formData.social_github_link} onChange={handleChange} placeholder="https://github.com/..." />
					</div>
				</div>

				{/* 7. Miscellaneous */}
				<div className="card p-6 space-y-4">
					<SubSectionHeader title="Miscellaneous"></SubSectionHeader>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2 md:col-span-2">
							<label className="text-sm font-medium">Favicon URL</label>
							<input type="text" name="favicon_url" value={formData.favicon_url} onChange={handleChange} className="input" placeholder="https://example.com/favicon.png" />
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">Cart Type</label>
							<select name="cart_type" value={formData.cart_type} onChange={handleChange} className="input">
								<option value="drawer">Drawer</option>
								<option value="page">Page</option>
								<option value="notification">Notification</option>
							</select>
						</div>
						<div className="flex flex-col gap-2 pt-6">
							<CheckboxInput label="Enable Currency Code" name="currency_code_enabled" checked={formData.currency_code_enabled} onChange={handleChange} />
							<CheckboxInput label="Enable Predictive Search" name="predictive_search_enabled" checked={formData.predictive_search_enabled} onChange={handleChange} />
						</div>
					</div>
				</div>

				{/* Save Button */}
				<div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t z-10 flex justify-end gap-4 max-w-[var(--container-width)] mx-auto">
					{message && (
						<div className={`px-4 py-2 rounded-md flex items-center ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
							{message.text}
						</div>
					)}
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

// Helper Components

function ColorInput({ label, name, value, onChange }: { label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
	return (
		<div className="space-y-2">
			<label className="text-sm font-medium">{label}</label>
			<div className="flex items-center gap-2">
				<input
					type="color"
					name={name}
					value={webColorToHex(value)}
					onChange={onChange}
					className="w-10 h-10 p-1 rounded cursor-pointer border border-input"
					title="Choose color"
				/>
				<input
					type="text"
					name={name}
					value={value}
					onChange={onChange}
					className="input font-mono"
					placeholder="#000000"
				/>
			</div>
		</div>
	);
}

function RangeInput({ label, name, value, min, max, step, onChange }: { label: string, name: string, value: number, min: number, max: number, step: number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
	return (
		<div className="space-y-2">
			<div className="flex justify-between">
				<label className="text-sm font-medium">{label}</label>
				<span className="text-xs text-muted-foreground">{value}</span>
			</div>
			<input
				type="range"
				name={name}
				value={value}
				min={min}
				max={max}
				step={step}
				onChange={onChange}
				className="w-full"
			/>
		</div>
	);
}

function CheckboxInput({ label, name, checked, onChange }: { label: string, name: string, checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
	return (
		<div className="flex items-center gap-2">
			<input
				type="checkbox"
				id={name}
				name={name}
				checked={checked}
				onChange={onChange}
				className="w-4 h-4 rounded border-input"
			/>
			<label htmlFor={name} className="text-sm cursor-pointer select-none">{label}</label>
		</div>
	);
}

function TextInput({ label, name, value, onChange, placeholder, type = "text", required = false }: { label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder?: string, type?: string, required?: boolean }) {
	return (
		<div className="space-y-2">
			<label className="text-sm font-medium">{label}</label>
			<input
				type={type}
				name={name}
				value={value}
				onChange={onChange}
				className="input"
				placeholder={placeholder}
				required={required}
			/>
		</div>
	);
}

let _ctx: CanvasRenderingContext2D | null = null;

function webColorToHex(color: string): string {
	if (!color) return "#000000";
	// If it's already a valid 6-char hex, return it (preserving case if desired, or maximizing performance)
	if (/^#[0-9A-F]{6}$/i.test(color)) return color;

	if (typeof document === "undefined") return "#000000";

	try {
		if (!_ctx) {
			_ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
		}
		if (!_ctx) return "#000000";

		_ctx.fillStyle = "#000000"; // Reset to black default
		_ctx.fillStyle = color;
		const computed = _ctx.fillStyle;

		// Canvas returns hex for common colors, or rgb(...)
		if (computed.startsWith("#")) {
			// Ensure full 6-digit hex (canvas might return #fff sometimes? usually expands)
			if (computed.length === 7) return computed;
			// Expand 3-digit hex if somehow returned
			if (computed.length === 4) {
				return "#" + computed[1] + computed[1] + computed[2] + computed[2] + computed[3] + computed[3];
			}
		}

		if (computed.startsWith("rgb")) {
			const match = computed.match(/\d+/g);
			if (match && match.length >= 3) {
				const toHex = (n: string) => parseInt(n).toString(16).padStart(2, "0");
				return `#${toHex(match[0])}${toHex(match[1])}${toHex(match[2])}`;
			}
		}
	} catch {
		// Fallback
		return "#000000";
	}

	return "#000000";
}
