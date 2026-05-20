import { useEffect, useRef, useState } from 'react';
import { Building2, ChevronDown, CreditCard } from 'lucide-react';
import type { PaymentGateway } from '../../types/payment';
import { formatMinDeposit } from '../../services/paymentConfig';

interface BankSelectDropdownProps {
  gateways: PaymentGateway[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function BankSelectDropdown({ gateways, selectedId, onSelect }: BankSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = gateways.find((g) => g.id === selectedId) ?? gateways[0] ?? null;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  if (!selected) {
    return (
      <p className="rounded-2xl border border-dashed border-zinc-200 py-8 text-center text-sm text-zinc-500">
        Chưa có phương thức nạp tiền.
      </p>
    );
  }

  const Icon = selected.providerType === 'third_party' ? CreditCard : Building2;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 text-left shadow-sm transition-all hover:border-emerald-200 hover:shadow-md"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-[11px] font-black text-white"
          style={{ backgroundColor: selected.color }}
        >
          {selected.providerType === 'third_party' ? (
            <Icon className="h-5 w-5" />
          ) : (
            selected.bankCode
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-400">Ngân hàng nạp tiền</p>
          <p className="text-sm font-black text-zinc-900">{selected.shortName}</p>
          <p className="truncate text-[12px] text-zinc-500">{selected.bankName}</p>
          <p className="mt-0.5 text-[11px] font-semibold text-brand-primary">
            Tối thiểu {formatMinDeposit(selected.minDepositAmount, selected.minDepositCurrency)}
          </p>
        </div>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-zinc-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full z-20 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-2 shadow-xl"
        >
          {gateways.map((gateway) => {
            const isActive = gateway.id === selected.id;
            return (
              <button
                key={gateway.id}
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => {
                  onSelect(gateway.id);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                  isActive ? 'bg-emerald-50 ring-1 ring-emerald-100' : 'hover:bg-zinc-50'
                }`}
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[9px] font-black text-white"
                  style={{ backgroundColor: gateway.color }}
                >
                  {gateway.bankCode}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-zinc-900">{gateway.shortName}</p>
                  <p className="truncate text-[11px] text-zinc-500">{gateway.bankName}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
