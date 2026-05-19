import type { PaymentGateway, PaymentGlobalSettings } from '../types/payment';
import { DEFAULT_MIN_DEPOSIT_USD, DEFAULT_MIN_DEPOSIT_VND } from '../types/payment';

const GATEWAYS_KEY = 'taphoammo_payment_gateways';
const SETTINGS_KEY = 'taphoammo_payment_settings';

export const DEFAULT_GLOBAL_SETTINGS: PaymentGlobalSettings = {
  globalWebhook: 'https://taphoammo.vn/api/webhook/payment',
  autoConfirm: true,
  globalDepositNote:
    'Vui lòng chuyển khoản đúng nội dung và số tiền tối thiểu. Hệ thống tự động cộng tiền trong 1–15 phút sau khi ngân hàng xác nhận.',
  depositSyntaxEnabled: true,
  depositSyntaxType: 'prefix_id',
  depositPrefix: 'NAPTIEN',
};

function normalizeGateway(raw: Partial<PaymentGateway> & Record<string, unknown>): PaymentGateway {
  const currency = raw.minDepositCurrency === 'USD' ? 'USD' : 'VND';
  const defaultMin = currency === 'USD' ? DEFAULT_MIN_DEPOSIT_USD : DEFAULT_MIN_DEPOSIT_VND;
  return {
    id: String(raw.id ?? ''),
    bankCode: String(raw.bankCode ?? ''),
    bankName: String(raw.bankName ?? ''),
    shortName: String(raw.shortName ?? ''),
    color: String(raw.color ?? '#059669'),
    status: (raw.status as PaymentGateway['status']) ?? 'disconnected',
    environment: (raw.environment as PaymentGateway['environment']) ?? 'sandbox',
    merchantId: String(raw.merchantId ?? ''),
    apiEndpoint: String(raw.apiEndpoint ?? ''),
    webhookUrl: String(raw.webhookUrl ?? ''),
    lastSync: String(raw.lastSync ?? '—'),
    todayVolume: Number(raw.todayVolume ?? 0),
    enabled: Boolean(raw.enabled),
    providerType: raw.providerType === 'third_party' ? 'third_party' : 'bank',
    minDepositAmount: Number(raw.minDepositAmount ?? defaultMin),
    minDepositCurrency: currency,
    depositNote: String(raw.depositNote ?? ''),
    accountNumber: String(raw.accountNumber ?? ''),
    accountHolder: String(raw.accountHolder ?? 'TAPHOAMMO'),
  };
}

function normalizeGlobalSettings(raw: Partial<PaymentGlobalSettings>): PaymentGlobalSettings {
  return {
    ...DEFAULT_GLOBAL_SETTINGS,
    ...raw,
    depositSyntaxEnabled: raw.depositSyntaxEnabled !== false,
    depositSyntaxType:
      raw.depositSyntaxType === 'fullname_transfer' ? 'fullname_transfer' : 'prefix_id',
    depositPrefix: String(raw.depositPrefix ?? DEFAULT_GLOBAL_SETTINGS.depositPrefix),
  };
}

export function loadGateways(fallback: PaymentGateway[]): PaymentGateway[] {
  try {
    const raw = localStorage.getItem(GATEWAYS_KEY);
    if (!raw) return fallback.map((g) => normalizeGateway(g));
    const parsed = JSON.parse(raw) as unknown[];
    if (!Array.isArray(parsed)) return fallback.map((g) => normalizeGateway(g));
    return parsed.map((item) => normalizeGateway(item as PaymentGateway));
  } catch {
    return fallback.map((g) => normalizeGateway(g));
  }
}

export function saveGateways(gateways: PaymentGateway[]) {
  localStorage.setItem(GATEWAYS_KEY, JSON.stringify(gateways));
}

export function loadGlobalSettings(): PaymentGlobalSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_GLOBAL_SETTINGS };
    return normalizeGlobalSettings(JSON.parse(raw) as Partial<PaymentGlobalSettings>);
  } catch {
    return { ...DEFAULT_GLOBAL_SETTINGS };
  }
}

export function saveGlobalSettings(settings: PaymentGlobalSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function formatMinDeposit(amount: number, currency: 'VND' | 'USD') {
  if (currency === 'USD') {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  }
  return `${amount.toLocaleString('vi-VN')}\u00a0đ`;
}
