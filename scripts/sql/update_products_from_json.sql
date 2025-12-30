
UPDATE public.products 
SET 
  name = 'Vintage Leather Camera Bag',
  description = 'Handcrafted from genuine full-grain leather, this camera bag ages beautifully. Fits one DSLR body and two lenses.',
  price = 145,
  category = 'Cameras & Optics > Camera & Optic Accessories > Camera Parts & Accessories > Camera Bags & Cases',
  image = 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80',
  images = ARRAY['https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80'],
  on_hand = 15,
  cost = 60,
  sku = 'CAM-BAG-LTH-002',
  brand = 'ArtisanLegacy',
  weight = 2.5,
  gtin = NULL,
  mpn = 'AL-CB100',
  condition = 'new',
  product_type = 'Accessories',
  tags = ARRAY['leather','camera','vintage'],
  is_active = true
WHERE id = 9;


UPDATE public.products 
SET 
  name = 'Premium Wireless Headphones',
  description = 'Experience crystal clear sound with our latest noise-cancelling headphones. Featuring 30-hour battery life and plush ear cushions for all-day comfort.',
  price = 299.99,
  category = 'Electronics > Audio > Headphones',
  image = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
  images = ARRAY['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'],
  on_hand = 50,
  cost = 150.00,
  sku = 'HDPH-NC-001',
  brand = 'SoundMax',
  weight = 0.8,
  gtin = '00012345678905',
  mpn = 'SM-NC300',
  condition = 'new',
  product_type = 'Electronics',
  tags = ARRAY['audio','wireless','headphones'],
  is_active = true
WHERE id = 13;


UPDATE public.products 
SET 
  name = '4K Action Camera',
  description = 'Capture life in stunning 4K detail. HyperSmooth stabilization and rugged design.',
  price = 349,
  category = 'Cameras & Optics > Cameras > Film Cameras',
  image = 'https://images.unsplash.com/photo-1564466021184-48618685e1ca?w=800&q=80',
  images = ARRAY['https://images.unsplash.com/photo-1564466021184-48618685e1ca?w=800&q=80'],
  on_hand = 30,
  cost = 0,
  sku = NULL,
  brand = '',
  weight = NULL,
  gtin = NULL,
  mpn = NULL,
  condition = 'new',
  product_type = NULL,
  tags = NULL,
  is_active = true
WHERE id = 6;


UPDATE public.products 
SET 
  name = 'Premium Wireless Headphones',
  description = 'Experience crystal clear sound with our latest noise-cancelling headphones. Featuring 30-hour battery life and plush ear cushions for all-day comfort.',
  price = 299.99,
  category = 'Electronics > Audio > Headphones',
  image = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
  images = ARRAY['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'],
  on_hand = 50,
  cost = 150.00,
  sku = 'HDPH-NC-001',
  brand = 'SoundMax',
  weight = 0.8,
  gtin = '00012345678905',
  mpn = 'SM-NC300',
  condition = 'new',
  product_type = 'Electronics',
  tags = ARRAY['audio','wireless','headphones'],
  is_active = true
WHERE id = 8;


UPDATE public.products 
SET 
  name = 'Mechanical Gaming Keyboard',
  description = 'RGB backlit mechanical keyboard with blue switches. Certified refurbished with new keycaps.',
  price = 89.99,
  category = 'Electronics > Electronics Accessories > Computer Components > Input Devices > Keyboards',
  image = 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80',
  images = ARRAY['https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80'],
  on_hand = 8,
  cost = 40.00,
  sku = 'KYB-MECH-RGB-REF',
  brand = 'ClickyTech',
  weight = 1.2,
  gtin = NULL,
  mpn = 'CT-K100-REF',
  condition = 'refurbished',
  product_type = 'Electronics',
  tags = ARRAY['gaming','keyboard','rgb'],
  is_active = true
WHERE id = 10;


