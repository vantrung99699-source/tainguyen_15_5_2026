import type {
  ItemExternalApiConfig,
  EffectiveApiRuntimeConfig,
  ItemApiFieldSync,
  ItemApiPriceMarkup,
  ItemStockSource,
} from '../types/itemApi';
import {
  DEFAULT_ITEM_API_FIELD_SYNC,
  DEFAULT_ITEM_API_PRICE_MARKUP,
  DEFAULT_ITEM_EXTERNAL_API,
} from '../types/itemApi';
import type { ApiProvider } from '../types/apiProvider';
import {
  DEMO_PROVIDER_PRODUCTS,
  STANDARD_API_PROTOCOL,
  type ApiProviderProduct,
} from '../types/apiProvider';
import { getApiProviderById, loadApiProviders } from './apiProviderConfig';

export function normalizeItemExternalApi(
  raw: Partial<ItemExternalApiConfig> & Record<string, unknown> | undefined,
): ItemExternalApiConfig {
  if (!raw) return { ...DEFAULT_ITEM_EXTERNAL_API };

  let providerId = String(raw.providerId ?? '');
  if (!providerId && raw.providerName) {
    const byName = loadApiProviders().find(
      (p) => p.name.toLowerCase() === String(raw.providerName).toLowerCase(),
    );
    providerId = byName?.id ?? '';
  }

  return {
    enabled: Boolean(raw.enabled),
    providerId,
    externalProductId: String(raw.externalProductId ?? ''),
    virtualStock: Math.max(0, Number(raw.virtualStock) || DEFAULT_ITEM_EXTERNAL_API.virtualStock),
    fieldSync: normalizeItemApiFieldSync(raw.fieldSync as Partial<ItemApiFieldSync> | undefined),
    priceMarkup: normalizeItemApiPriceMarkup(
      raw.priceMarkup as Partial<ItemApiPriceMarkup> | undefined,
    ),
  };
}

function normalizeItemApiFieldSync(raw: Partial<ItemApiFieldSync> | undefined): ItemApiFieldSync {
  if (!raw) return { ...DEFAULT_ITEM_API_FIELD_SYNC };
  return {
    name: raw.name ?? DEFAULT_ITEM_API_FIELD_SYNC.name,
    price: raw.price ?? DEFAULT_ITEM_API_FIELD_SYNC.price,
    minPurchase: raw.minPurchase ?? DEFAULT_ITEM_API_FIELD_SYNC.minPurchase,
    maxPurchase: raw.maxPurchase ?? DEFAULT_ITEM_API_FIELD_SYNC.maxPurchase,
    sold: raw.sold ?? DEFAULT_ITEM_API_FIELD_SYNC.sold,
    shortDescription: raw.shortDescription ?? DEFAULT_ITEM_API_FIELD_SYNC.shortDescription,
    detailDescription: raw.detailDescription ?? DEFAULT_ITEM_API_FIELD_SYNC.detailDescription,
  };
}

function normalizeItemApiPriceMarkup(
  raw: Partial<ItemApiPriceMarkup> | undefined,
): ItemApiPriceMarkup {
  if (!raw) return { ...DEFAULT_ITEM_API_PRICE_MARKUP };
  const type = raw.type === 'fixed' ? 'fixed' : 'percent';
  const fallback = type === 'percent' ? DEFAULT_ITEM_API_PRICE_MARKUP.value : 0;
  return {
    type,
    value: Math.max(0, Number(raw.value) || fallback),
  };
}

export function convertProviderPriceToVnd(
  amount: number,
  currency: 'VND' | 'USD',
  exchangeRateToVnd: number,
): number {
  if (currency === 'VND') return Math.round(amount);
  return Math.max(1, Math.round(amount * exchangeRateToVnd));
}

export function resolveProviderProductCurrency(
  product: ApiProviderProduct,
  defaultCurrency: 'VND' | 'USD' = 'USD',
): 'VND' | 'USD' {
  const c = product.currency?.trim().toUpperCase();
  if (c === 'VND' || c === 'Đ' || c === 'DONG') return 'VND';
  if (c === 'USD' || c === '$' || c === 'USDT') return 'USD';
  return defaultCurrency;
}

