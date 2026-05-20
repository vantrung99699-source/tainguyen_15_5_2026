import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Filter,
  Clock,
  ShoppingBag,
  X,
  RotateCcw,
  Check,
  Package,
  Ban,
  Eye,
  Download,
} from 'lucide-react';
import type { CustomerOrder, CustomerOrderKind, CustomerOrderStatus, RefundMode } from '../../types/customerOrder';
import type { PreorderStatus } from '../../types/preorder';
import {
  formatOrderDate,
  getAllOrdersForAdmin,
  getRefundableAmount,
  ORDERS_UPDATED,
  refundOrder,
} from '../../services/orderService';
import {
  approvePreorder,
  fulfillPreorderNow,
  getPreorderById,
  PREORDERS_UPDATED,
  rejectPreorder,
} from '../../services/preorderService';
import { ClampedProductName } from '../../components/common/ClampedProductName';

const STATUS_LABELS: Record<CustomerOrderStatus, string> = {
  completed: 'Hoàn thành',
  pending: 'Đang xử lý',
  cancelled: 'Đã hủy',
  refunded: 'Đã hoàn tiền',
  partial_refunded: 'Hoàn một phần',
};

const STATUS_STYLES: Record<CustomerOrderStatus, string> = {
  completed: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-violet-100 text-violet-700',
  partial_refunded: 'bg-orange-100 text-orange-700',
};

const KIND_LABELS: Record<CustomerOrderKind, string> = {
  instant: 'Mua ngay',
  preorder: 'Đặt trước',
};

const PREORDER_STATUS_LABELS: Record<PreorderStatus, string> = {
  pending_admin: 'Chờ xác nhận',
  approved: 'Đã xác nhận — chờ giao',
  fulfilled: 'Hoàn thành',
  rejected: 'Đã từ chối',
  cancelled_by_user: 'Khách đã hủy',
  expired_refunded: 'Hết hạn — đã hoàn',
};

const PREORDER_STATUS_STYLES: Record<PreorderStatus, string> = {
  pending_admin: 'bg-amber-100 text-amber-800',
  approved: 'bg-sky-100 text-sky-800',
  fulfilled: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-700',
  cancelled_by_user: 'bg-zinc-200 text-zinc-700',
  expired_refunded: 'bg-violet-100 text-violet-800',
};

function orderStatusLabel(order: CustomerOrder): string {
  if (order.kind === 'preorder' && order.preorderStatus) {
    return PREORDER_STATUS_LABELS[order.preorderStatus];
  }
  return STATUS_LABELS[order.status];
}

function orderStatusStyle(order: CustomerOrder): string {
  if (order.kind === 'preorder' && order.preorderStatus) {
    return PREORDER_STATUS_STYLES[order.preorderStatus];
  }
  return STATUS_STYLES[order.status];
}

interface RefundFormState {
  mode: RefundMode;
  partialAmount: string;
  percent: string;
  note: string;
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-zinc-100 py-2.5 text-sm last:border-0">
      <span className="shrink-0 font-bold text-zinc-500">{label}</span>
      <span className="text-right font-semibold text-zinc-800">{value}</span>
    </div>
  );
}

