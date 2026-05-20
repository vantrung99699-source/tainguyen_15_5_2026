import { useEffect, useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { CalendarClock, Gift, Megaphone, Save, Sparkles } from 'lucide-react';
import type { DepositCurrency, GlobalDepositPromotionSettings } from '../../types/payment';
import { GatewayPromotionTiersEditor } from '../../components/admin/GatewayPromotionTiersEditor';
import { formatPromotionSummary } from '../../services/depositPromotion';
import {
  formatPromotionEndLabel,
  fromDatetimeLocalValue,
  GLOBAL_DEPOSIT_PROMOTION_UPDATED,
  isGlobalDepositPromotionActive,
  loadGlobalDepositPromotion,
  resetTiersForCurrency,
  saveGlobalDepositPromotion,
  toDatetimeLocalValue,
} from '../../services/globalDepositPromotion';

const inputClass =
  'w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-800 outline-none transition-all focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10';

const noSpinnerClass =
  '[appearance:textfield] [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none';

export function GlobalDepositPromotionSection() {
  const [form, setForm] = useState<GlobalDepositPromotionSettings>(() =>
    loadGlobalDepositPromotion(),
  );
  const [saved, setSaved] = useState(false);
  const [endsAtLocal, setEndsAtLocal] = useState(() =>
    toDatetimeLocalValue(loadGlobalDepositPromotion().endsAt),
  );

  useEffect(() => {
    const sync = () => {
      const loaded = loadGlobalDepositPromotion();
      setForm(loaded);
      setEndsAtLocal(toDatetimeLocalValue(loaded.endsAt));
    };
    window.addEventListener(GLOBAL_DEPOSIT_PROMOTION_UPDATED, sync);
    return () => window.removeEventListener(GLOBAL_DEPOSIT_PROMOTION_UPDATED, sync);
  }, []);

  const isActive = isGlobalDepositPromotionActive(form);
  const endLabel = formatPromotionEndLabel(form.endsAt);

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    const payload: GlobalDepositPromotionSettings = {
      ...form,
      endsAt: fromDatetimeLocalValue(endsAtLocal),
    };
    saveGlobalDepositPromotion(payload);
    setForm(payload);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  const setCurrency = (currency: DepositCurrency) => {
    setForm((prev) => ({
      ...prev,
      currency,
      tiers: resetTiersForCurrency(currency),
    }));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-50 to-emerald-50 ring-1 ring-violet-100">
          <Megaphone className="h-5 w-5 text-brand-primary" />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-black tracking-tight text-zinc-900">Khuyến mãi nạp tiền</h2>
          <p className="mt-0.5 text-[12px] font-medium text-zinc-500">
            Thưởng % khi khách chuyển khoản nạp — áp dụng toàn hệ thống, không phải mã coupon
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-zinc-900">Bật chương trình</p>
              <p className="mt-0.5 text-[12px] text-zinc-500">
                {isActive
                  ? 'Đang áp dụng cho mọi cổng nạp tiền'
                  : form.enabled && endLabel
                    ? `Đã hết hạn (${endLabel})`
                    : form.enabled
                      ? 'Đang chờ lưu hoặc kiểm tra cấu hình'
                      : 'Khách chưa nhận thưởng nạp'}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form.enabled}
              onClick={() => setForm({ ...form, enabled: !form.enabled })}
              className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                form.enabled ? 'bg-brand-primary' : 'bg-zinc-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                  form.enabled ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>

          {isActive && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50/80 px-3 py-2.5 text-[12px] text-emerald-900">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Tóm tắt:{' '}
                {formatPromotionSummary(
                  form.useTierMilestones
                    ? form.tiers
                    : [
                        {
                          id: 'preview',
                          minAmount: form.flatMinAmount,
                          maxAmount: null,
                          bonusPercent: form.flatBonusPercent,
                          currency: form.currency,
                        },
                      ],
                  form.currency,
                )}
                {endLabel ? ` · Hết hạn: ${endLabel}` : ' · Không giới hạn thời gian'}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-4 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase text-slate-500">
                Tên chương trình
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="VD: KM nạp tháng 5"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase text-slate-500">
                <CalendarClock className="h-3.5 w-3.5" />
                Hết hạn khuyến mãi
              </label>
              <input
                type="datetime-local"
                value={endsAtLocal}
                onChange={(e) => setEndsAtLocal(e.target.value)}
                className={inputClass}
              />
              <p className="mt-1.5 text-[11px] text-zinc-400">Để trống = không giới hạn thời gian</p>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase text-slate-500">Loại tiền áp dụng</label>
            <select
              value={form.currency}
              onChange={(e) => setCurrency(e.target.value as DepositCurrency)}
              className={inputClass}
            >
              <option value="VND">VND — Việt Nam đồng</option>
              <option value="USD">USD — Đô la Mỹ</option>
            </select>
            <p className="mt-1.5 text-[11px] text-zinc-400">
              Chỉ áp dụng khi khách nạp bằng {form.currency}. Cổng loại tiền khác không dùng KM toàn cục.
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-violet-100 bg-violet-50/30 p-5 shadow-sm">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={form.useTierMilestones}
              onChange={(e) => setForm({ ...form, useTierMilestones: e.target.checked })}
              className="mt-1 h-4 w-4 rounded border-violet-300 text-brand-primary focus:ring-brand-primary/20"
            />
            <span>
              <span className="text-sm font-bold text-violet-900">Bậc theo mốc nạp</span>
              <span className="mt-0.5 block text-[12px] text-violet-700/80">
                VD: từ 1.000.000đ thưởng 10%, từ 2.000.000đ thưởng 20%. Bỏ chọn để dùng một mức % cố định.
              </span>
            </span>
          </label>

          {form.useTierMilestones ? (
            <GatewayPromotionTiersEditor
              enabled
              tiers={form.tiers}
              currency={form.currency}
              onEnabledChange={() => {}}
              onTiersChange={(tiers) => setForm({ ...form, tiers })}
              embedded
              hideEnableToggle
            />
          ) : (
            <div className="grid gap-3 rounded-xl border border-violet-100 bg-white p-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[11px] font-bold text-slate-500">
                  Nạp tối thiểu được KM
                </label>
                <input
                  type="number"
                  min={0}
                  step={form.currency === 'USD' ? 0.01 : 1000}
                  value={form.flatMinAmount}
                  onChange={(e) =>
                    setForm({ ...form, flatMinAmount: Number(e.target.value) || 0 })
                  }
                  className={`${inputClass} ${noSpinnerClass}`}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-bold text-slate-500">
                  % thưởng thêm
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={form.flatBonusPercent}
                    onChange={(e) =>
                      setForm({ ...form, flatBonusPercent: Number(e.target.value) || 0 })
                    }
                    className={`${inputClass} pr-8 tabular-nums ${noSpinnerClass}`}
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-violet-600">
                    %
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-3 text-[12px] font-bold text-white shadow-sm shadow-emerald-500/30 transition-all hover:from-emerald-600 hover:to-emerald-700 sm:max-w-xs"
        >
          <Save className="h-4 w-4" />
          {saved ? 'Đã lưu!' : 'Lưu cấu hình khuyến mãi nạp'}
        </button>
      </form>

      <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/80 px-4 py-3 text-[11px] text-zinc-500">
        <Gift className="mb-1 inline h-3.5 w-3.5 text-zinc-400" /> Mục{' '}
        <strong className="text-zinc-700">Mã khuyến mãi</strong> dùng cho coupon/voucher đơn hàng — khác
        với khuyến mãi nạp tiền tại đây. KM từng ngân hàng (nếu có) chỉ dùng khi chương trình toàn cục
        đang tắt hoặc hết hạn.
      </div>
    </motion.div>
  );
}