export function getProviderBasePriceVnd(
  product: ApiProviderProduct,
  options: {
    serviceCurrency?: 'VND' | 'USD';
    exchangeRateToVnd?: number;
  } = {},
): number {
  const rate = options.exchangeRateToVnd ?? 27000;
  const defaultCurrency = options.serviceCurrency ?? 'USD';
  const currency = resolveProviderProductCurrency(product, defaultCurrency);
  const rawAmount =
    product.retailPrice != null ? product.retailPrice : product.price != null ? product.price : 0;
  return convertProviderPriceToVnd(rawAmount, currency, rate);
}

export function applyPriceMarkup(basePrice: number, markup: ItemApiPriceMarkup): number {
  const base = Math.max(0, Math.round(basePrice));
  if (markup.type === 'fixed') {
    return Math.max(0, base + Math.round(markup.value));
  }
  return Math.max(0, Math.round(base * (1 + markup.value / 100)));
}

export function reversePriceMarkup(sellingPrice: number, markup: ItemApiPriceMarkup): number {
  const selling = Math.max(0, Math.round(sellingPrice));
  if (markup.type === 'fixed') {
    return Math.max(0, selling - Math.round(markup.value));
  }
  const factor = 1 + markup.value / 100;
  if (factor <= 0) return selling;
  return Math.max(0, Math.round(selling / factor));
}

export function findProviderProductSync(externalProductId: string): ApiProviderProduct | null {
  const id = externalProductId.trim();
  if (!id) return null;
  return DEMO_PROVIDER_PRODUCTS.find((p) => p.id === id) ?? null;
}

export interface ItemApiLinkSummary {
  providerId: string;
  providerName: string;
  externalProductId: string;
  externalProductName?: string;
  providerRawPrice: number | null;
  providerRawCurrency: 'VND' | 'USD' | null;
  providerBasePriceVnd: number | null;
  estimatedFromSelling: boolean;
  sellingPrice: number;
}

export function formatProviderRawPrice(
  amount: number | null,
  currency: 'VND' | 'USD' | null,
): string {
  if (amount == null || !Number.isFinite(amount)) return '—';
  if (currency === 'VND') return `${amount.toLocaleString('vi-VN')}đ`;
  return `$${amount}`;
}

export function getItemApiLinkSummary(item: {
  stockSource?: ItemStockSource;
  externalApi?: Partial<ItemExternalApiConfig> | null;
  price: number;
}): ItemApiLinkSummary | null {
  if (item.stockSource !== 'external_api') return null;
  const api = normalizeItemExternalApi(item.externalApi ?? undefined);
  if (!api.enabled || !api.providerId.trim() || !api.externalProductId.trim()) return null;

  const provider =
    getApiProviderById(api.providerId) ??
    loadApiProviders().find((p) => p.id === api.providerId) ??
    null;
  const product = findProviderProductSync(api.externalProductId);

  let providerRawPrice: number | null = null;
  let providerRawCurrency: 'VND' | 'USD' | null = null;
  let providerBasePriceVnd: number | null = null;
  let externalProductName: string | undefined;
  let estimatedFromSelling = false;

  if (product && provider) {
    externalProductName = product.channel ? `${product.name} - ${product.channel}` : product.name;
    providerRawCurrency = resolveProviderProductCurrency(product, provider.serviceCurrency);
    providerRawPrice =
      product.retailPrice != null ? product.retailPrice : product.price != null ? product.price : null;
    providerBasePriceVnd = getProviderBasePriceVnd(product, {
      serviceCurrency: provider.serviceCurrency,
      exchangeRateToVnd: provider.exchangeRateToVnd,
    });
  } else {
    providerBasePriceVnd = reversePriceMarkup(item.price, api.priceMarkup);
    estimatedFromSelling = true;
  }

  return {
    providerId: api.providerId,
    providerName: provider?.name ?? 'NCC không xác định',
    externalProductId: api.externalProductId,
    externalProductName,
    providerRawPrice,
    providerRawCurrency,
    providerBasePriceVnd,
    estimatedFromSelling,
    sellingPrice: item.price,
  };
}

