import { useState, useEffect } from 'react';
import {
  CreditCard,
  Building2,
  Link2,
  Key,
  Webhook,
  CheckCircle2,
  XCircle,
  Settings,
  RefreshCw,
  Plus,
  Eye,
  EyeOff,
  Copy,
  Zap,
  Shield,
  X,
  Activity,
  Trash2,
  Layers,
  Type,
  Gift,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AddProviderModal, TransactionDetailModal } from './PaymentsModals';
import type {
  BankCatalogEntry,
  DepositCurrency,
  Environment,
  GatewayStatus,
  PaymentGateway,
  PaymentGlobalSettings,
  Transaction,
} from '../../types/payment';
import { DEFAULT_MIN_DEPOSIT_USD, DEFAULT_MIN_DEPOSIT_VND } from '../../types/payment';
import {
  loadGateways,
  saveGateways,
  loadGlobalSettings,
  saveGlobalSettings,
  formatMinDeposit,
} from '../../services/paymentConfig';
import {
  buildDepositTransferContent,
  DEPOSIT_SYNTAX_OPTIONS,
  MOCK_DEPOSIT_USER,
} from '../../services/depositContent';
import { formatPromotionSummary, getDefaultTiersForCurrency } from '../../services/depositPromotion';
import { GatewayPromotionTiersEditor } from '../../components/admin/GatewayPromotionTiersEditor';
import {
  initialPaymentGateways,
  initialTransactions,
  BANK_CATALOG,
  THIRD_PARTY_CATALOG,
  catalogToGateway,
} from './paymentData';
function formatMoney(amount: number) {
  return `${amount.toLocaleString('vi-VN')}\u00a0đ`;
}

