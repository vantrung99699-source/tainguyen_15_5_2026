import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Ticket, Trash2, Power, Pencil, Save, Shuffle } from 'lucide-react';
import type { PromoAppliesTo, PromoCode, PromoDiscountType } from '../../types/promoCode';
import {
  createPromoCode,
  deletePromoCode,
  formatPromoDiscountLabel,
  loadPromoCodes,
  PROMO_CODES_UPDATED,
  upsertPromoCode,
} from '../../services/promoCodeService';
import { fromDatetimeLocalValue, toDatetimeLocalValue } from '../../services/globalDepositPromotion';
import { ModernDateTimePicker } from '../../components/admin/ModernDateTimePicker';

const inputClass =
  'w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm font-medium text-zinc-800 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10';

const PROMO_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Tạo mã coupon ngẫu nhiên (tránh ký tự dễ nhầm 0/O, 1/I) */
function generateRandomPromoCode(length = 10): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += PROMO_CODE_CHARS[Math.floor(Math.random() * PROMO_CODE_CHARS.length)];
  }
  return code;
}

const emptyForm = (): Omit<PromoCode, 'id' | 'usedCount' | 'createdAt'> => ({
  code: generateRandomPromoCode(),
  name: '',
  discountType: 'percent',
  discountValue: 10,
  minOrderAmount: 1000,
  maxDiscountAmount: 1_000_000_000,
  usageLimit: null,
  perUserLimit: 1,
  appliesTo: 'all',
  enabled: true,
  startsAt: null,
  expiresAt: null,
});

