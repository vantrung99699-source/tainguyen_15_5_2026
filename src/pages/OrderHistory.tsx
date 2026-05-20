import { useEffect, useMemo, useState } from 'react';
import { Search, ChevronLeft, Filter, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import type { PreorderOrder, PreorderStatus } from '../types/preorder';
import type { CustomerOrder, CustomerOrderStatus } from '../types/customerOrder';
import { loadCustomerSession } from '../services/customerSession';
import {
  cancelPreorderByUser,
  getPreordersForCustomer,
  PREORDERS_UPDATED,
} from '../services/preorderService';
import {
  formatOrderDate,
  getOrdersForCustomer,
  ORDERS_UPDATED,
} from '../services/orderService';
import { ClampedProductName } from '../components/common/ClampedProductName';

const PREORDER_STATUS_LABELS: Record<PreorderStatus, string> = {
  pending_admin: 'Chờ xác nhận',
  approved: 'Đã xác nhận — chờ giao',
  fulfilled: 'Hoàn thành',
  rejected: 'Đã từ chối',
  cancelled_by_user: 'Khách đã hủy',
  expired_refunded: 'Hết hạn — đã hoàn',
};

/** Đồng bộ màu trạng thái với Admin → Đơn hàng */
const PREORDER_STATUS_STYLES: Record<PreorderStatus, string> = {
  pending_admin: 'bg-amber-100 text-amber-800',
  approved: 'bg-sky-100 text-sky-800',
  fulfilled: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-700',
  cancelled_by_user: 'bg-zinc-200 text-zinc-700',
  expired_refunded: 'bg-violet-100 text-violet-800',
};

function PreorderStatusBadge({ status }: { status: PreorderStatus }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${PREORDER_STATUS_STYLES[status]}`}
    >
      {PREORDER_STATUS_LABELS[status]}
    </span>
  );
}

const ORDER_STATUS_UI: Record<
  CustomerOrderStatus,
  { label: string; ui: 'completed' | 'pending' | 'cancelled' }
> = {
  completed: { label: 'Hoàn thành', ui: 'completed' },
  pending: { label: 'Đang xử lý', ui: 'pending' },
  cancelled: { label: 'Đã hủy', ui: 'cancelled' },
  refunded: { label: 'Đã hoàn tiền', ui: 'cancelled' },
  partial_refunded: { label: 'Hoàn một phần', ui: 'pending' },
};

interface OrderHistoryProps {
  initialTab?: 'orders' | 'preorders';
}

export default function OrderHistory({ initialTab = 'orders' }: OrderHistoryProps) {
  const session = loadCustomerSession();
  const [tab, setTab] = useState<'orders' | 'preorders'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<CustomerOrder[]>(() =>
    getOrdersForCustomer(session.userId, 'instant'),
  );
  const [preorders, setPreorders] = useState<PreorderOrder[]>(() => getPreordersForCustomer());
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const reloadInstant = () =>
    setOrders(getOrdersForCustomer(loadCustomerSession().userId, 'instant'));

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const syncPreorders = () => setPreorders(getPreordersForCustomer());
    const syncOrders = () => reloadInstant();
    window.addEventListener(PREORDERS_UPDATED, syncPreorders);
    window.addEventListener(ORDERS_UPDATED, syncOrders);
    return () => {
      window.removeEventListener(PREORDERS_UPDATED, syncPreorders);
      window.removeEventListener(ORDERS_UPDATED, syncOrders);
    };
  }, []);

  const sortedPreorders = useMemo(
    () => [...preorders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [preorders],
  );

  const displayOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((o) => {
      const { date, time } = formatOrderDate(o.createdAt);
      const statusInfo = ORDER_STATUS_UI[o.status];
      return {
        id: o.id,
        date,
        time,
        productName: o.productName,
        quantity: o.quantity,
        payment: `${o.totalAmount.toLocaleString('vi-VN')}đ`,
        status: statusInfo.ui,
        statusLabel: statusInfo.label,
        note: o.note,
        raw: o,
      };
    });
  }, [orders]);

  const filteredOrders = displayOrders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const toggleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(o => o.id));
    }
  };

  const toggleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleView = (order: (typeof displayOrders)[0]) => {
    const lines = [
      `Mã: ${order.id}`,
      `Sản phẩm: ${order.productName}`,
      `Thanh toán: ${order.payment}`,
      `Trạng thái: ${order.statusLabel}`,
      order.raw.deliveredContents.length
        ? `Nội dung:\n${order.raw.deliveredContents.join('\n---\n')}`
        : '',
    ].filter(Boolean);
    alert(lines.join('\n'));
  };

  const handleDownload = (order: (typeof displayOrders)[0]) => {
    if (!order.raw.deliveredContents.length) {
      alert('Đơn chưa có nội dung tải xuống.');
      return;
    }
    const blob = new Blob([order.raw.deliveredContents.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${order.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: 'completed' | 'pending' | 'cancelled', label: string) => {
    const styles = {
      completed: 'bg-emerald-100 text-emerald-700',
      pending: 'bg-amber-100 text-amber-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return (
      <span
        className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${styles[status]}`}
      >
        {label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] pb-20">
      <div className="mx-auto max-w-[1700px] px-6 pt-10">
        <div className="flex items-center gap-3 mb-8">
          <button 
            onClick={() => window.history.back()}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="text-2xl font-black text-slate-800">Lịch sử đơn hàng</h1>
        </div>

        <div className="mb-6 flex gap-2 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setTab('orders')}
            className={`px-4 py-2.5 text-sm font-bold border-b-2 -mb-px transition-colors ${
              tab === 'orders'
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Đơn mua
          </button>
          <button
            type="button"
            onClick={() => setTab('preorders')}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold border-b-2 -mb-px transition-colors ${
              tab === 'preorders'
                ? 'border-violet-600 text-violet-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Clock className="h-4 w-4" />
            Đặt trước
            {preorders.filter((p) => p.status === 'pending_admin').length > 0 ? (
              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] text-violet-800">
                {preorders.filter((p) => p.status === 'pending_admin').length}
              </span>
            ) : null}
          </button>
        </div>

        {tab === 'preorders' ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] table-fixed">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="w-[18%] text-left px-4 py-4 text-xs font-bold text-slate-500 uppercase">Mã đơn</th>
                    <th className="w-[28%] text-left px-4 py-4 text-xs font-bold text-slate-500 uppercase">Sản phẩm</th>
                    <th className="text-center px-4 py-4 text-xs font-bold text-slate-500 uppercase">SL</th>
                    <th className="text-right px-4 py-4 text-xs font-bold text-slate-500 uppercase">Tổng</th>
                    <th className="w-[18%] min-w-[140px] text-center px-4 py-4 text-xs font-bold text-slate-500 uppercase">Trạng thái</th>
                    <th className="text-center px-4 py-4 text-xs font-bold text-slate-500 uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPreorders.map((po) => {
                    const placed = formatOrderDate(po.createdAt);
                    const expires = formatOrderDate(po.expiresAt);
                    return (
                    <tr key={po.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="px-4 py-4">
                        <div className="text-sm font-bold text-violet-700">{po.id}</div>
                        <div className="text-xs font-semibold text-slate-600">
                          Đặt: {placed.date} {placed.time}
                        </div>
                        <div className="text-xs text-slate-400">
                          Hạn: {expires.date} {expires.time}
                        </div>
                      </td>
                      <td className="max-w-0 px-4 py-4 align-top">
                        <ClampedProductName name={po.itemName} className="text-slate-700" />
                      </td>
                      <td className="px-4 py-4 text-center text-sm font-bold">{po.quantity}</td>
                      <td className="px-4 py-4 text-right text-sm font-bold">
                        {po.totalAmount.toLocaleString('vi-VN')}đ
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-center">
                        <PreorderStatusBadge status={po.status} />
                      </td>
                      <td className="px-4 py-4 text-center">
                        {po.status === 'pending_admin' ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (!confirm('Hủy đặt trước và hoàn tiền?')) return;
                              const r = cancelPreorderByUser(po.id);
                              if (!r.ok) alert(r.error);
                              else setPreorders(getPreordersForCustomer());
                            }}
                            className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100"
                          >
                            Hủy & hoàn tiền
                          </button>
                        ) : po.status === 'fulfilled' && po.deliveredContents.length > 0 ? (
                          <button
                            type="button"
                            onClick={() =>
                              alert(`Nội dung giao:\n${po.deliveredContents.join('\n---\n')}`)
                            }
                            className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                          >
                            Xem hàng
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {preorders.length === 0 ? (
              <p className="py-16 text-center text-slate-400 font-medium">Chưa có đơn đặt trước</p>
            ) : null}
          </div>
        ) : (
          <>
        {/* Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã đơn hàng, tên sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 outline-none text-sm font-medium text-slate-700 placeholder:text-slate-400"
            />
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">
              <Filter className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-bold text-slate-600">Lọc</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1280px] table-fixed">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="w-[4%] px-4 py-4 text-left border-r border-slate-200">
                    <input
                      type="checkbox"
                      checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200">Thao tác</th>
                  <th className="text-left px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200">Đơn hàng</th>
                  <th className="w-[26%] text-left px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200">Tên sản phẩm</th>
                  <th className="text-center px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200">Số lượng</th>
                  <th className="text-right px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200">Thanh toán</th>
                  <th className="text-center px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200">Trạng thái</th>
                  <th className="text-left px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, index) => (
                  <motion.tr 
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-slate-200 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-4 py-4 border-r border-slate-200">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => toggleSelectOrder(order.id)}
                        className="w-4 h-4 rounded border-slate-300 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-4 border-r border-slate-200">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleView(order)}
                          className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold transition-colors"
                        >
                          View
                        </button>
                        {order.raw.deliveredContents.length > 0 ? (
                          <button
                            onClick={() => handleDownload(order)}
                            className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-xs font-bold transition-colors"
                          >
                            Download
                          </button>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-4 border-r border-slate-200">
                      <div className="text-sm font-bold text-brand-primary">{order.id}</div>
                      <div className="text-xs text-slate-400">{order.date} {order.time}</div>
                    </td>
                    <td className="max-w-0 px-4 py-4 align-top border-r border-slate-200">
                      <ClampedProductName name={order.productName} className="text-slate-700" />
                    </td>
                    <td className="px-4 py-4 text-center border-r border-slate-200">
                      <span className="text-sm font-bold text-slate-700">{order.quantity}</span>
                    </td>
                    <td className="px-4 py-4 text-right border-r border-slate-200">
                      <span className="text-sm font-bold text-slate-800">{order.payment}</span>
                    </td>
                    <td className="px-4 py-4 text-center border-r border-slate-200">
                      {getStatusBadge(order.status, order.statusLabel)}
                    </td>
                    <td className="px-4 py-4">
                      <input
                        type="text"
                        defaultValue={order.note || ''}
                        placeholder="Nhập ghi chú..."
                        className="w-full px-2 py-1 text-sm text-slate-500 bg-transparent border border-transparent hover:border-slate-300 focus:border-brand-primary focus:outline-none rounded transition-colors"
                        onBlur={(e) => {
                          // Handle save note logic here
                          console.log('Save note:', order.id, e.target.value);
                        }}
                      />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-slate-400 font-medium">Không tìm thấy đơn hàng nào</p>
            </div>
          )}
        </div>
          </>
        )}
      </div>
    </div>
  );
}