export function mapProviderProductToItemFields(
  product: ApiProviderProduct,
  priceMarkup: ItemApiPriceMarkup = DEFAULT_ITEM_API_PRICE_MARKUP,
  provider?: Pick<ApiProvider, 'serviceCurrency' | 'exchangeRateToVnd'>,
) {
  const serviceCurrency = provider?.serviceCurrency ?? 'USD';
  const exchangeRateToVnd = provider?.exchangeRateToVnd ?? 27000;
  const priceCurrency = resolveProviderProductCurrency(product, serviceCurrency);
  const providerRawPrice =
    product.retailPrice != null ? product.retailPrice : product.price != null ? product.price : 0;
  const name = product.channel ? `${product.name} - ${product.channel}` : product.name;
  const providerBasePrice = getProviderBasePriceVnd(product, { serviceCurrency, exchangeRateToVnd });
  const retailPrice = applyPriceMarkup(providerBasePrice, priceMarkup);

  return {
    name,
    price: retailPrice,
    providerBasePrice,
    providerRawPrice,
    providerPriceCurrency: priceCurrency,
    exchangeRateToVnd,
    minPurchase: product.minPurchase ?? 1,
    maxPurchase: product.maxPurchase ?? 1_000_000,
    shortDescription: product.shortDescription ?? name,
    detailDescription: product.detailDescription ?? `<p>${name}</p>`,
    stock: product.stock ?? 999,
    sold: product.sold ?? 0,
    preorderEnabled: product.preorderEnabled ?? false,
    preorderMaxWaitDays: product.preorderMaxWaitDays ?? 3,
    saleMode: product.saleMode ?? 'fifo',
  };
}

export function resolveEffectiveApiConfig(
  item: ItemExternalApiConfig,
): EffectiveApiRuntimeConfig {
  const normalized = normalizeItemExternalApi(item);
  const provider = normalized.providerId
    ? getApiProviderById(normalized.providerId) ??
      loadApiProviders().find((p) => p.id === normalized.providerId) ??
      null
    : null;

  const baseUrl = provider?.baseUrl?.trim().replace(/\/+$/, '') ?? '';
  const apiKey = provider?.apiKey ?? '';

  return {
    enabled: normalized.enabled,
    providerId: normalized.providerId,
    providerName: provider?.name ?? 'Nhà cung cấp',
    baseUrl,
    apiKey,
    authType: provider?.authType ?? 'bearer',
    orderPath: STANDARD_API_PROTOCOL.orderPath,
    stockPath: STANDARD_API_PROTOCOL.stockPath,
    externalProductId: normalized.externalProductId,
    quantityField: STANDARD_API_PROTOCOL.quantityField,
    productIdField: STANDARD_API_PROTOCOL.productIdField,
    responseContentField: STANDARD_API_PROTOCOL.responseContentField,
    virtualStock: normalized.virtualStock,
  };
}

export function joinApiUrl(baseUrl: string, path: string): string {
  const base = baseUrl.trim().replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

function apiHeaders(config: EffectiveApiRuntimeConfig): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (!config.apiKey.trim()) return headers;
  if (config.authType === 'bearer') {
    headers.Authorization = `Bearer ${config.apiKey.trim()}`;
  } else if (config.authType === 'api_key') {
    headers['X-Api-Key'] = config.apiKey.trim();
  }
  return headers;
}

function isDemoApiUrl(url: string) {
  return /demo|localhost|127\.0\.0\.1|example\.com/i.test(url);
}

