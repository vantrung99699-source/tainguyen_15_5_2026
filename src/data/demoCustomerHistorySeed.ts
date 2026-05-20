import type { CustomerOrder, CustomerOrderStatus } from '../types/customerOrder';
import type { PreorderOrder, PreorderStatus } from '../types/preorder';
import type { StoredWalletTransaction } from '../services/walletTransactionService';
import type { TransactionType } from '../types/customerWallet';
import { loadCustomerSession } from '../services/customerSession';

const SEED_FLAG = 'taphoammo_demo_history_seed_version';
const SEED_VERSION = 'v3-bulk';

const ORDERS_KEY = 'taphoammo_customer_orders';
const PREORDERS_KEY = 'taphoammo_preorders';
const WALLET_KEY = 'taphoammo_wallet_transactions';

const DEMO_PREFIX = '-DEMO-';

const PRODUCTS: { name: string; unitPrice: number }[] = [
  { name: 'Tài khoản Gmail 1 năm', unitPrice: 100_000 },
  { name: 'Tài khoản Facebook VIP', unitPrice: 600_000 },
  { name: 'Tài khoản TikTok 10K followers', unitPrice: 300_000 },
  { name: 'Proxy Premium IPv4', unitPrice: 50_000 },
  { name: 'Tool SEO Pro Lifetime', unitPrice: 2_500_000 },
  { name: 'Capcut Pro 1 tháng', unitPrice: 45_000 },
  { name: 'Netflix Premium 4K', unitPrice: 89_000 },
  { name: 'ChatGPT Plus share', unitPrice: 120_000 },
  { name: 'Instagram 5K follow', unitPrice: 250_000 },
  { name: 'Canva Pro Edu', unitPrice: 35_000 },
  { name: 'Spotify Premium', unitPrice: 29_000 },
  { name: 'Adobe Creative Cloud', unitPrice: 180_000 },
  { name: 'VPS Windows 8GB', unitPrice: 450_000 },
  { name: 'Domain .com 1 năm', unitPrice: 280_000 },
  { name: 'Hotmail Trust Live', unitPrice: 15_000 },
];

const INSTANT_STATUSES: CustomerOrderStatus[] = [
  'completed',
  'completed',
  'completed',
  'completed',
  'completed',
  'pending',
  'partial_refunded',
  'refunded',
  'cancelled',
];

const PREORDER_STATUSES: PreorderStatus[] = [
  'pending_admin',
  'pending_admin',
  'approved',
  'fulfilled',
  'fulfilled',
  'rejected',
  'cancelled_by_user',
  'expired_refunded',
];

