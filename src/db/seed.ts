import { db, type Product } from "./index";

export async function seedDatabase() {
  const count = await db.products.count();
  if (count > 0) return;

  const products: Product[] = [
    {
      name: "Wireless Noise-Canceling Headphones",
      price: 299.99,
      description:
        "Experience silence and pure audio with our industry-leading noise cancellation technology. 30-hour battery life.",
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop",
      category: "Audio",
      onHand: 50,
    },
    {
      name: "Smart Fitness Watch",
      price: 199.5,
      description:
        "Track your health metrics, workouts, and sleep patterns with precision. Water-resistant up to 50m.",
      image:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop",
      category: "Wearables",
      onHand: 120,
    },
    {
      name: "Ultra-Book Pro Laptop",
      price: 1299.0,
      description:
        "Power meets portability. Features the latest M-series chip, liquid retina display, and all-day battery life.",
      image:
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1000&auto=format&fit=crop",
      category: "Electronics",
      onHand: 15,
    },
    {
      name: "Mechanical Gaming Keyboard",
      price: 149.99,
      description:
        "Tactile switches, RGB backlighting, and aircraft-grade aluminum frame. Built for esports professionals.",
      image:
        "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=1000&auto=format&fit=crop",
      category: "Electronics",
      onHand: 45,
    },
    {
      name: "Portable Bluetooth Speaker",
      price: 79.99,
      description:
        "360-degree sound in a compact design. Waterproof and dustproof for all your adventures.",
      image:
        "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=1000&auto=format&fit=crop",
      category: "Audio",
      onHand: 200,
    },
    {
      name: "4K Action Camera",
      price: 349.0,
      description:
        "Capture life in stunning 4K detail. HyperSmooth stabilization and rugged design.",
      image:
        "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=1000&auto=format&fit=crop",
      category: "Electronics",
      onHand: 30,
    },
  ];

  await db.products.bulkAdd(products);
  console.log("Database seeded with initial products");
}
