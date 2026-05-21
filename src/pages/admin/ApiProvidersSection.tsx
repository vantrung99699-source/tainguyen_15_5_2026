import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Plug, Plus, Save, Trash2, Pencil, Wifi, X, RefreshCw } from 'lucide-react';
import type { ApiProvider } from '../../types/apiProvider';
import { STANDARD_API_PROTOCOL } from '../../types/apiProvider';
import {
  API_PROVIDERS_UPDATED,
  deleteApiProvider,
  loadApiProviders,
  upsertApiProvider,
} from '../../services/apiProviderConfig';
import { fetchProviderBalance, testProviderApiConnection } from '../../services/itemApiService';
import {
  checkAndNotifyLowProviderBalance,
  formatProviderBalanceDisplay,
} from '../../services/apiProviderBalanceAlert';

const inputClass =
  'w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm font-medium text-zinc-800 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10';

interface ProviderBalanceInfo {
  balance: number;
  currency: string;
}

type BalanceState = ProviderBalanceInfo | { error: string } | 'loading';

const emptyProvider = (): ApiProvider => ({
  id: `ap-${Date.now()}`,
  name: '',
  baseUrl: '',
  apiKey: '',
  authType: 'bearer',
  enabled: true,
  note: '',
  serviceCurrency: 'USD',
  exchangeRateToVnd: 27000,
  balanceCurrency: 'VND',
  lowBalanceThreshold: 200_000,
  telegramBalanceAlert: true,
});

function renderBalanceCell(balance: number, provider: ApiProvider) {
  const display = formatProviderBalanceDisplay(balance, provider);
  const isLow =
    provider.lowBalanceThreshold > 0 && balance < provider.lowBalanceThreshold;
  return (
    <div className="leading-tight">
      <div
        className={`text-[12px] font-semibold tabular-nums ${isLow ? 'text-amber-700' : ''}`}
      >
        {display.main}
      </div>
      {display.sub ? (
        <div className="mt-0.5 text-[10px] font-medium text-zinc-500">{display.sub}</div>
      ) : null}
    </div>
  );
}

