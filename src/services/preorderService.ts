import type { PreorderOrder, PreorderStatus } from '../types/preorder';
import type { SaleMode, ServiceItem, ServiceShop } from '../types/serviceShop';
import { loadCustomerSession } from './customerSession';
import { createPreorderOrder, refundOrder, upsertOrderFromPreorder } from './orderService';
import {
  findShopItem,
  loadServiceShops,
  saveServiceShops,
  syncItemStock,
  SERVICE_SHOPS_UPDATED,
} from './serviceShopConfig';

export const PREORDERS_UPDATED = 'taphoammo-preorders-updated';
const STORAGE_KEY = 'taphoammo_preorders';

function emitPreordersUpdated() {
  window.dispatchEvent(new CustomEvent(PREORDERS_UPDATED));
}

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

export function loadPreorders(): PreorderOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PreorderOrder[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function savePreorders(orders: PreorderOrder[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  emitPreordersUpdated();
}

export function processExpiredPreorders(): PreorderOrder[] {
  const now = Date.now();
  let orders = loadPreorders();
  const expiredIds: string[] = [];

  orders = orders.map((order) => {
    if (order.status !== 'pending_admin') return order;
    if (new Date(order.expiresAt).getTime() > now) return order;
    expiredIds.push(order.id);
    return {
      ...order,
      status: 'expired_refunded',
      processedAt: new Date().toISOString(),
      rejectReason: 'Quá thời hạn chờ — tự động hoàn tiền',
    };
  });

  if (expiredIds.length > 0) {
    savePreorders(orders);
    for (const id of expiredIds) {
      const po = orders.find((o) => o.id === id);
      if (po) {
        upsertOrderFromPreorder(po);
        refundOrder(id, 'full', { note: po.rejectReason ?? '' });
      }
    }
  }
  return orders;
}

export function tryFulfillPreorder(
  shops: ServiceShop[],
  order: PreorderOrder,
): { shops: ServiceShop[]; order: PreorderOrder; fulfilled: boolean } {
  if (order.status !== 'approved') {
    return { shops, order, fulfilled: false };
  }

  const { shop, item } = findShopItem(shops, order.shopId, order.itemId);
  if (!shop || !item || item.stock < order.quantity) {
    return { shops, order, fulfilled: false };
  }

  const { picked, remaining } = pickResources(item, order.quantity);
  const updatedItem = syncItemStock({
    ...item,
    resources: remaining,
    sold: item.sold + order.quantity,
  });

  const nextShops = shops.map((s) =>
    s.id !== shop.id
      ? s
      : { ...s, items: s.items.map((i) => (i.id === item.id ? updatedItem : i)) },
  );

  const fulfilledOrder: PreorderOrder = {
    ...order,
    status: 'fulfilled',
    deliveredContents: picked.map((r) => r.content),
    processedAt: new Date().toISOString(),
  };

  return { shops: nextShops, order: fulfilledOrder, fulfilled: true };
}

function tryFulfillAllApproved(shops: ServiceShop[], orders: PreorderOrder[]) {
  let nextShops = shops;
  let nextOrders = orders;
  let shopsChanged = false;
  let ordersChanged = false;

  for (let i = 0; i < nextOrders.length; i++) {
    const order = nextOrders[i];
    if (order.status !== 'approved') continue;
    const result = tryFulfillPreorder(nextShops, order);
    if (result.fulfilled) {
      nextShops = result.shops;
      nextOrders[i] = result.order;
      shopsChanged = true;
      ordersChanged = true;
    }
  }

  if (shopsChanged) saveServiceShops(nextShops);
  if (ordersChanged) savePreorders(nextOrders);
  return { shops: nextShops, orders: nextOrders };
}

export function onStockUpdated(shopId: number, itemId: number) {
  const shops = loadServiceShops();
  let orders = processExpiredPreorders();
  const approved = orders.filter(
    (o) => o.shopId === shopId && o.itemId === itemId && o.status === 'approved',
  );

  let nextShops = shops;
  for (const order of approved) {
    const result = tryFulfillPreorder(nextShops, order);
    if (result.fulfilled) {
      nextShops = result.shops;
      orders = orders.map((o) => (o.id === order.id ? result.order : o));
      upsertOrderFromPreorder(result.order);
    }
  }

  saveServiceShops(nextShops);
  savePreorders(orders);
}

export function createPreorder(params: {
  shopId: number;
  itemId: number;
  quantity: number;
  /** Số ngày khách chọn — quá hạn chưa xác nhận sẽ tự hoàn tiền */
  waitDays: number;
}): { ok: true; order: PreorderOrder } | { ok: false; error: string } {
  processExpiredPreorders();
  const session = loadCustomerSession();
  const shops = loadServiceShops();
  const { item } = findShopItem(shops, params.shopId, params.itemId);

  if (!item || !item.enabled || item.visibility !== 'visible') {
    return { ok: false, error: 'Mặt hàng không khả dụng.' };
  }
  if (!item.preorderEnabled) {
    return { ok: false, error: 'Mặt hàng này không hỗ trợ đặt trước.' };
  }
  if (item.stock > 0) {
    return {
      ok: false,
      error: 'Trong kho vẫn còn hàng. Vui lòng ấn Mua ngay để nhận hàng ngay.',
    };
  }
  if (params.quantity < item.minPurchase || params.quantity > item.maxPurchase) {
    return {
      ok: false,
      error: `Số lượng phải từ ${item.minPurchase} đến ${item.maxPurchase}.`,
    };
  }

  const totalAmount = item.price * params.quantity;
  if (session.balance < totalAmount) {
    return { ok: false, error: 'Số dư không đủ để đặt trước.' };
  }

  const maxAllowed = item.preorderMaxWaitDays || 30;
  const waitDays = Math.floor(params.waitDays);
  if (waitDays < 1 || waitDays > maxAllowed) {
    return {
      ok: false,
      error: `Số ngày chờ phải từ 1 đến ${maxAllowed} (theo cấu hình mặt hàng).`,
    };
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + waitDays);

  const order: PreorderOrder = {
    id: `PO-${Date.now()}`,
    userId: session.userId,
    username: session.username,
    shopId: params.shopId,
    itemId: params.itemId,
    itemName: item.name,
    quantity: params.quantity,
    unitPrice: item.price,
    totalAmount,
    maxWaitDays: waitDays,
    createdAt: new Date().toISOString(),
    expiresAt: expiresAt.toISOString(),
    status: 'pending_admin',
    deliveredContents: [],
    processedAt: null,
    rejectReason: null,
  };

  const orders = [...loadPreorders(), order];
  savePreorders(orders);
  createPreorderOrder(order);

  return { ok: true, order };
}

export function approvePreorder(orderId: string): { ok: boolean; error?: string } {
  let orders = processExpiredPreorders();
  const shops = loadServiceShops();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx < 0) return { ok: false, error: 'Không tìm thấy đơn.' };

  const order = orders[idx];
  if (order.status !== 'pending_admin') {
    return { ok: false, error: 'Đơn không ở trạng thái chờ xác nhận.' };
  }

  const approved: PreorderOrder = {
    ...order,
    status: 'approved',
    processedAt: new Date().toISOString(),
  };

  const result = tryFulfillPreorder(shops, approved);
  orders[idx] = result.fulfilled ? result.order : approved;
  savePreorders(orders);
  upsertOrderFromPreorder(orders[idx]);
  if (result.fulfilled) saveServiceShops(result.shops);
  else saveServiceShops(shops);

  tryFulfillAllApproved(loadServiceShops(), loadPreorders());
  return { ok: true };
}

export function rejectPreorder(orderId: string, reason?: string): { ok: boolean; error?: string } {
  let orders = processExpiredPreorders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx < 0) return { ok: false, error: 'Không tìm thấy đơn.' };

  const order = orders[idx];
  if (order.status !== 'pending_admin' && order.status !== 'approved') {
    return { ok: false, error: 'Không thể từ chối đơn này.' };
  }

  orders[idx] = {
    ...order,
    status: 'rejected',
    processedAt: new Date().toISOString(),
    rejectReason: reason?.trim() || 'Admin từ chối đơn đặt trước',
  };
  savePreorders(orders);
  upsertOrderFromPreorder(orders[idx]);
  refundOrder(orderId, 'full', { note: orders[idx].rejectReason ?? '' });
  return { ok: true };
}

