export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  sold: number;
  image: string;
  category: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color?: string;
}
