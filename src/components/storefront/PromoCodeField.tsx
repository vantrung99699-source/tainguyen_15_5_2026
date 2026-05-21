import { useState } from 'react';
import { Ticket, X, Check } from 'lucide-react';
import type { AppliedPromoResult } from '../../types/promoCode';
import { validatePromoCode } from '../../services/promoCodeService';
import { loadCustomerSession } from '../../services/customerSession';
import { useLocaleCurrency } from '../../context/LocaleCurrencyContext';

interface PromoCodeFieldProps {
  subtotal: number;
  orderKind: 'instant' | 'preorder';
  applied: AppliedPromoResult | null;
  onApplied: (result: AppliedPromoResult | null) => void;
}

export function PromoCodeField({ subtotal, orderKind, applied, onApplied }: PromoCodeFieldProps) {
  const { formatMoney } = useLocaleCurrency();
  const [input, setInput] = useState(applied?.code ?? '');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  const handleApply = () => {
    setChecking(true);
    setError('');
    const session = loadCustomerSession();
    const r = validatePromoCode({
      code: input,
      userId: session.userId,
      subtotal,
      orderKind,
    });
    setChecking(false);
    if (!r.ok) {
      setError(r.error);
      onApplied(null);
      return;
    }
    onApplied(r.result);
  };

  const handleClear = () => {
    setInput('');
    setError('');
    onApplied(null);
  };

  if (applied) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0 text-brand-primary" />
            <div>
              <p className="text-sm font-bold text-emerald-900">Mã {applied.code}</p>
              <p className="text-[11px] text-emerald-700">
                Giảm {formatMoney(applied.discountAmount)} · Thanh toán {formatMoney(applied.total)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="rounded-lg p-1 text-zinc-500 hover:bg-white/80"
            aria-label="Gỡ mã"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-1.5 text-xs font-bold uppercase text-zinc-500">
        <Ticket className="h-3.5 w-3.5 text-brand-primary" />
        Mã khuyến mãi
      </label>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value.toUpperCase());
            setError('');
          }}
          placeholder="VD: WELCOME10"
          className="min-w-0 flex-1 rounded-xl border border-zinc-200 px-3 py-2.5 text-sm font-bold uppercase tracking-wide outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
        />
        <button
          type="button"
          disabled={checking || !input.trim() || subtotal <= 0}
          onClick={handleApply}
          className="shrink-0 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-bold text-zinc-700 transition hover:border-emerald-200 hover:bg-emerald-50 disabled:opacity-50"
        >
          {checking ? '...' : 'Áp dụng'}
        </button>
      </div>
      {error ? <p className="text-[12px] font-medium text-red-600">{error}</p> : null}
    </div>
  );
}
