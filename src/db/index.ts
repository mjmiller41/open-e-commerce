import Dexie, { type Table } from "dexie";

export interface Product {
  id?: number;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  onHand: number;
}

export interface CartItem {
  id?: number;
  productId: number;
  quantity: number;
}

export class ECommerceDB extends Dexie {
  products!: Table<Product>;
  cart!: Table<CartItem>;

  constructor() {
    super("ECommerceDB");
    this.version(1).stores({
      products: "++id, name, price, description, image, category, onHand",
      cart: "++id, productId, quantity",
    });
  }
}

export const db = new ECommerceDB();