function getByPath(obj: unknown, path: string): unknown {
  if (!path.trim()) return obj;
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function parseDeliveredContents(data: unknown, field: string, quantity: number): string[] {
  const raw = getByPath(data, field);
  if (Array.isArray(raw)) {
    return raw.map(String).slice(0, quantity);
  }
  if (typeof raw === 'string' && raw.trim()) {
    return raw.split('\n').map((s) => s.trim()).filter(Boolean).slice(0, quantity);
  }
  if (raw != null) {
    return [String(raw)];
  }
  return [];
}

function parseProviderProducts(data: unknown): ApiProviderProduct[] {
  const raw =
    (Array.isArray(data) ? data : null) ??
    (getByPath(data, 'data') as unknown) ??
    (getByPath(data, 'services') as unknown) ??
    (getByPath(data, 'products') as unknown);

  if (!Array.isArray(raw)) return [];

  return raw
    .map((item): ApiProviderProduct | null => {
      if (!item || typeof item !== 'object') return null;
      const row = item as Record<string, unknown>;
      const id = String(row.id ?? row.service_id ?? row.product_id ?? '').trim();
      const name = String(row.name ?? row.service ?? row.title ?? '').trim();
      if (!id || !name) return null;
      const channel = row.channel != null ? String(row.channel) : undefined;
      const priceRaw = row.price ?? row.rate ?? row.cost;
      const price = priceRaw != null && priceRaw !== '' ? Number(priceRaw) : undefined;
      const currency = row.currency != null ? String(row.currency) : undefined;
      const retailPriceRaw = row.retail_price ?? row.retailPrice ?? row.sale_price;
      const retailPrice =
        retailPriceRaw != null && retailPriceRaw !== '' ? Number(retailPriceRaw) : undefined;
      const minPurchaseRaw = row.min ?? row.min_purchase ?? row.minPurchase;
      const maxPurchaseRaw = row.max ?? row.max_purchase ?? row.maxPurchase;
      const stockRaw = row.stock ?? row.quantity_available;
      return {
        id,
        name,
        channel,
        price: Number.isFinite(price) ? price : undefined,
        currency,
        retailPrice: Number.isFinite(retailPrice) ? retailPrice : undefined,
        minPurchase:
          minPurchaseRaw != null && minPurchaseRaw !== '' ? Number(minPurchaseRaw) : undefined,
        maxPurchase:
          maxPurchaseRaw != null && maxPurchaseRaw !== '' ? Number(maxPurchaseRaw) : undefined,
        shortDescription:
          row.short_description != null
            ? String(row.short_description)
            : row.shortDescription != null
              ? String(row.shortDescription)
              : undefined,
        detailDescription:
          row.description != null
            ? String(row.description)
            : row.detailDescription != null
              ? String(row.detailDescription)
              : undefined,
        stock: stockRaw != null && stockRaw !== '' ? Number(stockRaw) : undefined,
        sold:
          row.sold != null && row.sold !== ''
            ? Number(row.sold)
            : row.total_sold != null
              ? Number(row.total_sold)
              : undefined,
        preorderEnabled:
          row.preorder_enabled != null
            ? Boolean(row.preorder_enabled)
            : row.preorderEnabled != null
              ? Boolean(row.preorderEnabled)
              : undefined,
        preorderMaxWaitDays:
          row.preorder_max_wait_days != null
            ? Number(row.preorder_max_wait_days)
            : row.preorderMaxWaitDays != null
              ? Number(row.preorderMaxWaitDays)
              : undefined,
        saleMode:
          row.sale_mode === 'oldest' ||
          row.sale_mode === 'newest' ||
          row.sale_mode === 'random'
            ? row.sale_mode
            : row.saleMode === 'oldest' ||
                row.saleMode === 'newest' ||
                row.saleMode === 'random'
              ? row.saleMode
              : undefined,
      };
    })
    .filter((p): p is ApiProviderProduct => p !== null);
}

function runtimeFromProvider(
  provider: Pick<ApiProvider, 'id' | 'name' | 'baseUrl' | 'apiKey' | 'authType'>,
): EffectiveApiRuntimeConfig {
  return {
    enabled: true,
    providerId: provider.id,
    providerName: provider.name,
    baseUrl: provider.baseUrl.trim().replace(/\/+$/, ''),
    apiKey: provider.apiKey,
    authType: provider.authType,
    orderPath: STANDARD_API_PROTOCOL.orderPath,
    stockPath: STANDARD_API_PROTOCOL.stockPath,
    externalProductId: '',
    quantityField: STANDARD_API_PROTOCOL.quantityField,
    productIdField: STANDARD_API_PROTOCOL.productIdField,
    responseContentField: STANDARD_API_PROTOCOL.responseContentField,
    virtualStock: 0,
  };
}

function enrichProviderProducts(
  products: ApiProviderProduct[],
  provider: ApiProvider,
): ApiProviderProduct[] {
  return products.map((p) => ({
    ...p,
    currency: p.currency ?? provider.serviceCurrency,
  }));
}

export async function fetchProviderProducts(
  providerId: string,
): Promise<{ ok: true; products: ApiProviderProduct[] } | { ok: false; error: string }> {
  const provider =
    getApiProviderById(providerId) ??
    loadApiProviders().find((p) => p.id === providerId) ??
    null;
  if (!provider) {
    return { ok: false, error: 'Không tìm thấy nhà cung cấp.' };
  }
  if (!provider.baseUrl.trim()) {
    return { ok: false, error: 'NCC chưa cấu hình URL API.' };
  }
  if (isDemoApiUrl(provider.baseUrl) || provider.id === 'demo-partner') {
    return {
      ok: true,
      products: enrichProviderProducts(
        DEMO_PROVIDER_PRODUCTS.map((p) => ({ ...p, currency: p.currency ?? 'USD' })),
        provider,
      ),
    };
  }

  const cfg = runtimeFromProvider(provider);
  const servicesUrl = joinApiUrl(cfg.baseUrl, STANDARD_API_PROTOCOL.servicesPath);

  try {
    const res = await fetch(servicesUrl, { method: 'GET', headers: apiHeaders(cfg) });
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status} — không tải được danh sách dịch vụ.` };
    }
    const data = await res.json();
    const products = parseProviderProducts(data);
    if (products.length === 0) {
      return { ok: false, error: 'API không trả về dịch vụ nào.' };
    }
    return { ok: true, products: enrichProviderProducts(products, provider) };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Không tải được danh sách dịch vụ.',
    };
  }
}

export async function fetchProviderBalance(
  provider: Pick<
    ApiProvider,
    'id' | 'name' | 'baseUrl' | 'apiKey' | 'authType' | 'balanceCurrency'
  >,
): Promise<{ ok: true; balance: number; currency: string } | { ok: false; error: string }> {
  const cfg = runtimeFromProvider(provider);
  if (!cfg.baseUrl.trim()) {
    return { ok: false, error: 'Chưa có URL API.' };
  }
  if (isDemoApiUrl(cfg.baseUrl)) {
    if (provider.balanceCurrency === 'USD') {
      return { ok: true, balance: 42.5, currency: 'USD' };
    }
    return { ok: true, balance: 1_250_000, currency: 'VND' };
  }
  const url = joinApiUrl(cfg.baseUrl, STANDARD_API_PROTOCOL.balancePath);
  try {
    const res = await fetch(url, { method: 'GET', headers: apiHeaders(cfg) });
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}` };
    }
    const data = (await res.json()) as Record<string, unknown>;
    const balanceRaw =
      getByPath(data, 'balance') ??
      getByPath(data, 'data.balance') ??
      getByPath(data, 'money') ??
      getByPath(data, 'amount');
    const balance = Math.max(0, Number(balanceRaw) || 0);
    const currencyRaw = getByPath(data, 'currency') ?? getByPath(data, 'data.currency');
    return {
      ok: true,
      balance,
      currency: currencyRaw != null ? String(currencyRaw) : 'VND',
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Không lấy được số dư.',
    };
  }
}

