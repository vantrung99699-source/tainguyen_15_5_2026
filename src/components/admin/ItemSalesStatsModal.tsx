import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { X, BarChart3, Package, Coins, CalendarDays } from 'lucide-react';
import { buildItemSalesStats, type DailySalePoint, type MonthSalesBlock } from '../../utils/itemSalesStats';

interface ItemSalesStatsModalProps {
  itemId: number;
  itemName: string;
  unitPrice: number;
  totalSold: number;
  onClose: () => void;
}

const PLOT_HEIGHT = 200;
const COLUMN_WIDTH = 30;

function formatMoney(value: number) {
  return `${value.toLocaleString('vi-VN')}\u00a0đ`;
}

function formatMoneyShort(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}k`;
  return String(value);
}

function buildYTicks(max: number, count = 4) {
  if (max <= 0) return [0];
  const step = Math.max(1, Math.ceil(max / (count - 1)));
  const top = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = 0; v <= top; v += step) ticks.push(v);
  if (ticks[ticks.length - 1] !== top) ticks.push(top);
  return ticks;
}

function barHeightPx(value: number, max: number) {
  if (value <= 0 || max <= 0) return 0;
  return Math.max(8, Math.round((value / max) * (PLOT_HEIGHT - 16)));
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: typeof Package;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-100 bg-zinc-50/80 p-4">
      <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-lg ${accent}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-lg font-black tabular-nums text-zinc-900">{value}</p>
    </div>
  );
}

function BarSeries({
  title,
  days,
  maxValue,
  formatValue,
  getValue,
  barClass,
  glowClass,
}: {
  title: string;
  days: DailySalePoint[];
  maxValue: number;
  formatValue: (v: number) => string;
  getValue: (d: DailySalePoint) => number;
  barClass: string;
  glowClass: string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const yTicks = buildYTicks(maxValue);
  const yMax = yTicks[yTicks.length - 1] || 1;
  const chartMinWidth = days.length * COLUMN_WIDTH + 16;

  return (
    <div className="rounded-xl border border-zinc-100 bg-gradient-to-b from-white to-zinc-50/90 p-4">
      <p className="mb-3 text-[11px] font-black uppercase tracking-wide text-zinc-600">{title}</p>
      <div className="flex gap-2">
        <div
          className="flex shrink-0 flex-col justify-between pb-6 text-right"
          style={{ height: PLOT_HEIGHT }}
        >
          {[...yTicks].reverse().map((tick) => (
            <span key={tick} className="text-[10px] font-bold tabular-nums text-zinc-400">
              {formatValue(tick)}
            </span>
          ))}
        </div>

        <div className="min-w-0 flex-1 overflow-x-auto pb-1">
          <div style={{ minWidth: chartMinWidth }}>
            <div
              className="relative border-b border-l border-zinc-200/90"
              style={{ height: PLOT_HEIGHT }}
            >
              {yTicks.map((tick) => {
                const pct = yMax > 0 ? (tick / yMax) * 100 : 0;
                return (
                  <div
                    key={tick}
                    className="pointer-events-none absolute left-0 right-0 border-t border-dashed border-zinc-200/80"
                    style={{ bottom: `${pct}%` }}
                  />
                );
              })}

              <div className="absolute inset-0 flex items-end gap-[2px] px-1">
                {days.map((d) => {
                  const value = getValue(d);
                  const h = barHeightPx(value, yMax);
                  const isHover = hovered === d.day;

                  return (
                    <motion.div
                      key={d.dateKey}
                      className="relative flex shrink-0 flex-col items-center"
                      style={{ width: COLUMN_WIDTH - 2 }}
                      onMouseEnter={() => setHovered(d.day)}
                      onMouseLeave={() => setHovered(null)}
                    >
                      {isHover && (
                        <div className="absolute bottom-full z-20 mb-2 w-max max-w-[140px] rounded-lg border border-zinc-200 bg-zinc-900 px-2.5 py-1.5 text-center shadow-lg">
                          <p className="text-[10px] font-bold text-white">Ngày {d.day}</p>
                          <p className="text-[11px] font-semibold text-emerald-300">
                            {d.quantity} sp
                          </p>
                          <p className="text-[10px] text-zinc-300">{formatMoney(d.revenue)}</p>
                        </div>
                      )}

                      <motion.div
                        className={`w-[18px] rounded-t-md ${barClass} transition-all duration-200 ${
                          isHover ? `ring-2 ring-offset-1 ${glowClass} scale-105` : ''
                        } ${value === 0 ? 'opacity-25' : 'opacity-100'}`}
                        style={{ height: h }}
                        title={`Ngày ${d.day}: ${d.quantity} sp · ${formatMoney(d.revenue)}`}
                      />
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="mt-2 flex gap-[2px] px-1">
              {days.map((d) => (
                <div
                  key={`label-${d.dateKey}`}
                  className={`flex shrink-0 items-center justify-center text-[10px] font-bold tabular-nums ${
                    hovered === d.day ? 'text-brand-primary' : 'text-zinc-500'
                  }`}
                  style={{ width: COLUMN_WIDTH - 2 }}
                >
                  {d.day}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MonthChart({ month }: { month: MonthSalesBlock }) {
  const maxQty = Math.max(1, ...month.days.map((d) => d.quantity));
  const maxRev = Math.max(1, ...month.days.map((d) => d.revenue));

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-zinc-100 pb-4">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-zinc-800">{month.label}</p>
          <p className="mt-1 text-[13px] font-semibold text-zinc-600">
            <span className="text-emerald-700">{month.monthQuantity.toLocaleString('vi-VN')} sp</span>
            <span className="mx-2 text-zinc-300">·</span>
            <span className="text-sky-700">{formatMoney(month.monthRevenue)}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-[11px] font-bold text-zinc-500">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-gradient-to-t from-emerald-600 to-emerald-400" />
            Số lượng
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-gradient-to-t from-sky-600 to-sky-400" />
            Doanh thu
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <BarSeries
          title="Số lượng bán theo ngày"
          days={month.days}
          maxValue={maxQty}
          formatValue={(v) => String(v)}
          getValue={(d) => d.quantity}
          barClass="bg-gradient-to-t from-emerald-600 to-emerald-400"
          glowClass="ring-emerald-400"
        />
        <BarSeries
          title="Doanh thu theo ngày"
          days={month.days}
          maxValue={maxRev}
          formatValue={formatMoneyShort}
          getValue={(d) => d.revenue}
          barClass="bg-gradient-to-t from-sky-600 to-sky-400"
          glowClass="ring-sky-400"
        />
      </div>
    </div>
  );
}

export default function ItemSalesStatsModal({
  itemId,
  itemName,
  unitPrice,
  totalSold,
  onClose,
}: ItemSalesStatsModalProps) {
  const stats = useMemo(
    () => buildItemSalesStats(itemId, unitPrice, totalSold),
    [itemId, unitPrice, totalSold],
  );

  const modal = (
    <motion.div
      className="fixed inset-0 z-[320] flex items-center justify-center bg-black/50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="item-stats-title"
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div className="flex items-start justify-between gap-4 border-b border-zinc-100 px-6 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-brand-primary">
              <BarChart3 className="h-5 w-5 shrink-0" />
              <span className="text-[11px] font-black uppercase tracking-wide">Thống kê mặt hàng</span>
            </div>
            <h2 id="item-stats-title" className="mt-1 truncate text-base font-black text-zinc-900">
              {itemName}
            </h2>
            <p className="mt-0.5 text-[12px] font-medium text-zinc-500">
              ID: {itemId} · Đơn giá {formatMoney(unitPrice)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
          >
            <X className="h-5 w-5" />
          </button>
        </motion.div>

        <div className="max-h-[calc(92vh-80px)] overflow-y-auto px-6 py-5 space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Tổng số lượng đã bán"
              value={stats.totalQuantity.toLocaleString('vi-VN')}
              icon={Package}
              accent="bg-emerald-100 text-emerald-700"
            />
            <StatCard
              label="Số lượng bán hôm nay"
              value={stats.todayQuantity.toLocaleString('vi-VN')}
              icon={CalendarDays}
              accent="bg-teal-100 text-teal-700"
            />
            <StatCard
              label="Tổng số tiền đã bán"
              value={formatMoney(stats.totalRevenue)}
              icon={Coins}
              accent="bg-sky-100 text-sky-700"
            />
            <StatCard
              label="Số tiền bán hôm nay"
              value={formatMoney(stats.todayRevenue)}
              icon={Coins}
              accent="bg-indigo-100 text-indigo-700"
            />
          </div>

          <div>
            <h3 className="mb-4 text-[12px] font-black uppercase text-zinc-700">
              Biểu đồ 2 tháng gần nhất
            </h3>
            {stats.months.length === 0 ? (
              <p className="rounded-xl border border-dashed border-zinc-200 py-10 text-center text-sm font-medium text-zinc-500">
                Chưa có dữ liệu bán trong 2 tháng gần đây.
              </p>
            ) : (
              <div className="space-y-6">
                {stats.months.map((month) => (
                  <MonthChart key={month.key} month={month} />
                ))}
              </div>
            )}
            <p className="mt-3 text-[11px] text-zinc-400">
              Dữ liệu mô phỏng theo mặt hàng (2 tháng gần nhất); sẽ thay bằng đơn hàng thật khi có API.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  return createPortal(modal, document.body);
}
