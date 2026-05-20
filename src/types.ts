export interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  detailDescription?: string;
  price: number;
  stock: number;
  sold: number;
  image: string;
  category: string;
  /** Liên kết mặt hàng admin (nếu từ shop) */
  shopId?: number;
  itemId?: number;
  preorderEnabled?: boolean;
  preorderMaxWaitDays?: number;
  minPurchase?: number;
  maxPurchase?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color?: string;
}
