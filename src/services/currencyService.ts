import type { Currency, CurrencySettings } from '../types/currency';

const CURRENCIES_KEY = 'taphoammo_currencies';
const SETTINGS_KEY = 'taphoammo_currency_settings';
const CUSTOMER_CURRENCY_KEY = 'taphoammo_customer_currency';

export const CURRENCY_UPDATED = 'taphoammo-currency-updated';

const DEFAULT_CURRENCIES: Currency[] = [
  {
    id: 'cur-vnd',
    code: 'VND',
    name: 'Việt Nam Đồng',
    symbol: 'đ',
    symbolPosition: 'suffix',
    decimals: 0,
    basePerUnit: 1,
    rateMode: 'manual',
    enabled: true,
    isDefault: true,
    lastRateUpdate: null,
  },
  {
    id: 'cur-usd',
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    symbolPosition: 'prefix',
    decimals: 2,
    basePerUnit: 24_000,
    rateMode: 'manual',
    enabled: true,
    isDefault: false,
    lastRateUpdate: null,
  },
  {
    id: 'cur-thb',
    code: 'THB',
    name: 'Thai Baht',
    symbol: '฿',
    symbolPosition: 'prefix',
    decimals: 2,
    basePerUnit: 680,
    rateMode: 'manual',
    enabled: true,
    isDefault: false,
    lastRateUpdate: null,
  },
  {
    id: 'cur-eur',
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    symbolPosition: 'prefix',
    decimals: 2,
    basePerUnit: 26_000,
    rateMode: 'manual',
    enabled: false,
    isDefault: false,
    lastRateUpdate: null,
  },
];

const DEFAULT_SETTINGS: CurrencySettings = {
  baseCurrencyCode: 'VND',
  autoRateApiEnabled: false,
};

/** Tỷ giá mock khi bật auto (so với VND) */
const MOCK_AUTO_RATES: Record<string, number> = {
  USD: 24_150,
  THB: 685,
  EUR: 26_200,
};

function emit() {
  window.dispatchEvent(new CustomEvent(CURRENCY_UPDATED));
}

export function loadCurrencies(): Currency[] {
  try {
    const raw = localStorage.getItem(CURRENCIES_KEY);
    if (!raw) return [...DEFAULT_CURRENCIES];
    const parsed = JSON.parse(raw) as Currency[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...DEFAULT_CURRENCIES];
  } catch {
    return [...DEFAULT_CURRENCIES];
  }
}

export function saveCurrencies(list: Currency[]) {
  localStorage.setItem(CURRENCIES_KEY, JSON.stringify(list));
  emit();
}

export function loadCurrencySettings(): CurrencySettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as CurrencySettings) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveCurrencySettings(patch: Partial<CurrencySettings>) {
  const next = { ...loadCurrencySettings(), ...patch };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  emit();
}

export function getBaseCurrency(): Currency {
  const list = loadCurrencies().filter((c) => c.enabled);
  return list.find((c) => c.isDefault) ?? list[0] ?? DEFAULT_CURRENCIES[0];
}

export function getCurrencyByCode(code: string): Currency | undefined {
  return loadCurrencies().find((c) => c.code.toUpperCase() === code.toUpperCase());
}

export function getEnabledCurrencies() {
  return loadCurrencies().filter((c) => c.enabled);
}

export function loadCustomerCurrencyCode(): string {
  const saved = localStorage.getItem(CUSTOMER_CURRENCY_KEY);
  if (saved) {
    const c = getCurrencyByCode(saved);
    if (c?.enabled) return c.code;
  }
  return getBaseCurrency().code;
}

export function saveCustomerCurrencyCode(code: string) {
  localStorage.setItem(CUSTOMER_CURRENCY_KEY, code.toUpperCase());
  emit();
}

/** Số tiền lưu trong DB luôn là VND (base) */
export function convertFromBase(amountVnd: number, currency: Currency): number {
  if (currency.basePerUnit <= 0) return amountVnd;
  return amountVnd / currency.basePerUnit;
}

export function convertToBase(amount: number, currency: Currency): number {
  return amount * currency.basePerUnit;
}

export function formatCurrencyAmount(amountInCurrency: number, currency: Currency): string {
  const formatted = amountInCurrency.toLocaleString(undefined, {
    minimumFractionDigits: currency.decimals,
    maximumFractionDigits: currency.decimals,
  });
  return currency.symbolPosition === 'prefix'
    ? `${currency.symbol}${formatted}`
    : `${formatted}${currency.symbol}`;
}

export function formatBaseMoney(amountVnd: number, currencyCode?: string): string {
  const code = currencyCode ?? loadCustomerCurrencyCode();
  const currency = getCurrencyByCode(code) ?? getBaseCurrency();
  const converted = convertFromBase(amountVnd, currency);
  return formatCurrencyAmount(converted, currency);
}

export function upsertCurrency(
  input: Omit<Currency, 'id' | 'lastRateUpdate'> & { id?: string },
): Currency {
  const list = loadCurrencies();
  const id = input.id ?? `cur-${Date.now()}`;
  const next: Currency = {
    ...input,
    id,
    code: input.code.toUpperCase(),
    lastRateUpdate: input.rateMode === 'auto' ? new Date().toISOString() : null,
  };
  const idx = list.findIndex((c) => c.id === id || c.code === next.code);
  if (idx >= 0) list[idx] = { ...list[idx], ...next };
  else list.push(next);
  if (next.isDefault) {
    for (const c of list) {
      c.isDefault = c.id === next.id;
    }
  }
  saveCurrencies(list);
  return next;
}

export function setCurrencyEnabled(id: string, enabled: boolean) {
  const list = loadCurrencies();
  const idx = list.findIndex((c) => c.id === id);
  if (idx < 0) return;
  list[idx].enabled = enabled;
  if (!enabled && list[idx].isDefault) {
    list[idx].isDefault = false;
    const vnd = list.find((c) => c.code === 'VND');
    if (vnd) vnd.isDefault = true;
  }
  saveCurrencies(list);
}

export function setDefaultCurrency(id: string) {
  const list = loadCurrencies();
  for (const c of list) {
    c.isDefault = c.id === id;
  }
  saveCurrencies(list);
}

export function deleteCurrency(id: string) {
  const list = loadCurrencies();
  const target = list.find((c) => c.id === id);
  if (!target || target.isDefault) return;
  saveCurrencies(list.filter((c) => c.id !== id));
}

/** Cập nhật tỷ giá tự động (mock API) */
export async function fetchAutoExchangeRates(): Promise<{ ok: boolean; updated: number }> {
  const list = loadCurrencies();
  let updated = 0;
  const now = new Date().toISOString();
  for (const c of list) {
    if (c.rateMode !== 'auto' || c.code === 'VND') continue;
    const rate = MOCK_AUTO_RATES[c.code];
    if (rate) {
      c.basePerUnit = rate;
      c.lastRateUpdate = now;
      updated++;
    }
  }
  saveCurrencies(list);
  saveCurrencySettings({ autoRateApiEnabled: true });
  return { ok: true, updated };
}