UPDATE public.products 
SET 
  name = 'Organic Cotton T-Shirt',
  description = 'Classic fit t-shirt made from 100% organic cotton. Pre-shrunk and durable.',
  price = 25.00,
  category = 'Apparel & Accessories > Clothing > Shirts & Tops',
  image = 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80',
  images = ARRAY['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80'],
  on_hand = 100,
  cost = 8.50,
  sku = 'TSHIRT-ORG-003',
  brand = 'EcoWear',
  weight = 0.3,
  gtin = NULL,
  mpn = 'EW-TS003',
  condition = 'new',
  product_type = 'Apparel',
  tags = ARRAY['organic','cotton','clothing'],
  is_active = true
WHERE id = 12;


UPDATE public.products 
SET 
  name = 'Smart Coffee Maker',
  description = 'WiFi enabled coffee maker. Schedule your brew from your phone. (Currently Out of Stock)',
  price = 189.99,
  category = 'Home & Garden > Kitchen & Dining > Kitchen Appliances > Coffee Makers & Espresso Machines',
  image = 'https://images.unsplash.com/photo-1510972527921-ce03766a1cf1?w=800&q=80',
  images = ARRAY['https://images.unsplash.com/photo-1510972527921-ce03766a1cf1?w=800&q=80'],
  on_hand = 0,
  cost = 95,
  sku = 'COF-SMRT-005',
  brand = 'BrewSmart',
  weight = 5,
  gtin = '00098765432101',
  mpn = 'BS-CM500',
  condition = 'new',
  product_type = 'Home Appliance',
  tags = ARRAY['coffee','smart home','wifi'],
  is_active = true
WHERE id = 11;


UPDATE public.products 
SET 
  name = 'Wireless Noise-Canceling Headphones',
  description = 'Experience silence and pure audio with our industry-leading noise cancellation technology. 30-hour battery life.',
  price = 299.99,
  category = 'Audio',
  image = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
  images = ARRAY['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'],
  on_hand = 50,
  cost = 0,
  sku = NULL,
  brand = '',
  weight = NULL,
  gtin = NULL,
  mpn = NULL,
  condition = 'new',
  product_type = NULL,
  tags = NULL,
  is_active = true
WHERE id = 1;


UPDATE public.products 
SET 
  name = 'Smart Fitness Watch',
  description = 'Track your health metrics, workouts, and sleep patterns with precision. Water-resistant up to 50m.',
  price = 199.5,
  category = 'Wearables',
  image = 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80',
  images = ARRAY['https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80'],
  on_hand = 120,
  cost = 0,
  sku = NULL,
  brand = '',
  weight = NULL,
  gtin = NULL,
  mpn = NULL,
  condition = 'new',
  product_type = NULL,
  tags = NULL,
  is_active = true
WHERE id = 2;


UPDATE public.products 
SET 
  name = 'Mechanical Gaming Keyboard',
  description = 'Tactile switches, RGB backlighting, and aircraft-grade aluminum frame. Built for esports professionals.',
  price = 149.99,
  category = 'Electronics',
  image = 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80',
  images = ARRAY['https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80'],
  on_hand = 45,
  cost = 0,
  sku = NULL,
  brand = '',
  weight = NULL,
  gtin = NULL,
  mpn = NULL,
  condition = 'new',
  product_type = NULL,
  tags = NULL,
  is_active = true
WHERE id = 4;


UPDATE public.products 
SET 
  name = 'Portable Bluetooth Speaker',
  description = '360-degree sound in a compact design. Waterproof and dustproof for all your adventures.',
  price = 79.99,
  category = 'Audio',
  image = 'https://images.unsplash.com/photo-1545459720-aac3e5ca9678?w=800&q=80',
  images = ARRAY['https://images.unsplash.com/photo-1545459720-aac3e5ca9678?w=800&q=80'],
  on_hand = 200,
  cost = 0,
  sku = NULL,
  brand = '',
  weight = NULL,
  gtin = NULL,
  mpn = NULL,
  condition = 'new',
  product_type = NULL,
  tags = NULL,
  is_active = true
WHERE id = 5;


