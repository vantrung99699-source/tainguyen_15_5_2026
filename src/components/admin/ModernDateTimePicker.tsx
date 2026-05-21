import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarClock, ChevronLeft, ChevronRight, X } from 'lucide-react';
import {
  buildDatetimeLocal,
  formatDatetimeLocalDisplay,
  getTodayParts,
  parseDatetimeLocal,
  type DatetimeLocalParts,
} from '../../utils/datetimeLocal';

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

interface ModernDateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

/** Thứ Hai = 0 … Chủ nhật = 6 */
function mondayBasedWeekday(year: number, month: number, day: number) {
  const w = new Date(year, month - 1, day).getDay();
  return w === 0 ? 6 : w - 1;
}

export function ModernDateTimePicker({
  value,
  onChange,
  label,
  placeholder = 'Chọn ngày giờ (24h)',
  className = '',
}: ModernDateTimePickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const initial = parseDatetimeLocal(value) ?? getTodayParts();
  const [viewYear, setViewYear] = useState(initial.year);
  const [viewMonth, setViewMonth] = useState(initial.month);
  const [draft, setDraft] = useState<DatetimeLocalParts>(initial);

  useEffect(() => {
    const p = parseDatetimeLocal(value);
    if (p) {
      setDraft(p);
      setViewYear(p.year);
      setViewMonth(p.month);
    }
  }, [value]);

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

  const display = formatDatetimeLocalDisplay(value);

  const calendarCells = useMemo(() => {
    const total = daysInMonth(viewYear, viewMonth);
    const firstOffset = mondayBasedWeekday(viewYear, viewMonth, 1);
    const cells: ({ day: number; inMonth: true } | { day: null; inMonth: false })[] = [];
    for (let i = 0; i < firstOffset; i++) cells.push({ day: null, inMonth: false });
    for (let d = 1; d <= total; d++) cells.push({ day: d, inMonth: true });
    while (cells.length % 7 !== 0) cells.push({ day: null, inMonth: false });
    return cells;
  }, [viewYear, viewMonth]);

  const today = getTodayParts();
  const monthLabel = new Date(viewYear, viewMonth - 1, 1).toLocaleDateString('vi-VN', {
    month: 'long',
    year: 'numeric',
  });

  const shiftMonth = (delta: number) => {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 1) {
      m = 12;
      y -= 1;
    } else if (m > 12) {
      m = 1;
      y += 1;
    }
    setViewMonth(m);
    setViewYear(y);
  };

  const apply = () => {
    onChange(buildDatetimeLocal(draft));
    setOpen(false);
  };

  const clear = () => {
    onChange('');
    setOpen(false);
  };

  const hourOptions = Array.from({ length: 24 }, (_, i) => i);
  const minuteOptions = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {label ? (
        <span className="text-[11px] font-bold uppercase text-zinc-400">{label}</span>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`mt-1 flex w-full items-center gap-2.5 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-left text-sm font-medium transition-all hover:border-emerald-200 hover:shadow-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/10 ${
          open ? 'border-brand-primary ring-2 ring-brand-primary/10' : ''
        }`}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-brand-primary">
          <CalendarClock className="h-4 w-4" />
        </span>
        <span className={`min-w-0 flex-1 truncate ${display ? 'text-zinc-800' : 'text-zinc-400'}`}>
          {display || placeholder}
        </span>
        {value ? (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              clear();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.stopPropagation();
                clear();
              }
            }}
            className="shrink-0 rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
            aria-label="Xóa ngày giờ"
          >
            <X className="h-4 w-4" />
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-xl shadow-zinc-200/60 ring-1 ring-zinc-100 sm:left-0 sm:right-auto sm:w-[320px]">
          <div className="flex items-center justify-between border-b border-zinc-100 bg-gradient-to-r from-emerald-50/80 to-white px-3 py-2.5">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              className="rounded-lg p-1.5 text-zinc-500 hover:bg-white hover:text-brand-primary"
              aria-label="Tháng trước"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-[13px] font-black capitalize text-zinc-800">{monthLabel}</p>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              className="rounded-lg p-1.5 text-zinc-500 hover:bg-white hover:text-brand-primary"
              aria-label="Tháng sau"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 px-2 pt-2">
            {WEEKDAYS.map((d) => (
              <span
                key={d}
                className="py-1 text-center text-[10px] font-bold uppercase text-zinc-400"
              >
                {d}
              </span>
            ))}
            {calendarCells.map((cell, idx) => {
              if (!cell.inMonth || cell.day == null) {
                return <span key={idx} className="h-9" />;
              }
              const selected =
                draft.year === viewYear &&
                draft.month === viewMonth &&
                draft.day === cell.day;
              const isToday =
                today.year === viewYear && today.month === viewMonth && today.day === cell.day;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    setDraft((prev) => ({
                      ...prev,
                      year: viewYear,
                      month: viewMonth,
                      day: cell.day!,
                    }))
                  }
                  className={`h-9 rounded-lg text-[13px] font-semibold transition-colors ${
                    selected
                      ? 'bg-brand-primary text-white shadow-sm'
                      : isToday
                        ? 'ring-1 ring-brand-primary/40 text-brand-primary hover:bg-emerald-50'
                        : 'text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          <div className="mt-2 border-t border-zinc-100 bg-zinc-50/60 px-3 py-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-zinc-400">
              Giờ (24h)
            </p>
            <div className="flex items-center gap-2">
              <select
                value={draft.hour}
                onChange={(e) => setDraft((p) => ({ ...p, hour: Number(e.target.value) }))}
                className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white px-2 py-2 text-sm font-bold tabular-nums text-zinc-800 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
                aria-label="Giờ"
              >
                {hourOptions.map((h) => (
                  <option key={h} value={h}>
                    {String(h).padStart(2, '0')}
                  </option>
                ))}
              </select>
              <span className="text-lg font-black text-zinc-300">:</span>
              <select
                value={draft.minute}
                onChange={(e) => setDraft((p) => ({ ...p, minute: Number(e.target.value) }))}
                className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white px-2 py-2 text-sm font-bold tabular-nums text-zinc-800 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
                aria-label="Phút"
              >
                {minuteOptions.map((m) => (
                  <option key={m} value={m}>
                    {String(m).padStart(2, '0')}
                  </option>
                ))}
              </select>
            </div>
            <p className="mt-2 text-center text-[11px] font-medium text-zinc-500">
              {formatDatetimeLocalDisplay(buildDatetimeLocal(draft))}
            </p>
          </div>

          <div className="flex gap-2 border-t border-zinc-100 px-3 py-2.5">
            <button
              type="button"
              onClick={() => {
                const t = getTodayParts();
                setDraft(t);
                setViewYear(t.year);
                setViewMonth(t.month);
              }}
              className="rounded-xl border border-zinc-200 px-3 py-2 text-[11px] font-bold text-zinc-600 hover:bg-zinc-50"
            >
              Hôm nay
            </button>
            <button
              type="button"
              onClick={clear}
              className="rounded-xl border border-zinc-200 px-3 py-2 text-[11px] font-bold text-zinc-500 hover:bg-zinc-50"
            >
              Xóa
            </button>
            <button
              type="button"
              onClick={apply}
              className="ml-auto rounded-xl bg-brand-primary px-4 py-2 text-[11px] font-black text-white hover:bg-emerald-600"
            >
              Áp dụng
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
