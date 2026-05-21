import type {
  AppliedPromoResult,
  PromoAppliesTo,
  PromoCode,
  PromoCodeUsage,
  PromoDiscountType,
} from '../types/promoCode';

const CODES_KEY = 'taphoammo_promo_codes';
const USAGES_KEY = 'taphoammo_promo_usages';

export const PROMO_CODES_UPDATED = 'taphoammo-promo-codes-updated';

const DEFAULT_CODES: PromoCode[] = [
  {
    id: 'pc-welcome10',
    code: 'WELCOME10',
    name: 'Giảm 10% đơn đầu',
    discountType: 'percent',
    discountValue: 10,
    minOrderAmount: 50000,
    maxDiscountAmount: 100000,
    usageLimit: 500,
    usedCount: 0,
    perUserLimit: 1,
    appliesTo: 'all',
    enabled: true,
    startsAt: null,
    expiresAt: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pc-giam50k',
    code: 'GIAM50K',
    name: 'Giảm 50.000đ',
    discountType: 'fixed',
    discountValue: 50000,
    minOrderAmount: 200000,
    maxDiscountAmount: 0,
    usageLimit: 200,
    usedCount: 0,
    perUserLimit: 3,
    appliesTo: 'all',
    enabled: true,
    startsAt: null,
    expiresAt: null,
    createdAt: new Date().toISOString(),
  },
];

function emit() {
  window.dispatchEvent(new CustomEvent(PROMO_CODES_UPDATED));
}

function normalizeCode(raw: string) {
  return raw.trim().toUpperCase();
}

function normalizePromo(raw: Partial<PromoCode> & Record<string, unknown>): PromoCode {
  const discountType = (
    ['percent', 'fixed'].includes(String(raw.discountType)) ? raw.discountType : 'percent'
  ) as PromoDiscountType;
  const appliesTo = (
    ['all', 'instant', 'preorder'].includes(String(raw.appliesTo)) ? raw.appliesTo : 'all'
  ) as PromoAppliesTo;
  return {
    id: String(raw.id ?? `PC${Date.now()}`),
    code: normalizeCode(String(raw.code ?? '')),
    name: String(raw.name ?? ''),
    discountType,
    discountValue: Math.max(0, Number(raw.discountValue) || 0),
    minOrderAmount: Math.max(0, Number(raw.minOrderAmount) || 0),
    maxDiscountAmount: Math.max(0, Number(raw.maxDiscountAmount) || 0),
    usageLimit: raw.usageLimit == null ? null : Math.max(0, Number(raw.usageLimit)),
    usedCount: Math.max(0, Number(raw.usedCount) || 0),
    perUserLimit: Math.max(1, Number(raw.perUserLimit) || 1),
    appliesTo,
    enabled: raw.enabled !== false,
    startsAt: raw.startsAt ? String(raw.startsAt) : null,
    expiresAt: raw.expiresAt ? String(raw.expiresAt) : null,
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
  };
}

export function loadPromoCodes(): PromoCode[] {
  try {
    const raw = localStorage.getItem(CODES_KEY);
    if (!raw) return [...DEFAULT_CODES];
    const parsed = JSON.parse(raw) as PromoCode[];
    return parsed.length ? parsed.map((p) => normalizePromo(p)) : [...DEFAULT_CODES];
  } catch {
    return [...DEFAULT_CODES];
  }
}

function savePromoCodes(list: PromoCode[]) {
  localStorage.setItem(CODES_KEY, JSON.stringify(list));
  emit();
}