export function PromoCodesAdminSection() {
  const [list, setList] = useState(loadPromoCodes);
  const [form, setForm] = useState(emptyForm);
  const [startsLocal, setStartsLocal] = useState('');
  const [expiresLocal, setExpiresLocal] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const sync = () => setList(loadPromoCodes());

  useEffect(() => {
    window.addEventListener(PROMO_CODES_UPDATED, sync);
    return () => window.removeEventListener(PROMO_CODES_UPDATED, sync);
  }, []);

  const resetForm = () => {
    setForm(emptyForm());
    setStartsLocal('');
    setExpiresLocal('');
    setEditingId(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) return;
    const payload = {
      ...form,
      code: form.code.trim().toUpperCase(),
      startsAt: startsLocal ? fromDatetimeLocalValue(startsLocal) : null,
      expiresAt: expiresLocal ? fromDatetimeLocalValue(expiresLocal) : null,
    };
    if (editingId) {
      upsertPromoCode({
        ...payload,
        id: editingId,
        usedCount: list.find((p) => p.id === editingId)?.usedCount ?? 0,
        createdAt: list.find((p) => p.id === editingId)?.createdAt ?? new Date().toISOString(),
      });
    } else {
      createPromoCode(payload);
    }
    resetForm();
    sync();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  const startEdit = (p: PromoCode) => {
    setEditingId(p.id);
    setForm({
      code: p.code,
      name: p.name,
      discountType: p.discountType,
      discountValue: p.discountValue,
      minOrderAmount: p.minOrderAmount,
      maxDiscountAmount: p.maxDiscountAmount,
      usageLimit: p.usageLimit,
      perUserLimit: p.perUserLimit,
      appliesTo: p.appliesTo,
      enabled: p.enabled,
      startsAt: p.startsAt,
      expiresAt: p.expiresAt,
    });
    setStartsLocal(p.startsAt ? toDatetimeLocalValue(p.startsAt) : '');
    setExpiresLocal(p.expiresAt ? toDatetimeLocalValue(p.expiresAt) : '');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 ring-1 ring-emerald-100">
          <Ticket className="h-5 w-5 text-brand-primary" />
        </div>
        <div>
          <h2 className="text-base font-black text-zinc-900">Mã khuyến mãi</h2>
          <p className="text-[12px] text-zinc-500">Coupon giảm giá khi mua ngay / đặt trước</p>
        </div>
      </div>

      <form
        onSubmit={handleSave}
        className="max-w-3xl space-y-4 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm"
      >
        <p className="text-sm font-black text-zinc-800">
          {editingId ? 'Sửa mã' : 'Tạo mã mới'}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-[11px] font-bold uppercase text-zinc-400">Mã CODE</span>
            <div className="mt-1 flex gap-2">
              <input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="WELCOME10"
                className={`${inputClass} min-w-0 flex-1 font-bold uppercase`}
                required
              />
              <button
                type="button"
                title="Tạo mã ngẫu nhiên"
                onClick={() => setForm({ ...form, code: generateRandomPromoCode() })}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-[12px] font-bold text-zinc-700 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-brand-primary"
              >
                <Shuffle className="h-4 w-4" />
                <span className="hidden sm:inline">Ngẫu nhiên</span>
              </button>
            </div>
          </label>
          <label className="block">
            <span className="text-[11px] font-bold uppercase text-zinc-400">Tên hiển thị</span>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Giảm 10% đơn đầu"
              className={`${inputClass} mt-1`}
            />
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="text-[11px] font-bold uppercase text-zinc-400">Loại giảm</span>
            <select
              value={form.discountType}
              onChange={(e) =>
                setForm({ ...form, discountType: e.target.value as PromoDiscountType })
              }
              className={`${inputClass} mt-1`}
            >
              <option value="percent">Phần trăm (%)</option>
              <option value="fixed">Số tiền cố định (đ)</option>
            </select>
          </label>
          <label className="block">
            <span className="text-[11px] font-bold uppercase text-zinc-400">Giá trị</span>
            <input
              type="number"
              min={0}
              value={form.discountValue}
              onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) || 0 })}
              className={`${inputClass} mt-1`}
            />
          </label>
          <label className="block">
            <span className="text-[11px] font-bold uppercase text-zinc-400">Áp dụng</span>
            <select
              value={form.appliesTo}
              onChange={(e) =>
                setForm({ ...form, appliesTo: e.target.value as PromoAppliesTo })
              }
              className={`${inputClass} mt-1`}
            >
              <option value="all">Mua + Đặt trước</option>
              <option value="instant">Chỉ mua ngay</option>
              <option value="preorder">Chỉ đặt trước</option>
            </select>
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block">
            <span className="text-[11px] font-bold uppercase text-zinc-400">Đơn tối thiểu (đ)</span>
            <input
              type="number"
              min={0}
              value={form.minOrderAmount}
              onChange={(e) => setForm({ ...form, minOrderAmount: Number(e.target.value) || 0 })}
              className={`${inputClass} mt-1`}
            />
          </label>
          <label className="block">
            <span className="text-[11px] font-bold uppercase text-zinc-400">Giảm tối đa (đ)</span>
            <input
              type="number"
              min={0}
              value={form.maxDiscountAmount}
              onChange={(e) =>
                setForm({ ...form, maxDiscountAmount: Number(e.target.value) || 0 })
              }
              className={`${inputClass} mt-1`}
              disabled={form.discountType !== 'percent'}
            />
          </label>
          <label className="block">
            <span className="text-[11px] font-bold uppercase text-zinc-400">Lượt dùng tổng</span>
            <input
              type="number"
              min={0}
              value={form.usageLimit ?? ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  usageLimit: e.target.value === '' ? null : Number(e.target.value) || 0,
                })
              }
              placeholder="Không giới hạn"
              className={`${inputClass} mt-1`}
            />
          </label>
          <label className="block">
            <span className="text-[11px] font-bold uppercase text-zinc-400">Lượt / user</span>
            <input
              type="number"
              min={1}
              value={form.perUserLimit}
              onChange={(e) => setForm({ ...form, perUserLimit: Number(e.target.value) || 1 })}
              className={`${inputClass} mt-1`}
            />
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <ModernDateTimePicker
            label="Bắt đầu"
            value={startsLocal}
            onChange={setStartsLocal}
            placeholder="Chọn thời điểm bắt đầu"
          />
          <ModernDateTimePicker
            label="Hết hạn"
            value={expiresLocal}
            onChange={setExpiresLocal}
            placeholder="Chọn thời điểm hết hạn"
          />
        </div>
        <label className="flex items-center gap-2 text-sm font-bold text-zinc-700">
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
            className="rounded border-zinc-300 text-brand-primary"
          />
          Bật mã
        </label>
        <div className="flex flex-wrap gap-2">
          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-2.5 text-sm font-bold text-zinc-700"
            >
              Hủy
            </button>
          ) : null}
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-600"
          >
            <Save className="h-4 w-4" />
            {saved ? 'Đã lưu!' : editingId ? 'Cập nhật' : 'Tạo mã'}
          </button>
        </div>
      </form>

      <div className="rounded-2xl border border-zinc-200/80 bg-white shadow-sm overflow-hidden">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead>
            <tr className="bg-zinc-50/80 text-[11px] font-bold uppercase text-zinc-500">
              <th className="px-4 py-3">Mã</th>
              <th className="px-4 py-3">Giảm</th>
              <th className="px-4 py-3">Áp dụng</th>
              <th className="px-4 py-3">Đã dùng</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className="border-t border-zinc-50">
                <td className="px-4 py-3">
                  <p className="font-black text-zinc-900">{p.code}</p>
                  <p className="text-xs text-zinc-500">{p.name}</p>
                </td>
                <td className="px-4 py-3 font-bold text-brand-primary">
                  {formatPromoDiscountLabel(p)}
                </td>
                <td className="px-4 py-3 text-xs text-zinc-600">
                  {p.appliesTo === 'all'
                    ? 'Tất cả'
                    : p.appliesTo === 'instant'
                      ? 'Mua ngay'
                      : 'Đặt trước'}
                </td>
                <td className="px-4 py-3 tabular-nums text-zinc-700">
                  {p.usedCount}
                  {p.usageLimit != null ? ` / ${p.usageLimit}` : ''}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-bold ${p.enabled ? 'text-emerald-600' : 'text-zinc-400'}`}
                  >
                    {p.enabled ? 'Bật' : 'Tắt'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        upsertPromoCode({ ...p, enabled: !p.enabled });
                        sync();
                      }}
                      className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100"
                    >
                      <Power className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(p)}
                      className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        deletePromoCode(p.id);
                        sync();
                      }}
                      className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-zinc-400">
        Mã demo: <strong>WELCOME10</strong> (10%, đơn từ 50k), <strong>GIAM50K</strong> (50k, đơn từ
        200k)
      </p>
    </motion.div>
  );
}
