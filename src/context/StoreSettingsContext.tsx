
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import logger from "../lib/logger";

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
	type_header_scale: number;
	type_body_scale: number;

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
		const root = document.documentElement;
		// Apply primary color
		if (s.primary_color) {
			root.style.setProperty("--accent", s.primary_color);
			// We might want to calculate a hover state or keep it simple
			// For now, let's just set accent. The hover variant might need manual adjustment or a CSS color-mix if supported.
			// Basic hover approximation:
			// root.style.setProperty("--accent-hover", s.primary_color); // Simplified
		}
		// Apply secondary color
		if (s.secondary_color) {
			root.style.setProperty("--brand-secondary", s.secondary_color);
		}
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