export async function testProviderApiConnection(
  provider: Pick<ApiProvider, 'id' | 'name' | 'baseUrl' | 'apiKey' | 'authType'>,
): Promise<{ ok: true; message: string } | { ok: false; error: string }> {
  const cfg: EffectiveApiRuntimeConfig = {
    ...runtimeFromProvider(provider),
    externalProductId: 'test',
  };
  if (!cfg.baseUrl.trim()) {
    return { ok: false, error: 'Cấu hình URL API tại Nhà cung cấp API.' };
  }
  if (isDemoApiUrl(cfg.baseUrl)) {
    return {
      ok: true,
      message: `Kết nối demo OK — ${cfg.providerName} (chuẩn API chung).`,
    };
  }
  const url = joinApiUrl(
    cfg.baseUrl,
    `${cfg.stockPath}?${cfg.productIdField}=${encodeURIComponent('test')}`,
  );
  try {
    const res = await fetch(url, { method: 'GET', headers: apiHeaders(cfg) });
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status} — kiểm tra URL và API key.` };
    }
    return { ok: true, message: `Kết nối OK — ${cfg.providerName} (HTTP ${res.status}).` };
  } catch (e) {
    return {
      ok: false,
      error:
        e instanceof Error
          ? `${e.message} — có thể do CORS hoặc URL sai.`
          : 'Không thể kết nối API.',
    };
  }
}

export async function testExternalApiConnection(
  item: ItemExternalApiConfig,
): Promise<{ ok: true; message: string } | { ok: false; error: string }> {
  const cfg = resolveEffectiveApiConfig(item);
  if (!cfg.providerId) {
    return { ok: false, error: 'Chọn nhà cung cấp API.' };
  }
  if (!cfg.baseUrl.trim()) {
    return { ok: false, error: 'Cấu hình URL API tại Nhà cung cấp API.' };
  }
  if (isDemoApiUrl(cfg.baseUrl)) {
    return {
      ok: true,
      message: `Kết nối demo OK — ${cfg.providerName} (chuẩn API chung).`,
    };
  }
  const url = joinApiUrl(cfg.baseUrl, `${cfg.stockPath}?${cfg.productIdField}=${encodeURIComponent(cfg.externalProductId || 'test')}`);
  try {
    const res = await fetch(url, { method: 'GET', headers: apiHeaders(cfg) });
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status} — kiểm tra URL và API key.` };
    }
    return { ok: true, message: `Kết nối OK — ${cfg.providerName} (HTTP ${res.status}).` };
  } catch (e) {
    return {
      ok: false,
      error:
        e instanceof Error
          ? `${e.message} — có thể do CORS hoặc URL sai.`
          : 'Không thể kết nối API.',
    };
  }
}