UPDATE public.products 
SET 
  name = 'Ultra-Book Pro Laptop',
  description = 'Power meets portability. Features the latest M-series chip, liquid retina display, and all-day battery life.',
  price = 1299.0,
  category = 'Electronics',
  image = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
  images = ARRAY['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80'],
  on_hand = 16,
  cost = 0,
  sku = NULL,
  brand = '',
  weight = NULL,
  gtin = NULL,
  mpn = NULL,
  condition = 'new',
  product_type = NULL,
  tags = NULL,
  is_active = true
WHERE id = 3;


UPDATE public.products 
SET 
  name = 'Test',
  description = 'Test',
  price = 9.99,
  category = 'Test',
  image = 'https://placehold.co/800x800',
  images = ARRAY['https://placehold.co/800x800'],
  on_hand = 10,
  cost = 0,
  sku = NULL,
  brand = '',
  weight = NULL,
  gtin = NULL,
  mpn = NULL,
  condition = 'new',
  product_type = NULL,
  tags = NULL,
  is_active = true
WHERE id = 7;


UPDATE public.products 
SET 
  name = 'Vintage Leather Camera Bag',
  description = 'Handcrafted from genuine full-grain leather, this camera bag ages beautifully. Fits one DSLR body and two lenses.',
  price = 145.00,
  category = 'Cameras & Optics > Camera & Optic Accessories > Camera Parts & Accessories > Camera Bags & Cases',
  image = 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80',
  images = ARRAY['https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80'],
  on_hand = 15,
  cost = 60.00,
  sku = 'CAM-BAG-LTH-002',
  brand = 'ArtisanLegacy',
  weight = 2.5,
  gtin = NULL,
  mpn = 'AL-CB100',
  condition = 'new',
  product_type = 'Accessories',
  tags = ARRAY['leather','camera','vintage'],
  is_active = true
WHERE id = 14;


UPDATE public.products 
SET 
  name = 'Mechanical Gaming Keyboard',
  description = 'RGB backlit mechanical keyboard with blue switches. Certified refurbished with new keycaps.',
  price = 89.99,
  category = 'Electronics > Electronics Accessories > Computer Components > Input Devices > Keyboards',
  image = 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80',
  images = ARRAY['https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80'],
  on_hand = 8,
  cost = 40.00,
  sku = 'KYB-MECH-RGB-REF',
  brand = 'ClickyTech',
  weight = 1.2,
  gtin = NULL,
  mpn = 'CT-K100-REF',
  condition = 'refurbished',
  product_type = 'Electronics',
  tags = ARRAY['gaming','keyboard','rgb'],
  is_active = true
WHERE id = 15;


UPDATE public.products 
SET 
  name = 'Smart Coffee Maker',
  description = 'WiFi enabled coffee maker. Schedule your brew from your phone. (Currently Out of Stock)',
  price = 189.99,
  category = 'Home & Garden > Kitchen & Dining > Kitchen Appliances > Coffee Makers & Espresso Machines',
  image = 'https://images.unsplash.com/photo-1510972527921-ce03766a1cf1?w=800&q=80',
  images = ARRAY['https://images.unsplash.com/photo-1510972527921-ce03766a1cf1?w=800&q=80'],
  on_hand = 0,
  cost = 95.00,
  sku = 'COF-SMRT-005',
  brand = 'BrewSmart',
  weight = 5.0,
  gtin = '00098765432101',
  mpn = 'BS-CM500',
  condition = 'new',
  product_type = 'Home Appliance',
  tags = ARRAY['coffee','smart home','wifi'],
  is_active = true
WHERE id = 16;


UPDATE public.products 
SET 
  name = 'Organic Cotton T-Shirt',
  description = 'Classic fit t-shirt made from 100% organic cotton. Pre-shrunk and durable.',
  price = 25.00,
  category = 'Apparel & Accessories > Clothing > Shirts & Tops',
  image = 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80',
  images = ARRAY['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80'],
  on_hand = 100,
  cost = 8.50,
  sku = 'TSHIRT-ORG-003',
  brand = 'EcoWear',
  weight = 0.3,
  gtin = NULL,
  mpn = 'EW-TS003',
  condition = 'new',
  product_type = 'Apparel',
  tags = ARRAY['organic','cotton','clothing'],
  is_active = true
WHERE id = 17;

