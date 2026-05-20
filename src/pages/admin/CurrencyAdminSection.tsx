import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Coins, Plus, RefreshCw, Pencil, Trash2 } from 'lucide-react';
import type { Currency, CurrencyRateMode } from '../../types/currency';
import {
  CURRENCY_UPDATED,
  deleteCurrency,
  fetchAutoExchangeRates,
  loadCurrencies,
  loadCurrencySettings,
  saveCurrencySettings,
  setCurrencyEnabled,
  setDefaultCurrency,
  upsertCurrency,
} from '../../services/currencyService';

const emptyForm = (): Omit<Currency, 'id' | 'lastRateUpdate'> => ({
  code: '',
  name: '',
  symbol: '',
  symbolPosition: 'suffix',
  decimals: 0,
  basePerUnit: 1,
  rateMode: 'manual',
  enabled: true,
  isDefault: false,
});

export function CurrencyAdminSection() {
  const [list, setList] = useState<Currency[]>(() => loadCurrencies());
  const [settings, setSettings] = useState(() => loadCurrencySettings());
  const [editing, setEditing] = useState<Currency | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const sync = () => {
    setList(loadCurrencies());
    setSettings(loadCurrencySettings());
  };

  useEffect(() => {
    window.addEventListener(CURRENCY_UPDATED, sync);
    return () => window.removeEventListener(CURRENCY_UPDATED, sync);
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setShowForm(true);
  };

  const openEdit = (c: Currency) => {
    setEditing(c);
    setForm({ ...c });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.code.trim() || !form.name.trim()) return;
    upsertCurrency({ ...form, id: editing?.id });
    setShowForm(false);
    sync();
  };

  const handleAutoRates = async () => {
    setSyncing(true);
    await fetchAutoExchangeRates();
    setSyncing(false);
    sync();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 ring-1 ring-emerald-100">
          <Coins className="h-5 w-5 text-brand-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-black tracking-tight text-zinc-900">Tiền tệ</h2>
          <p className="mt-0.5 text-[12px] font-medium text-zinc-500">
            Đơn vị tiền tệ, tỷ giá quy đổi (gốc VND) và định dạng hiển thị
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2 text-sm font-bold text-white"
        >
          <Plus className="h-4 w-4" /> Thêm tiền tệ
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-zinc-200/70 bg-white p-4">
        <label className="flex items-center gap-2 text-sm font-bold text-zinc-700">
          <input
            type="checkbox"
            checked={settings.autoRateApiEnabled}
            onChange={(e) => {
              saveCurrencySettings({ autoRateApiEnabled: e.target.checked });
              sync();
            }}
            className="h-4 w-4 accent-emerald-600"
          />
          Bật cập nhật tỷ giá tự động (API)
        </label>
        <button
          type="button"
          disabled={syncing}
          onClick={handleAutoRates}
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-100 px-3 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-200 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
          Cập nhật tỷ giá auto
        </button>
        <p className="text-[11px] text-zinc-400">
          Đồng có chế độ &quot;auto&quot; sẽ nhận tỷ giá mock (demo API).
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-zinc-200/70 bg-white shadow-sm">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/80 text-[11px] font-bold uppercase text-zinc-500">
              <th className="px-4 py-3">Mã</th>
              <th className="px-4 py-3">Tên</th>
              <th className="px-4 py-3">Ký hiệu</th>
              <th className="px-4 py-3">1 đơn vị = VND</th>
              <th className="px-4 py-3">Tỷ giá</th>
              <th className="px-4 py-3">Bật</th>
              <th className="px-4 py-3">Mặc định</th>
              <th className="px-4 py-3">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id} className="border-b border-zinc-50">
                <td className="px-4 py-3 font-black">{c.code}</td>
                <td className="px-4 py-3">{c.name}</td>
                <td className="px-4 py-3">
                  {c.symbolPosition === 'prefix' ? `${c.symbol}100` : `100${c.symbol}`}
                </td>
                <td className="px-4 py-3 tabular-nums">
                  {c.basePerUnit.toLocaleString('vi-VN')}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${
                      c.rateMode === 'auto'
                        ? 'bg-sky-100 text-sky-700'
                        : 'bg-zinc-100 text-zinc-600'
                    }`}
                  >
                    {c.rateMode === 'auto' ? 'Auto API' : 'Manual'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={c.enabled}
                    disabled={c.isDefault}
                    onChange={(e) => {
                      setCurrencyEnabled(c.id, e.target.checked);
                      sync();
                    }}
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="radio"
                    name="default-currency"
                    checked={c.isDefault}
                    onChange={() => {
                      setDefaultCurrency(c.id);
                      sync();
                    }}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(c)}
                      className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    {!c.isDefault && (
                      <button
                        type="button"
                        onClick={() => {
                          deleteCurrency(c.id);
                          sync();
                        }}
                        className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-black text-zinc-900">
              {editing ? 'Sửa tiền tệ' : 'Thêm tiền tệ'}
            </h3>
            <div className="mt-4 space-y-3">
              <input
                placeholder="Mã (USD)"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="w-full rounded-xl border px-3 py-2 text-sm"
                disabled={Boolean(editing?.isDefault)}
              />
              <input
                placeholder="Tên tiền tệ"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border px-3 py-2 text-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  placeholder="Ký hiệu"
                  value={form.symbol}
                  onChange={(e) => setForm({ ...form, symbol: e.target.value })}
                  className="rounded-xl border px-3 py-2 text-sm"
                />
                <select
                  value={form.symbolPosition}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      symbolPosition: e.target.value as Currency['symbolPosition'],
                    })
                  }
                  className="rounded-xl border px-3 py-2 text-sm"
                >
                  <option value="prefix">Trước số</option>
                  <option value="suffix">Sau số</option>
                </select>
              </div>
              <input
                type="number"
                placeholder="1 đơn vị = ? VND"
                value={form.basePerUnit}
                onChange={(e) => setForm({ ...form, basePerUnit: Number(e.target.value) })}
                className="w-full rounded-xl border px-3 py-2 text-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min={0}
                  max={4}
                  placeholder="Số thập phân"
                  value={form.decimals}
                  onChange={(e) => setForm({ ...form, decimals: Number(e.target.value) })}
                  className="rounded-xl border px-3 py-2 text-sm"
                />
                <select
                  value={form.rateMode}
                  onChange={(e) =>
                    setForm({ ...form, rateMode: e.target.value as CurrencyRateMode })
                  }
                  className="rounded-xl border px-3 py-2 text-sm"
                >
                  <option value="manual">Tự cấu hình (Manual)</option>
                  <option value="auto">Cập nhật qua API (Auto)</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl px-4 py-2 text-sm font-bold text-zinc-600"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="rounded-xl bg-brand-primary px-4 py-2 text-sm font-bold text-white"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
