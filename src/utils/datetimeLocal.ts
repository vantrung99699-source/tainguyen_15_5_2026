export interface DatetimeLocalParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

const pad = (n: number) => String(n).padStart(2, '0');

export function parseDatetimeLocal(value: string): DatetimeLocalParts | null {
  if (!value.trim()) return null;
  const m = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!m) return null;
  return {
    year: Number(m[1]),
    month: Number(m[2]),
    day: Number(m[3]),
    hour: Number(m[4]),
    minute: Number(m[5]),
  };
}

export function buildDatetimeLocal(parts: DatetimeLocalParts): string {
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}`;
}

/** Hiển thị 24h — dd/mm/yyyy · HH:mm */
export function formatDatetimeLocalDisplay(value: string): string {
  const p = parseDatetimeLocal(value);
  if (!p) return '';
  return `${pad(p.day)}/${pad(p.month)}/${p.year} · ${pad(p.hour)}:${pad(p.minute)}`;
}

export function partsToDate(parts: Pick<DatetimeLocalParts, 'year' | 'month' | 'day'>): Date {
  return new Date(parts.year, parts.month - 1, parts.day);
}

export function getTodayParts(): DatetimeLocalParts {
  const d = new Date();
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
    hour: 9,
    minute: 0,
  };
}
