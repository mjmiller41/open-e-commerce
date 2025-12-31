
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import logger from "../lib/logger";
import { AVAILABLE_FONTS } from "../constants/fonts";

export interface StoreSettings {
	id: number;
	store_name: string;
	support_email: string | null;
	primary_color: string;
	secondary_color: string;
	logo_url: string | null;
	updated_at: string;

	// Global Colors
	colors_background_light: string;
	colors_background_dark: string;
	colors_text_light: string;
	colors_text_dark: string;
	colors_solid_button_labels: string;
	colors_accent_1: string;
	colors_accent_2: string;
	gradient_background_1: string | null;

	// Typography
	type_header_font: string;
	type_body_font: string;

	// Layout
	page_width: number;
	spacing_grid_horizontal: number;
	spacing_grid_vertical: number;

	// Buttons & Inputs
	buttons_border_thickness: number;
	buttons_opacity: number;
	buttons_radius: number;
	buttons_shadow_opacity: number;
	buttons_shadow_horizontal_offset: number;

	// Product Card
	image_ratio: string;
	show_secondary_image: boolean;
	show_vendor: boolean;
	show_rating: boolean;
	enable_quick_add: boolean;

	// Social Media
	social_facebook_link: string;
	social_instagram_link: string;
	social_youtube_link: string;
	social_tiktok_link: string;
	social_twitter_link: string;
	social_pinterest_link: string;
	social_snapchat_link: string;
	social_tumblr_link: string;
	social_vimeo_link: string;

	// Miscellaneous
	favicon_url: string;
	currency_code_enabled: boolean;
	cart_type: string;
	predictive_search_enabled: boolean;
}

interface StoreSettingsContextType {
	settings: StoreSettings | null;
	loading: boolean;
	updateSettings: (newSettings: Partial<StoreSettings>) => Promise<void>;
	refreshSettings: () => Promise<void>;
}

const StoreSettingsContext = createContext<StoreSettingsContextType>({
	settings: null,
	loading: true,
	updateSettings: async () => { },
	refreshSettings: async () => { },
});

// eslint-disable-next-line react-refresh/only-export-components
export const useStoreSettings = () => useContext(StoreSettingsContext);