function formatThresholdCell(provider: ApiProvider): string {
  if (provider.lowBalanceThreshold <= 0) return '—';
  if (provider.balanceCurrency === 'USD') {
    return `$${provider.lowBalanceThreshold.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  }
  return `${provider.lowBalanceThreshold.toLocaleString('vi-VN')}đ`;
}

function formatExchangeRateCell(provider: ApiProvider): string {
  if (provider.balanceCurrency !== 'USD') return '—';
  return provider.exchangeRateToVnd.toLocaleString('vi-VN');
}

const thBase = 'border border-zinc-200 px-2.5 py-2.5 text-[10px] font-bold uppercase leading-tight text-zinc-500';
const tdBase = 'border border-zinc-200 px-2.5 py-2.5 align-top';
const thBalanceGroup = `${thBase} bg-amber-50/80 text-amber-900/70`;
const tdBalanceGroup = `${tdBase} bg-amber-50/20`;

export function ApiProvidersSection() {
  const [list, setList] = useState(loadApiProviders);
  const [form, setForm] = useState<ApiProvider | null>(null);
  const [saved, setSaved] = useState(false);
  const [testMsg, setTestMsg] = useState('');
  const [testOk, setTestOk] = useState<boolean | null>(null);
  const [testing, setTesting] = useState(false);
  const [balances, setBalances] = useState<Record<string, BalanceState>>({});

  const sync = () => setList(loadApiProviders());

  const refreshBalances = useCallback(async (providers: ApiProvider[]) => {
    const enabled = providers.filter((p) => p.enabled && p.baseUrl.trim());
    if (enabled.length === 0) return;

    setBalances((prev) => {
      const next = { ...prev };
      for (const p of enabled) next[p.id] = 'loading';
      return next;
    });

    await Promise.all(
      enabled.map(async (p) => {
        const res = await fetchProviderBalance(p);
        setBalances((prev) => ({
          ...prev,
          [p.id]: res.ok
            ? { balance: res.balance, currency: res.currency }
            : { error: res.error },
        }));
        if (res.ok) {
          await checkAndNotifyLowProviderBalance(p, res.balance);
        }
      }),
    );
  }, []);

  useEffect(() => {
    window.addEventListener(API_PROVIDERS_UPDATED, sync);
    return () => window.removeEventListener(API_PROVIDERS_UPDATED, sync);
  }, []);

  useEffect(() => {
    void refreshBalances(list);
  }, [list, refreshBalances]);

  const openForm = (provider: ApiProvider) => {
    setForm({ ...provider });
    setTestMsg('');
    setTestOk(null);
  };

  const closeForm = () => {
    setForm(null);
    setTestMsg('');
    setTestOk(null);
  };

  const handleSave = () => {
    if (!form || !form.name.trim() || !form.baseUrl.trim()) return;
    upsertApiProvider({ ...form, authType: 'bearer' });
    closeForm();
    sync();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  const runTest = async () => {
    if (!form) return;
    setTesting(true);
    setTestMsg('');
    const res = await testProviderApiConnection(form);
    setTestOk(res.ok);
    setTestMsg(res.ok ? res.message : res.error);
    setTesting(false);
    if (res.ok) void refreshBalances([form]);
  };

  const modal =
    form &&
    createPortal(
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4"
          onClick={closeForm}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-zinc-100 px-6 py-4">
              <h3 className="text-base font-black text-zinc-900">
                {list.some((p) => p.id === form.id) ? 'Sửa nhà cung cấp' : 'Thêm nhà cung cấp'}
              </h3>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
              <label className="block">
                <span className="text-[11px] font-bold uppercase text-zinc-400">Tên nhà cung cấp *</span>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={`${inputClass} mt-1`}
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-bold uppercase text-zinc-400">URL API *</span>
                <input
                  value={form.baseUrl}
                  onChange={(e) => setForm({ ...form, baseUrl: e.target.value })}
                  placeholder="https://api.doi-tac.com"
                  className={`${inputClass} mt-1 font-mono text-[12px]`}
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-bold uppercase text-zinc-400">API Key / Token</span>
                <input
                  type="password"
                  value={form.apiKey}
                  onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                  placeholder="Khóa API tài khoản đại lý"
                  className={`${inputClass} mt-1 font-mono text-[12px]`}
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-bold uppercase text-zinc-400">Ghi chú</span>
                <textarea
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  rows={2}
                  className={`${inputClass} mt-1 resize-y`}
                />
              </label>

              <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-4 space-y-3">
                <p className="text-[11px] font-bold uppercase text-sky-800">Quy đổi giá dịch vụ</p>
                <p className="text-[11px] leading-relaxed text-zinc-600">
                  Đơn giá từ <code className="text-[10px]">/api/services</code> được quy đổi sang VND
                  trước khi áp dụng % hoặc +đ trên form tạo mặt hàng.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase text-zinc-500">
                      Tiền tệ giá NCC
                    </span>
                    <select
                      value={form.serviceCurrency}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          serviceCurrency: e.target.value === 'VND' ? 'VND' : 'USD',
                        })
                      }
                      className={`${inputClass} mt-1`}
                    >
                      <option value="USD">USD (đô la)</option>
                      <option value="VND">VND (đồng)</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase text-zinc-500">
                      Tỉ giá 1 USD → VND
                    </span>
                    <input
                      type="number"
                      min={1}
                      step={100}
                      value={form.exchangeRateToVnd}
                      disabled={form.serviceCurrency === 'VND'}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          exchangeRateToVnd: Math.max(1, Number(e.target.value) || 27000),
                        })
                      }
                      className={`${inputClass} mt-1 tabular-nums disabled:bg-zinc-100 disabled:text-zinc-400`}
                    />
                    {form.serviceCurrency === 'VND' ? (
                      <span className="mt-1 block text-[10px] text-zinc-500">
                        Giá NCC đã là VND — không cần quy đổi.
                      </span>
                    ) : null}
                  </label>
                </div>
              </div>

              <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4 space-y-3">
                <p className="text-[11px] font-bold uppercase text-amber-800">Số dư & cảnh báo</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase text-zinc-500">Tiền tệ số dư</span>
                    <select
                      value={form.balanceCurrency}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          balanceCurrency: e.target.value === 'USD' ? 'USD' : 'VND',
                        })
                      }
                      className={`${inputClass} mt-1`}
                    >
                      <option value="VND">VND (đồng)</option>
                      <option value="USD">USD (đô la)</option>
                    </select>
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="text-[10px] font-bold uppercase text-zinc-500">
                      Ngưỡng cảnh báo ({form.balanceCurrency === 'USD' ? 'USD' : 'VND'})
                    </span>
                    <input
                      type="number"
                      min={0}
                      step={form.balanceCurrency === 'USD' ? 1 : 1000}
                      value={form.lowBalanceThreshold}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          lowBalanceThreshold: Math.max(0, Number(e.target.value) || 0),
                        })
                      }
                      className={`${inputClass} mt-1 tabular-nums`}
                    />
                  </label>
                </div>
                <label className="flex items-start gap-2 text-[12px] font-medium text-zinc-700">
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={form.telegramBalanceAlert}
                    onChange={(e) =>
                      setForm({ ...form, telegramBalanceAlert: e.target.checked })
                    }
                  />
                  <span>
                    Gửi cảnh báo Telegram khi số dư thấp hơn ngưỡng (cần bật sự kiện &quot;Số dư NCC
                    thấp&quot; trong Cài đặt Telegram)
                  </span>
                </label>
              </div>

              <label className="flex items-center gap-2 text-sm font-bold text-zinc-700">
                <input
                  type="checkbox"
                  checked={form.enabled}
                  onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
                />
                Bật nhà cung cấp
              </label>
              <button
                type="button"
                disabled={testing || !form.baseUrl.trim()}
                onClick={runTest}
                className="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-white px-4 py-2 text-[12px] font-bold text-sky-800 hover:bg-sky-50 disabled:opacity-50"
              >
                <Wifi className="h-4 w-4" />
                {testing ? 'Đang kiểm tra…' : 'Kiểm tra kết nối'}
              </button>
              {testMsg ? (
                <p className={`text-[12px] font-medium ${testOk ? 'text-emerald-700' : 'text-red-600'}`}>
                  {testMsg}
                </p>
              ) : null}
            </div>

            <div className="flex shrink-0 gap-2 border-t border-zinc-100 px-6 py-4">
              <button
                type="button"
                onClick={closeForm}
                className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-sm font-bold text-zinc-600 hover:bg-zinc-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!form.name.trim() || !form.baseUrl.trim()}
                className="flex-[2] inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary py-2.5 text-sm font-bold text-white disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saved ? 'Đã lưu!' : 'Lưu'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>,
      document.body,
    );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {modal}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 ring-1 ring-sky-100">
            <Plug className="h-5 w-5 text-sky-700" />
          </div>
          <div>
            <h2 className="text-base font-black text-zinc-900">Nhà cung cấp API</h2>
            <p className="mt-0.5 max-w-xl text-[12px] text-zinc-500">
              Cấu hình URL, API key một lần cho mỗi đối tác. Mặt hàng chỉ chọn NCC + ID service.
              Endpoint chuẩn: đặt hàng{' '}
              <code className="text-[11px]">{STANDARD_API_PROTOCOL.orderPath}</code>, kho{' '}
              <code className="text-[11px]">{STANDARD_API_PROTOCOL.stockPath}</code>.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => openForm(emptyProvider())}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-600"
        >
          <Plus className="h-4 w-4" />
          Thêm nhà cung cấp
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-zinc-200/80 bg-white shadow-sm">
        <div className="flex items-center justify-end border-b border-zinc-100 px-4 py-2">
          <button
            type="button"
            onClick={() => void refreshBalances(list)}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-sky-700 hover:text-sky-900"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Làm mới số dư
          </button>
        </div>
        <table className="w-full min-w-[1280px] table-fixed border-collapse text-left text-sm">
          <colgroup>
            <col className="w-[128px]" />
            <col />
            <col className="w-[72px]" />
            <col className="w-[96px]" />
            <col className="w-[112px]" />
            <col className="w-[132px]" />
            <col className="w-[76px]" />
            <col className="w-[84px]" />
            <col className="w-[84px]" />
          </colgroup>
          <thead>
            <tr className="bg-zinc-50/80">
              <th className={thBase}>Tên</th>
              <th className={thBase}>URL API</th>
              <th className={`${thBalanceGroup} border-l-2 border-l-sky-200/80 bg-sky-50/80 text-sky-900/70`}>
                Giá NCC
              </th>
              <th className={`${thBalanceGroup} bg-sky-50/80 text-sky-900/70`}>
                <span className="block">Tỉ giá DV</span>
                <span className="block text-[9px] font-semibold normal-case text-sky-800/60">
                  1 USD
                </span>
              </th>
              <th className={`${thBalanceGroup} border-l-2 border-l-amber-200/80`}>Ngưỡng CB</th>
              <th className={thBalanceGroup}>Số dư</th>
              <th className={thBalanceGroup}>Telegram</th>
              <th className={thBase}>Trạng thái</th>
              <th className={`${thBase} text-center`}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="border border-zinc-200 px-4 py-10 text-center text-sm text-zinc-400"
                >
                  Chưa có nhà cung cấp. Bấm &quot;Thêm nhà cung cấp&quot; để bắt đầu.
                </td>
              </tr>
            ) : (
              list.map((p) => {
                const bal = balances[p.id];
                return (
                  <tr key={p.id}>
                    <td className={`${tdBase} font-bold text-zinc-900`}>
                      <span className="line-clamp-2 break-words text-[13px]">{p.name}</span>
                    </td>
                    <td className={`${tdBase} font-mono text-[11px] text-zinc-600`}>
                      <span className="line-clamp-2 break-all" title={p.baseUrl || undefined}>
                        {p.baseUrl || '—'}
                      </span>
                    </td>
                    <td
                      className={`${tdBase} border-l-2 border-l-sky-200/80 bg-sky-50/20 text-center`}
                    >
                      <span className="inline-flex rounded-md bg-white px-1.5 py-0.5 text-[10px] font-bold text-zinc-700 ring-1 ring-sky-200/80">
                        {p.serviceCurrency}
                      </span>
                    </td>
                    <td
                      className={`${tdBase} bg-sky-50/20 text-right text-[11px] tabular-nums text-zinc-600`}
                    >
                      {p.serviceCurrency === 'USD' ? (
                        <span title={`1 USD = ${formatExchangeRateCell(p)} VND`}>
                          {formatExchangeRateCell(p)}
                          <span className="block text-[9px] font-medium text-zinc-400">VND</span>
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td
                      className={`${tdBalanceGroup} border-l-2 border-l-amber-200/80 text-right text-[11px] font-semibold tabular-nums text-zinc-800`}
                    >
                      {formatThresholdCell(p)}
                    </td>
                    <td className={`${tdBalanceGroup} text-zinc-800`}>
                      {bal === 'loading' ? (
                        <span className="text-[11px] font-medium text-zinc-400">Đang tải…</span>
                      ) : bal && 'error' in bal ? (
                        <span className="text-[11px] font-medium text-red-500" title={bal.error}>
                          Lỗi
                        </span>
                      ) : bal && 'balance' in bal ? (
                        renderBalanceCell(bal.balance, p)
                      ) : (
                        <span className="text-[11px] text-zinc-400">—</span>
                      )}
                    </td>
                    <td className={`${tdBalanceGroup} text-center`}>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          p.telegramBalanceAlert
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-zinc-100 text-zinc-400'
                        }`}
                        title={
                          p.telegramBalanceAlert
                            ? 'Gửi Telegram khi số dư dưới ngưỡng'
                            : 'Không gửi cảnh báo'
                        }
                      >
                        {p.telegramBalanceAlert ? 'Bật' : 'Tắt'}
                      </span>
                    </td>
                    <td className={`${tdBase} text-center`}>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          p.enabled
                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
                            : 'bg-zinc-100 text-zinc-500'
                        }`}
                      >
                        {p.enabled ? 'Bật' : 'Tắt'}
                      </span>
                    </td>
                    <td className={`${tdBase} px-1.5`}>
                      <div className="flex justify-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => openForm({ ...p })}
                          className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100"
                          title="Sửa"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Xóa nhà cung cấp "${p.name}"?`)) {
                              deleteApiProvider(p.id);
                              sync();
                            }
                          }}
                          className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
