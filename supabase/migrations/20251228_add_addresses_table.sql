-- Create addresses table
CREATE TABLE public.addresses (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    address_line1 text NOT NULL,
    address_line2 text,
    city text NOT NULL,
    state text NOT NULL,
    zip_code text NOT NULL,
    country text DEFAULT 'US'::text,
    is_default boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own addresses" 
    ON public.addresses FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own addresses" 
    ON public.addresses FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own addresses" 
    ON public.addresses FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own addresses" 
    ON public.addresses FOR DELETE 
    USING (auth.uid() = user_id);

-- Create index on user_id for performance
CREATE INDEX addresses_user_id_idx ON public.addresses (user_id);
