export interface DailySalePoint {
  dateKey: string;
  day: number;
  quantity: number;
  revenue: number;
}

export interface MonthSalesBlock {
  key: string;
  label: string;
  days: DailySalePoint[];
  monthQuantity: number;
  monthRevenue: number;
}

export interface ItemSalesSummary {
  totalQuantity: number;
  todayQuantity: number;
  totalRevenue: number;
  todayRevenue: number;
  months: MonthSalesBlock[];
}

function seededRandom(seed: number) {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function formatMonthLabel(year: number, month: number) {
  return `Tháng ${month + 1}/${year}`;
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function normalizeToTarget(values: number[], target: number) {
  const sum = values.reduce((a, b) => a + b, 0);
  if (sum === 0) {
    const copy = values.map(() => 0);
    copy[Math.floor(copy.length / 2)] = target;
    return copy;
  }
  const scaled = values.map((v) => Math.max(0, Math.round((v * target) / sum)));
  let diff = target - scaled.reduce((a, b) => a + b, 0);
  for (let i = scaled.length - 1; i >= 0 && diff > 0; i -= 1) {
    scaled[i] += 1;
    diff -= 1;
  }
  for (let i = 0; i < scaled.length && diff < 0; i += 1) {
    if (scaled[i] > 0) {
      scaled[i] -= 1;
      diff += 1;
    }
  }
  return scaled;
}

function generateDailyQuantities(lastDay: number, monthTarget: number, rand: () => number, month: number) {
  const raw: number[] = [];

  for (let day = 1; day <= lastDay; day += 1) {
    const date = new Date(2026, month, day);
    const weekend = date.getDay() === 0 || date.getDay() === 6;
    const r = rand();

    let q = 0;
    if (r < 0.2) q = 0;
    else if (r < 0.42) q = 1;
    else if (r < 0.62) q = 2;
    else if (r < 0.78) q = 3;
    else if (r < 0.9) q = 4 + Math.floor(rand() * 2);
    else q = 6 + Math.floor(rand() * 4);

    if (weekend) q = Math.max(0, q - 1);
    if (day % 7 === 0) q += 1;
    raw.push(q);
  }

  return normalizeToTarget(raw, monthTarget);
}

function buildMonthBlock(
  year: number,
  month: number,
  unitPrice: number,
  today: Date,
  rand: () => number,
  monthTarget: number,
): MonthSalesBlock {
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
  const lastDay = isCurrentMonth ? today.getDate() : daysInMonth(year, month);
  const quantities = generateDailyQuantities(lastDay, monthTarget, rand, month);

  const days: DailySalePoint[] = quantities.map((quantity, index) => {
    const day = index + 1;
    const date = new Date(year, month, day);
    return {
      dateKey: date.toISOString().slice(0, 10),
      day,
      quantity,
      revenue: quantity * unitPrice,
    };
  });

  const monthQuantity = days.reduce((sum, d) => sum + d.quantity, 0);
  const monthRevenue = days.reduce((sum, d) => sum + d.revenue, 0);

  return {
    key: `${year}-${String(month + 1).padStart(2, '0')}`,
    label: formatMonthLabel(year, month),
    days,
    monthQuantity,
    monthRevenue,
  };
}

/** Dữ liệu giả 2 tháng gần nhất (đủ ngày, cột cao/thấp rõ ràng). */
export function buildItemSalesStats(
  itemId: number,
  unitPrice: number,
  totalSold: number,
  referenceDate = new Date(),
): ItemSalesSummary {
  const rand = seededRandom(itemId * 7919 + Math.round(unitPrice));
  const today = startOfDay(referenceDate);
  const year = today.getFullYear();
  const month = today.getMonth();

  const prevMonth = month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 };
  const demoTotal = Math.max(totalSold, 32 + (itemId % 45));
  const prevTarget = Math.round(demoTotal * 0.52);
  const currTarget = demoTotal - prevTarget;

  const months = [
    buildMonthBlock(prevMonth.year, prevMonth.month, unitPrice, today, rand, prevTarget),
    buildMonthBlock(year, month, unitPrice, today, rand, currTarget),
  ];

  const allDays = months.flatMap((m) => m.days);
  const todayKey = today.toISOString().slice(0, 10);
  const todayRow = allDays.find((d) => d.dateKey === todayKey);

  const totalQuantity = allDays.reduce((sum, d) => sum + d.quantity, 0);
  const totalRevenue = allDays.reduce((sum, d) => sum + d.revenue, 0);

  return {
    totalQuantity,
    todayQuantity: todayRow?.quantity ?? 0,
    totalRevenue,
    todayRevenue: todayRow?.revenue ?? 0,
    months,
  };
}
