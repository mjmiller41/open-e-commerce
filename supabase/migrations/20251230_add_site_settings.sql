-- Add Global Colors
ALTER TABLE public.store_settings
ADD COLUMN IF NOT EXISTS colors_background_light text DEFAULT '#FFFFFF',
ADD COLUMN IF NOT EXISTS colors_background_dark text DEFAULT '#09090b',
ADD COLUMN IF NOT EXISTS colors_text_light text DEFAULT '#121212',
ADD COLUMN IF NOT EXISTS colors_text_dark text DEFAULT '#f8fafc',
ADD COLUMN IF NOT EXISTS colors_solid_button_labels text DEFAULT '#FFFFFF',
ADD COLUMN IF NOT EXISTS colors_accent_1 text DEFAULT '#000000',
ADD COLUMN IF NOT EXISTS colors_accent_2 text DEFAULT '#334FB4',
ADD COLUMN IF NOT EXISTS gradient_background_1 text DEFAULT NULL;

-- Add Typography
ALTER TABLE public.store_settings
ADD COLUMN IF NOT EXISTS type_header_font text DEFAULT 'Assistant',
ADD COLUMN IF NOT EXISTS type_body_font text DEFAULT 'Inter',
ADD COLUMN IF NOT EXISTS type_header_scale integer DEFAULT 100,
ADD COLUMN IF NOT EXISTS type_body_scale integer DEFAULT 100;

-- Add Layout
ALTER TABLE public.store_settings
ADD COLUMN IF NOT EXISTS page_width integer DEFAULT 1200,
ADD COLUMN IF NOT EXISTS spacing_grid_horizontal integer DEFAULT 8,
ADD COLUMN IF NOT EXISTS spacing_grid_vertical integer DEFAULT 8;

-- Add Buttons & Inputs
ALTER TABLE public.store_settings
ADD COLUMN IF NOT EXISTS buttons_border_thickness integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS buttons_opacity integer DEFAULT 100,
ADD COLUMN IF NOT EXISTS buttons_radius integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS buttons_shadow_opacity integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS buttons_shadow_horizontal_offset integer DEFAULT 0;

-- Add Product Card
ALTER TABLE public.store_settings
ADD COLUMN IF NOT EXISTS image_ratio text DEFAULT 'adapt',
ADD COLUMN IF NOT EXISTS show_secondary_image boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS show_vendor boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS show_rating boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS enable_quick_add boolean DEFAULT true;

-- Add Social Media
ALTER TABLE public.store_settings
ADD COLUMN IF NOT EXISTS social_facebook_link text DEFAULT '',
ADD COLUMN IF NOT EXISTS social_instagram_link text DEFAULT '',
ADD COLUMN IF NOT EXISTS social_youtube_link text DEFAULT '',
ADD COLUMN IF NOT EXISTS social_tiktok_link text DEFAULT '',
ADD COLUMN IF NOT EXISTS social_twitter_link text DEFAULT '',
ADD COLUMN IF NOT EXISTS social_pinterest_link text DEFAULT '',
ADD COLUMN IF NOT EXISTS social_snapchat_link text DEFAULT '',
ADD COLUMN IF NOT EXISTS social_tumblr_link text DEFAULT '',
ADD COLUMN IF NOT EXISTS social_vimeo_link text DEFAULT '';

-- Add Miscellaneous
ALTER TABLE public.store_settings
ADD COLUMN IF NOT EXISTS favicon_url text DEFAULT '',
ADD COLUMN IF NOT EXISTS currency_code_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS cart_type text DEFAULT 'drawer',
ADD COLUMN IF NOT EXISTS predictive_search_enabled boolean DEFAULT true;
