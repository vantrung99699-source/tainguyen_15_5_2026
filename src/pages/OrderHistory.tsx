import { useEffect, useState } from 'react';
import { Search, ChevronLeft, Filter, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import type { PreorderOrder, PreorderStatus } from '../types/preorder';
import {
  cancelPreorderByUser,
  getPreordersForCustomer,
  PREORDERS_UPDATED,
} from '../services/preorderService';

const PREORDER_STATUS_LABELS: Record<PreorderStatus, string> = {
  pending_admin: 'Chờ xác nhận',
  approved: 'Đã duyệt — chờ kho',
  fulfilled: 'Đã giao hàng',
  rejected: 'Đã từ chối',
  cancelled_by_user: 'Đã hủy',
  expired_refunded: 'Hết hạn — đã hoàn',
};

interface OrderItem {
  id: string;
  date: string;
  time: string;
  productName: string;
  quantity: number;
  payment: string;
  status: 'completed' | 'pending' | 'cancelled';
  note: string;
}

const mockOrders: OrderItem[] = [
  { id: 'DH001234', date: '15/05/2026', time: '14:30', productName: 'Tài khoản Gmail 1 năm', quantity: 5, payment: '500.000đ', status: 'completed', note: 'Giao hàng nhanh' },
  { id: 'DH001235', date: '15/05/2026', time: '13:45', productName: 'Tài khoản Facebook VIP', quantity: 2, payment: '1.200.000đ', status: 'completed', note: '' },
  { id: 'DH001236', date: '14/05/2026', time: '10:20', productName: 'Tool SEO Pro', quantity: 1, payment: '2.500.000đ', status: 'pending', note: 'Đang xử lý' },
  { id: 'DH001237', date: '14/05/2026', time: '09:15', productName: 'Tài khoản TikTok 10K followers', quantity: 3, payment: '900.000đ', status: 'completed', note: '' },
  { id: 'DH001238', date: '13/05/2026', time: '16:50', productName: 'Proxy Premium', quantity: 10, payment: '1.000.000đ', status: 'cancelled', note: 'Khách hủy đơn' },
];

export default function OrderHistory() {
  const [tab, setTab] = useState<'orders' | 'preorders'>('orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<OrderItem[]>(mockOrders);
  const [preorders, setPreorders] = useState<PreorderOrder[]>(() => getPreordersForCustomer());
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => setPreorders(getPreordersForCustomer());
    window.addEventListener(PREORDERS_UPDATED, sync);
    return () => window.removeEventListener(PREORDERS_UPDATED, sync);
  }, []);

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.productName.toLowerCase().includes(searchQuery.toLowerCase())
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

  const handleDelete = (orderId: string) => {
    if (confirm('Bạn có chắc muốn xóa đơn hàng này?')) {
      setOrders(orders.filter(o => o.id !== orderId));
      setSelectedOrders(prev => prev.filter(id => id !== orderId));
    }
  };

  const handleView = (order: OrderItem) => {
    alert(`Xem chi tiết đơn hàng ${order.id}`);
  };

  const handleDownload = (order: OrderItem) => {
    alert(`Tải xuống đơn hàng ${order.id}`);
  };

  const getStatusBadge = (status: OrderItem['status']) => {
    const styles = {
      completed: 'bg-emerald-100 text-emerald-700',
      pending: 'bg-amber-100 text-amber-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    const labels = {
      completed: 'Hoàn thành',
      pending: 'Đang xử lý',
      cancelled: 'Đã hủy',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] pb-20">
      <div className="max-w-[1400px] mx-auto px-6 pt-10">
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
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-4 text-xs font-bold text-slate-500 uppercase">Mã đơn</th>
                    <th className="text-left px-4 py-4 text-xs font-bold text-slate-500 uppercase">Sản phẩm</th>
                    <th className="text-center px-4 py-4 text-xs font-bold text-slate-500 uppercase">SL</th>
                    <th className="text-right px-4 py-4 text-xs font-bold text-slate-500 uppercase">Tổng</th>
                    <th className="text-center px-4 py-4 text-xs font-bold text-slate-500 uppercase">Trạng thái</th>
                    <th className="text-center px-4 py-4 text-xs font-bold text-slate-500 uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {preorders.map((po) => (
                    <tr key={po.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="px-4 py-4">
                          <motion.div className="text-sm font-bold text-violet-700">{po.id}</motion.div>
                        <div className="text-xs text-slate-400">
                          Hạn: {new Date(po.expiresAt).toLocaleDateString('vi-VN')}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-slate-700">{po.itemName}</td>
                      <td className="px-4 py-4 text-center text-sm font-bold">{po.quantity}</td>
                      <td className="px-4 py-4 text-right text-sm font-bold">
                        {po.totalAmount.toLocaleString('vi-VN')}đ
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                          {PREORDER_STATUS_LABELS[po.status]}
                        </span>
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
                  ))}
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
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-4 text-left border-r border-slate-200">
                    <input
                      type="checkbox"
                      checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200">Thao tác</th>
                  <th className="text-left px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200">Đơn hàng</th>
                  <th className="text-left px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200">Tên sản phẩm</th>
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
                        <button 
                          onClick={() => handleDownload(order)}
                          className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-xs font-bold transition-colors"
                        >
                          Download
                        </button>
                        <button 
                          onClick={() => handleDelete(order.id)}
                          className="px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4 border-r border-slate-200">
                      <div className="text-sm font-bold text-brand-primary">{order.id}</div>
                      <div className="text-xs text-slate-400">{order.date} {order.time}</div>
                    </td>
                    <td className="px-4 py-4 border-r border-slate-200">
                      <span className="text-sm font-medium text-slate-700">{order.productName}</span>
                    </td>
                    <td className="px-4 py-4 text-center border-r border-slate-200">
                      <span className="text-sm font-bold text-slate-700">{order.quantity}</span>
                    </td>
                    <td className="px-4 py-4 text-right border-r border-slate-200">
                      <span className="text-sm font-bold text-slate-800">{order.payment}</span>
                    </td>
                    <td className="px-4 py-4 text-center border-r border-slate-200">
                      {getStatusBadge(order.status)}
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
