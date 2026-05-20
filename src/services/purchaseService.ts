import type { SaleMode, ServiceItem, ServiceShop } from '../types/serviceShop';
import { adjustCustomerBalance, loadCustomerSession } from './customerSession';
import {
  findShopItem,
  loadServiceShops,
  saveServiceShops,
  syncItemStock,
} from './serviceShopConfig';

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

export function createInstantPurchase(params: {
  shopId: number;
  itemId: number;
  quantity: number;
}):
  | { ok: true; deliveredContents: string[]; totalAmount: number }
  | { ok: false; error: string } {
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

  const totalAmount = item.price * params.quantity;
  if (session.balance < totalAmount) {
    return { ok: false, error: 'Số dư không đủ để mua.' };
  }

  const { picked, remaining } = pickResources(item, params.quantity);
  const updatedItem = syncItemStock({
    ...item,
    resources: remaining,
    sold: item.sold + params.quantity,
  });

  const nextShops = shops.map((s) =>
    s.id !== shop!.id
      ? s
      : { ...s, items: s.items.map((i) => (i.id === item.id ? updatedItem : i)) },
  );

  adjustCustomerBalance(-totalAmount);
  saveServiceShops(nextShops);

  return {
    ok: true,
    deliveredContents: picked.map((r) => r.content),
    totalAmount,
  };
}
