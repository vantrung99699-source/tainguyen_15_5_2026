import type { ApiProvider } from '../types/apiProvider';
import { DEFAULT_API_PROVIDERS } from '../types/apiProvider';

export const API_PROVIDERS_UPDATED = 'taphoammo-api-providers-updated';
const STORAGE_KEY = 'taphoammo_api_providers';

function emit() {
  window.dispatchEvent(new CustomEvent(API_PROVIDERS_UPDATED));
}

function normalizeProvider(raw: Partial<ApiProvider> & Record<string, unknown>): ApiProvider {
  const legacyUrl = String(raw.defaultBaseUrl ?? '');
  return {
    id: String(raw.id ?? `ap-${Date.now()}`),
    name: String(raw.name ?? ''),
    baseUrl: String(raw.baseUrl ?? legacyUrl)
      .trim()
      .replace(/\/+$/, ''),
    apiKey: String(raw.apiKey ?? ''),
    authType:
      raw.authType === 'api_key' || raw.authType === 'none' ? raw.authType : 'bearer',
    enabled: raw.enabled !== false,
    note: String(raw.note ?? ''),
    serviceCurrency: raw.serviceCurrency === 'VND' ? 'VND' : 'USD',
    exchangeRateToVnd: Math.max(1, Number(raw.exchangeRateToVnd) || 27000),
    balanceCurrency: raw.balanceCurrency === 'USD' ? 'USD' : 'VND',
    lowBalanceThreshold: Math.max(0, Number(raw.lowBalanceThreshold) || 0),
    telegramBalanceAlert: raw.telegramBalanceAlert !== false,
  };
}

export function loadApiProviders(): ApiProvider[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_API_PROVIDERS.map((p) => ({ ...p }));
    const parsed = JSON.parse(raw) as Partial<ApiProvider>[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_API_PROVIDERS.map((p) => ({ ...p }));
    }
    return parsed.map((p) => normalizeProvider(p));
  } catch {
    return DEFAULT_API_PROVIDERS.map((p) => ({ ...p }));
  }
}

export function saveApiProviders(list: ApiProvider[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.map((p) => normalizeProvider(p))));
  emit();
}

export function getApiProviderById(id: string): ApiProvider | null {
  return loadApiProviders().find((p) => p.id === id && p.enabled) ?? null;
}

export function upsertApiProvider(provider: ApiProvider) {
  const list = loadApiProviders();
  const idx = list.findIndex((p) => p.id === provider.id);
  const next = normalizeProvider(provider);
  if (idx >= 0) list[idx] = next;
  else list.push(next);
  saveApiProviders(list);
}

export function deleteApiProvider(id: string) {
  saveApiProviders(loadApiProviders().filter((p) => p.id !== id));
}
