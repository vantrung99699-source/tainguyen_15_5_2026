import { Gift, Plus, Trash2 } from 'lucide-react';
import type { DepositCurrency, DepositPromotionTier } from '../../types/payment';
import { formatTierRange } from '../../services/depositPromotion';

const inputClass =
  'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10';

const noSpinnerClass =
  '[appearance:textfield] [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none';

interface GatewayPromotionTiersEditorProps {
  enabled: boolean;
  tiers: DepositPromotionTier[];
  currency: DepositCurrency;
  onEnabledChange: (enabled: boolean) => void;
  onTiersChange: (tiers: DepositPromotionTier[]) => void;
  embedded?: boolean;
  /** Ẩn công tắc bật/tắt (dùng khi bật KM ở form cha) */
  hideEnableToggle?: boolean;
}

function newTier(currency: DepositCurrency): DepositPromotionTier {
  return {
    id: `prom-${Date.now()}`,
    minAmount: 0,
    maxAmount: null,
    bonusPercent: 1,
    currency,
  };
}

export function GatewayPromotionTiersEditor({
  enabled,
  tiers,
  currency,
  onEnabledChange,
  onTiersChange,
  embedded,
  hideEnableToggle,
}: GatewayPromotionTiersEditorProps) {
  const rows = tiers
    .filter((t) => t.currency === currency)
    .sort((a, b) => a.minAmount - b.minAmount);

  const updateTier = (id: string, patch: Partial<DepositPromotionTier>) => {
    onTiersChange(tiers.map((t) => (t.id === id ? { ...t, ...patch, currency } : t)));
  };

  const removeTier = (id: string) => {
    onTiersChange(tiers.filter((t) => t.id !== id));
  };

  const addTier = () => {
    onTiersChange([...tiers, newTier(currency)]);
  };

  return (
    <div className={embedded ? 'space-y-4' : 'rounded-xl border border-violet-100 bg-violet-50/40 p-4'}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Gift className="h-4 w-4 text-violet-600" />
          <div>
            <p className="text-xs font-bold text-violet-900">
              {embedded ? `Bậc khuyến mãi (${currency})` : 'Khuyến mãi nạp tiền'}
            </p>
            {!embedded && (
              <p className="text-[11px] text-violet-700/80">
                Bậc thưởng % theo số tiền nạp ({currency})
              </p>
            )}
          </div>
        </div>
        {!hideEnableToggle ? (
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => onEnabledChange(!enabled)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
              enabled ? 'bg-brand-primary' : 'bg-zinc-300'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                enabled ? 'translate-x-5' : ''
              }`}
            />
          </button>
        ) : null}
      </div>

      {enabled ? (
        <>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={addTier}
              className="flex items-center gap-1 rounded-lg bg-brand-primary px-2.5 py-1 text-[11px] font-bold text-white"
            >
              <Plus className="h-3.5 w-3.5" />
              Thêm bậc
            </button>
          </div>
          {rows.length === 0 ? (
            <p className="py-4 text-center text-[12px] text-violet-700/70">Chưa có bậc — bấm Thêm bậc.</p>
          ) : (
            <div className="space-y-2">
              {rows.map((tier) => (
                <div
                  key={tier.id}
                  className="grid grid-cols-[1fr_1fr_88px_auto] items-center gap-2 rounded-lg border border-violet-100 bg-white p-2"
                >
                  <input
                    type="number"
                    min={0}
                    step={currency === 'USD' ? 0.01 : 1000}
                    value={tier.minAmount}
                    onChange={(e) =>
                      updateTier(tier.id, { minAmount: Number(e.target.value) || 0 })
                    }
                    className={`${inputClass} ${noSpinnerClass}`}
                    placeholder="Từ"
                    title="Từ"
                  />
                  <input
                    type="number"
                    min={0}
                    step={currency === 'USD' ? 0.01 : 1000}
                    value={tier.maxAmount ?? ''}
                    onChange={(e) => {
                      const v = e.target.value.trim();
                      updateTier(tier.id, { maxAmount: v === '' ? null : Number(v) || 0 });
                    }}
                    className={`${inputClass} ${noSpinnerClass}`}
                    placeholder="Đến (trống = ∞)"
                    title="Đến"
                  />
                  <div className="relative">
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      max={100}
                      step={0.1}
                      value={tier.bonusPercent}
                      onChange={(e) =>
                        updateTier(tier.id, { bonusPercent: Number(e.target.value) || 0 })
                      }
                      className={`${inputClass} pr-8 tabular-nums ${noSpinnerClass}`}
                      aria-label="Phần trăm khuyến mãi"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-black text-violet-600">
                      %
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTier(tier.id)}
                    className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                    aria-label="Xóa"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <p className="col-span-full text-[10px] font-medium text-violet-600">
                    {formatTierRange(tier, currency)} → +{tier.bonusPercent}%
                  </p>
                </div>
              ))}
            </div>
          )}
          <p className="text-[10px] text-violet-600/80">
            VD: 0–100 → 1%, 100–200 → 2%. Để trống &quot;Đến&quot; = không giới hạn.
          </p>
        </>
      ) : (
        <p className="text-[11px] text-violet-700/70">Đang tắt — khách không thấy KM nạp cho cổng này.</p>
      )}
    </div>
  );
}
