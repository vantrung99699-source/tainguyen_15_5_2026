import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { Clock, X } from 'lucide-react';
import type { Product } from '../../types';
import { ProductDescriptions } from '../storefront/ProductDescriptions';
import { createPreorder } from '../../services/preorderService';
import { loadCustomerSession } from '../../services/customerSession';

interface PreorderCheckoutModalProps {
  product: Product;
  onClose: () => void;
  onSuccess: () => void;
}

export function PreorderCheckoutModal({ product, onClose, onSuccess }: PreorderCheckoutModalProps) {
  const session = loadCustomerSession();
  const min = product.minPurchase ?? 1;
  const max = product.maxPurchase ?? 999;
  const maxWaitDays = product.preorderMaxWaitDays ?? 30;
  const defaultWait = Math.min(3, maxWaitDays);
  const [quantity, setQuantity] = useState(min);
  const [waitDays, setWaitDays] = useState(defaultWait);
  const [error, setError] = useState('');

  const total = product.price * quantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product.shopId || !product.itemId) {
      setError('Sản phẩm không hỗ trợ đặt trước.');
      return;
    }
    const result = createPreorder({
      shopId: product.shopId,
      itemId: product.itemId,
      quantity,
      waitDays,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onSuccess();
    onClose();
  };

  const modal = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[260] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-zinc-100 px-5 py-4">
          <div className="min-w-0">
            <h3 className="flex items-center gap-2 text-base font-black text-zinc-900">
              <Clock className="h-5 w-5 text-violet-600" />
              Đặt trước
            </h3>
            <p className="mt-0.5 truncate text-[12px] text-zinc-500">{product.name}</p>
          </div>
          <button type="button" onClick={onClose} className="shrink-0 rounded-lg p-1 hover:bg-zinc-100">
            <X className="h-5 w-5 text-zinc-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
            <ProductDescriptions product={product} />

            <div className="rounded-xl border border-violet-100 bg-violet-50/60 px-3 py-2.5 text-[12px] text-violet-900">
              <p className="font-bold">Số dư: {session.balance.toLocaleString('vi-VN')} đ</p>
              <p className="mt-1 flex items-center gap-1 text-violet-800">
                <Clock className="h-3.5 w-3.5" />
                Bạn chọn thời gian chờ — quá hạn chưa xác nhận sẽ tự hoàn tiền
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase text-zinc-500">
                Số ngày chờ xác nhận (tối đa {maxWaitDays} ngày)
              </label>
              <input
                type="number"
                min={1}
                max={maxWaitDays}
                value={waitDays}
                onChange={(e) => setWaitDays(Number(e.target.value) || 1)}
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm font-bold outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
              />
              <p className="mt-1 text-[11px] text-zinc-400">
                Sau {waitDays} ngày nếu admin chưa xác nhận → tự động hoàn {total.toLocaleString('vi-VN')} đ
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase text-zinc-500">Số lượng đặt trước</label>
              <input
                type="number"
                min={min}
                max={max}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value) || min)}
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm font-bold outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
              />
              <p className="mt-1 text-[11px] text-zinc-400">
                Từ {min} đến {max} · Đơn giá {product.price.toLocaleString('vi-VN')} đ
              </p>
            </div>

            <div className="rounded-xl bg-zinc-50 px-4 py-3">
              <p className="text-[11px] font-bold uppercase text-zinc-400">Tổng thanh toán</p>
              <p className="text-xl font-black text-red-600">{total.toLocaleString('vi-VN')} đ</p>
              <p className="mt-1 text-[11px] text-zinc-500">
                Tiền tạm giữ — hoàn lại nếu bị từ chối, quá hạn, hoặc bạn hủy trước khi admin xác nhận
              </p>
            </div>

            {error ? <p className="text-[12px] font-medium text-red-600">{error}</p> : null}
          </div>

          <div className="shrink-0 border-t border-zinc-100 px-5 py-4">
            <button
              type="submit"
              className="w-full rounded-xl bg-violet-600 py-3 text-sm font-black text-white hover:bg-violet-700"
            >
              Xác nhận đặt trước
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );

  return createPortal(modal, document.body);
}