function daysAgo(days: number, hour = 10, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function formatViTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function isDemoId(id: string) {
  return id.includes(DEMO_PREFIX);
}

function stripDemo<T extends { id: string }>(list: T[]): T[] {
  return list.filter((x) => !isDemoId(x.id));
}

function generateInstantOrders(userId: string, username: string): CustomerOrder[] {
  const orders: CustomerOrder[] = [];
  for (let i = 1; i <= 42; i++) {
    const product = PRODUCTS[i % PRODUCTS.length];
    const qty = (i % 5) + 1;
    const total = product.unitPrice * qty;
    const status = INSTANT_STATUSES[i % INSTANT_STATUSES.length];
    const refundedAmount =
      status === 'refunded'
        ? total
        : status === 'partial_refunded'
          ? Math.floor(total * 0.3)
          : 0;
    const createdAt = daysAgo(i % 45, 8 + (i % 12), (i * 7) % 60);
    orders.push({
      id: `DH${DEMO_PREFIX}${String(i).padStart(3, '0')}`,
      kind: 'instant',
      userId,
      username,
      shopId: 1,
      itemId: 100 + i,
      productName: product.name,
      quantity: qty,
      unitPrice: product.unitPrice,
      totalAmount: total,
      refundedAmount,
      status,
      createdAt,
      note:
        status === 'completed'
          ? i % 3 === 0
            ? 'Giao hàng tự động'
            : ''
          : status === 'partial_refunded'
            ? 'Hoàn 30% theo yêu cầu khách'
            : status === 'refunded'
              ? 'Đã hoàn tiền toàn bộ'
              : status === 'pending'
                ? 'Đang xử lý'
                : 'Khách hủy đơn',
      deliveredContents:
        status === 'completed' || status === 'partial_refunded'
          ? [`user${i}@mail-demo.com|pass${1000 + i}`, `backup-key-${i}`]
          : [],
    });
  }
  orders.push({
    id: `DH${DEMO_PREFIX}EXTRA`,
    kind: 'instant',
    userId,
    username,
    shopId: 1,
    itemId: 999,
    productName: 'VPS Windows 8GB',
    quantity: 1,
    unitPrice: 320_000,
    totalAmount: 320_000,
    refundedAmount: 80_000,
    status: 'partial_refunded',
    createdAt: daysAgo(1, 16, 45),
    note: 'Hoàn một phần theo ticket',
    deliveredContents: ['vps-demo-01|pass-extra'],
  });

  return orders;
}

function generatePreorders(userId: string, username: string): PreorderOrder[] {
  const list: PreorderOrder[] = [];
  for (let i = 1; i <= 16; i++) {
    const product = PRODUCTS[(i + 3) % PRODUCTS.length];
    const qty = (i % 3) + 1;
    const total = product.unitPrice * qty;
    const status = PREORDER_STATUSES[i % PREORDER_STATUSES.length];
    const createdAt = daysAgo(i % 30, 14 + (i % 6), (i * 11) % 60);
    const expires = new Date(createdAt);
    expires.setDate(expires.getDate() + 7);
    const refunded =
      status === 'rejected' || status === 'cancelled_by_user' || status === 'expired_refunded';
    list.push({
      id: `PO${DEMO_PREFIX}${String(i).padStart(3, '0')}`,
      userId,
      username,
      shopId: 1,
      itemId: 200 + i,
      itemName: product.name,
      quantity: qty,
      unitPrice: product.unitPrice,
      totalAmount: total,
      maxWaitDays: 7,
      createdAt,
      expiresAt: expires.toISOString(),
      status,
      deliveredContents: status === 'fulfilled' ? [`preorder-slot-${i}@demo.vn`] : [],
      processedAt: status !== 'pending_admin' ? daysAgo(i % 20, 16, 0) : null,
      rejectReason:
        status === 'rejected'
          ? 'Hết hàng tạm thời'
          : status === 'expired_refunded'
            ? 'Quá thời hạn chờ — tự động hoàn tiền'
            : status === 'cancelled_by_user'
              ? 'Khách hủy đơn'
              : null,
    });
  }
  return list;
}

function preorderToOrder(po: PreorderOrder): CustomerOrder {
  const refunded =
    po.status === 'rejected' ||
    po.status === 'cancelled_by_user' ||
    po.status === 'expired_refunded';
  let status: CustomerOrderStatus = 'pending';
  if (po.status === 'fulfilled') status = 'completed';
  else if (refunded) status = 'refunded';
  else if (po.status === 'cancelled_by_user') status = 'cancelled';

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
    status,
    createdAt: po.createdAt,
    note: po.rejectReason || 'Đặt trước',
    deliveredContents: po.deliveredContents,
    preorderStatus: po.status,
  };
}

