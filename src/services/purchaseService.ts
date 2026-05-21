import type { SaleMode, ServiceItem, ServiceShop } from '../types/serviceShop';
import { loadCustomerSession } from './customerSession';
import type { AppliedPromoResult } from '../types/promoCode';
import { recordPromoUsage } from './promoCodeService';
import { createInstantOrder } from './orderService';
import {
  findShopItem,
  loadServiceShops,
  saveServiceShops,
  syncItemStock,
} from './serviceShopConfig';
import { fulfillOrderViaExternalApi } from './itemApiService';

function sortResources(resources: ServiceItem['resources'], mode: SaleMode) {
  const list = [...resources];
  if (mode === 'oldest') {
    return list.sort((a, b) => a.addedAt.localeCompare(b.addedAt));
  }
  if (mode === 'newest') {
    return list.sort((a, b) => b.addedAt.localeCompare(a.addedAt));
  }
  if (mode === 'random') {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }
  return list;
}

function pickResources(item: ServiceItem, quantity: number) {
  const sorted = sortResources(item.resources, item.saleMode);
  const picked = sorted.slice(0, quantity);
  const pickedSet = new Set(picked);
  const remaining = item.resources.filter((r) => !pickedSet.has(r));
  return { picked, remaining };
}

export async function createInstantPurchase(params: {
  shopId: number;
  itemId: number;
  quantity: number;
  appliedPromo?: AppliedPromoResult | null;
}): Promise<
  | { ok: true; deliveredContents: string[]; totalAmount: number; orderId: string }
  | { ok: false; error: string }
> {
  const session = loadCustomerSession();
  const shops = loadServiceShops();
  const { shop, item } = findShopItem(shops, params.shopId, params.itemId);

  if (!item || !item.enabled || item.visibility !== 'visible') {
    return { ok: false, error: 'Mặt hàng không khả dụng.' };
  }
  if (params.quantity < item.minPurchase || params.quantity > item.maxPurchase) {
    return {
      ok: false,
      error: `Số lượng phải từ ${item.minPurchase} đến ${item.maxPurchase}.`,
    };
  }
  if (item.stock < params.quantity) {
    return { ok: false, error: 'Kho không đủ số lượng.' };
  }

  const subtotalAmount = item.price * params.quantity;
  const promo = params.appliedPromo;
  const discountAmount = promo?.discountAmount ?? 0;
  const totalAmount = promo?.total ?? subtotalAmount;
  if (promo && (promo.subtotal !== subtotalAmount || promo.total !== totalAmount)) {
    return { ok: false, error: 'Mã khuyến mãi không còn khớp với đơn — áp dụng lại.' };
  }
  if (session.balance < totalAmount) {
    return { ok: false, error: 'Số dư không đủ để mua.' };
  }

  let deliveredContents: string[] = [];
  let updatedItem: ServiceItem;

  if (item.stockSource === 'external_api' && item.externalApi.enabled) {
    const apiResult = await fulfillOrderViaExternalApi(item.externalApi, params.quantity);
    if (!apiResult.ok) {
      return { ok: false, error: apiResult.error };
    }
    deliveredContents = apiResult.contents;
    const nextStock = Math.max(0, item.stock - params.quantity);
    updatedItem = {
      ...item,
      stock: nextStock,
      externalApi: { ...item.externalApi, virtualStock: nextStock },
      sold: item.sold + params.quantity,
    };
  } else {
    const { picked, remaining } = pickResources(item, params.quantity);
    deliveredContents = picked.map((r) => r.content);
    updatedItem = syncItemStock({
      ...item,
      resources: remaining,
      sold: item.sold + params.quantity,
    });
  }

  const nextShops = shops.map((s) =>
    s.id !== shop!.id
      ? s
      : { ...s, items: s.items.map((i) => (i.id === item.id ? updatedItem : i)) },
  );

  saveServiceShops(nextShops);

  const order = createInstantOrder({
    shopId: params.shopId,
    itemId: params.itemId,
    productName: item.name,
    quantity: params.quantity,
    unitPrice: item.price,
    subtotalAmount,
    discountAmount,
    promoCode: promo?.code ?? null,
    totalAmount,
    deliveredContents,
  });

  if (promo) {
    recordPromoUsage({
      promoId: promo.promoId,
      code: promo.code,
      userId: session.userId,
      orderId: order.id,
      discountAmount,
    });
  }

  return {
    ok: true,
    deliveredContents,
    totalAmount,
    orderId: order.id,
  };
}
