import { Product } from '../types';
import { ShoppingCart, Info, Clock, Check, Package } from 'lucide-react';
import { motion } from 'motion/react';
import type { ProductCardStyle } from '../types/siteDesign';
import { ProductCover } from './ProductCover';
import { useLocaleCurrency } from '../context/LocaleCurrencyContext';

function stripHtml(text: string) {
  return text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function useProductCardText(product: Product) {
  const { td } = useLocaleCurrency();
  const displayName = td('product', product.id, 'name', product.name);
  const rawShort =
    product.shortDescription?.trim() ||
    stripHtml(product.description || '').slice(0, 160) ||
    '';
  const shortDescription = rawShort
    ? td('product', product.id, 'shortDescription', rawShort)
    : '';
  return { displayName, shortDescription };
}

const NO_COVER_MAX_FEATURES = 3;
const NO_COVER_MAX_FEATURE_CHARS = 72;
const NO_COVER_MAX_TITLE_CHARS = 120;

/** Chèn khoảng vào chuỗi dài liền để xuống dòng và line-clamp hoạt động */
function softenLongWords(text: string, chunk = 28): string {
  if (text.length <= chunk * 1.5) return text;
  return text.replace(new RegExp(`([^\\s]{${chunk}})`, 'g'), '$1 ').replace(/\s+/g, ' ').trim();
}

function truncateWithEllipsis(text: string, maxLen: number): string {
  const t = text.trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen).trim()}…`;
}

function parseFeatureLines(text: string): string[] {
  const trimmed = softenLongWords(text.trim());
  if (!trimmed) return [];
  const parts = trimmed
    .split(/[.;•|\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);
  const lines = parts.length > 0 ? parts : [trimmed];
  return lines.map((line) => truncateWithEllipsis(softenLongWords(line), NO_COVER_MAX_FEATURE_CHARS));
}

function ProductCardHeading({
  displayName,
  shortDescription,
  size = 'default',
}: {
  displayName: string;
  shortDescription: string;
  size?: 'default' | 'compact' | 'list';
}) {
  const titleClass =
    size === 'compact'
      ? 'line-clamp-2 text-[12px] font-bold uppercase leading-snug tracking-wide text-[#1E293B]'
      : size === 'list'
        ? 'line-clamp-2 text-[13px] font-bold uppercase leading-snug tracking-wide text-[#1E293B]'
        : 'line-clamp-2 text-[13px] font-bold uppercase leading-snug tracking-wide text-[#1E293B] sm:text-[14px]';

  const descClass =
    size === 'compact'
      ? 'mt-1.5 line-clamp-2 font-sans text-[11px] font-normal normal-case leading-relaxed tracking-normal text-zinc-500'
      : 'mt-1.5 line-clamp-2 font-sans text-[12px] font-normal normal-case leading-relaxed tracking-normal text-zinc-500';

  const title = truncateWithEllipsis(softenLongWords(displayName), NO_COVER_MAX_TITLE_CHARS);
  const desc = shortDescription
    ? truncateWithEllipsis(softenLongWords(shortDescription), NO_COVER_MAX_FEATURE_CHARS * 2)
    : '';

  return (
    <div className="min-w-0">
      <h3
        className={`min-w-0 overflow-hidden break-words font-[family-name:var(--font-product)] ${titleClass} transition-colors group-hover:text-brand-primary`}
        title={displayName}
      >
        {title}
      </h3>
      {desc ? (
        <p className={`min-w-0 overflow-hidden break-words ${descClass}`} title={shortDescription}>
          {desc}
        </p>
      ) : null}
    </div>
  );
}

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
  layout = 'default',
}: {
  product: Product;
  onBuy?: (product: Product) => void;
  onPreorder?: (product: Product) => void;
  layout?: 'default' | 'compact' | 'list';
}) {
  const { t } = useLocaleCurrency();
  const hasStock = product.stock > 0;
  const showPreorder = Boolean(product.preorderEnabled && product.shopId && product.itemId);
  const buyNowEnabled = hasStock;

  const btnRound = layout === 'list' ? 'rounded-lg' : 'rounded-xl';
  const btnHeight =
    layout === 'list' ? 'h-10' : layout === 'compact' ? 'py-2' : 'py-3';
  const btnText =
    layout === 'list' ? 'text-[12px]' : layout === 'compact' ? 'text-[10px]' : 'text-[12px]';
  const iconSize =
    layout === 'list' ? 'h-4 w-4' : layout === 'compact' ? 'h-3 w-3' : 'h-4 w-4';

  if (!showPreorder && !hasStock) {
    return (
      <span
        className={`inline-flex items-center justify-center font-bold text-zinc-500 ${btnRound} bg-zinc-100 px-3 ${
          layout === 'list' ? 'h-10 w-full text-[12px]' : layout === 'compact' ? 'py-2 text-[10px]' : 'mt-4 w-full py-2.5 text-[11px]'
        }`}
      >
        {t('product_out_of_stock', 'Hết hàng')}
      </span>
    );
  }

  const buyBtnClass = buyNowEnabled
    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-sm shadow-emerald-500/25 hover:from-emerald-600 hover:to-emerald-700'
    : 'cursor-not-allowed bg-zinc-100 text-zinc-400';

  const wrapperClass =
    layout === 'list'
      ? `grid w-full gap-2 ${showPreorder ? 'grid-cols-1' : 'grid-cols-1'}`
      : layout === 'compact'
        ? `relative z-20 mt-3 ${showPreorder ? 'grid grid-cols-2 gap-1.5' : 'space-y-1.5'}`
        : `relative z-20 mt-4 ${showPreorder ? 'grid grid-cols-2 gap-2' : 'space-y-1.5'}`;

  return (
    <div className={wrapperClass}>
      <button
        type="button"
        disabled={!buyNowEnabled}
        onClick={(e) => {
          e.stopPropagation();
          if (!buyNowEnabled) return;
          onBuy?.(product);
        }}
        className={`flex w-full items-center justify-center gap-1.5 font-bold transition-all ${btnRound} ${btnHeight} ${btnText} ${buyBtnClass}`}
      >
        <ShoppingCart className={iconSize} />
        {t('product_buy_now', 'Mua ngay')}
      </button>
      {showPreorder ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPreorder?.(product);
          }}
          className={`flex w-full items-center justify-center gap-1.5 border border-violet-200 bg-violet-50 font-bold text-violet-800 transition-colors hover:bg-violet-100 ${btnRound} ${btnHeight} ${btnText}`}
        >
          <Clock className={iconSize} />
          {t('product_preorder', 'Đặt trước')}
        </button>
      ) : null}
    </div>
  );
}

function ProductCardList({ product, index, onBuy, onPreorder }: ProductCardProps) {
  const { formatMoney, t } = useLocaleCurrency();
  const { displayName, shortDescription } = useProductCardText(product);
  const hasStock = product.stock > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group flex flex-col gap-4 overflow-hidden rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-sm transition-all hover:border-emerald-100 hover:shadow-md sm:flex-row sm:items-center sm:gap-5 sm:p-5"
    >
      <div className="relative h-[108px] w-full shrink-0 overflow-hidden rounded-xl bg-zinc-50 sm:h-[120px] sm:w-[120px]">
        <ProductCover
          image={product.image}
          alt={product.name}
          className="h-full w-full object-cover"
          iconClassName="h-10 w-10"
        />
        <span className="absolute left-2 top-2 rounded-md bg-brand-primary px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white shadow-sm">
          {product.category}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 sm:py-0.5">
        <ProductCardHeading
          displayName={displayName}
          shortDescription={shortDescription}
          size="list"
        />
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
          <span className="rounded-md bg-emerald-50 px-2 py-1 text-emerald-700 ring-1 ring-emerald-100">
            {t('product_sold', 'Đã bán')}: {product.sold}
          </span>
          <span
            className={`rounded-md px-2 py-1 ring-1 ${
              hasStock
                ? 'bg-zinc-50 text-zinc-600 ring-zinc-100'
                : 'bg-amber-50 text-amber-800 ring-amber-100'
            }`}
          >
            {t('product_stock', 'Kho')}: {product.stock}
            {!hasStock ? ` · ${t('product_out_of_stock', 'Hết hàng')}` : ''}
          </span>
        </div>
      </div>

      <div className="flex w-full shrink-0 flex-col justify-center gap-3 border-t border-zinc-100 pt-4 sm:w-[188px] sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
        <div className="text-center sm:text-right">
          <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-400">
            {t('product_price_label', 'Giá')}
          </p>
          <p className="text-xl font-black leading-tight text-red-600">{formatMoney(product.price)}</p>
        </div>
        <BuyActions product={product} onBuy={onBuy} onPreorder={onPreorder} layout="list" />
      </div>
    </motion.div>
  );
}

/** Thẻ không ảnh — layout header / tính năng / thống kê / nút (Thiết kế → Không ảnh) */
function ProductCardNoCover({ product, index, onBuy, onPreorder }: ProductCardProps) {
  const { formatMoney, t } = useLocaleCurrency();
  const { displayName, shortDescription } = useProductCardText(product);
  const features = parseFeatureLines(shortDescription);
  const visibleFeatures = features.slice(0, NO_COVER_MAX_FEATURES);
  const hasMoreFeatures = features.length > NO_COVER_MAX_FEATURES;
  const displayTitle = truncateWithEllipsis(softenLongWords(displayName), NO_COVER_MAX_TITLE_CHARS);
  const hasStock = product.stock > 0;
  const showPreorder = Boolean(product.preorderEnabled && product.shopId && product.itemId);
  const buyEnabled = hasStock;
  const stockBadgeClass = hasStock
    ? 'bg-emerald-100 text-emerald-800 ring-emerald-200/70'
    : 'bg-amber-50 text-amber-800 ring-amber-200/60';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.06)] ring-1 ring-zinc-100/80 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_8px_24px_rgba(16,185,129,0.12)]"
    >
      <div className="border-b border-zinc-100/90 bg-gradient-to-br from-zinc-50 via-white to-emerald-50/30 px-4 py-3.5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md shadow-emerald-500/25 ring-2 ring-white">
            <Package className="h-5 w-5 text-white" strokeWidth={2} />
          </div>
          <h3
            className="line-clamp-3 min-w-0 flex-1 overflow-hidden break-words pt-0.5 font-[family-name:var(--font-product)] text-[12px] font-bold uppercase leading-[1.35] tracking-wide text-[#1E293B] transition-colors group-hover:text-brand-primary sm:text-[13px]"
            title={displayName}
          >
            {displayTitle}
          </h3>
        </div>
      </div>

      <div className="flex-1 px-4 py-3.5">
        <div className="max-h-[108px] min-h-[92px] overflow-hidden rounded-xl border border-zinc-100/90 bg-zinc-50/40 px-3 py-3">
          {visibleFeatures.length > 0 ? (
            <ul className="space-y-2.5">
              {visibleFeatures.map((line, idx) => (
                <li key={`${idx}-${line.slice(0, 12)}`} className="flex min-w-0 items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 ring-1 ring-emerald-200/60">
                    <Check className="h-3 w-3 text-brand-primary" strokeWidth={3} aria-hidden />
                  </span>
                  <span
                    className="line-clamp-2 min-w-0 flex-1 overflow-hidden break-words text-[12px] font-medium leading-relaxed text-zinc-600"
                    title={line}
                  >
                    {line}
                  </span>
                </li>
              ))}
              {hasMoreFeatures ? (
                <li className="pt-0.5 pl-7 text-[11px] font-bold text-zinc-400">…</li>
              ) : null}
            </ul>
          ) : (
            <p className="text-center text-[12px] italic leading-relaxed text-zinc-400">
              {t('product_no_features', 'Chưa có mô tả tính năng.')}
            </p>
          )}
        </div>
      </div>

      <div className="mx-4 mb-3 overflow-hidden rounded-xl border border-zinc-100 bg-white shadow-sm">
        <div className="grid grid-cols-3 divide-x divide-zinc-100">
          <div className="flex flex-col items-center justify-center bg-zinc-50/50 px-2 py-3.5 text-center">
            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">
              {t('product_country', 'Quốc gia')}
            </span>
            <span className="mt-2 rounded-md bg-white px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-zinc-700 ring-1 ring-zinc-200/80">
              {product.category?.slice(0, 10) || '—'}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center px-2 py-3.5 text-center">
            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">
              {t('product_in_stock', 'Hiện có')}
            </span>
            <span
              className={`mt-2 inline-flex min-w-[2.75rem] items-center justify-center rounded-full px-2.5 py-1 text-[11px] font-black tabular-nums ring-1 ${stockBadgeClass}`}
            >
              {product.stock.toLocaleString('vi-VN')}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center bg-gradient-to-b from-white to-red-50/30 px-2 py-3.5 text-center">
            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">
              {t('product_price', 'Giá')}
            </span>
            <p className="mt-1.5 text-lg font-black leading-none tracking-tight text-red-600">
              {formatMoney(product.price)}
            </p>
            <p className="mt-1.5 text-[9px] font-semibold text-zinc-400">
              {t('product_sold', 'Đã bán')}:{' '}
              <span className="font-bold text-zinc-600">{product.sold}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-auto space-y-2 border-t border-zinc-100 bg-zinc-50/40 px-3.5 py-3.5">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white py-2.5 text-[11px] font-bold uppercase tracking-wide text-zinc-700 shadow-sm transition-all hover:border-brand-primary/40 hover:text-brand-primary"
        >
          <Info className="h-4 w-4 text-brand-primary/80" />
          {t('product_view_detail', 'Xem chi tiết')}
        </button>
        {buyEnabled ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onBuy?.(product);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary to-emerald-600 py-3 text-[11px] font-bold uppercase tracking-wide text-white shadow-md shadow-emerald-500/25 transition-all hover:shadow-lg hover:shadow-emerald-500/30"
          >
            <ShoppingCart className="h-4 w-4" />
            {t('product_buy_now', 'Mua ngay')}
          </button>
        ) : showPreorder ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPreorder?.(product);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 py-3 text-[11px] font-bold uppercase tracking-wide text-white shadow-md shadow-violet-500/20 transition-all hover:from-violet-700 hover:to-violet-800"
          >
            <Clock className="h-4 w-4" />
            {t('product_preorder', 'Đặt trước')}
          </button>
        ) : (
          <div className="rounded-xl border border-amber-200/80 bg-amber-50 px-3 py-2.5 text-center">
            <p className="text-[11px] font-bold uppercase tracking-wide text-amber-800">
              {t('product_out_of_stock', 'Hết hàng')}
            </p>
          </div>
        )}
        {showPreorder && buyEnabled ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPreorder?.(product);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-violet-200/80 bg-violet-50 py-2 text-[10px] font-bold uppercase tracking-wide text-violet-800 transition-colors hover:bg-violet-100"
          >
            <Clock className="h-3.5 w-3.5" />
            {t('product_preorder', 'Đặt trước')}
          </button>
        ) : null}
      </div>
    </motion.div>
  );
}

function ProductCardCompact({ product, index, onBuy, onPreorder }: ProductCardProps) {
  const { formatMoney, t } = useLocaleCurrency();
  const { displayName, shortDescription } = useProductCardText(product);
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
        <ProductCardHeading
          displayName={displayName}
          shortDescription={shortDescription}
          size="compact"
        />
        <p className="mt-2 text-base font-bold text-red-600">{formatMoney(product.price)}</p>
        <p className="text-[9px] font-bold text-slate-400">
          {t('product_sold', 'Bán')} {product.sold} · {t('product_stock', 'Kho')} {product.stock}
        </p>
        <BuyActions product={product} onBuy={onBuy} onPreorder={onPreorder} layout="compact" />
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
  const { formatMoney, t } = useLocaleCurrency();
  const { displayName, shortDescription } = useProductCardText(product);
  if (variant === 'no-cover')
    return (
      <ProductCardNoCover product={product} index={index} onBuy={onBuy} onPreorder={onPreorder} />
    );
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
        <div className="grow">
          <ProductCardHeading
            displayName={displayName}
            shortDescription={shortDescription}
          />
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-4">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#94A3B8]">Niêm yết</span>
            <span className="text-lg font-bold text-red-600">{formatMoney(product.price)}</span>
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