export function cancelPreorderByUser(orderId: string): { ok: boolean; error?: string } {
  let orders = processExpiredPreorders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx < 0) return { ok: false, error: 'Không tìm thấy đơn.' };

  const order = orders[idx];
  const session = loadCustomerSession();
  if (order.userId !== session.userId) {
    return { ok: false, error: 'Không có quyền hủy đơn này.' };
  }
  if (order.status !== 'pending_admin') {
    return { ok: false, error: 'Chỉ hủy được khi đơn chưa được admin xác nhận.' };
  }

  orders[idx] = {
    ...order,
    status: 'cancelled_by_user',
    processedAt: new Date().toISOString(),
    rejectReason: 'Khách hủy đơn',
  };
  savePreorders(orders);
  upsertOrderFromPreorder(orders[idx]);
  refundOrder(orderId, 'full', { note: 'Khách hủy đơn' });
  return { ok: true };
}

/** Admin bấm Giao hàng — trừ kho và chuyển sang đã giao nếu đủ hàng */
export function fulfillPreorderNow(orderId: string): { ok: boolean; error?: string } {
  let orders = processExpiredPreorders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx < 0) return { ok: false, error: 'Không tìm thấy đơn đặt trước.' };

  const order = orders[idx];
  if (order.status !== 'approved') {
    return { ok: false, error: 'Chỉ giao được đơn đã xác nhận (đang chờ kho).' };
  }

  const shops = loadServiceShops();
  const result = tryFulfillPreorder(shops, order);
  if (!result.fulfilled) {
    return {
      ok: false,
      error: 'Kho chưa đủ số lượng. Vui lòng thêm hàng vào Kho rồi bấm Giao hàng lại.',
    };
  }

  orders[idx] = result.order;
  savePreorders(orders);
  saveServiceShops(result.shops);
  upsertOrderFromPreorder(result.order);
  return { ok: true };
}