export async function fetchExternalApiStock(
  item: ItemExternalApiConfig,
): Promise<{ ok: true; stock: number } | { ok: false; error: string }> {
  const cfg = resolveEffectiveApiConfig(item);
  if (!cfg.baseUrl.trim()) {
    return { ok: false, error: 'Cấu hình URL API tại Nhà cung cấp API.' };
  }
  if (isDemoApiUrl(cfg.baseUrl)) {
    return { ok: true, stock: Math.max(cfg.virtualStock, 50) };
  }
  const url = joinApiUrl(
    cfg.baseUrl,
    `${cfg.stockPath}?${cfg.productIdField}=${encodeURIComponent(cfg.externalProductId)}`,
  );
  try {
    const res = await fetch(url, { method: 'GET', headers: apiHeaders(cfg) });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    const data = (await res.json()) as Record<string, unknown>;
    const stockRaw =
      getByPath(data, 'stock') ??
      getByPath(data, 'data.stock') ??
      getByPath(data, 'quantity') ??
      cfg.virtualStock;
    const stock = Math.max(0, Number(stockRaw) || 0);
    return { ok: true, stock };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Không đồng bộ được kho từ API.',
    };
  }
}

export async function fulfillOrderViaExternalApi(
  item: ItemExternalApiConfig,
  quantity: number,
): Promise<{ ok: true; contents: string[] } | { ok: false; error: string }> {
  const cfg = resolveEffectiveApiConfig(item);
  if (!cfg.enabled) {
    return { ok: false, error: 'Mặt hàng chưa bật API ngoài.' };
  }
  if (!cfg.baseUrl.trim()) {
    return { ok: false, error: 'Chưa cấu hình URL API tại Nhà cung cấp API.' };
  }
  if (!cfg.externalProductId.trim()) {
    return { ok: false, error: 'Chưa có ID service sản phẩm nhà cung cấp.' };
  }

  if (isDemoApiUrl(cfg.baseUrl)) {
    const contents = Array.from({ length: quantity }, (_, i) => {
      const pid = cfg.externalProductId || 'product';
      return `${pid}_${Date.now()}_${i + 1}|api_demo_secret`;
    });
    return { ok: true, contents };
  }

  const url = joinApiUrl(cfg.baseUrl, cfg.orderPath);
  const body: Record<string, string | number> = {
    [cfg.quantityField]: quantity,
    [cfg.productIdField]: cfg.externalProductId,
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: apiHeaders(cfg),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      return { ok: false, error: `API trả lỗi HTTP ${res.status}` };
    }
    const data = await res.json();
    let contents = parseDeliveredContents(data, cfg.responseContentField, quantity);
    if (contents.length < quantity) {
      const alt = parseDeliveredContents(data, 'accounts', quantity);
      if (alt.length > contents.length) contents = alt;
    }
    if (contents.length === 0) {
      return {
        ok: false,
        error: `Không đọc được nội dung từ trường "${cfg.responseContentField}".`,
      };
    }
    return { ok: true, contents };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Gọi API giao hàng thất bại.',
    };
  }
}
