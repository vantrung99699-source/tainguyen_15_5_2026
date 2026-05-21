import type { ServiceItem, ServiceShop } from '../types/serviceShop';
import type { StockResource } from '../pages/admin/stockResource';
import { normalizeItemExternalApi } from './itemApiService';

export const SERVICE_SHOPS_UPDATED = 'taphoammo-service-shops-updated';
const STORAGE_KEY = 'taphoammo_service_shops';

export function syncItemStock(item: ServiceItem): ServiceItem {
  return { ...item, stock: item.resources.length };
}

function normalizeItem(raw: Partial<ServiceItem>, index: number): ServiceItem {
  const resources = Array.isArray(raw.resources) ? (raw.resources as StockResource[]) : [];
  const item: ServiceItem = {
    id: Number(raw.id ?? Date.now() + index),
    name: String(raw.name ?? ''),
    slug: String(raw.slug ?? `item-${index}`),
    createdAt: String(raw.createdAt ?? ''),
    price: Number(raw.price ?? 0),
    minPurchase: Math.max(1, Number(raw.minPurchase ?? 1)),
    maxPurchase: Math.max(1, Number(raw.maxPurchase ?? 1_000_000)),
    stock: 0,
    sold: Number(raw.sold ?? 0),
    shortDescription: String(raw.shortDescription ?? ''),
    detailDescription: String(raw.detailDescription ?? ''),
    saleMode: raw.saleMode === 'oldest' || raw.saleMode === 'newest' || raw.saleMode === 'random' ? raw.saleMode : 'fifo',
    visibility: raw.visibility === 'hidden' ? 'hidden' : 'visible',
    enabled: raw.enabled !== false,
    resources,
    preorderEnabled: Boolean(raw.preorderEnabled),
    preorderMaxWaitDays: Math.max(1, Number(raw.preorderMaxWaitDays ?? 3)),
    externalApi: normalizeItemExternalApi(
      raw.externalApi as Partial<ServiceItem['externalApi']> | undefined,
    ),
    stockSource:
      raw.stockSource === 'external_api' || (raw.externalApi as { enabled?: boolean })?.enabled
        ? 'external_api'
        : 'warehouse',
  };
  const synced = syncItemStock(item);
  if (synced.stockSource === 'external_api' && synced.externalApi.enabled) {
    return {
      ...synced,
      stock: Math.max(synced.stock, synced.externalApi.virtualStock),
    };
  }
  return synced;
}

function normalizeShop(raw: Partial<ServiceShop>, index: number): ServiceShop {
  return {
    id: Number(raw.id ?? index + 1),
    title: String(raw.title ?? ''),
    slug: String(raw.slug ?? `shop-${index}`),
    iconUrl: String(raw.iconUrl ?? ''),
    iconName: String(raw.iconName ?? ''),
    status: raw.status === 'hidden' ? 'hidden' : 'visible',
    seoDescription: String(raw.seoDescription ?? ''),
    category: String(raw.category ?? ''),
    date: String(raw.date ?? ''),
    username: String(raw.username ?? ''),
    items: Array.isArray(raw.items) ? raw.items.map((item, i) => normalizeItem(item as ServiceItem, i)) : [],
  };
}

export const DEFAULT_SERVICE_SHOPS: ServiceShop[] = [
  {
    id: 1,
    title: 'SHOP XU HƯỚNG - TIKTOK TRIỆU VIEW',
    slug: 'shop-tiktok-uy-tin',
    iconUrl: 'preset:tiktok',
    iconName: 'TikTok',
    status: 'visible',
    seoDescription: '',
    category: 'TIKTOK',
    date: '28/02/2024 13:51',
    username: 'test12345',
    items: [
      {
        id: 28,
        name: 'TIKTOK >1K FL - SHOP - CÓ VIDEO',
        slug: 'tiktok-1k-fl-shop',
        createdAt: '11/03/2024 15:06',
        price: 15000,
        minPurchase: 1,
        maxPurchase: 10,
        stock: 2,
        sold: 0,
        shortDescription: 'Tài khoản TikTok shop, có video.',
        detailDescription: '',
        saleMode: 'fifo',
        visibility: 'visible',
        enabled: true,
        resources: [
          { content: 'tiktok_user1|pass1', addedAt: '11/03/2024 15:06' },
          { content: 'tiktok_user2|pass2', addedAt: '11/03/2024 15:08' },
        ],
        preorderEnabled: true,
        preorderMaxWaitDays: 7,
      },
      {
        id: 29,
        name: 'TIKTOK >5K FL - SHOP - CÓ VIDEO',
        slug: 'tiktok-5k-fl-shop',
        createdAt: '11/03/2024 15:08',
        price: 45000,
        minPurchase: 1,
        maxPurchase: 5,
        stock: 0,
        sold: 12,
        shortDescription: 'TikTok >5K follow — hết hàng, đặt trước.',
        detailDescription: '',
        saleMode: 'oldest',
        visibility: 'visible',
        enabled: true,
        resources: [],
        preorderEnabled: true,
        preorderMaxWaitDays: 3,
      },
    ],
  },
];

export function loadServiceShops(): ServiceShop[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SERVICE_SHOPS.map((s, i) => normalizeShop(s, i));
    const parsed = JSON.parse(raw) as Partial<ServiceShop>[];
    if (!Array.isArray(parsed)) return DEFAULT_SERVICE_SHOPS.map((s, i) => normalizeShop(s, i));
    return parsed.map((s, i) => normalizeShop(s, i));
  } catch {
    return DEFAULT_SERVICE_SHOPS.map((s, i) => normalizeShop(s, i));
  }
}

export function saveServiceShops(shops: ServiceShop[]) {
  const normalized = shops.map((s, i) => normalizeShop(s, i));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new CustomEvent(SERVICE_SHOPS_UPDATED));
}

export function updateShopItem(
  shops: ServiceShop[],
  shopId: number,
  itemId: number,
  updater: (item: ServiceItem) => ServiceItem,
): ServiceShop[] {
  return shops.map((shop) =>
    shop.id !== shopId
      ? shop
      : {
          ...shop,
          items: shop.items.map((item) =>
            item.id === itemId ? syncItemStock(updater(item)) : item,
          ),
        },
  );
}

export function findShopItem(shops: ServiceShop[], shopId: number, itemId: number) {
  const shop = shops.find((s) => s.id === shopId);
  const item = shop?.items.find((i) => i.id === itemId);
  return { shop, item };
}
