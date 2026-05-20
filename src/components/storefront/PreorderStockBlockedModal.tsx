import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { AlertCircle, ShoppingCart, X } from 'lucide-react';
import type { Product } from '../../types';

interface PreorderStockBlockedModalProps {
  product: Product;
  onClose: () => void;
  onBuyNow: () => void;
}

export function PreorderStockBlockedModal({ product, onClose, onBuyNow }: PreorderStockBlockedModalProps) {
  const modal = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[265] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50/80 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
              <AlertCircle className="h-5 w-5 text-amber-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-black text-zinc-900">Chưa thể đặt trước</h3>
              <p className="mt-0.5 line-clamp-2 text-[12px] font-medium text-zinc-600">{product.name}</p>
            </div>
            <button type="button" onClick={onClose} className="shrink-0 rounded-lg p-1 hover:bg-white/60">
              <X className="h-5 w-5 text-zinc-500" />
            </button>
          </div>
        </div>

        <div className="space-y-4 px-5 py-4">
          <p className="text-[13px] leading-relaxed text-zinc-700">
            Kho còn{' '}
            <span className="font-black text-amber-700">{product.stock}</span> sản phẩm sẵn có. Bạn cần{' '}
            <span className="font-bold">mua hết hàng trong kho</span> (dùng <span className="font-bold">Mua ngay</span>)
            trước khi có thể đặt trước.
          </p>
          <p className="rounded-xl border border-amber-100 bg-amber-50/60 px-3 py-2.5 text-[12px] text-amber-900">
            Đặt trước chỉ dùng khi hết hàng — admin sẽ xác nhận và giao khi có kho trở lại.
          </p>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-[12px] font-bold text-zinc-600 hover:bg-zinc-50"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={onBuyNow}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-2.5 text-[12px] font-bold text-white shadow-sm hover:from-emerald-600 hover:to-emerald-700"
            >
              <ShoppingCart className="h-4 w-4" />
              Mua ngay
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  return createPortal(modal, document.body);
}
