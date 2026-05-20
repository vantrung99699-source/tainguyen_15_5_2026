import type {
  DepositCurrency,
  DepositPromotionTier,
  GlobalDepositPromotionSettings,
} from '../types/payment';
import { getDefaultTiersForCurrency, normalizePromotionTier } from './depositPromotion';

export const GLOBAL_DEPOSIT_PROMOTION_UPDATED = 'taphoammo-global-deposit-promotion-updated';

const STORAGE_KEY = 'taphoammo_global_deposit_promotion';

export const DEFAULT_GLOBAL_DEPOSIT_PROMOTION: GlobalDepositPromotionSettings = {
  enabled: false,
  name: 'Khuyến mãi nạp tiền',
  endsAt: null,
  currency: 'VND',
  useTierMilestones: true,
  flatBonusPercent: 10,
  flatMinAmount: 1_000_000,
  tiers: [
    {
      id: 'global-vnd-1',
      minAmount: 1_000_000,
      maxAmount: 1_999_999,
      bonusPercent: 10,
      currency: 'VND',
    },
    {
      id: 'global-vnd-2',
      minAmount: 2_000_000,
      maxAmount: null,
      bonusPercent: 20,
      currency: 'VND',
    },
  ],
};

function normalizeTiers(raw: unknown, currency: DepositCurrency): DepositPromotionTier[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return DEFAULT_GLOBAL_DEPOSIT_PROMOTION.tiers.filter((t) => t.currency === currency);
  }
  return (raw as Partial<DepositPromotionTier>[])
    .map((item, i) => normalizePromotionTier(item, i))
    .filter((t) => t.currency === currency);
}

export function normalizeGlobalDepositPromotion(
  raw: Partial<GlobalDepositPromotionSettings>,
): GlobalDepositPromotionSettings {
  const currency = raw.currency === 'USD' ? 'USD' : 'VND';
  return {
    enabled: Boolean(raw.enabled),
    name: String(raw.name ?? DEFAULT_GLOBAL_DEPOSIT_PROMOTION.name),
    endsAt:
      raw.endsAt === null || raw.endsAt === undefined || raw.endsAt === ''
        ? null
        : String(raw.endsAt),
    currency,
    useTierMilestones: raw.useTierMilestones !== false,
    flatBonusPercent: Math.max(
      0,
      Math.min(100, Number(raw.flatBonusPercent ?? DEFAULT_GLOBAL_DEPOSIT_PROMOTION.flatBonusPercent)),
    ),
    flatMinAmount: Math.max(0, Number(raw.flatMinAmount ?? DEFAULT_GLOBAL_DEPOSIT_PROMOTION.flatMinAmount)),
    tiers: normalizeTiers(raw.tiers, currency),
  };
}

export function loadGlobalDepositPromotion(): GlobalDepositPromotionSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_GLOBAL_DEPOSIT_PROMOTION };
    return normalizeGlobalDepositPromotion(JSON.parse(raw) as Partial<GlobalDepositPromotionSettings>);
  } catch {
    return { ...DEFAULT_GLOBAL_DEPOSIT_PROMOTION };
  }
}

export function saveGlobalDepositPromotion(settings: GlobalDepositPromotionSettings) {
  const normalized = normalizeGlobalDepositPromotion(settings);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new CustomEvent(GLOBAL_DEPOSIT_PROMOTION_UPDATED));
}

/** Chương trình còn hiệu lực (bật + chưa quá hạn) */
export function isGlobalDepositPromotionActive(
  settings: GlobalDepositPromotionSettings,
  now = Date.now(),
): boolean {
  if (!settings.enabled) return false;
  if (!settings.endsAt) return true;
  const end = new Date(settings.endsAt).getTime();
  return !Number.isNaN(end) && now <= end;
}

/** Bậc áp dụng cho trang nạp (theo loại tiền cổng đang chọn) */
export function resolveGlobalPromotionTiers(
  settings: GlobalDepositPromotionSettings,
  currency: DepositCurrency,
): DepositPromotionTier[] {
  if (settings.currency !== currency) return [];

  if (!settings.useTierMilestones) {
    return [
      {
        id: 'global-flat',
        minAmount: settings.flatMinAmount,
        maxAmount: null,
        bonusPercent: settings.flatBonusPercent,
        currency,
      },
    ];
  }

  return settings.tiers.filter((t) => t.currency === currency);
}

export function formatPromotionEndLabel(endsAt: string | null): string | null {
  if (!endsAt) return null;
  const d = new Date(endsAt);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Chuyển ISO → value cho input datetime-local */
export function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromDatetimeLocalValue(value: string): string | null {
  if (!value.trim()) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export function resetTiersForCurrency(currency: DepositCurrency): DepositPromotionTier[] {
  if (currency === 'VND') {
    return DEFAULT_GLOBAL_DEPOSIT_PROMOTION.tiers.map((t) => ({ ...t, id: `global-vnd-${Date.now()}` }));
  }
  return getDefaultTiersForCurrency('USD');
}