export function StoreSettingsProvider({ children }: { children: React.ReactNode }) {
	const [settings, setSettings] = useState<StoreSettings | null>(null);
	const [loading, setLoading] = useState(true);

	const fetchSettings = useCallback(async () => {
		try {
			const { data, error } = await supabase
				.from("store_settings")
				.select("*")
				.eq("id", 1)
				.single();

			if (error) {
				// If table doesn't exist yet or row missing, ignore silently or log warning
				// It might be because migration hasn't run in development environment
				logger.warn("Error fetching store settings:", error);
			} else {
				setSettings(data);
				applyTheme(data);
			}
		} catch (err) {
			logger.error("Unexpected error fetching store settings:", err);
		} finally {
			setLoading(false);
		}
	}, []);

	const applyTheme = (s: StoreSettings) => {
		let styleEl = document.getElementById("store-theme-style");
		if (!styleEl) {
			styleEl = document.createElement("style");
			styleEl.id = "store-theme-style";
			document.head.appendChild(styleEl);
		}


		// Generate Font Faces
		const fontFaces = AVAILABLE_FONTS.map(font => {
			const weight = font.name.toLowerCase().includes('bold') ? '700' : '400';
			// Ensure leading slash but handle if base url has trailing slash
			const baseUrl = import.meta.env.BASE_URL.endsWith('/')
				? import.meta.env.BASE_URL
				: `${import.meta.env.BASE_URL}/`;

			return `
				@font-face {
					font-family: '${font.family}';
					src: url('${baseUrl}fonts/${font.fileName}') format('woff2');
					font-weight: ${weight};
					font-style: normal;
					font-display: swap;
				}
			`;
		}).join('\n');

		// Recommended Border Colors (Complimentary Neutrals to Blue Primary)
		// Accent 1: Slate 500 (#64748b) - Structural Borders
		// Accent 2: Slate 600 (#475569) - Active/Focus Borders (Rings)


		const lightCss = `
			:root {
				--accent: ${s.primary_color || '#2563eb'};
				--brand-secondary: ${s.secondary_color || '#64748b'};
				
				--bg-primary: ${s.colors_background_light || '#ffffff'};
				--text-primary: ${s.colors_text_light || '#0f172a'};
				--accent-foreground: ${s.colors_solid_button_labels || '#ffffff'};

				/* Accent 1: Main Borders */
				--border: ${s.colors_accent_1 || '#64748b'};
				--input: ${s.colors_accent_1 || '#64748b'};

				/* Accent 2: Focus Rings & Strong Borders */
				--ring: ${s.colors_accent_2 || '#475569'};

				/* Typography */
				--font-header: '${s.type_header_font}', sans-serif;
				--font-body: '${s.type_body_font}', sans-serif;

				/* Layout */
				--container-width: ${s.page_width}px;
				--grid-spacing-horizontal: ${s.spacing_grid_horizontal}px;
				--grid-spacing-vertical: ${s.spacing_grid_vertical}px;
			}
		`;

		const darkCss = `
			[data-theme="dark"] {
				--bg-primary: ${s.colors_background_dark || '#0f172a'};
				--text-primary: ${s.colors_text_dark || '#f8fafc'};
				
				/* Dark Mode Border Adjustments (Optional: could map to same or standard dark border) */
				--border: ${s.colors_accent_1 ? s.colors_accent_1 : '#334155'};
				--input: ${s.colors_accent_1 ? s.colors_accent_1 : '#334155'};
				--ring: ${s.colors_accent_2 ? s.colors_accent_2 : '#475569'};
			}

			:root {
				/* Buttons & Inputs */
				--btn-border-width: ${s.buttons_border_thickness}px;
				--btn-opacity: ${s.buttons_opacity / 100};
				--btn-radius: ${s.buttons_radius}px;
				--btn-shadow-opacity: ${s.buttons_shadow_opacity / 100};
				--btn-shadow-offset-x: ${s.buttons_shadow_horizontal_offset}px;
				/* Shadow construction: offset-x | offset-y (0) | blur (4px) | spread (0) | color (black with opacity) */
				--btn-shadow: ${s.buttons_shadow_horizontal_offset}px 4px 6px -1px rgba(0, 0, 0, ${s.buttons_shadow_opacity / 100});

				/* Product Card */
				--card-image-ratio: ${s.image_ratio === 'square' ? '1/1' : s.image_ratio === 'portrait' ? '3/4' : 'auto'};
				--card-show-secondary-image: ${s.show_secondary_image ? '1' : '0'};
				--card-show-vendor: ${s.show_vendor ? 'block' : 'none'};
				--card-show-rating: ${s.show_rating ? 'flex' : 'none'}; /* Using flex for stars alignment */
				--card-show-quick-add: ${s.enable_quick_add ? 'block' : 'none'};
			}
		`;

		styleEl.innerHTML = fontFaces + lightCss + darkCss;
	};

	const updateSettings = async (newSettings: Partial<StoreSettings>) => {
		try {
			const { error } = await supabase
				.from("store_settings")
				.update(newSettings)
				.eq("id", 1);

			if (error) throw error;

			// Optimistic update
			if (settings) {
				const updated = { ...settings, ...newSettings };
				setSettings(updated);
				applyTheme(updated);
			}

			await fetchSettings(); // Confirm with server
		} catch (err) {
			logger.error("Error updating settings:", err);
			throw err;
		}
	};

	useEffect(() => {
		fetchSettings();

		// Realtime subscription
		const channel = supabase
			.channel("store_settings_changes")
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "store_settings",
					filter: "id=eq.1",
				},
				(payload) => {
					const newSettings = payload.new as StoreSettings;
					setSettings(newSettings);
					applyTheme(newSettings);
				}
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [fetchSettings]);

	return (
		<StoreSettingsContext.Provider
			value={{ settings, loading, updateSettings, refreshSettings: fetchSettings }}
		>
			{children}
		</StoreSettingsContext.Provider>
	);
}
