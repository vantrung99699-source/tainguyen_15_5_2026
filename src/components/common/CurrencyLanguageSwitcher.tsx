import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Coins, Globe } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useLocaleCurrency } from '../../context/LocaleCurrencyContext';

interface SwitcherProps {
  variant?: 'dark' | 'light';
}

interface DropdownAnchor {
  top: number;
  left: number;
  minWidth: number;
}

function useDropdownPosition(
  anchorRef: React.RefObject<HTMLElement | null>,
  open: boolean,
): DropdownAnchor | null {
  const [pos, setPos] = useState<DropdownAnchor | null>(null);

  const update = () => {
    const el = anchorRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos({
      top: rect.bottom + 6,
      left: rect.right,
      minWidth: Math.max(rect.width, 140),
    });
  };

  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open]);

  return pos;
}

function DropdownPortal({
  anchorRef,
  open,
  onClose,
  variant,
  children,
  panelRef,
}: {
  anchorRef: React.RefObject<HTMLElement | null>;
  open: boolean;
  onClose: () => void;
  variant: 'dark' | 'light';
  children: ReactNode;
  panelRef: React.RefObject<HTMLDivElement | null>;
}) {
  const pos = useDropdownPosition(anchorRef, open);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (anchorRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      onClose();
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open, onClose, anchorRef, panelRef]);

  const panelClass =
    variant === 'dark'
      ? 'overflow-hidden rounded-xl border border-white/10 bg-zinc-900 py-1 shadow-2xl ring-1 ring-black/20'
      : 'overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-2xl ring-1 ring-black/5';

  if (typeof document === 'undefined' || !open || !pos) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          role="listbox"
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98 }}
          transition={{ duration: 0.15 }}
          className={panelClass}
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            transform: 'translateX(-100%)',
            minWidth: pos.minWidth,
            zIndex: 99999,
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export function CurrencyLanguageSwitcher({ variant = 'dark' }: SwitcherProps) {
  const { currencyCode, currencies, setCurrencyCode, localeCode, languages, setLocaleCode, t } =
    useLocaleCurrency();
  const [openCurrency, setOpenCurrency] = useState(false);
  const [openLocale, setOpenLocale] = useState(false);
  const currencyBtnRef = useRef<HTMLButtonElement>(null);
  const localeBtnRef = useRef<HTMLButtonElement>(null);
  const currencyPanelRef = useRef<HTMLDivElement>(null);
  const localePanelRef = useRef<HTMLDivElement>(null);

  const btnClass =
    variant === 'dark'
      ? 'flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/5 px-2.5 py-1 text-white/90 transition-all hover:bg-white/10'
      : 'flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 shadow-sm hover:bg-slate-50';

  const itemClass = (active: boolean) =>
    variant === 'dark'
      ? `flex w-full items-center gap-2 px-3 py-2 text-left text-[11px] font-bold transition-colors ${
          active ? 'bg-emerald-600/30 text-emerald-300' : 'text-white/80 hover:bg-white/10'
        }`
      : `flex w-full items-center gap-2 px-3 py-2 text-left text-[11px] font-bold transition-colors ${
          active ? 'bg-emerald-50 text-brand-primary' : 'text-slate-600 hover:bg-slate-50'
        }`;

  const lang = languages.find((l) => l.code === localeCode);

  return (
    <div className="flex items-center gap-2">
      <button
        ref={currencyBtnRef}
        type="button"
        onClick={() => {
          setOpenCurrency((v) => !v);
          setOpenLocale(false);
        }}
        className={`${btnClass} group cursor-pointer`}
        aria-label={t('currency_switch', 'Tiền tệ')}
        aria-expanded={openCurrency}
      >
        <Coins className={`h-3 w-3 ${variant === 'dark' ? 'text-yellow-400' : 'text-amber-500'}`} />
        <span className="text-[10px] font-black uppercase tracking-widest">{currencyCode}</span>
        <ChevronDown
          className={`h-3 w-3 opacity-40 transition-transform ${openCurrency ? 'rotate-180' : ''}`}
        />
      </button>

      <DropdownPortal
        anchorRef={currencyBtnRef}
        open={openCurrency}
        onClose={() => setOpenCurrency(false)}
        variant={variant}
        panelRef={currencyPanelRef}
      >
        {currencies.map((c) => (
          <button
            key={c.id}
            type="button"
            className={itemClass(c.code === currencyCode)}
            onClick={() => {
              setCurrencyCode(c.code);
              setOpenCurrency(false);
            }}
          >
            <span>{c.symbol}</span>
            <span>{c.code}</span>
          </button>
        ))}
      </DropdownPortal>

      <button
        ref={localeBtnRef}
        type="button"
        onClick={() => {
          setOpenLocale((v) => !v);
          setOpenCurrency(false);
        }}
        className={`${btnClass} group cursor-pointer`}
        aria-label={t('language_switch', 'Ngôn ngữ')}
        aria-expanded={openLocale}
      >
        <Globe className={`h-3 w-3 ${variant === 'dark' ? 'text-emerald-400' : 'text-brand-primary'}`} />
        <span className="text-[10px] font-black uppercase tracking-widest">
          {lang?.flag} {lang?.code.toUpperCase()}
        </span>
        <ChevronDown
          className={`h-3 w-3 opacity-40 transition-transform ${openLocale ? 'rotate-180' : ''}`}
        />
      </button>

      <DropdownPortal
        anchorRef={localeBtnRef}
        open={openLocale}
        onClose={() => setOpenLocale(false)}
        variant={variant}
        panelRef={localePanelRef}
      >
        {languages.map((l) => (
          <button
            key={l.id}
            type="button"
            className={itemClass(l.code === localeCode)}
            onClick={() => {
              setLocaleCode(l.code);
              setOpenLocale(false);
            }}
          >
            <span>{l.flag}</span>
            <span>{l.nativeName}</span>
          </button>
        ))}
      </DropdownPortal>
    </div>
  );
}
