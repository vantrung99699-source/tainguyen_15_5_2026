import type { StockResource } from '../pages/admin/stockResource';
import type { ItemExternalApiConfig, ItemStockSource } from './itemApi';

export type ShopStatus = 'visible' | 'hidden';
export type SaleMode = 'fifo' | 'oldest' | 'newest' | 'random';

export interface ServiceItem {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
  price: number;
  minPurchase: number;
  maxPurchase: number;
  stock: number;
  sold: number;
  shortDescription: string;
  detailDescription: string;
  saleMode: SaleMode;
  visibility: ShopStatus;
  enabled: boolean;
  resources: StockResource[];
  /** Cho phép khách đặt trước khi hết hàng */
  preorderEnabled: boolean;
  /** Số ngày chờ tối đa khách được chọn */
  preorderMaxWaitDays: number;
  /** warehouse = kho tài nguyên nội bộ; external_api = giao hàng qua API web khác */
  stockSource: ItemStockSource;
  externalApi: ItemExternalApiConfig;
}

export interface ServiceShop {
  id: number;
  title: string;
  slug: string;
  iconUrl: string;
  iconName: string;
  status: ShopStatus;
  seoDescription: string;
  category: string;
  date: string;
  username: string;
  items: ServiceItem[];
}

export interface CreateItemInput {
  name: string;
  slug: string;
  price: number;
  minPurchase: number;
  maxPurchase: number;
  sold: number;
  shortDescription: string;
  detailDescription: string;
  saleMode: SaleMode;
  visibility: ShopStatus;
  preorderEnabled: boolean;
  preorderMaxWaitDays: number;
  stockSource: ItemStockSource;
  externalApi: ItemExternalApiConfig;
}