function StatusPill({ status }: { status: GatewayStatus }) {
  const map = {
    connected: { label: 'Đã kết nối', className: 'bg-emerald-50 text-emerald-700 ring-emerald-100' },
    disconnected: { label: 'Chưa kết nối', className: 'bg-zinc-100 text-zinc-600 ring-zinc-200' },
    error: { label: 'Lỗi API', className: 'bg-red-50 text-red-600 ring-red-100' },
  };
  const s = map[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ring-1 ${s.className}`}>
      {status === 'connected' ? <CheckCircle2 className="h-3 w-3" /> : status === 'error' ? <XCircle className="h-3 w-3" /> : null}
      {s.label}
    </span>
  );
}

type GatewayConfigTab = 'settings' | 'promotion';

const GATEWAY_CONFIG_TABS: { id: GatewayConfigTab; label: string; icon: typeof Settings }[] = [
  { id: 'settings', label: 'API & Nạp tiền', icon: Settings },
  { id: 'promotion', label: 'Khuyến mãi', icon: Gift },
];

function GatewayConfigModal({
  gateway,
  onClose,
  onSave,
  onTest,
}: {
  gateway: PaymentGateway;
  onClose: () => void;
  onSave: (updated: PaymentGateway) => void;
  onTest: (gateway: PaymentGateway) => void;
}) {
  const [form, setForm] = useState(gateway);
  const [activeTab, setActiveTab] = useState<GatewayConfigTab>('settings');
  const [showSecret, setShowSecret] = useState(false);
  const [apiKey, setApiKey] = useState('sk_live_••••••••••••••••');
  const [secretKey, setSecretKey] = useState('••••••••••••••••••••');

  useEffect(() => {
    setForm(gateway);
    setActiveTab('settings');
  }, [gateway]);

  return (
    <div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between border-b border-slate-100 px-6 py-4"
          style={{ background: `linear-gradient(135deg, ${gateway.color}15, white)` }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-xs font-black text-white"
              style={{ backgroundColor: gateway.color }}
            >
              {gateway.bankCode}
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800">Cấu hình API — {gateway.shortName}</h3>
              <p className="text-[11px] text-slate-500">
                {form.providerType === 'third_party'
                  ? 'Nhà cung cấp thanh toán thứ 3'
                  : 'Tích hợp cổng thanh toán ngân hàng'}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 hover:bg-white">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 border-b border-slate-100 bg-slate-50/80 px-6 py-3 text-center text-[11px]">
          <div>
            <p className="text-slate-400">Doanh thu hôm nay</p>
            <p className="font-bold tabular-nums text-slate-800">{formatMoney(form.todayVolume)}</p>
          </div>
          <div>
            <p className="text-slate-400">Đồng bộ</p>
            <p className="font-medium text-slate-700">{form.lastSync}</p>
          </div>
          <div>
            <p className="text-slate-400">Trạng thái</p>
            <div className="mt-0.5 flex justify-center">
              <StatusPill status={form.status} />
            </div>
          </div>
        </div>

        <div className="flex gap-1 border-b border-slate-100 bg-slate-50/50 px-4 pt-2">
          {GATEWAY_CONFIG_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 rounded-t-lg px-4 py-2.5 text-[12px] font-bold transition-colors ${
                  isActive
                    ? 'border border-b-0 border-slate-200 bg-white text-brand-primary shadow-sm'
                    : 'text-slate-500 hover:bg-white/60 hover:text-slate-700'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <form
          className="space-y-4 p-6"
          onSubmit={(e) => {
            e.preventDefault();
            onSave({
              ...form,
              status: form.merchantId ? 'connected' : 'disconnected',
              lastSync: new Date().toLocaleString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }),
            });
          }}
        >
          {activeTab === 'settings' && (
          <>
          <div>
            <label className="mb-2 block text-xs font-bold uppercase text-slate-500">Môi trường</label>
            <select
              value={form.environment}
              onChange={(e) => setForm({ ...form, environment: e.target.value as Environment })}
              className={inputClass}
            >
              <option value="sandbox">Sandbox (thử nghiệm)</option>
              <option value="production">Production (thật)</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-xs font-bold uppercase text-slate-500">Merchant ID</label>
            <input
              value={form.merchantId}
              onChange={(e) => setForm({ ...form, merchantId: e.target.value })}
              placeholder="TAPHOMMO_VCB_001"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-bold uppercase text-slate-500">API Endpoint</label>
            <input
              value={form.apiEndpoint}
              onChange={(e) => setForm({ ...form, apiEndpoint: e.target.value })}
              className={`${inputClass} font-mono text-[12px]`}
            />
          </div>
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase text-slate-500">
              <Key className="h-3.5 w-3.5" /> API Key
            </label>
            <div className="relative">
              <input
                type={showSecret ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className={`${inputClass} pr-10 font-mono text-[12px]`}
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="mb-2 block text-xs font-bold uppercase text-slate-500">Secret Key</label>
            <input
              type={showSecret ? 'text' : 'password'}
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className={`${inputClass} font-mono text-[12px]`}
            />
          </div>
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase text-slate-500">
              <Webhook className="h-3.5 w-3.5" /> Webhook URL
            </label>
            <div className="flex gap-2">
              <input
                value={form.webhookUrl}
                onChange={(e) => setForm({ ...form, webhookUrl: e.target.value })}
                className={`${inputClass} flex-1 font-mono text-[12px]`}
              />
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(form.webhookUrl)}
                className="shrink-0 rounded-xl border border-slate-200 px-3 hover:bg-slate-50"
                title="Sao chép"
              >
                <Copy className="h-4 w-4 text-slate-500" />
              </button>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
            <p className="text-xs font-bold uppercase text-slate-500">Nạp tiền (trang khách hàng)</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[11px] font-bold text-slate-500">Nạp tối thiểu</label>
                <input
                  type="number"
                  min={0}
                  step={form.minDepositCurrency === 'USD' ? 0.01 : 1}
                  value={form.minDepositAmount}
                  onChange={(e) =>
                    setForm({ ...form, minDepositAmount: Number(e.target.value) || 0 })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-bold text-slate-500">Loại tiền</label>
                <select
                  value={form.minDepositCurrency}
                  onChange={(e) => {
                    const currency = e.target.value as DepositCurrency;
                    setForm({
                      ...form,
                      minDepositCurrency: currency,
                      minDepositAmount:
                        currency === 'USD' ? DEFAULT_MIN_DEPOSIT_USD : DEFAULT_MIN_DEPOSIT_VND,
                      depositPromotionTiers: getDefaultTiersForCurrency(currency),
                    });
                  }}
                  className={inputClass}
                >
                  <option value="VND">VND (Việt Nam đồng)</option>
                  <option value="USD">USD (Đô la Mỹ)</option>
                </select>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Mặc định: {formatMinDeposit(DEFAULT_MIN_DEPOSIT_VND, 'VND')} hoặc{' '}
              {formatMinDeposit(DEFAULT_MIN_DEPOSIT_USD, 'USD')}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[11px] font-bold text-slate-500">Số tài khoản nhận</label>
                <input
                  value={form.accountNumber}
                  onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                  placeholder="VD: 1023456789"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-bold text-slate-500">Chủ tài khoản</label>
                <input
                  value={form.accountHolder}
                  onChange={(e) => setForm({ ...form, accountHolder: e.target.value })}
                  placeholder="VD: TAPHOAMMO VN"
                  className={inputClass}
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Dùng cho mã QR VietQR trên trang nạp tiền của khách.
            </p>
            <div>
              <label className="mb-1.5 block text-[11px] font-bold text-slate-500">
                Lưu ý nạp tiền riêng cổng này
              </label>
              <textarea
                value={form.depositNote}
                onChange={(e) => setForm({ ...form, depositNote: e.target.value })}
                rows={3}
                placeholder="Hiển thị khi khách chọn cổng này trên trang nạp tiền..."
                className={`${inputClass} resize-y text-[13px] font-medium`}
              />
            </div>
          </div>
          </>
          )}

          {activeTab === 'promotion' && (
          <div className="space-y-3">
            <p className="rounded-lg border border-violet-100 bg-violet-50/60 px-3 py-2 text-[11px] text-violet-800">
              Bậc khuyến mãi áp dụng theo loại tiền đã chọn ở tab{' '}
              <strong>API & Nạp tiền</strong> ({form.minDepositCurrency}).
            </p>
            <GatewayPromotionTiersEditor
              enabled={form.depositPromotionEnabled}
              tiers={form.depositPromotionTiers}
              currency={form.minDepositCurrency}
              onEnabledChange={(depositPromotionEnabled) =>
                setForm({ ...form, depositPromotionEnabled })
              }
              onTiersChange={(depositPromotionTiers) =>
                setForm({ ...form, depositPromotionTiers })
              }
              embedded
            />
          </div>
          )}

          <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
            <div>
              <p className="text-sm font-bold text-slate-800">Kích hoạt cổng</p>
              <p className="text-[12px] text-slate-500">Bật/tắt nhận thanh toán qua cổng này</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form.enabled}
              onClick={() => setForm({ ...form, enabled: !form.enabled })}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                form.enabled ? 'bg-brand-primary' : 'bg-zinc-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  form.enabled ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onTest(form)}
              disabled={form.status === 'disconnected'}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white py-3 text-[12px] font-bold text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Zap className="h-4 w-4" />
              Test kết nối
            </button>
            <button
              type="submit"
              className="flex-[2] rounded-xl bg-brand-primary py-3 text-sm font-black text-white shadow-md shadow-emerald-200 hover:bg-emerald-600"
            >
              Lưu cấu hình
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputClass =
  'w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10';

const ALL_BANK_TEMPLATES: BankCatalogEntry[] = [
  ...initialPaymentGateways.map((g) => ({
    id: g.id,
    bankCode: g.bankCode,
    bankName: g.bankName,
    shortName: g.shortName,
    color: g.color,
    apiEndpoint: g.apiEndpoint,
    webhookUrl: g.webhookUrl,
    providerType: g.providerType,
  })),
  ...BANK_CATALOG.filter((c) => !initialPaymentGateways.some((g) => g.id === c.id)),
];

function GatewayBankTable({
  gateways,
  onOpenConfig,
  onToggle,
  onDelete,
}: {
  gateways: PaymentGateway[];
  onOpenConfig: (gateway: PaymentGateway) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm"
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wide text-slate-600">Ngân hàng</th>
              <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wide text-slate-600">Trạng thái</th>
              <th className="whitespace-nowrap px-4 py-3 text-right text-[11px] font-black uppercase tracking-wide text-slate-600">Doanh thu hôm nay</th>
              <th className="hidden px-4 py-3 text-left text-[11px] font-black uppercase tracking-wide text-slate-600 lg:table-cell">Đồng bộ</th>
              <th className="px-4 py-3 text-center text-[11px] font-black uppercase tracking-wide text-slate-600">Bật</th>
              <th className="w-40 px-4 py-3 text-right text-[11px] font-black uppercase tracking-wide text-slate-600">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {gateways.map((gateway) => (
              <tr
                key={gateway.id}
                onClick={() => onOpenConfig(gateway)}
                className={`cursor-pointer border-b border-slate-100 transition-colors hover:bg-emerald-50/40 ${!gateway.enabled ? 'opacity-60' : ''}`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[10px] font-black text-white"
                      style={{ backgroundColor: gateway.color }}
                    >
                      {gateway.bankCode}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                      <p className="text-sm font-bold text-zinc-900">{gateway.shortName}</p>
                      {gateway.providerType === 'third_party' && (
                        <span className="rounded-full bg-violet-100 px-1.5 py-0.5 text-[9px] font-bold text-violet-700">
                          NCC thứ 3
                        </span>
                      )}
                    </div>
                      <p className="truncate text-[11px] text-zinc-500">{gateway.bankName}</p>
                      <p className="text-[10px] font-semibold text-brand-primary">
                        Tối thiểu {formatMinDeposit(gateway.minDepositAmount, gateway.minDepositCurrency)}
                      </p>
                      {gateway.depositPromotionEnabled ? (
                        <p className="mt-0.5 text-[10px] font-medium text-violet-600">
                          KM nạp:{' '}
                          {formatPromotionSummary(
                            gateway.depositPromotionTiers,
                            gateway.minDepositCurrency,
                          )}
                        </p>
                      ) : (
                        <p className="mt-0.5 text-[10px] text-zinc-400">KM nạp: tắt</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <StatusPill status={gateway.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-bold tabular-nums text-zinc-800">
                  {formatMoney(gateway.todayVolume)}
                </td>
                <td className="hidden px-4 py-3 text-[12px] text-zinc-500 lg:table-cell">{gateway.lastSync}</td>
                <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={gateway.enabled}
                    onClick={() => onToggle(gateway.id)}
                    className={`relative mx-auto block h-6 w-11 rounded-full transition-colors ${
                      gateway.enabled ? 'bg-brand-primary' : 'bg-zinc-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        gateway.enabled ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                </td>
                <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => onOpenConfig(gateway)}
                      className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100"
                    >
                      <Settings className="h-3.5 w-3.5" />
                      Cài đặt
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(gateway.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] font-bold text-red-600 hover:bg-red-100"
                      title="Xóa khỏi bảng"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="border-t border-slate-100 px-4 py-2.5 text-[11px] text-zinc-400">
        Bấm vào dòng hoặc nút <strong className="text-zinc-600">Cài đặt</strong> để mở popup cấu hình API
      </p>
    </div>
  );
}

