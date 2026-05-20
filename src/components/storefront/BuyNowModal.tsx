import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { ShoppingCart, X } from 'lucide-react';
import type { Product } from '../../types';
import { ProductDescriptions } from './ProductDescriptions';
import { createInstantPurchase } from '../../services/purchaseService';
import {
  CUSTOMER_SESSION_UPDATED,
  loadCustomerSession,
} from '../../services/customerSession';
import { WALLET_TX_UPDATED } from '../../services/walletTransactionService';
import { useLocaleCurrency } from '../../context/LocaleCurrencyContext';

interface BuyNowModalProps {
  product: Product;
  onClose: () => void;
  onSuccess: (payload: { deliveredContents: string[]; orderId: string }) => void;
}

export function BuyNowModal({ product, onClose, onSuccess }: BuyNowModalProps) {
  const { formatMoney } = useLocaleCurrency();
  const [balance, setBalance] = useState(() => loadCustomerSession().balance);
  const min = product.minPurchase ?? 1;
  const max = Math.min(product.maxPurchase ?? 999, product.stock);
  const [quantity, setQuantity] = useState(min);
  const [error, setError] = useState('');

  useEffect(() => {
    const sync = () => setBalance(loadCustomerSession().balance);
    window.addEventListener(CUSTOMER_SESSION_UPDATED, sync);
    window.addEventListener(WALLET_TX_UPDATED, sync);
    return () => {
      window.removeEventListener(CUSTOMER_SESSION_UPDATED, sync);
      window.removeEventListener(WALLET_TX_UPDATED, sync);
    };
  }, []);

  const total = product.price * quantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product.shopId || !product.itemId) {
      setError('Sản phẩm demo — chưa liên kết kho admin.');
      return;
    }
    const result = createInstantPurchase({
      shopId: product.shopId,
      itemId: product.itemId,
      quantity,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onSuccess({
      deliveredContents: result.deliveredContents,
      orderId: result.orderId,
    });
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
              <ShoppingCart className="h-5 w-5 text-brand-primary" />
              Mua ngay
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

            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-2.5 text-[12px] text-emerald-900">
              <p className="font-bold">Số dư: {formatMoney(balance)}</p>
              <p className="mt-0.5">Kho hiện có: {product.stock} · Giao ngay sau thanh toán</p>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase text-zinc-500">Số lượng mua</label>
              <input
                type="number"
                min={min}
                max={max}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value) || min)}
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm font-bold outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
              />
              <p className="mt-1 text-[11px] text-zinc-400">
                Từ {min} đến {max} · Đơn giá {formatMoney(product.price)}
              </p>
            </div>

            <div className="rounded-xl bg-zinc-50 px-4 py-3">
              <p className="text-[11px] font-bold uppercase text-zinc-400">Tổng thanh toán</p>
              <p className="text-xl font-black text-red-600">{formatMoney(total)}</p>
            </div>

            {error ? <p className="text-[12px] font-medium text-red-600">{error}</p> : null}
          </div>

          <div className="shrink-0 border-t border-zinc-100 px-5 py-4">
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-3 text-sm font-black text-white shadow-sm hover:from-emerald-600 hover:to-emerald-700"
            >
              Xác nhận mua ngay
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );

  return createPortal(modal, document.body);
}
