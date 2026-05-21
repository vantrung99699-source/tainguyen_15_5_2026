import type { ItemApiAuthType } from './itemApi';

/** Giao thức API chung — mọi nhà cung cấp dùng cùng endpoint & trường JSON */
export const STANDARD_API_PROTOCOL = {
  orderPath: '/api/order',
  stockPath: '/api/stock',
  servicesPath: '/api/services',
  balancePath: '/api/balance',
  quantityField: 'quantity',
  productIdField: 'product_id',
  responseContentField: 'data',
} as const;

export interface ApiProviderProduct {
  id: string;
  name: string;
  channel?: string;
  price?: number;
  currency?: string;
  retailPrice?: number;
  minPurchase?: number;
  maxPurchase?: number;
  shortDescription?: string;
  detailDescription?: string;
  stock?: number;
  sold?: number;
  preorderEnabled?: boolean;
  preorderMaxWaitDays?: number;
  saleMode?: 'fifo' | 'oldest' | 'newest' | 'random';
}

export function formatProviderProductLabel(product: ApiProviderProduct): string {
  const cur = product.currency?.trim().toUpperCase();
  const isVnd = cur === 'VND' || cur === 'Đ' || cur === 'DONG';
  const price =
    product.price != null
      ? isVnd
        ? ` - ${product.price.toLocaleString('vi-VN')}đ`
        : ` - $${product.price}`
      : '';
  const channel = product.channel ? ` - ${product.channel}` : '';
  return `${product.id} - ${product.name}${channel}${price}`;
}

export const DEMO_PROVIDER_PRODUCTS: ApiProviderProduct[] = [
  { id: '3020', name: 'Tiktok Like', channel: 'Channel 11', price: 0.22222 },
  { id: '3019', name: 'Tiktok Like', channel: 'Channel 10', price: 0.37037 },
  { id: '3017', name: 'Tiktok Like', channel: 'Channel 8', price: 0.37037 },
  { id: '3014', name: 'Tiktok Like', channel: 'Channel 5', price: 0.44444 },
  { id: '3012', name: 'Tiktok Like', channel: 'Channel 3', price: 0.48148 },
  { id: '3011', name: 'Tiktok Like', channel: 'Channel 2', price: 0.62962 },
  { id: '3008', name: 'Tiktok Follow', channel: 'Channel 1', price: 1.25 },
  { id: '3005', name: 'Instagram Follow', channel: 'Channel 3', price: 0.85 },
];

export type ApiProviderBalanceCurrency = 'VND' | 'USD';

export interface ApiProvider {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  authType: ItemApiAuthType;
  enabled: boolean;
  note: string;
  /** Tiền tệ đơn giá dịch vụ từ /api/services (mặc định khi API không trả currency) */
  serviceCurrency: ApiProviderBalanceCurrency;
  /** 1 USD = X VND — quy đổi giá dịch vụ sang VND trước khi cộng %/đ */
  exchangeRateToVnd: number;
  /** Tiền tệ số dư tài khoản NCC */
  balanceCurrency: ApiProviderBalanceCurrency;
  /** Cảnh báo Telegram khi số dư < ngưỡng (theo balanceCurrency) */
  lowBalanceThreshold: number;
  telegramBalanceAlert: boolean;
}

export const DEFAULT_API_PROVIDERS: ApiProvider[] = [
  {
    id: 'demo-partner',
    name: 'Demo Partner API',
    baseUrl: 'https://demo.example.com',
    apiKey: '',
    authType: 'bearer',
    enabled: true,
    note: 'Chế độ demo — giả lập đơn hàng không cần server thật.',
    serviceCurrency: 'USD',
    exchangeRateToVnd: 27000,
    balanceCurrency: 'VND',
    lowBalanceThreshold: 200_000,
    telegramBalanceAlert: true,
  },
];
