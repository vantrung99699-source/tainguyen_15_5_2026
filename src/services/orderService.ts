import type { CustomerOrder, CustomerOrderKind, CustomerOrderStatus, RefundMode } from '../types/customerOrder';
import type { PreorderOrder, PreorderStatus } from '../types/preorder';
import { loadCustomerSession } from './customerSession';
import { addWalletTransaction } from './walletTransactionService';
import { adjustUserBalanceById } from './userAdmin';

const PREORDER_STORAGE_KEY = 'taphoammo_preorders';

function loadRawPreorders(): PreorderOrder[] {
  try {
    const raw = localStorage.getItem(PREORDER_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PreorderOrder[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const ORDERS_UPDATED = 'taphoammo-orders-updated';
const STORAGE_KEY = 'taphoammo_customer_orders';

function emitOrdersUpdated() {
  window.dispatchEvent(new CustomEvent(ORDERS_UPDATED));
}

function saveOrders(orders: CustomerOrder[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  emitOrdersUpdated();
}

export function loadCustomerOrders(): CustomerOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return migrateFromPreorders([]);
    const parsed = JSON.parse(raw) as CustomerOrder[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function migrateFromPreorders(existing: CustomerOrder[]): CustomerOrder[] {
  const preorders = loadRawPreorders();
  const ids = new Set(existing.map((o) => o.id));
  const merged = [...existing];
  for (const po of preorders) {
    if (ids.has(po.id)) continue;
    merged.push(preorderToCustomerOrder(po));
  }
  if (merged.length > existing.length) saveOrders(merged);
  return merged;
}

function preorderStatusToOrderStatus(status: PreorderStatus): CustomerOrderStatus {
  if (status === 'fulfilled') return 'completed';
  if (status === 'pending_admin' || status === 'approved') return 'pending';
  if (status === 'rejected' || status === 'cancelled_by_user' || status === 'expired_refunded') {
    return 'refunded';
  }
  return 'cancelled';
}

function preorderToCustomerOrder(po: PreorderOrder): CustomerOrder {
  const refunded =
    po.status === 'rejected' ||
    po.status === 'cancelled_by_user' ||
    po.status === 'expired_refunded';
  return {
    id: po.id,
    kind: 'preorder',
    userId: po.userId,
    username: po.username,
    shopId: po.shopId,
    itemId: po.itemId,
    productName: po.itemName,
    quantity: po.quantity,
    unitPrice: po.unitPrice,
    totalAmount: po.totalAmount,
    refundedAmount: refunded ? po.totalAmount : 0,
    status: preorderStatusToOrderStatus(po.status),
    createdAt: po.createdAt,
    note: po.rejectReason || '',
    deliveredContents: po.deliveredContents,
    preorderStatus: po.status,
  };
}

export function upsertOrderFromPreorder(po: PreorderOrder) {
  const orders = loadCustomerOrders();
  const idx = orders.findIndex((o) => o.id === po.id);
  const next = preorderToCustomerOrder(po);
  if (idx >= 0) orders[idx] = { ...orders[idx], ...next };
  else orders.unshift(next);
  saveOrders(orders);
}

export function createInstantOrder(params: {
  shopId: number;
  itemId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  deliveredContents: string[];
}): CustomerOrder {
  const session = loadCustomerSession();
  const order: CustomerOrder = {
    id: `DH${Date.now()}`,
    kind: 'instant',
    userId: session.userId,
    username: session.username,
    shopId: params.shopId,
    itemId: params.itemId,
    productName: params.productName,
    quantity: params.quantity,
    unitPrice: params.unitPrice,
    totalAmount: params.totalAmount,
    refundedAmount: 0,
    status: 'completed',
    createdAt: new Date().toISOString(),
    note: 'Giao hàng tự động',
    deliveredContents: params.deliveredContents,
  };
  const orders = [order, ...loadCustomerOrders()];
  saveOrders(orders);

  const sessionAfter = adjustUserBalanceById(session.userId, -params.totalAmount);
  addWalletTransaction({
    userId: session.userId,
    type: 'purchase',
    amount: -params.totalAmount,
    balanceAfter: sessionAfter.balance,
    note: `Mua ${params.productName} — Đơn #${order.id}`,
    orderId: order.id,
  });

  return order;
}

export function createPreorderOrder(po: PreorderOrder) {
  const session = loadCustomerSession();
  const order = preorderToCustomerOrder(po);
  const orders = [order, ...loadCustomerOrders().filter((o) => o.id !== po.id)];
  saveOrders(orders);

  const sessionAfter = adjustUserBalanceById(session.userId, -po.totalAmount);
  addWalletTransaction({
    userId: session.userId,
    type: 'purchase',
    amount: -po.totalAmount,
    balanceAfter: sessionAfter.balance,
    note: `Đặt trước ${po.itemName} — Đơn #${po.id}`,
    orderId: po.id,
  });
}

export function getOrdersForCustomer(userId: string, kind?: CustomerOrderKind) {
  let list = loadCustomerOrders().filter((o) => o.userId === userId);
  if (kind) list = list.filter((o) => o.kind === kind);
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function syncPreorderStatuses(orders: CustomerOrder[]): CustomerOrder[] {
  const preorders = loadRawPreorders();
  const byId = new Map(preorders.map((p) => [p.id, p]));
  return orders.map((o) => {
    if (o.kind !== 'preorder') return o;
    const po = byId.get(o.id);
    if (!po) return o;
    const synced = preorderToCustomerOrder(po);
    return { ...o, ...synced };
  });
}

export function getAllOrdersForAdmin() {
  return syncPreorderStatuses(loadCustomerOrders()).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export function formatOrderDate(iso: string) {
  try {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString('vi-VN'),
      time: d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
  } catch {
    return { date: iso, time: '' };
  }
}

export function getRefundableAmount(order: CustomerOrder) {
  return Math.max(0, order.totalAmount - order.refundedAmount);
}

export function refundOrder(
  orderId: string,
  mode: RefundMode,
  options: { partialAmount?: number; percent?: number; note?: string },
): { ok: true; refundAmount: number } | { ok: false; error: string } {
  const orders = loadCustomerOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx < 0) return { ok: false, error: 'Không tìm thấy đơn hàng.' };

  const order = orders[idx];
  const remaining = getRefundableAmount(order);
  if (remaining <= 0) return { ok: false, error: 'Đơn đã hoàn tiền đủ.' };

  let refundAmount = remaining;
  if (mode === 'partial') {
    const amt = Math.floor(options.partialAmount ?? 0);
    if (amt <= 0 || amt > remaining) {
      return { ok: false, error: `Số tiền hoàn phải từ 1 đến ${remaining.toLocaleString('vi-VN')} đ.` };
    }
    refundAmount = amt;
  } else if (mode === 'percent') {
    const pct = options.percent ?? 0;
    if (pct <= 0 || pct > 100) return { ok: false, error: 'Phần trăm phải từ 1 đến 100.' };
    refundAmount = Math.floor((remaining * pct) / 100);
    if (refundAmount <= 0) return { ok: false, error: 'Số tiền hoàn quá nhỏ.' };
  }

  const newRefunded = order.refundedAmount + refundAmount;
  const newStatus: CustomerOrderStatus =
    newRefunded >= order.totalAmount ? 'refunded' : 'partial_refunded';

  orders[idx] = {
    ...order,
    refundedAmount: newRefunded,
    status: newStatus,
    note: options.note?.trim() || order.note || `Hoàn ${refundAmount.toLocaleString('vi-VN')} đ`,
  };
  saveOrders(orders);

  const sessionAfter = adjustUserBalanceById(order.userId, refundAmount);
  addWalletTransaction({
    userId: order.userId,
    type: 'refund',
    amount: refundAmount,
    balanceAfter: sessionAfter.balance,
    note: `Hoàn tiền đơn #${order.id} (${mode === 'full' ? 'toàn bộ' : mode === 'percent' ? `${options.percent}%` : 'một phần'})`,
    orderId: order.id,
  });

  return { ok: true, refundAmount };
}

