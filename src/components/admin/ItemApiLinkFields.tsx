import { useEffect, useState } from 'react';
import type { ApiProviderProduct } from '../../types/apiProvider';
import type { ItemExternalApiConfig } from '../../types/itemApi';
import { loadApiProviders } from '../../services/apiProviderConfig';
import { fetchProviderProducts, normalizeItemExternalApi } from '../../services/itemApiService';
import { ProviderServicePicker } from './ProviderServicePicker';

const inputClass =
  'w-full rounded-lg border border-zinc-200 px-2.5 py-2 text-sm font-medium text-zinc-800 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10';

const labelClass = 'text-[10px] font-bold uppercase text-zinc-400';

interface ItemApiLinkFieldsProps {
  value: ItemExternalApiConfig;
  onChange: (config: ItemExternalApiConfig) => void;
  onProductSelected?: (product: ApiProviderProduct | null) => void;
}

export function ItemApiLinkFields({ value, onChange, onProductSelected }: ItemApiLinkFieldsProps) {
  const [providers, setProviders] = useState(loadApiProviders);
  const [products, setProducts] = useState<ApiProviderProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const refresh = () => setProviders(loadApiProviders());
    window.addEventListener('taphoammo-api-providers-updated', refresh);
    return () => window.removeEventListener('taphoammo-api-providers-updated', refresh);
  }, []);

  const patch = (partial: Partial<ItemExternalApiConfig>) => {
    onChange(normalizeItemExternalApi({ ...value, ...partial, enabled: true }));
  };

  useEffect(() => {
    if (!value.providerId) {
      setProducts([]);
      setProductsError('');
      setLoadingProducts(false);
      return;
    }

    let cancelled = false;
    setLoadingProducts(true);
    setProductsError('');

    void fetchProviderProducts(value.providerId).then((res) => {
      if (cancelled) return;
      setLoadingProducts(false);
      if (res.ok) {
        setProducts(res.products);
        if (
          value.externalProductId &&
          !res.products.some((p) => p.id === value.externalProductId)
        ) {
          onChange(
            normalizeItemExternalApi({
              ...value,
              externalProductId: '',
              enabled: true,
            }),
          );
        }
      } else {
        setProducts([]);
        setProductsError(res.error);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [value.providerId, reloadKey]);

  useEffect(() => {
    if (!value.externalProductId) {
      onProductSelected?.(null);
      return;
    }
    const product = products.find((p) => p.id === value.externalProductId) ?? null;
    onProductSelected?.(product);
  }, [value.externalProductId, products, onProductSelected]);

  return (
    <div className="rounded-xl border border-sky-100 bg-sky-50/40 px-3 py-2.5">
      <p className="mb-2 text-[11px] text-zinc-600">
        <span className="font-bold text-zinc-800">API ngoài</span> — URL/key cấu hình tại{' '}
        <span className="font-semibold text-sky-800">Nhà cung cấp API</span>
      </p>
      <div className="space-y-2">
        <label className="block">
          <span className={labelClass}>Nhà cung cấp *</span>
          <select
            value={value.providerId}
            onChange={(e) => {
              patch({ providerId: e.target.value, externalProductId: '' });
              onProductSelected?.(null);
            }}
            className={`${inputClass} mt-0.5`}
            required
          >
            <option value="">— Chọn —</option>
            {providers
              .filter((p) => p.enabled)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
          </select>
        </label>
        <label className="block">
          <span className={labelClass}>ID dịch vụ *</span>
          <ProviderServicePicker
            disabled={!value.providerId}
            products={products}
            value={value.externalProductId}
            onChange={(productId) => patch({ externalProductId: productId })}
            loading={loadingProducts}
            error={productsError}
            onRetry={() => setReloadKey((k) => k + 1)}
          />
        </label>
      </div>
    </div>
  );
}
