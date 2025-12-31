
-- Create store_settings table
CREATE TABLE IF NOT EXISTS public.store_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  store_name TEXT NOT NULL DEFAULT 'Open E-Commerce',
  support_email TEXT,
  primary_color TEXT NOT NULL DEFAULT '#2563eb',
  secondary_color TEXT NOT NULL DEFAULT '#f8fafc',
  logo_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Enable RLS
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access (everyone needs to see store branding)
CREATE POLICY "Allow public read access" ON public.store_settings
  FOR SELECT
  USING (true);

-- Allow admins to update settings
CREATE POLICY "Allow admins to update settings" ON public.store_settings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Insert default row if not exists
INSERT INTO public.store_settings (id, store_name, primary_color, secondary_color)
VALUES (1, 'Open E-Commerce', '#2563eb', '#f8fafc')
ON CONFLICT (id) DO NOTHING;

-- Enable realtime for store_settings
ALTER PUBLICATION supabase_realtime ADD TABLE public.store_settings;
