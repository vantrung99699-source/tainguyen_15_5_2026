import { Product } from '../types';
import { ShoppingCart, Info, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import type { ProductCardStyle } from '../types/siteDesign';
import { ProductCover } from './ProductCover';
import { useLocaleCurrency } from '../context/LocaleCurrencyContext';

interface ProductCardProps {
  product: Product;
  index: number;
  variant?: ProductCardStyle;
  onBuy?: (product: Product) => void;
  onPreorder?: (product: Product) => void;
  key?: string | number;
}

function BuyActions({
  product,
  onBuy,
  onPreorder,
  compact,
}: {
  product: Product;
  onBuy?: (product: Product) => void;
  onPreorder?: (product: Product) => void;
  compact?: boolean;
}) {
  const { t } = useLocaleCurrency();
  const hasStock = product.stock > 0;
  const showPreorder = Boolean(product.preorderEnabled && product.shopId && product.itemId);
  const buyNowEnabled = hasStock;

  if (!showPreorder && !hasStock) {
    return (
      <p className={`text-center font-bold text-zinc-400 ${compact ? 'mt-3 text-[10px]' : 'mt-4 text-[11px]'}`}>
        {t('product_out_of_stock', 'Hết hàng')}
      </p>
    );
  }

  const btnBase = compact ? 'py-2 text-[10px]' : 'py-3 text-[12px]';
  const buyBtnClass = buyNowEnabled
    ? `bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-sm shadow-emerald-500/30 hover:from-emerald-600 hover:to-emerald-700`
    : `bg-zinc-100 text-zinc-400 cursor-not-allowed`;

  return (
    <div
      className={`relative z-20 ${
        compact
          ? `mt-3 ${showPreorder ? 'grid grid-cols-2 gap-1.5' : 'space-y-1'}`
          : `mt-4 ${showPreorder ? 'grid grid-cols-2 gap-2' : 'space-y-1'}`
      }`}
    >
      <button
        type="button"
        disabled={!buyNowEnabled}
        onClick={(e) => {
          e.stopPropagation();
          if (!buyNowEnabled) return;
          onBuy?.(product);
        }}
        className={`flex w-full items-center justify-center gap-1.5 rounded-xl font-bold transition-all ${btnBase} ${buyBtnClass}`}
      >
        <ShoppingCart className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
        {t('product_buy_now', 'Mua ngay')}
      </button>
      {showPreorder ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPreorder?.(product);
          }}
          className={`flex w-full items-center justify-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 font-bold text-violet-800 transition-colors hover:bg-violet-100 ${
            compact ? 'py-2 text-[10px]' : 'py-2.5 text-[11px]'
          }`}
        >
          <Clock className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
          {t('product_preorder', 'Đặt trước')}
        </button>
      ) : null}
    </div>
  );
}

function ProductCardList({ product, index, onBuy, onPreorder }: ProductCardProps) {
  const { formatMoney, t, td } = useLocaleCurrency();
  const displayName = td('product', product.id, 'name', product.name);
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group flex gap-4 overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md"
    >
      <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-xl sm:h-28 sm:w-32">
        <ProductCover
          image={product.image}
          alt={product.name}
          className="h-full w-full object-cover"
          iconClassName="h-10 w-10"
        />
        <span className="absolute left-2 top-2 rounded-md bg-brand-primary px-2 py-0.5 text-[8px] font-bold uppercase text-white">
          {product.category}
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <h3 className="line-clamp-2 text-[13px] font-black uppercase text-[#1E293B] group-hover:text-brand-primary">
          {displayName}
        </h3>
        <p className="mt-2 text-lg font-black text-red-600">{formatMoney(product.price)}</p>
        <p className="text-[10px] font-bold text-slate-500">
          {t('product_sold', 'Đã bán')}: {product.sold} · {t('product_stock', 'Kho')}: {product.stock}
        </p>
        <div className="mt-auto flex gap-2 pt-3">
          <BuyActions product={product} onBuy={onBuy} onPreorder={onPreorder} compact />
        </div>
      </div>
    </motion.div>
  );
}

function ProductCardCompact({ product, index, onBuy, onPreorder }: ProductCardProps) {
  const { formatMoney, t, td } = useLocaleCurrency();
  const displayName = td('product', product.id, 'name', product.name);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md"
    >
      <div className="relative h-32 overflow-hidden">
        <ProductCover
          image={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
          iconClassName="h-12 w-12"
        />
        <span className="absolute left-2 top-2 rounded bg-brand-primary px-2 py-0.5 text-[8px] font-bold uppercase text-white">
          {product.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 text-[11px] font-black uppercase group-hover:text-brand-primary">
          {displayName}
        </h3>
        <p className="mt-2 text-base font-black text-red-600">{formatMoney(product.price)}</p>
        <p className="text-[9px] font-bold text-slate-400">
          {t('product_sold', 'Bán')} {product.sold} · {t('product_stock', 'Kho')} {product.stock}
        </p>
        <BuyActions product={product} onBuy={onBuy} onPreorder={onPreorder} compact />
      </div>
    </motion.div>
  );
}

export default function ProductCard({
  product,
  index,
  variant = 'grid',
  onBuy,
  onPreorder,
}: ProductCardProps) {
  const { formatMoney, t, td } = useLocaleCurrency();
  const displayName = td('product', product.id, 'name', product.name);
  if (variant === 'list') return <ProductCardList product={product} index={index} onBuy={onBuy} onPreorder={onPreorder} />;
  if (variant === 'compact')
    return <ProductCardCompact product={product} index={index} onBuy={onBuy} onPreorder={onPreorder} />;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md"
    >
      <div className="relative h-44 shrink-0 overflow-hidden">
        <ProductCover
          image={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          iconClassName="h-16 w-16"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          <span className="rounded-md bg-brand-primary px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm">
            {product.category}
          </span>
        </div>
        <button
          type="button"
          className="absolute right-3 top-3 rounded-lg bg-white/20 p-2 text-white backdrop-blur-md transition-all hover:bg-white hover:text-brand-primary"
        >
          <Info className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 grow text-[13px] font-black uppercase leading-snug tracking-wide text-[#1E293B] transition-colors group-hover:text-brand-primary">
          {displayName}
        </h3>

        <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-4">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#94A3B8]">Niêm yết</span>
            <span className="text-lg font-black text-red-600">{formatMoney(product.price)}</span>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-[10px] font-bold italic text-emerald-600">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>
                {t('product_sold', 'Đã bán')}: {product.sold}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1 text-[10px] font-bold italic text-slate-500">
              <span>
                {t('product_stock', 'Kho')}: {product.stock}
              </span>
            </div>
          </div>
        </div>

        <BuyActions product={product} onBuy={onBuy} onPreorder={onPreorder} />
        <button
          type="button"
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2 text-[11px] font-bold text-slate-600 transition-all hover:border-brand-primary hover:text-brand-primary"
        >
          <Info className="h-3.5 w-3.5" />
          Chi tiết
        </button>
      </div>
    </motion.div>
  );
}