export function getPreorderById(orderId: string): PreorderOrder | undefined {
  return processExpiredPreorders().find((o) => o.id === orderId);
}

export function getPreordersForAdmin() {
  return processExpiredPreorders();
}

const ADMIN_PENDING_SEEN_KEY = 'taphoammo_admin_preorder_pending_seen';

function loadSeenPendingIds(): Set<string> {
  try {
    const raw = localStorage.getItem(ADMIN_PENDING_SEEN_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as string[];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function saveSeenPendingIds(ids: Set<string>) {
  localStorage.setItem(ADMIN_PENDING_SEEN_KEY, JSON.stringify([...ids]));
}

/** Tổng đơn đặt trước đang chờ admin xác nhận */
export function getPendingPreorderCount(): number {
  return getPreordersForAdmin().filter((o) => o.status === 'pending_admin').length;
}

/** Đơn chờ xác nhận admin chưa mở mục Đơn hàng sau khi tạo */
export function getUnreadPendingPreorderCount(): number {
  const seen = loadSeenPendingIds();
  return getPreordersForAdmin().filter(
    (o) => o.status === 'pending_admin' && !seen.has(o.id),
  ).length;
}

export function markPendingPreordersAsSeen(): void {
  const seen = loadSeenPendingIds();
  for (const o of getPreordersForAdmin()) {
    if (o.status === 'pending_admin') seen.add(o.id);
  }
  saveSeenPendingIds(seen);
}

export function getPreordersForCustomer() {
  const session = loadCustomerSession();
  return processExpiredPreorders()
    .filter((o) => o.userId === session.userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export { SERVICE_SHOPS_UPDATED };
