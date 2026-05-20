import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { CheckCircle2, History, X, ShoppingBag } from 'lucide-react';

export interface PurchaseSuccessModalProps {
  variant: 'buy' | 'preorder';
  productName: string;
  orderId?: string;
  deliveredCount?: number;
  onClose: () => void;
  onGoToOrderHistory: () => void;
}

export function PurchaseSuccessModal({
  variant,
  productName,
  orderId,
  deliveredCount = 0,
  onClose,
  onGoToOrderHistory,
}: PurchaseSuccessModalProps) {
  const isBuy = variant === 'buy';

  const modal = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[270] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative px-6 pb-2 pt-8 text-center">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
          <div
            className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${
              isBuy ? 'bg-emerald-100 text-emerald-600' : 'bg-violet-100 text-violet-600'
            }`}
          >
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-black text-slate-900">
            {isBuy ? 'Mua hàng thành công!' : 'Đặt trước thành công!'}
          </h3>
          <p className="mt-2 text-sm font-medium text-slate-500">{productName}</p>
          {orderId ? (
            <p className="mt-1 text-xs font-bold text-brand-primary">Mã đơn: {orderId}</p>
          ) : null}
        </div>

        <div className="px-6 py-4">
          <p className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-center text-[13px] leading-relaxed text-slate-600">
            {isBuy ? (
              <>
                Đơn hàng đã được xử lý
                {deliveredCount > 0
                  ? ` và giao ${deliveredCount} tài khoản/tài nguyên.`
                  : '.'}{' '}
                Bạn có thể xem chi tiết trong lịch sử đơn hàng.
              </>
            ) : (
              <>
                Admin sẽ xác nhận trong thời gian chờ. Theo dõi trạng thái tại tab{' '}
                <strong>Đặt trước</strong> trong lịch sử đơn hàng.
              </>
            )}
          </p>
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/80 px-6 py-4 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Tiếp tục mua sắm
          </button>
          <button
            type="button"
            onClick={onGoToOrderHistory}
            className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 ${
              isBuy
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                : 'bg-gradient-to-r from-violet-500 to-violet-600'
            }`}
          >
            {isBuy ? <ShoppingBag className="h-4 w-4" /> : <History className="h-4 w-4" />}
            Xem lịch sử đơn hàng
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  return createPortal(modal, document.body);
}
