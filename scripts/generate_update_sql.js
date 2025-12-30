import fs from 'fs';

const products = JSON.parse(fs.readFileSync('products.json', 'utf8'));

const imageMap = {
	"Vintage Leather Camera Bag": "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80",
	"Premium Wireless Headphones": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
	"4K Action Camera": "https://images.unsplash.com/photo-1564466021184-48618685e1ca?w=800&q=80",
	"Mechanical Gaming Keyboard": "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80",
	"Smart Coffee Maker": "https://images.unsplash.com/photo-1510972527921-ce03766a1cf1?w=800&q=80",
	"Organic Cotton T-Shirt": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80",
	"Smart Fitness Watch": "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80",
	"Portable Bluetooth Speaker": "https://images.unsplash.com/photo-1545459720-aac3e5ca9678?w=800&q=80",
	"Ultra-Book Pro Laptop": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
	"Wireless Noise-Canceling Headphones": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
	"Test": "https://placehold.co/800x800"
};

const sql = products.map(p => {
	const imageUrl = imageMap[p.name] || p.image;
	// Escape single quotes in description and name
	const name = p.name.replace(/'/g, "''");
	const description = (p.description || '').replace(/'/g, "''");
	const brand = (p.brand || '').replace(/'/g, "''");
	const category = (p.category || '').replace(/'/g, "''");

	// Format arrays for SQL
	const tags = p.tags && p.tags.length ? `ARRAY['${p.tags.join("','")}']` : 'NULL';
	const images = imageUrl ? `ARRAY['${imageUrl}']` : 'NULL';

	return `
UPDATE public.products 
SET 
  name = '${name}',
  description = '${description}',
  price = ${p.price || 0},
  category = '${category}',
  image = '${imageUrl}',
  images = ${images},
  on_hand = ${p.on_hand || 0},
  cost = ${p.cost || 0},
  sku = ${p.sku ? `'${p.sku}'` : 'NULL'},
  brand = '${brand}',
  weight = ${p.weight || 'NULL'},
  gtin = ${p.gtin ? `'${p.gtin}'` : 'NULL'},
  mpn = ${p.mpn ? `'${p.mpn}'` : 'NULL'},
  condition = '${p.condition || 'new'}',
  product_type = ${p.product_type ? `'${p.product_type}'` : 'NULL'},
  tags = ${tags},
  is_active = ${p.is_active ?? true}
WHERE id = ${p.id};
`;
}).join('\n');

console.log(sql);