export function AdminOrdersSection() {
  const [orders, setOrders] = useState<CustomerOrder[]>(() => getAllOrdersForAdmin());
  const [tab, setTab] = useState<'all' | CustomerOrderKind>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [detailOrder, setDetailOrder] = useState<CustomerOrder | null>(null);
  const [showRefundPanel, setShowRefundPanel] = useState(false);
  const [refundForm, setRefundForm] = useState<RefundFormState>({
    mode: 'full',
    partialAmount: '',
    percent: '100',
    note: '',
  });
  const [refundError, setRefundError] = useState('');
  const [actionError, setActionError] = useState('');

  const reload = () => {
    const list = getAllOrdersForAdmin();
    setOrders(list);
    if (detailOrder) {
      const fresh = list.find((o) => o.id === detailOrder.id);
      if (fresh) setDetailOrder(fresh);
      else setDetailOrder(null);
    }
  };

  useEffect(() => {
    const onUpdate = () => reload();
    window.addEventListener(ORDERS_UPDATED, onUpdate);
    window.addEventListener(PREORDERS_UPDATED, onUpdate);
    return () => {
      window.removeEventListener(ORDERS_UPDATED, onUpdate);
      window.removeEventListener(PREORDERS_UPDATED, onUpdate);
    };
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return orders.filter((o) => {
      if (tab !== 'all' && o.kind !== tab) return false;
      if (!q) return true;
      return (
        o.id.toLowerCase().includes(q) ||
        o.productName.toLowerCase().includes(q) ||
        o.username.toLowerCase().includes(q)
      );
    });
  }, [orders, tab, searchQuery]);

  const openDetail = (order: CustomerOrder) => {
    setActionError('');
    setRefundError('');
    setShowRefundPanel(false);
    const remaining = getRefundableAmount(order);
    setRefundForm({
      mode: 'full',
      partialAmount: String(remaining),
      percent: '100',
      note: '',
    });
    setDetailOrder(order);
  };

  const closeDetail = () => {
    setDetailOrder(null);
    setShowRefundPanel(false);
    setActionError('');
    setRefundError('');
  };

  const handleApprove = () => {
    if (!detailOrder || detailOrder.kind !== 'preorder') return;
    const r = approvePreorder(detailOrder.id);
    if (!r.ok) setActionError(r.error ?? 'Không xác nhận được đơn.');
    else {
      setActionError('');
      reload();
    }
  };

  const handleFulfill = () => {
    if (!detailOrder || detailOrder.kind !== 'preorder') return;
    const r = fulfillPreorderNow(detailOrder.id);
    if (!r.ok) setActionError(r.error ?? 'Chưa giao được hàng.');
    else {
      setActionError('');
      reload();
    }
  };

  const handleReject = () => {
    if (!detailOrder || detailOrder.kind !== 'preorder') return;
    const reason = window.prompt('Lý do từ chối (tùy chọn):');
    if (reason === null) return;
    const r = rejectPreorder(detailOrder.id, reason || undefined);
    if (!r.ok) setActionError(r.error ?? 'Không từ chối được đơn.');
    else {
      setActionError('');
      reload();
    }
  };

  const submitRefund = () => {
    if (!detailOrder) return;
    if (
      detailOrder.kind === 'preorder' &&
      detailOrder.preorderStatus === 'pending_admin'
    ) {
      const r = rejectPreorder(
        detailOrder.id,
        refundForm.note.trim() || 'Admin hoàn tiền — hủy đơn chờ xác nhận',
      );
      if (!r.ok) {
        setRefundError(r.error ?? 'Không hoàn tiền được.');
        return;
      }
      setRefundError('');
      setShowRefundPanel(false);
      reload();
      return;
    }
    const result = refundOrder(detailOrder.id, refundForm.mode, {
      partialAmount: Math.floor(Number(refundForm.partialAmount.replace(/\D/g, '')) || 0),
      percent: Number(refundForm.percent) || 0,
      note: refundForm.note,
    });
    if (!result.ok) {
      setRefundError(result.error);
      return;
    }
    setRefundError('');
    setShowRefundPanel(false);
    reload();
  };

  const downloadDelivery = (order: CustomerOrder) => {
    if (!order.deliveredContents.length) return;
    const blob = new Blob([order.deliveredContents.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${order.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const detailRefundable = detailOrder ? getRefundableAmount(detailOrder) : 0;
  const preorderMeta = detailOrder?.kind === 'preorder' ? getPreorderById(detailOrder.id) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-zinc-900">Đơn hàng</h2>
          <p className="mt-1 text-[13px] font-medium text-zinc-500">
            Bấm Xem đơn để xác nhận, giao hàng, hoàn tiền hoặc từ chối trong một popup
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-xl bg-zinc-100 px-3 py-1.5 text-[12px] font-bold text-zinc-600">
          <ShoppingBag className="h-4 w-4" />
          {orders.length} đơn
        </span>
      </div>

      <div className="flex gap-2 border-b border-zinc-200">
        {(
          [
            { id: 'all' as const, label: 'Tất cả' },
            { id: 'instant' as const, label: 'Đơn mua' },
            { id: 'preorder' as const, label: 'Đặt trước', icon: Clock },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold border-b-2 -mb-px transition-colors ${
              tab === t.id
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-zinc-500 hover:text-zinc-700'
            }`}
          >
            {'icon' in t && t.icon ? <t.icon className="h-4 w-4" /> : null}
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Search className="h-5 w-5 text-zinc-400" />
          <input
            type="text"
            placeholder="Mã đơn, sản phẩm, username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 border-0 bg-transparent text-sm font-medium text-zinc-800 outline-none placeholder:text-zinc-400"
          />
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl bg-zinc-50 px-4 py-2 text-sm font-bold text-zinc-600 hover:bg-zinc-100"
          >
            <Filter className="h-4 w-4" />
            Lọc
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1500px] table-fixed">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                <th className="w-[9%] px-4 py-3 text-center text-[11px] font-black uppercase text-zinc-500">
                  Thao tác
                </th>
                <th className="w-[14%] px-4 py-3 text-left text-[11px] font-black uppercase text-zinc-500">
                  Đơn hàng
                </th>
                <th className="w-[10%] px-4 py-3 text-left text-[11px] font-black uppercase text-zinc-500">
                  Người mua
                </th>
                <th className="w-[22%] px-4 py-3 text-left text-[11px] font-black uppercase text-zinc-500">
                  Tên sản phẩm
                </th>
                <th className="w-[5%] px-4 py-3 text-center text-[11px] font-black uppercase text-zinc-500">
                  SL
                </th>
                <th className="w-[11%] px-4 py-3 text-right text-[11px] font-black uppercase text-zinc-500">
                  Thanh toán
                </th>
                <th className="w-[8%] px-4 py-3 text-center text-[11px] font-black uppercase text-zinc-500">
                  Loại
                </th>
                <th className="w-[15%] min-w-[148px] px-4 py-3 text-center text-[11px] font-black uppercase text-zinc-500">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order, index) => {
                const { date, time } = formatOrderDate(order.createdAt);
                const preorderMeta =
                  order.kind === 'preorder' ? getPreorderById(order.id) : undefined;
                const expires = preorderMeta
                  ? formatOrderDate(preorderMeta.expiresAt)
                  : null;
                return (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="border-b border-zinc-100 hover:bg-zinc-50/60"
                  >
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => openDetail(order)}
                        className="inline-flex items-center gap-1 rounded-lg bg-brand-primary/10 px-3 py-1.5 text-[11px] font-bold text-brand-primary hover:bg-brand-primary/20"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Xem đơn
                      </button>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="text-sm font-bold text-brand-primary">{order.id}</div>
                      <div className="text-xs font-semibold text-zinc-600">
                        {order.kind === 'preorder' ? 'Đặt: ' : ''}
                        {date} {time}
                      </div>
                      {expires ? (
                        <div className="text-xs font-bold text-violet-600">
                          Hạn đặt trước: {expires.date} {expires.time}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="text-sm font-bold text-zinc-800">{order.username}</div>
                      <div className="text-xs text-zinc-400">ID: {order.userId}</div>
                    </td>
                    <td className="max-w-0 px-4 py-3 align-top">
                      <ClampedProductName name={order.productName} className="text-zinc-700" />
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-bold">{order.quantity}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="text-sm font-bold text-zinc-800">
                        {order.totalAmount.toLocaleString('vi-VN')}đ
                      </div>
                      {order.refundedAmount > 0 ? (
                        <div className="text-[11px] font-medium text-violet-600">
                          Hoàn: {order.refundedAmount.toLocaleString('vi-VN')}đ
                        </div>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-center">
                      <span
                        className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          order.kind === 'preorder'
                            ? 'bg-violet-100 text-violet-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {KIND_LABELS[order.kind]}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-center">
                      <span
                        className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${orderStatusStyle(order)}`}
                      >
                        {orderStatusLabel(order)}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 ? (
          <p className="py-16 text-center text-sm font-medium text-zinc-400">Chưa có đơn hàng</p>
        ) : null}
      </div>

      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {detailOrder ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4"
                onClick={closeDetail}
              >
                <motion.div
                  initial={{ scale: 0.96, opacity: 0, y: 8 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.96, opacity: 0, y: 8 }}
                  className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex shrink-0 items-start justify-between border-b border-zinc-100 px-5 py-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Chi tiết đơn · {KIND_LABELS[detailOrder.kind]}
                      </p>
                      <h3 className="text-lg font-black text-zinc-900">{detailOrder.id}</h3>
                      <span
                        className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${orderStatusStyle(detailOrder)}`}
                      >
                        {orderStatusLabel(detailOrder)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={closeDetail}
                      className="rounded-lg p-1 hover:bg-zinc-100"
                      aria-label="Đóng"
                    >
                      <X className="h-5 w-5 text-zinc-500" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto px-5 py-4">
                    <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 px-4">
                      <DetailRow label="Người mua" value={`@${detailOrder.username}`} />
                      <DetailRow label="User ID" value={detailOrder.userId} />
                      <DetailRow label="Sản phẩm" value={detailOrder.productName} />
                      <DetailRow label="Số lượng" value={detailOrder.quantity} />
                      <DetailRow
                        label="Thanh toán"
                        value={`${detailOrder.totalAmount.toLocaleString('vi-VN')} đ`}
                      />
                      {detailOrder.refundedAmount > 0 ? (
                        <DetailRow
                          label="Đã hoàn"
                          value={`${detailOrder.refundedAmount.toLocaleString('vi-VN')} đ`}
                        />
                      ) : null}
                      <DetailRow
                        label="Thời gian"
                        value={(() => {
                          const { date, time } = formatOrderDate(detailOrder.createdAt);
                          return `${date} ${time}`;
                        })()}
                      />
                      {preorderMeta ? (
                        <DetailRow
                          label="Hạn chờ"
                          value={new Date(preorderMeta.expiresAt).toLocaleString('vi-VN')}
                        />
                      ) : null}
                      {detailOrder.note ? (
                        <DetailRow label="Ghi chú" value={detailOrder.note} />
                      ) : null}
                    </div>

                    {actionError ? (
                      <p className="mt-3 text-sm font-bold text-red-600">{actionError}</p>
                    ) : null}

                    {showRefundPanel ? (
                      <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50/40 p-4">
                        <p className="mb-3 text-sm font-black text-violet-900">
                          Hoàn tiền — còn{' '}
                          {detailRefundable.toLocaleString('vi-VN')} đ
                        </p>
                        <div className="mb-3 flex flex-col gap-2">
                          {(
                            [
                              { mode: 'full' as const, label: 'Hoàn toàn bộ' },
                              { mode: 'partial' as const, label: 'Hoàn một phần' },
                              { mode: 'percent' as const, label: 'Hoàn theo %' },
                            ] as const
                          ).map((opt) => (
                            <label
                              key={opt.mode}
                              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold ${
                                refundForm.mode === opt.mode
                                  ? 'border-violet-400 bg-white'
                                  : 'border-violet-100'
                              }`}
                            >
                              <input
                                type="radio"
                                checked={refundForm.mode === opt.mode}
                                onChange={() =>
                                  setRefundForm((f) => ({ ...f, mode: opt.mode }))
                                }
                              />
                              {opt.label}
                            </label>
                          ))}
                        </div>
                        {refundForm.mode === 'partial' ? (
                          <input
                            type="text"
                            value={refundForm.partialAmount}
                            onChange={(e) =>
                              setRefundForm((f) => ({ ...f, partialAmount: e.target.value }))
                            }
                            placeholder="Số tiền hoàn"
                            className="mb-2 w-full rounded-lg border border-violet-200 px-3 py-2 text-sm font-bold"
                          />
                        ) : null}
                        {refundForm.mode === 'percent' ? (
                          <input
                            type="number"
                            min={1}
                            max={100}
                            value={refundForm.percent}
                            onChange={(e) =>
                              setRefundForm((f) => ({ ...f, percent: e.target.value }))
                            }
                            className="mb-2 w-full rounded-lg border border-violet-200 px-3 py-2 text-sm font-bold"
                          />
                        ) : null}
                        <input
                          type="text"
                          value={refundForm.note}
                          onChange={(e) =>
                            setRefundForm((f) => ({ ...f, note: e.target.value }))
                          }
                          placeholder="Ghi chú hoàn tiền..."
                          className="mb-2 w-full rounded-lg border border-violet-200 px-3 py-2 text-sm"
                        />
                        {refundError ? (
                          <p className="mb-2 text-xs font-bold text-red-600">{refundError}</p>
                        ) : null}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setShowRefundPanel(false);
                              setRefundError('');
                            }}
                            className="flex-1 rounded-lg border border-violet-200 py-2 text-xs font-bold text-violet-700"
                          >
                            Hủy
                          </button>
                          <button
                            type="button"
                            onClick={submitRefund}
                            className="flex-1 rounded-lg bg-violet-600 py-2 text-xs font-bold text-white hover:bg-violet-700"
                          >
                            Xác nhận hoàn
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="shrink-0 border-t border-zinc-100 bg-zinc-50/80 px-5 py-4">
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Thao tác đơn
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {detailOrder.kind === 'preorder' &&
                      detailOrder.preorderStatus === 'pending_admin' ? (
                        <button
                          type="button"
                          onClick={handleApprove}
                          className="inline-flex flex-1 min-w-[120px] items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"
                        >
                          <Check className="h-4 w-4" />
                          Xác nhận đơn
                        </button>
                      ) : null}

                      {detailOrder.kind === 'preorder' &&
                      detailOrder.preorderStatus === 'approved' ? (
                        <button
                          type="button"
                          onClick={handleFulfill}
                          className="inline-flex flex-1 min-w-[120px] items-center justify-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-sky-700"
                        >
                          <Package className="h-4 w-4" />
                          Giao hàng
                        </button>
                      ) : null}

                      {detailRefundable > 0 &&
                      detailOrder.preorderStatus !== 'pending_admin' &&
                      detailOrder.preorderStatus !== 'approved' ? (
                        <button
                          type="button"
                          onClick={() => {
                            setShowRefundPanel(true);
                            setRefundError('');
                          }}
                          className="inline-flex flex-1 min-w-[120px] items-center justify-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm font-bold text-violet-800 hover:bg-violet-100"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Hoàn tiền
                        </button>
                      ) : null}

                      {detailOrder.kind === 'preorder' &&
                      (detailOrder.preorderStatus === 'pending_admin' ||
                        detailOrder.preorderStatus === 'approved') ? (
                        <button
                          type="button"
                          onClick={handleReject}
                          className="inline-flex flex-1 min-w-[120px] items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-100"
                        >
                          <Ban className="h-4 w-4" />
                          Từ chối
                        </button>
                      ) : null}

                      {detailOrder.deliveredContents.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => downloadDelivery(detailOrder)}
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700 hover:bg-emerald-100"
                        >
                          <Download className="h-4 w-4" />
                          Tải hàng
                        </button>
                      ) : null}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
