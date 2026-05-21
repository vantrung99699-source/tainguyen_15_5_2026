import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import type { ApiProviderProduct } from '../../types/apiProvider';
import { formatProviderProductLabel } from '../../types/apiProvider';

const fieldClass =
  'w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-sm font-medium text-zinc-800 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10';

interface ProviderServicePickerProps {
  products: ApiProviderProduct[];
  value: string;
  onChange: (productId: string) => void;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  disabled?: boolean;
}

export function ProviderServicePicker({
  products,
  value,
  onChange,
  loading = false,
  error,
  onRetry,
  disabled = false,
}: ProviderServicePickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = products.find((p) => p.id === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      const label = formatProviderProductLabel(p).toLowerCase();
      return label.includes(q) || p.id.includes(q) || p.name.toLowerCase().includes(q);
    });
  }, [products, query]);

  const closeDropdown = () => {
    setOpen(false);
    setQuery('');
  };

  const selectProduct = (productId: string) => {
    onChange(productId);
    closeDropdown();
  };

  useEffect(() => {
    closeDropdown();
  }, [value]);

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        closeDropdown();
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [open]);

  const triggerLabel = loading
    ? 'Đang tải dịch vụ…'
    : selected
      ? formatProviderProductLabel(selected)
      : '— Chọn dịch vụ —';

  if (disabled) {
    return (
      <input
        disabled
        placeholder="Chọn nhà cung cấp trước"
        className={`${fieldClass} mt-0.5 text-zinc-400`}
      />
    );
  }

  return (
    <div ref={rootRef} className="relative mt-0.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`${fieldClass} flex w-full items-center gap-2 text-left ${
          open ? 'border-brand-primary ring-2 ring-brand-primary/10' : ''
        }`}
      >
        <span className={`min-w-0 flex-1 truncate ${!selected && !loading ? 'text-zinc-400' : ''}`}>
          {triggerLabel}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg">
          <div className="border-b border-zinc-100 p-2">
            <div className="relative">
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') closeDropdown();
                }}
                placeholder="Tìm kiếm dịch vụ..."
                className="w-full rounded-md border border-zinc-200 py-1.5 pl-2.5 pr-8 text-[13px] outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20"
              />
              <Search className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            </div>
          </div>

          <div className="max-h-40 overflow-y-auto">
            {loading ? (
              <p className="px-3 py-4 text-center text-[12px] text-zinc-500">Đang tải dịch vụ…</p>
            ) : error ? (
              <div className="space-y-2 px-3 py-3 text-center">
                <p className="text-[12px] text-red-600">{error}</p>
                {onRetry ? (
                  <button
                    type="button"
                    onClick={onRetry}
                    className="text-[12px] font-bold text-sky-700 hover:underline"
                  >
                    Thử lại
                  </button>
                ) : null}
              </div>
            ) : filtered.length === 0 ? (
              <p className="px-3 py-4 text-center text-[12px] text-zinc-500">
                Không có dịch vụ phù hợp.
              </p>
            ) : (
              <ul>
                {filtered.map((product) => {
                  const active = product.id === value;
                  return (
                    <li key={product.id}>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          selectProduct(product.id);
                        }}
                        className={`w-full px-3 py-2 text-left text-[13px] transition-colors ${
                          active
                            ? 'bg-sky-50 font-semibold text-sky-900'
                            : 'text-zinc-700 hover:bg-zinc-50'
                        }`}
                      >
                        {formatProviderProductLabel(product)}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
