import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Check, Clock, Package, RefreshCw, X } from 'lucide-react';
import type { PreorderOrder, PreorderStatus } from '../../types/preorder';
import {
  approvePreorder,
  getPreordersForAdmin,
  PREORDERS_UPDATED,
  rejectPreorder,
} from '../../services/preorderService';

const STATUS_LABELS: Record<PreorderStatus, string> = {
  pending_admin: 'Chờ xác nhận',
  approved: 'Đã duyệt — chờ kho',
  fulfilled: 'Đã giao hàng',
  rejected: 'Đã từ chối',
  cancelled_by_user: 'Khách hủy',
  expired_refunded: 'Hết hạn — đã hoàn',
};

const STATUS_STYLES: Record<PreorderStatus, string> = {
  pending_admin: 'bg-amber-100 text-amber-800',
  approved: 'bg-sky-100 text-sky-800',
  fulfilled: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-700',
  cancelled_by_user: 'bg-zinc-200 text-zinc-700',
  expired_refunded: 'bg-violet-100 text-violet-800',
};

function formatMoney(n: number) {
  return `${n.toLocaleString('vi-VN')} đ`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function PreorderAdminTab() {
  const [orders, setOrders] = useState<PreorderOrder[]>(() => getPreordersForAdmin());
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');

  const reload = () => setOrders(getPreordersForAdmin());

  useEffect(() => {
    const onUpdate = () => reload();
    window.addEventListener(PREORDERS_UPDATED, onUpdate);
    return () => window.removeEventListener(PREORDERS_UPDATED, onUpdate);
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return orders;
    return orders.filter((o) => o.status === 'pending_admin');
  }, [orders, filter]);

  const pendingCount = orders.filter((o) => o.status === 'pending_admin').length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-violet-600">Đặt trước</p>
          <h3 className="text-lg font-black text-zinc-900">Đơn đặt trước</h3>
          <p className="text-[12px] text-zinc-500">
            {pendingCount} đơn chờ xác nhận · Duyệt xong sẽ tự giao khi đủ kho
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter('pending')}
            className={`rounded-lg px-3 py-1.5 text-[11px] font-bold ${
              filter === 'pending' ? 'bg-brand-primary text-white' : 'bg-zinc-100 text-zinc-600'
            }`}
          >
            Chờ xác nhận
          </button>
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`rounded-lg px-3 py-1.5 text-[11px] font-bold ${
              filter === 'all' ? 'bg-brand-primary text-white' : 'bg-zinc-100 text-zinc-600'
            }`}
          >
            Tất cả
          </button>
          <button
            type="button"
            onClick={reload}
            className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-1.5 text-[11px] font-bold text-zinc-600 hover:bg-zinc-50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Làm mới
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/80 text-left text-[11px] font-black uppercase text-zinc-500">
                <th className="px-4 py-3">Mã đơn</th>
                <th className="px-4 py-3">Khách</th>
                <th className="px-4 py-3">Sản phẩm</th>
                <th className="px-4 py-3">SL</th>
                <th className="px-4 py-3">Tổng</th>
                <th className="px-4 py-3">Hạn chờ</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-zinc-400">
                    Không có đơn đặt trước.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id} className="border-b border-zinc-50 hover:bg-emerald-50/20">
                    <td className="px-4 py-3 text-[12px] font-bold text-brand-primary">{order.id}</td>
                    <td className="px-4 py-3 text-[13px]">@{order.username}</td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-[12px]" title={order.itemName}>
                      {order.itemName}
                    </td>
                    <td className="px-4 py-3 text-center font-bold tabular-nums">{order.quantity}</td>
                    <td className="px-4 py-3 font-bold tabular-nums text-red-600">
                      {formatMoney(order.totalAmount)}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(order.expiresAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLES[order.status]}`}
                      >
                        {STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {order.status === 'pending_admin' ? (
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              approvePreorder(order.id);
                              reload();
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[10px] font-bold text-white hover:bg-emerald-700"
                          >
                            <Check className="h-3 w-3" />
                            Duyệt
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const reason = window.prompt('Lý do từ chối (tùy chọn):');
                              rejectPreorder(order.id, reason ?? undefined);
                              reload();
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-[10px] font-bold text-red-600 hover:bg-red-100"
                          >
                            <X className="h-3 w-3" />
                            Từ chối
                          </button>
                        </div>
                      ) : order.status === 'fulfilled' && order.deliveredContents.length > 0 ? (
                        <span className="text-[10px] text-emerald-700">
                          Đã giao {order.deliveredContents.length} tài khoản
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="flex items-start gap-2 text-[11px] text-zinc-500">
        <Package className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Sau khi duyệt, hệ thống tự trừ kho và giao tài khoản khi đủ số lượng. Thêm hàng vào Kho cũng kích
        hoạt giao tự động cho đơn đã duyệt.
      </p>
    </motion.div>
  );
}