function generateWalletTransactions(
  userId: string,
  orders: CustomerOrder[],
): StoredWalletTransaction[] {
  const txs: StoredWalletTransaction[] = [];
  let balance = 1_200_000;
  let n = 1;

  const push = (
    type: TransactionType,
    amount: number,
    note: string,
    iso: string,
    orderId?: string,
  ) => {
    balance = Math.max(0, balance + amount);
    txs.push({
      id: `TX${DEMO_PREFIX}${String(n++).padStart(3, '0')}`,
      userId,
      type,
      amount,
      balanceAfter: balance,
      time: formatViTime(iso),
      note,
      orderId,
    });
  };

  const deposits: { amount: number; note: string; days: number }[] = [
    { amount: 500_000, note: 'Nạp tiền qua Vietcombank (+ KM 50.000đ)', days: 2 },
    { amount: 200_000, note: 'Nạp tiền qua Techcombank', days: 4 },
    { amount: 1_000_000, note: 'Nạp tiền qua Momo (+ KM 100.000đ)', days: 8 },
    { amount: 300_000, note: 'Nạp tiền qua ACB', days: 12 },
    { amount: 100_000, note: 'Nạp tiền qua MB Bank (+ KM 10.000đ)', days: 18 },
    { amount: 50_000, note: 'Nạp tiền ZaloPay', days: 25 },
    { amount: 750_000, note: 'Nạp tiền VietinBank', days: 32 },
    { amount: 150_000, note: 'Nạp tiền BIDV', days: 38 },
  ];

  for (const d of deposits) {
    push('deposit', d.amount, d.note, daysAgo(d.days, 9, 30));
  }

  push('credit', 50_000, 'Admin cộng tiền — Khuyến mãi thành viên', daysAgo(6, 11, 0));
  push('credit', 20_000, 'Thưởng nhiệm vụ giới thiệu bạn bè', daysAgo(14, 15, 20));
  push('debit', -25_000, 'Admin trừ tiền — Điều chỉnh sai số dư', daysAgo(10, 10, 5));

  const sortedOrders = [...orders].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  for (const o of sortedOrders) {
    const iso = o.createdAt;
    if (o.kind === 'instant' && o.status !== 'cancelled') {
      push('purchase', -o.totalAmount, `Mua ${o.productName} — Đơn #${o.id}`, iso, o.id);
    }
    if (o.kind === 'preorder') {
      push('purchase', -o.totalAmount, `Đặt trước ${o.productName} — Đơn #${o.id}`, iso, o.id);
    }
    if (o.refundedAmount > 0) {
      const refundIso = daysAgo(
        Math.max(0, Math.floor((Date.now() - new Date(o.createdAt).getTime()) / 86400000) - 1),
        14,
        0,
      );
      const pct =
        o.refundedAmount >= o.totalAmount
          ? 'toàn bộ'
          : `${Math.round((o.refundedAmount / o.totalAmount) * 100)}%`;
      push(
        'refund',
        o.refundedAmount,
        `Hoàn tiền đơn #${o.id} (${pct})`,
        refundIso,
        o.id,
      );
    }
  }

  push('purchase', -320_000, 'Mua VPS Windows 8GB — Đơn #DH-DEMO-EXTRA', daysAgo(1, 16, 45), 'DH-DEMO-EXTRA');
  push('refund', 80_000, 'Hoàn tiền đơn #DH-DEMO-EXTRA (một phần)', daysAgo(1, 17, 10), 'DH-DEMO-EXTRA');

  return txs.sort((a, b) => b.time.localeCompare(a.time));
}

function loadJson<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Seed nhiều đơn hàng & giao dịch giả cho khách demo (minhnv) */
export function ensureDemoCustomerHistory(): void {
  if (localStorage.getItem(SEED_FLAG) === SEED_VERSION) return;

  const { userId, username } = loadCustomerSession();

  const instantOrders = generateInstantOrders(userId, username);
  const preorders = generatePreorders(userId, username);
  const preorderOrders = preorders.map(preorderToOrder);
  const demoOrders = [...instantOrders, ...preorderOrders];

  const existingOrders = stripDemo(loadJson<CustomerOrder>(ORDERS_KEY));
  const otherUserOrders = existingOrders.filter((o) => o.userId !== userId);
  localStorage.setItem(
    ORDERS_KEY,
    JSON.stringify([...demoOrders, ...otherUserOrders]),
  );

  const existingPreorders = stripDemo(loadJson<PreorderOrder>(PREORDERS_KEY));
  const otherPreorders = existingPreorders.filter((p) => p.userId !== userId);
  localStorage.setItem(
    PREORDERS_KEY,
    JSON.stringify([...preorders, ...otherPreorders]),
  );

  const existingTx = stripDemo(loadJson<StoredWalletTransaction>(WALLET_KEY));
  const otherTx = existingTx.filter((t) => t.userId !== userId);
  const demoTx = generateWalletTransactions(userId, demoOrders);
  localStorage.setItem(WALLET_KEY, JSON.stringify([...demoTx, ...otherTx]));

  localStorage.setItem(SEED_FLAG, SEED_VERSION);

  window.dispatchEvent(new CustomEvent('taphoammo-orders-updated'));
  window.dispatchEvent(new CustomEvent('taphoammo-preorders-updated'));
  window.dispatchEvent(new CustomEvent('taphoammo-wallet-tx-updated'));
}
