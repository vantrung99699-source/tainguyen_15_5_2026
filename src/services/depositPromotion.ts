import type { DepositCurrency, DepositPromotionTier } from '../types/payment';
import { formatMinDeposit } from './paymentConfig';

export const DEFAULT_DEPOSIT_PROMOTION_TIERS: DepositPromotionTier[] = [
  { id: 'prom-usd-1', minAmount: 0, maxAmount: 100, bonusPercent: 1, currency: 'USD' },
  { id: 'prom-usd-2', minAmount: 100, maxAmount: 200, bonusPercent: 2, currency: 'USD' },
  { id: 'prom-usd-3', minAmount: 200, maxAmount: null, bonusPercent: 3, currency: 'USD' },
  {
    id: 'prom-vnd-1',
    minAmount: 0,
    maxAmount: 2_000_000,
    bonusPercent: 1,
    currency: 'VND',
  },
  {
    id: 'prom-vnd-2',
    minAmount: 2_000_000,
    maxAmount: 5_000_000,
    bonusPercent: 2,
    currency: 'VND',
  },
  { id: 'prom-vnd-3', minAmount: 5_000_000, maxAmount: null, bonusPercent: 3, currency: 'VND' },
];

export function getDefaultTiersForCurrency(currency: DepositCurrency): DepositPromotionTier[] {
  return DEFAULT_DEPOSIT_PROMOTION_TIERS.filter((t) => t.currency === currency).map((t, i) => ({
    ...t,
    id: `prom-${currency.toLowerCase()}-${i + 1}-${Date.now()}`,
  }));
}

export function normalizePromotionTier(
  raw: Partial<DepositPromotionTier>,
  index: number,
): DepositPromotionTier {
  const currency = raw.currency === 'USD' ? 'USD' : 'VND';
  return {
    id: String(raw.id ?? `prom-${Date.now()}-${index}`),
    minAmount: Math.max(0, Number(raw.minAmount ?? 0)),
    maxAmount:
      raw.maxAmount === null || raw.maxAmount === undefined
        ? null
        : Math.max(0, Number(raw.maxAmount)),
    bonusPercent: Math.max(0, Math.min(100, Number(raw.bonusPercent ?? 0))),
    currency,
  };
}

/** Tìm bậc khuyến mãi áp dụng cho số tiền nạp */
export function getPromotionTierForAmount(
  amount: number,
  currency: DepositCurrency,
  tiers: DepositPromotionTier[],
): DepositPromotionTier | null {
  if (amount <= 0 || !tiers.length) return null;

  const matches = tiers
    .filter((t) => t.currency === currency && amount >= t.minAmount)
    .filter((t) => t.maxAmount === null || amount <= t.maxAmount);

  if (!matches.length) return null;
  return matches.sort((a, b) => b.bonusPercent - a.bonusPercent)[0];
}

export function calcDepositBonus(amount: number, bonusPercent: number) {
  return Math.round((amount * bonusPercent) / 100);
}

export function formatTierRange(
  tier: DepositPromotionTier,
  currency: DepositCurrency,
): string {
  const min = formatMinDeposit(tier.minAmount, currency);
  if (tier.maxAmount === null) {
    return `Từ ${min} trở lên`;
  }
  const max = formatMinDeposit(tier.maxAmount, currency);
  return `${min} – ${max}`;
}

export function formatPromotionSummary(
  tiers: DepositPromotionTier[],
  currency: DepositCurrency,
): string {
  const list = tiers
    .filter((t) => t.currency === currency)
    .sort((a, b) => a.minAmount - b.minAmount);
  if (!list.length) return 'Chưa cấu hình';
  return list.map((t) => `${formatTierRange(t, currency)}: +${t.bonusPercent}%`).join(' · ');
}
