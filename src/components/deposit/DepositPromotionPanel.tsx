import { Gift, Sparkles } from 'lucide-react';
import type { DepositCurrency, DepositPromotionTier } from '../../types/payment';
import {
  calcDepositBonus,
  formatTierRange,
  getPromotionTierForAmount,
} from '../../services/depositPromotion';
import { formatMinDeposit } from '../../services/paymentConfig';

interface DepositPromotionPanelProps {
  enabled: boolean;
  tiers: DepositPromotionTier[];
  currency: DepositCurrency;
  amount: number;
  /** Tên chương trình (KM toàn cục) */
  campaignName?: string;
  /** Nhãn hết hạn, VD: "31/05/2026 23:59" */
  endsAtLabel?: string | null;
}

export function DepositPromotionPanel({
  enabled,
  tiers,
  currency,
  amount,
  campaignName,
  endsAtLabel,
}: DepositPromotionPanelProps) {
  if (!enabled || !tiers.some((t) => t.currency === currency)) {
    return null;
  }

  const currencyTiers = tiers
    .filter((t) => t.currency === currency)
    .sort((a, b) => a.minAmount - b.minAmount);

  const activeTier =
    amount > 0 ? getPromotionTierForAmount(amount, currency, tiers) : null;
  const bonusAmount = activeTier ? calcDepositBonus(amount, activeTier.bonusPercent) : 0;

  return (
    <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50/90 to-white p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Gift className="h-4 w-4 text-violet-600" />
          <div>
            <p className="text-sm font-black text-violet-900">
              {campaignName?.trim() || 'Khuyến mãi nạp tiền'}
            </p>
            {endsAtLabel ? (
              <p className="text-[10px] font-medium text-violet-700/80">Hết hạn: {endsAtLabel}</p>
            ) : null}
          </div>
        </div>
      </div>

      <ul className="space-y-1.5">
        {currencyTiers.map((tier) => {
          const isActive = activeTier?.id === tier.id;
          return (
            <li
              key={tier.id}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-[12px] ${
                isActive
                  ? 'bg-violet-100 font-bold text-violet-900 ring-1 ring-violet-200'
                  : 'bg-white/80 text-zinc-600'
              }`}
            >
              <span>{formatTierRange(tier, currency)}</span>
              <span className="font-black text-violet-700">+{tier.bonusPercent}%</span>
            </li>
          );
        })}
      </ul>

      {amount > 0 && activeTier ? (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-violet-200 bg-white/90 px-3 py-2.5">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
          <div className="text-[12px]">
            <p className="font-bold text-violet-900">
              Bạn được thưởng thêm +{activeTier.bonusPercent}% (
              {formatMinDeposit(bonusAmount, currency)})
            </p>
            <p className="mt-0.5 text-zinc-600">
              Tổng cộng vào ví:{' '}
              <strong className="text-brand-primary">
                {formatMinDeposit(amount + bonusAmount, currency)}
              </strong>
            </p>
          </div>
        </div>
      ) : (
        <p className="mt-2 text-[11px] text-violet-700/80">
          Nhập số tiền để xem mức khuyến mãi áp dụng.
        </p>
      )}
    </div>
  );
}