function loadUsages(): PromoCodeUsage[] {
  try {
    const raw = localStorage.getItem(USAGES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PromoCodeUsage[];
  } catch {
    return [];
  }
}

function saveUsages(list: PromoCodeUsage[]) {
  localStorage.setItem(USAGES_KEY, JSON.stringify(list));
}

export function computePromoDiscount(subtotal: number, promo: PromoCode): number {
  if (subtotal <= 0) return 0;
  if (promo.discountType === 'fixed') {
    return Math.min(promo.discountValue, subtotal);
  }
  let discount = Math.floor((subtotal * promo.discountValue) / 100);
  if (promo.maxDiscountAmount > 0) {
    discount = Math.min(discount, promo.maxDiscountAmount);
  }
  return Math.min(discount, subtotal);
}

export function validatePromoCode(params: {
  code: string;
  userId: string;
  subtotal: number;
  orderKind: 'instant' | 'preorder';
}): { ok: true; result: AppliedPromoResult } | { ok: false; error: string } {
  const normalized = normalizeCode(params.code);
  if (!normalized) return { ok: false, error: 'Nhập mã khuyến mãi' };

  const promo = loadPromoCodes().find((p) => p.code === normalized);
  if (!promo) return { ok: false, error: 'Mã không tồn tại' };
  if (!promo.enabled) return { ok: false, error: 'Mã đã bị tắt' };

  const now = Date.now();
  if (promo.startsAt && new Date(promo.startsAt).getTime() > now) {
    return { ok: false, error: 'Mã chưa có hiệu lực' };
  }
  if (promo.expiresAt && new Date(promo.expiresAt).getTime() < now) {
    return { ok: false, error: 'Mã đã hết hạn' };
  }
  if (promo.appliesTo !== 'all' && promo.appliesTo !== params.orderKind) {
    return {
      ok: false,
      error: params.orderKind === 'instant' ? 'Mã không áp dụng mua ngay' : 'Mã không áp dụng đặt trước',
    };
  }
  if (params.subtotal < promo.minOrderAmount) {
    return {
      ok: false,
      error: `Đơn tối thiểu ${promo.minOrderAmount.toLocaleString('vi-VN')}đ`,
    };
  }
  if (promo.usageLimit != null && promo.usedCount >= promo.usageLimit) {
    return { ok: false, error: 'Mã đã hết lượt dùng' };
  }

  const userUses = loadUsages().filter(
    (u) => u.promoCodeId === promo.id && u.userId === params.userId,
  ).length;
  if (userUses >= promo.perUserLimit) {
    return { ok: false, error: 'Bạn đã dùng hết lượt với mã này' };
  }

  const discountAmount = computePromoDiscount(params.subtotal, promo);
  if (discountAmount <= 0) {
    return { ok: false, error: 'Mã không áp dụng được cho đơn này' };
  }

  return {
    ok: true,
    result: {
      promoId: promo.id,
      code: promo.code,
      discountAmount,
      subtotal: params.subtotal,
      total: params.subtotal - discountAmount,
    },
  };
}

export function recordPromoUsage(params: {
  promoId: string;
  code: string;
  userId: string;
  orderId: string;
  discountAmount: number;
}) {
  const list = loadPromoCodes();
  const idx = list.findIndex((p) => p.id === params.promoId);
  if (idx >= 0) {
    list[idx] = { ...list[idx], usedCount: list[idx].usedCount + 1 };
    savePromoCodes(list);
  }
  const usages = loadUsages();
  usages.unshift({
    id: `PU${Date.now()}`,
    promoCodeId: params.promoId,
    code: params.code,
    userId: params.userId,
    orderId: params.orderId,
    discountAmount: params.discountAmount,
    usedAt: new Date().toISOString(),
  });
  saveUsages(usages.slice(0, 500));
}

export function upsertPromoCode(promo: PromoCode) {
  const list = loadPromoCodes();
  const normalized = normalizePromo(promo);
  const idx = list.findIndex((p) => p.id === normalized.id);
  if (idx >= 0) list[idx] = normalized;
  else list.unshift(normalized);
  savePromoCodes(list);
}

export function deletePromoCode(id: string) {
  savePromoCodes(loadPromoCodes().filter((p) => p.id !== id));
}

export function createPromoCode(
  params: Omit<PromoCode, 'id' | 'usedCount' | 'createdAt'>,
): PromoCode {
  const promo = normalizePromo({
    ...params,
    id: `PC${Date.now()}`,
    usedCount: 0,
    createdAt: new Date().toISOString(),
  });
  upsertPromoCode(promo);
  return promo;
}

export function formatPromoDiscountLabel(promo: PromoCode): string {
  if (promo.discountType === 'percent') {
    const cap =
      promo.maxDiscountAmount > 0
        ? ` (tối đa ${promo.maxDiscountAmount.toLocaleString('vi-VN')}đ)`
        : '';
    return `-${promo.discountValue}%${cap}`;
  }
  return `-${promo.discountValue.toLocaleString('vi-VN')}đ`;
}
