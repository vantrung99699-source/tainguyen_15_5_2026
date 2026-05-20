import { PRODUCTS } from '../constants';
import { isPresetIconUrl } from '../constants/socialIcons';
import type { Product } from '../types';
import type { ServiceShop } from '../types/serviceShop';
import { loadServiceShops } from './serviceShopConfig';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=300&fit=crop';

function shopItemImage(shop: ServiceShop): string {
  if (shop.iconUrl && (isPresetIconUrl(shop.iconUrl) || shop.iconUrl.startsWith('http') || shop.iconUrl.startsWith('data:'))) {
    return shop.iconUrl;
  }
  return FALLBACK_IMAGE;
}

export function shopsToProducts(shops: ServiceShop[]): Product[] {
  return shops.flatMap((shop) => {
    if (shop.status !== 'visible') return [];
    return shop.items
      .filter((item) => item.enabled && item.visibility === 'visible')
      .map((item) => ({
        id: `shop-${shop.id}-item-${item.id}`,
        shopId: shop.id,
        itemId: item.id,
        name: item.name,
        description: item.shortDescription || item.name,
        shortDescription: item.shortDescription,
        detailDescription: item.detailDescription,
        price: item.price,
        stock: item.stock,
        sold: item.sold,
        image: shopItemImage(shop),
        category: shop.category || shop.slug,
        preorderEnabled: item.preorderEnabled,
        preorderMaxWaitDays: item.preorderMaxWaitDays,
        minPurchase: item.minPurchase,
        maxPurchase: item.maxPurchase,
      }));
  });
}

export function loadStorefrontProducts(): Product[] {
  const fromShops = shopsToProducts(loadServiceShops());
  if (fromShops.length > 0) return fromShops;
  return PRODUCTS;
}