export default function PaymentsSection() {
  const [gateways, setGateways] = useState<PaymentGateway[]>(() =>
    loadGateways(initialPaymentGateways)
  );
  const [transactions] = useState<Transaction[]>(initialTransactions);
  const [configGateway, setConfigGateway] = useState<PaymentGateway | null>(null);
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [showAddThirdPartyModal, setShowAddThirdPartyModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [globalSettings, setGlobalSettings] = useState(() => loadGlobalSettings());
  const {
    globalWebhook,
    autoConfirm,
    globalDepositNote,
    depositSyntaxEnabled,
    depositSyntaxType,
    depositPrefix,
  } = globalSettings;

  const depositContentPreview = buildDepositTransferContent(globalSettings, MOCK_DEPOSIT_USER);

  useEffect(() => {
    saveGateways(gateways);
  }, [gateways]);

  useEffect(() => {
    saveGlobalSettings(globalSettings);
  }, [globalSettings]);

  const connectedCount = gateways.filter((g) => g.status === 'connected' && g.enabled).length;
  const totalVolume = gateways.reduce((s, g) => s + g.todayVolume, 0);
  const pendingCount = transactions.filter((t) => t.status === 'pending').length;

  const saveGateway = (updated: PaymentGateway) => {
    setGateways((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
    setConfigGateway(null);
  };

  const existingBankIds = new Set(gateways.map((g) => g.id));

  const handleAddProvider = (entry: BankCatalogEntry) => {
    setGateways((prev) => [...prev, catalogToGateway(entry)]);
    setShowAddBankModal(false);
    setShowAddThirdPartyModal(false);
  };

  const handleDeleteBank = (id: string) => {
    const bank = gateways.find((g) => g.id === id);
    if (!bank) return;
    if (!window.confirm(`Xóa ${bank.shortName} khỏi bảng tích hợp API?`)) return;
    setGateways((prev) => prev.filter((g) => g.id !== id));
  };

  const testConnection = (gateway: PaymentGateway) => {
    alert(
      gateway.status === 'connected'
        ? `Kết nối ${gateway.shortName} thành công.\nPhản hồi: 200 OK — latency 124ms`
        : `Không thể kết nối ${gateway.shortName}. Kiểm tra Merchant ID và API Key.`
    );
  };

  const txStatus = {
    success: { label: 'Thành công', className: 'bg-emerald-50 text-emerald-600' },
    pending: { label: 'Chờ xử lý', className: 'bg-amber-100 text-amber-700' },
    failed: { label: 'Thất bại', className: 'bg-red-100 text-red-700' },
  };

  return (
    <div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-black tracking-tight text-zinc-900">Cổng thanh toán (Payment Gateway)</h2>
          <p className="mt-0.5 text-[13px] font-medium text-zinc-500">
            Tích hợp API ngân hàng — webhook, merchant & xác thực giao dịch
          </p>
        </div>
        <div className="flex flex-wrap gap-2 self-start">
          <button
            type="button"
            onClick={() => setShowAddBankModal(true)}
            className="flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-[12px] font-bold text-white shadow-md shadow-emerald-200 hover:bg-emerald-600"
          >
            <Plus className="h-4 w-4" />
            Thêm ngân hàng
          </button>
          <button
            type="button"
            onClick={() => setShowAddThirdPartyModal(true)}
            className="flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-[12px] font-bold text-violet-700 hover:bg-violet-100"
          >
            <Layers className="h-4 w-4" />
            Thêm nhà cung cấp thứ 3
          </button>
        </div>
      </div>

      {/* Tổng quan */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Ngân hàng đang hoạt động', value: `${connectedCount}/${gateways.length}`, icon: Building2 },
          { label: 'Doanh thu hôm nay (tất cả cổng)', value: formatMoney(totalVolume), icon: CreditCard },
          { label: 'Giao dịch chờ xử lý', value: String(pendingCount), icon: Activity },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-zinc-200/80 bg-white/90 p-5 shadow-sm backdrop-blur-sm"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                <Icon className="h-5 w-5 text-brand-primary" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{stat.label}</p>
              <p className="mt-1 text-xl font-black tabular-nums text-zinc-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Cài đặt gateway chung */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white/90 p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-brand-primary" />
          <h3 className="text-sm font-bold text-zinc-900">Cài đặt gateway chung</h3>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase text-zinc-500">
              <Link2 className="h-3.5 w-3.5" /> Webhook callback chung
            </label>
            <div className="flex gap-2">
              <input
                value={globalWebhook}
                onChange={(e) => setGlobalSettings((s) => ({ ...s, globalWebhook: e.target.value }))}
                className={`${inputClass} flex-1 font-mono text-[12px]`}
              />
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(globalWebhook)}
                className="shrink-0 rounded-xl border border-slate-200 px-3 hover:bg-sinc-50"
              >
                <Copy className="h-4 w-4 text-slate-500" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/80 px-4 py-3">
            <div>
              <p className="text-sm font-bold text-zinc-800">Tự động xác nhận giao dịch</p>
              <p className="text-[12px] text-zinc-500">Qua webhook khi ngân hàng báo thành công</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={autoConfirm}
              onClick={() => setGlobalSettings((s) => ({ ...s, autoConfirm: !s.autoConfirm }))}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                autoConfirm ? 'bg-brand-primary' : 'bg-zinc-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  autoConfirm ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>
          <div className="mt-4 lg:col-span-2">
            <label className="mb-2 block text-xs font-bold uppercase text-zinc-500">
              Lưu ý nạp tiền chung (trang khách hàng)
            </label>
            <textarea
              value={globalDepositNote}
              onChange={(e) => setGlobalSettings((s) => ({ ...s, globalDepositNote: e.target.value }))}
              rows={4}
              placeholder="Lưu ý hiển thị cho tất cả khách hàng khi vào trang nạp tiền..."
              className={`${inputClass} resize-y text-[13px] font-medium`}
            />
          </div>
        </div>
      </div>

      {/* Cú pháp nội dung nạp tiền */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white/90 p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Type className="h-5 w-5 text-brand-primary" />
          <h3 className="text-sm font-bold text-zinc-900">Cú pháp nội dung nạp tiền</h3>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase text-zinc-500">Trạng thái</label>
            <select
              value={depositSyntaxEnabled ? 'ON' : 'OFF'}
              onChange={(e) =>
                setGlobalSettings((s) => ({
                  ...s,
                  depositSyntaxEnabled: e.target.value === 'ON',
                }))
              }
              className={inputClass}
            >
              <option value="ON">ON</option>
              <option value="OFF">OFF</option>
            </select>
            <p className="mt-1.5 text-[11px] text-zinc-400">
              Bật để khách phải ghi đúng cú pháp khi chuyển khoản.
            </p>
          </div>
          <div>
            <label className="mb-2 block text-xs font-bold uppercase text-zinc-500">Kiểu nạp tiền</label>
            <select
              value={depositSyntaxType}
              onChange={(e) =>
                setGlobalSettings((s) => ({
                  ...s,
                  depositSyntaxType: e.target.value as typeof depositSyntaxType,
                }))
              }
              className={inputClass}
            >
              {DEPOSIT_SYNTAX_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-[11px] text-zinc-400">
              Chọn kiểu nội dung chuyển khoản mà khách hàng sử dụng khi nạp tiền.
            </p>
          </div>
          {depositSyntaxType === 'prefix_id' ? (
            <div>
              <label className="mb-2 block text-xs font-bold uppercase text-zinc-500">Prefix</label>
              <input
                value={depositPrefix}
                onChange={(e) =>
                  setGlobalSettings((s) => ({ ...s, depositPrefix: e.target.value }))
                }
                placeholder="VD: NAPTIEN"
                className={inputClass}
              />
              <p className="mt-1.5 text-[11px] text-zinc-400">
                Không được để trống Prefix. Prefix là nội dung nạp tiền vào hệ thống.
              </p>
            </div>
          ) : (
            <div className="flex items-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50/80 px-4 py-3">
              <p className="text-[12px] text-zinc-500">
                Kiểu <strong className="text-zinc-700">Họ và tên + chuyển tiền</strong> — hệ thống tự
                ghép tên khách (không dấu) + &quot;CHUYEN TIEN&quot;.
              </p>
            </div>
          )}
        </div>
        <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3">
          <p className="text-[10px] font-bold uppercase text-emerald-700">
            Ví dụ nội dung (khách ID {MOCK_DEPOSIT_USER.id})
          </p>
          <p className="mt-1 font-mono text-sm font-bold text-zinc-900">{depositContentPreview}</p>
        </div>
      </div>

      {/* Danh sách ngân hàng */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-900">Tích hợp API ngân hàng</h3>
          <button
            type="button"
            onClick={() => alert('Đang đồng bộ trạng thái tất cả cổng...')}
            className="flex items-center gap-1.5 text-[12px] font-bold text-brand-primary hover:underline"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Đồng bộ tất cả
          </button>
        </div>
        <GatewayBankTable
          gateways={gateways}
          onOpenConfig={setConfigGateway}
          onToggle={(id) =>
            setGateways((prev) => prev.map((g) => (g.id === id ? { ...g, enabled: !g.enabled } : g)))
          }
          onDelete={handleDeleteBank}
        />
      </div>

      {/* Giao dịch gần đây */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/90 shadow-sm">
        <div className="border-b border-zinc-100 px-6 py-4">
          <h3 className="text-sm font-bold text-zinc-900">Giao dịch qua cổng gần đây</h3>
          <p className="text-[12px] text-zinc-500">Log realtime từ webhook ngân hàng</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-6 py-3 text-left text-[11px] font-black uppercase tracking-wide text-slate-600">
                  Mã GD
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-black uppercase tracking-wide text-slate-600">
                  Username
                </th>
                <th className="whitespace-nowrap px-6 py-3 text-left text-[11px] font-black uppercase tracking-wide text-slate-600">
                  Số tiền
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-black uppercase tracking-wide text-slate-600">
                  Ngân hàng
                </th>
                <th className="hidden px-6 py-3 text-left text-[11px] font-black uppercase tracking-wide text-slate-600 xl:table-cell">
                  Nội dung
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-black uppercase tracking-wide text-slate-600">
                  Mã giao dịch
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-black uppercase tracking-wide text-slate-600">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-black uppercase tracking-wide text-slate-600">
                  Thời gian
                </th>
                <th className="w-24 px-6 py-3 text-right text-[11px] font-black uppercase tracking-wide text-slate-600" />
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, index) => (
                <motion.tr
                  key={tx.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.04 }}
                  onClick={() => setSelectedTransaction(tx)}
                  className="cursor-pointer border-b border-slate-100 hover:bg-emerald-50/40"
                >
                  <td className="px-6 py-3 text-sm font-bold text-brand-primary">{tx.id}</td>
                  <td className="px-6 py-3 text-[13px] text-slate-600">{tx.username}</td>
                  <td className="whitespace-nowrap px-6 py-3 text-sm font-black tabular-nums text-red-600">
                    {formatMoney(tx.amount)}
                  </td>
                  <td className="px-6 py-3 text-[13px] text-slate-500">{tx.bank}</td>
                  <td className="hidden max-w-[200px] truncate px-6 py-3 text-[12px] text-slate-600 xl:table-cell" title={tx.content}>
                    {tx.content}
                  </td>
                  <td className="px-6 py-3 font-mono text-[12px] text-slate-500">{tx.ref}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${txStatus[tx.status].className}`}
                    >
                      {txStatus[tx.status].label}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-[12px] font-medium text-slate-400">{tx.date}</td>
                  <td className="px-6 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setSelectedTransaction(tx)}
                      className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Chi tiết
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {configGateway && (
          <GatewayConfigModal
            key={configGateway.id}
            gateway={configGateway}
            onClose={() => setConfigGateway(null)}
            onSave={saveGateway}
            onTest={testConnection}
          />
        )}
                {showAddBankModal && (
          <AddProviderModal
            key="add-bank"
            title="Thêm ngân hàng"
            subtitle="Chọn ngân hàng để tích hợp API"
            banks={ALL_BANK_TEMPLATES}
            existingIds={existingBankIds}
            onClose={() => setShowAddBankModal(false)}
            onAdd={handleAddProvider}
          />
        )}
        {showAddThirdPartyModal && (
          <AddProviderModal
            key="add-3p"
            title="Thêm nhà cung cấp thứ 3"
            subtitle="MoMo, VNPay, PayPal, Stripe..."
            banks={THIRD_PARTY_CATALOG}
            existingIds={existingBankIds}
            onClose={() => setShowAddThirdPartyModal(false)}
            onAdd={handleAddProvider}
          />
        )}
        {selectedTransaction && (
          <TransactionDetailModal
            key={selectedTransaction.id}
            tx={selectedTransaction}
            onClose={() => setSelectedTransaction(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
