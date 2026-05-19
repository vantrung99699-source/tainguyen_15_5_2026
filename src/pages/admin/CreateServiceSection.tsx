import {
  useState,
  Fragment,
  useEffect,
  useRef,
  type ReactNode,
  type ChangeEvent,
  type ComponentType,
  type CSSProperties,
} from 'react';
import { createPortal } from 'react-dom';
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  Clock,
  Link2,
  MoreVertical,
  Box,
  X,
  Layers,
  ShoppingBag,
  Archive,
  HelpCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import {
  SOCIAL_ICON_PRESETS,
  presetIconUrl,
  isPresetIconUrl,
  resolveSocialIconPreset,
} from '../../constants/socialIcons';
import type { Category } from '../../types';
import ItemStockPage from './ItemStockPage';
import type { StockResource } from './stockResource';
import DetailDescriptionEditor from '../../components/admin/DetailDescriptionEditor';

type ShopStatus = 'visible' | 'hidden';
type SaleMode = 'fifo' | 'oldest' | 'newest' | 'random';

interface ServiceItem {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
  price: number;
  minPurchase: number;
  maxPurchase: number;
  stock: number;
  sold: number;
  shortDescription: string;
  detailDescription: string;
  saleMode: SaleMode;
  visibility: ShopStatus;
  enabled: boolean;
  /** Tài nguyên trong kho (mỗi phần tử = 1 dòng tài khoản / key / file…) */
  resources: StockResource[];
}

interface CreateItemInput {
  name: string;
  slug: string;
  price: number;
  minPurchase: number;
  maxPurchase: number;
  sold: number;
  shortDescription: string;
  detailDescription: string;
  saleMode: SaleMode;
  visibility: ShopStatus;
}
type IconSourceMode = 'preset' | 'upload';

interface CreateParentCategoryInput {
  title: string;
  slug: string;
  iconUrl: string;
  iconName: string;
  status: ShopStatus;
  seoDescription: string;
}

interface ServiceShop {
  id: number;
  title: string;
  slug: string;
  iconUrl: string;
  iconName: string;
  status: ShopStatus;
  seoDescription: string;
  category: string;
  date: string;
  username: string;
  items: ServiceItem[];
}

const CATEGORY_URL_PREFIX = 'https://taphoammo.vn/category/';
const PRODUCT_URL_PREFIX = 'https://taphoammo.vn/product/';
const DEFAULT_ITEM_MIN_PURCHASE = 1;
const DEFAULT_ITEM_MAX_PURCHASE = 1_000_000;

const inputClass =
  'w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm font-medium text-zinc-800 outline-none transition-all placeholder:text-zinc-400 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10';

function isValidSlug(slug: string) {
  if (!slug) return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/** Slug tự sinh khi người dùng không nhập — không lấy từ tên chuyên mục */
function generateAutoCategorySlug() {
  return `cat-${Date.now().toString(36)}`;
}

function resolveCategorySlug(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return generateAutoCategorySlug();
  return trimmed;
}

function generateAutoItemSlug() {
  return `item-${Date.now().toString(36)}`;
}

function resolveItemSlug(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return generateAutoItemSlug();
  return trimmed;
}

const SALE_MODE_OPTIONS: { value: SaleMode; label: string }[] = [
  { value: 'fifo', label: 'Bán trước (FIFO)' },
  { value: 'oldest', label: 'Cũ nhất trước' },
  { value: 'newest', label: 'Mới nhất trước' },
  { value: 'random', label: 'Random' },
];

function FormFieldLabel({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-sm font-semibold text-zinc-800">
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

function FormFieldLabelHoverHint({
  children,
  hint,
  required,
}: {
  children: ReactNode;
  hint: string;
  required?: boolean;
}) {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [hintVisible, setHintVisible] = useState(false);
  const [hintPos, setHintPos] = useState({ top: 0, left: 0 });

  const updateHintPosition = () => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    const maxWidth = Math.min(288, window.innerWidth - 24);
    let left = rect.left;
    if (left + maxWidth > window.innerWidth - 12) {
      left = window.innerWidth - 12 - maxWidth;
    }
    left = Math.max(12, left);
    setHintPos({ top: rect.bottom + 8, left });
  };

  const showHint = () => {
    updateHintPosition();
    setHintVisible(true);
  };

  const hideHint = () => setHintVisible(false);

  const hintTooltip =
    hintVisible &&
    createPortal(
      <div
        role="tooltip"
        style={{ top: hintPos.top, left: hintPos.left, maxWidth: Math.min(288, window.innerWidth - 24) }}
        className="fixed z-[400] rounded-xl border border-emerald-100 bg-white px-3 py-2.5 text-[12px] leading-relaxed text-zinc-600 shadow-[0_8px_24px_-8px_rgba(16,185,129,0.2)] ring-1 ring-zinc-100"
        onMouseEnter={showHint}
        onMouseLeave={hideHint}
      >
        {hint}
      </div>,
      document.body
    );

  return (
    <div className="mb-1.5 flex items-center gap-1.5">
      <label className="text-sm font-semibold text-zinc-800">
        {children}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <button
        ref={anchorRef}
        type="button"
        aria-label="Hướng dẫn"
        className="inline-flex shrink-0 rounded-full p-0.5 text-zinc-400 outline-none transition-colors hover:bg-emerald-50 hover:text-brand-primary focus-visible:ring-2 focus-visible:ring-brand-primary/20"
        onMouseEnter={showHint}
        onMouseLeave={hideHint}
        onFocus={showHint}
        onBlur={hideHint}
      >
        <HelpCircle className="h-4 w-4" />
      </button>
      {hintTooltip}
    </div>
  );
}

function CategoryIconAvatar({
  preset,
  iconUrl,
  size = 'md',
}: {
  preset?: Category;
  iconUrl?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClass = size === 'lg' ? 'h-12 w-12' : size === 'sm' ? 'h-9 w-9' : 'h-11 w-11';
  const iconSize = size === 'lg' ? 'h-6 w-6' : size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

  if (preset) {
    const Icon =
      (LucideIcons as Record<string, ComponentType<{ className?: string; style?: CSSProperties }>>)[preset.icon] ||
      LucideIcons.LayoutGrid;
    return (
      <div
        className={`${sizeClass} flex shrink-0 items-center justify-center rounded-2xl shadow-md ring-4 ring-white/80`}
        style={{ backgroundColor: preset.color || '#10b981' }}
      >
        <Icon className={`${iconSize} text-white`} />
      </div>
    );
  }

  if (iconUrl && !isPresetIconUrl(iconUrl)) {
    return (
      <img
        src={iconUrl}
        alt=""
        className={`${sizeClass} shrink-0 rounded-2xl border border-zinc-200 object-cover ring-4 ring-emerald-50`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary to-emerald-600 ring-4 ring-emerald-50`}
    >
      <Package className={`${iconSize} text-white`} />
    </div>
  );
}

const initialShops: ServiceShop[] = [
  {
    id: 1,
    title: 'SHOP XU HƯỚNG - TIKTOK TRIỆU VIEW - TÀI KHOẢN UY TÍN SỐ 1 VN',
    slug: 'shop-tiktok-uy-tin',
    iconUrl: 'preset:tiktok',
    iconName: 'TikTok',
    status: 'visible',
    seoDescription: '',
    category: 'Tài khoản Facebook',
    date: '28/02/2024 13:51',
    username: 'test12345',
    items: [
      {
        id: 28,
        name: 'TIKTOK >1K FL - SHOP - CÓ VIDEO - Tạo > 100 Tuần',
        slug: 'tiktok-1k-fl-shop',
        createdAt: '11/03/2024 15:06',
        price: 15000,
        minPurchase: 1,
        maxPurchase: 10,
        stock: 2,
        sold: 0,
        shortDescription: 'Tài khoản TikTok shop, có video.',
        detailDescription: 'Tài khoản đã tạo trên 100 tuần, đủ điều kiện bán hàng.',
        saleMode: 'fifo',
        visibility: 'visible',
        enabled: true,
        resources: [
          { content: 'tiktok_user1|pass1', addedAt: '11/03/2024 15:06' },
          { content: 'tiktok_user2|pass2', addedAt: '11/03/2024 15:08' },
        ],
      },
      {
        id: 29,
        name: 'TIKTOK >5K FL - SHOP - CÓ VIDEO - Tạo > 100 Tuần',
        slug: 'tiktok-5k-fl-shop',
        createdAt: '11/03/2024 15:08',
        price: 45000,
        minPurchase: 1,
        maxPurchase: 5,
        stock: 0,
        sold: 12,
        shortDescription: 'TikTok >5K follow.',
        detailDescription: '',
        saleMode: 'oldest',
        visibility: 'visible',
        enabled: true,
        resources: [],
      },
      {
        id: 30,
        name: 'TIKTOK >10K FL - SHOP - CÓ VIDEO - Tạo > 100 Tuần',
        slug: 'tiktok-10k-fl-shop',
        createdAt: '12/03/2024 09:20',
        price: 85000,
        minPurchase: 1,
        maxPurchase: 0,
        stock: 3,
        sold: 5,
        shortDescription: 'TikTok >10K follow — tạm ẩn.',
        detailDescription: 'Mô tả chi tiết sản phẩm cao cấp.',
        saleMode: 'random',
        visibility: 'hidden',
        enabled: false,
        resources: [
          { content: 'acc_a|pwd_a', addedAt: '12/03/2024 09:20' },
          { content: 'acc_b|pwd_b', addedAt: '12/03/2024 09:21' },
          { content: 'acc_c|pwd_c', addedAt: '12/03/2024 09:22' },
        ],
      },
    ],
  },
];

function formatPrice(price: number) {
  return `${price.toLocaleString('vi-VN')}\u00a0đ`;
}

function syncStock(item: ServiceItem): ServiceItem {
  return { ...item, stock: item.resources.length };
}

function ToggleSwitch({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onChange}
      className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${
        enabled ? 'bg-brand-primary' : 'bg-zinc-200'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function CreateShopModal({
  onClose,
  onSave,
  initialShop,
}: {
  onClose: () => void;
  onSave: (data: CreateParentCategoryInput) => void;
  initialShop?: ServiceShop;
}) {
  const isEdit = Boolean(initialShop);
  const initialPreset = initialShop
    ? SOCIAL_ICON_PRESETS.find((p) => presetIconUrl(p.id) === initialShop.iconUrl)
    : undefined;

  const [title, setTitle] = useState(initialShop?.title ?? '');
  const [slug, setSlug] = useState(initialShop?.slug ?? '');
  const [status, setStatus] = useState<ShopStatus>(initialShop?.status ?? 'visible');
  const [seoDescription, setSeoDescription] = useState(initialShop?.seoDescription ?? '');
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(
    initialPreset?.id ?? (initialShop && isPresetIconUrl(initialShop.iconUrl) ? null : null)
  );
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState(
    initialShop && !isPresetIconUrl(initialShop.iconUrl) ? initialShop.iconUrl : ''
  );
  const [iconError, setIconError] = useState('');
  const [iconSourceMode, setIconSourceMode] = useState<IconSourceMode>(
    initialShop && !isPresetIconUrl(initialShop.iconUrl) && initialShop.iconUrl ? 'upload' : 'preset'
  );
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const iconPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!initialShop) return;
    const preset = SOCIAL_ICON_PRESETS.find((p) => presetIconUrl(p.id) === initialShop.iconUrl);
    if (preset) {
      setSelectedPresetId(preset.id);
      setIconSourceMode('preset');
    } else if (initialShop.iconUrl) {
      setIconSourceMode('upload');
      setIconPreview(initialShop.iconUrl);
    }
  }, [initialShop]);

  const hasIcon =
    iconSourceMode === 'preset'
      ? Boolean(selectedPresetId)
      : Boolean(iconFile || iconPreview);
  const selectedPreset = SOCIAL_ICON_PRESETS.find((p) => p.id === selectedPresetId);

  useEffect(() => {
    if (!iconFile) {
      setIconPreview('');
      return;
    }
    const url = URL.createObjectURL(iconFile);
    setIconPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [iconFile]);

  useEffect(() => {
    if (!iconPickerOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (iconPickerRef.current && !iconPickerRef.current.contains(e.target as Node)) {
        setIconPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [iconPickerOpen]);

  const slugInvalid = slug.length > 0 && !isValidSlug(slug);

  const handleIconChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setIconError('');
    if (!file) {
      setIconFile(null);
      return;
    }
    if (!file.type.startsWith('image/')) {
      setIconError('Vui lòng chọn file ảnh (PNG, JPG, SVG…)');
      setIconFile(null);
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setIconError('Icon tối đa 2MB');
      setIconFile(null);
      return;
    }
    setIconFile(file);
    setSelectedPresetId(null);
    setIconPickerOpen(false);
  };

  const selectPreset = (presetId: string) => {
    setIconError('');
    setSelectedPresetId(presetId);
    setIconPickerOpen(false);
  };

  const switchIconSourceMode = (mode: IconSourceMode) => {
    setIconError('');
    setIconSourceMode(mode);
    setIconPickerOpen(false);
    if (mode === 'preset') {
      setIconFile(null);
      setIconPreview('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } else {
      setSelectedPresetId(null);
    }
  };

  const modal = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-zinc-100 px-6 py-4">
          <div>
            <h3 className="text-base font-black text-zinc-900">
              {isEdit ? 'Sửa chuyên mục cha' : 'Tạo chuyên mục cha'}
            </h3>
            <p className="mt-0.5 text-[12px] text-zinc-500">
              {isEdit ? 'Cập nhật thông tin mục cha (shop)' : 'Điền thông tin mục cha (shop) mới'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          className="flex-1 space-y-4 overflow-y-auto px-6 py-5"
          onSubmit={(e) => {
            e.preventDefault();
            const trimmedSlug = slug.trim();
            if (trimmedSlug && !isValidSlug(trimmedSlug)) return;
            const finalSlug = resolveCategorySlug(slug);
            if (!hasIcon) {
              setIconError(
                iconSourceMode === 'preset'
                  ? 'Vui lòng chọn icon mạng xã hội'
                  : 'Vui lòng tải file icon lên'
              );
              return;
            }
            if (iconSourceMode === 'preset' && selectedPresetId && selectedPreset) {
              onSave({
                title: title.trim(),
                slug: finalSlug,
                iconUrl: presetIconUrl(selectedPresetId),
                iconName: selectedPreset.name,
                status,
                seoDescription: seoDescription.trim(),
              });
              return;
            }
            onSave({
              title: title.trim(),
              slug: finalSlug,
              iconUrl: iconFile ? iconPreview : initialShop?.iconUrl ?? iconPreview,
              iconName: iconFile?.name ?? initialShop?.iconName ?? 'icon',
              status,
              seoDescription: seoDescription.trim(),
            });
          }}
        >
          <div>
            <FormFieldLabel required>Tên chuyên mục cha:</FormFieldLabel>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tên chuyên mục"
              className={inputClass}
              required
            />
          </div>

          <div>
            <FormFieldLabel>Liên kết truy cập chuyên mục (slug):</FormFieldLabel>
            <div
              className={`flex overflow-hidden rounded-lg border bg-white ${
                slugInvalid
                  ? 'border-red-300 ring-2 ring-red-100'
                  : 'border-zinc-200 focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/10'
              }`}
            >
              <span className="shrink-0 border-r border-zinc-200 bg-zinc-50 px-3 py-2.5 text-[12px] font-medium text-zinc-500">
                {CATEGORY_URL_PREFIX}
              </span>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                placeholder="Để trống để hệ thống tự tạo"
                className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2.5 text-sm font-medium text-zinc-800 outline-none placeholder:text-zinc-400"
              />
            </div>
            <p className="mt-1.5 text-[12px] text-zinc-500">
              Không nhập thì web tự tạo liên kết (không theo tên chuyên mục).
            </p>
            {slugInvalid && (
              <p className="mt-1 text-[12px] font-medium text-red-600">Slug không đúng định dạng.</p>
            )}
          </div>

          <div>
            <FormFieldLabel required>Icon:</FormFieldLabel>
            <div className="mb-3 flex rounded-lg border border-zinc-200 bg-zinc-50 p-1">
              <button
                type="button"
                onClick={() => switchIconSourceMode('preset')}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                  iconSourceMode === 'preset'
                    ? 'bg-white text-brand-primary shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-700'
                }`}
              >
                Icon có sẵn
              </button>
              <button
                type="button"
                onClick={() => switchIconSourceMode('upload')}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                  iconSourceMode === 'upload'
                    ? 'bg-white text-brand-primary shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-700'
                }`}
              >
                Tải icon lên
              </button>
            </div>

            {iconSourceMode === 'preset' ? (
              <div ref={iconPickerRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIconPickerOpen((open) => !open)}
                  className={`flex w-full items-center gap-3 rounded-lg border bg-white px-3 py-2.5 text-left transition-all ${
                    iconPickerOpen
                      ? 'border-brand-primary ring-2 ring-brand-primary/10'
                      : 'border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  {selectedPreset ? (
                    <>
                      <CategoryIconAvatar preset={selectedPreset} size="sm" />
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-zinc-800">
                        {selectedPreset.name}
                      </span>
                    </>
                  ) : (
                    <span className="flex-1 text-sm text-zinc-400">Chọn icon mạng xã hội…</span>
                  )}
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform ${iconPickerOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {iconPickerOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 right-0 z-20 mt-1 max-h-[240px] overflow-y-auto rounded-xl border border-zinc-200 bg-white py-1 shadow-lg ring-1 ring-black/5"
                    >
                      {SOCIAL_ICON_PRESETS.map((preset) => {
                        const Icon =
                          (LucideIcons as Record<
                            string,
                            ComponentType<{ className?: string; style?: CSSProperties }>
                          >)[preset.icon] || LucideIcons.LayoutGrid;
                        const isSelected = selectedPresetId === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => selectPreset(preset.id)}
                            className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                              isSelected ? 'bg-emerald-50 text-brand-primary' : 'hover:bg-zinc-50'
                            }`}
                          >
                            <span
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                              style={{ backgroundColor: preset.color || '#64748b' }}
                            >
                              <Icon className="h-4 w-4 text-white" />
                            </span>
                            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-zinc-800">
                              {preset.name}
                            </span>
                            {isSelected && (
                              <span className="text-[11px] font-bold text-brand-primary">Đã chọn</span>
                            )}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleIconChange}
                />
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100"
                  >
                    Chọn file
                  </button>
                  <span className="text-sm text-zinc-500">{iconFile ? iconFile.name : 'Chưa chọn file'}</span>
                </div>
                {iconPreview && (
                  <div className="mt-3">
                    <CategoryIconAvatar iconUrl={iconPreview} size="sm" />
                  </div>
                )}
              </>
            )}
            {iconError && <p className="mt-1 text-[12px] font-medium text-red-600">{iconError}</p>}
          </div>
          <div>
            <FormFieldLabel required>Trạng thái:</FormFieldLabel>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ShopStatus)}
              className={`${inputClass} cursor-pointer`}
              required
            >
              <option value="visible">Hiển thị</option>
              <option value="hidden">Ẩn</option>
            </select>
          </div>

          <div>
            <FormFieldLabel>Description SEO:</FormFieldLabel>
            <textarea
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              placeholder="Mô tả ngắn về chuyên mục này"
              rows={4}
              className={`${inputClass} resize-y`}
            />
          </div>

          <div className="flex gap-2 border-t border-zinc-100 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-sm font-bold text-zinc-600 transition-colors hover:bg-zinc-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!title.trim() || slugInvalid || !hasIcon}
              className="flex-[2] rounded-xl bg-brand-primary py-2.5 text-sm font-black text-white shadow-md shadow-emerald-200/50 transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isEdit ? 'Lưu thay đổi' : 'Tạo Mục Cha'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );

  return createPortal(modal, document.body);
}

function CreateItemModal({
  onClose,
  onSave,
  initialItem,
}: {
  onClose: () => void;
  onSave: (data: CreateItemInput) => void;
  initialItem?: ServiceItem;
}) {
  const isEdit = Boolean(initialItem);
  const [name, setName] = useState(initialItem?.name ?? '');
  const [slug, setSlug] = useState(initialItem?.slug ?? '');
  const [price, setPrice] = useState(initialItem ? String(initialItem.price) : '');
  const [minPurchase, setMinPurchase] = useState(
    initialItem ? String(initialItem.minPurchase) : String(DEFAULT_ITEM_MIN_PURCHASE)
  );
  const [maxPurchase, setMaxPurchase] = useState(
    initialItem ? String(initialItem.maxPurchase) : String(DEFAULT_ITEM_MAX_PURCHASE)
  );
  const [sold, setSold] = useState(initialItem ? String(initialItem.sold) : '');
  const [shortDescription, setShortDescription] = useState(initialItem?.shortDescription ?? '');
  const [detailDescription, setDetailDescription] = useState(initialItem?.detailDescription ?? '');
  const [saleMode, setSaleMode] = useState<SaleMode>(initialItem?.saleMode ?? 'fifo');
  const [visibility, setVisibility] = useState<ShopStatus>(initialItem?.visibility ?? 'visible');

  const slugInvalid = slug.length > 0 && !isValidSlug(slug);

  const modal = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-zinc-100 px-6 py-4">
          <div>
            <h3 className="text-base font-black text-zinc-900">
              {isEdit ? 'Sửa mặt hàng' : 'Tạo mặt hàng mới'}
            </h3>
            <p className="mt-0.5 text-[12px] text-zinc-500">
              {isEdit ? 'Cập nhật thông tin mặt hàng' : 'Giá, slug, giới hạn mua và kiểu xuất kho'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          className="flex-1 space-y-4 overflow-y-auto px-6 py-5"
          onSubmit={(e) => {
            e.preventDefault();
            const trimmedSlug = slug.trim();
            if (trimmedSlug && !isValidSlug(trimmedSlug)) return;
            const finalSlug = isEdit
              ? trimmedSlug || initialItem!.slug
              : resolveItemSlug(slug);
            onSave({
              name: name.trim(),
              slug: finalSlug,
              price: Number(price) || 0,
              minPurchase: Math.max(1, Number(minPurchase) || DEFAULT_ITEM_MIN_PURCHASE),
              maxPurchase: Math.max(1, Number(maxPurchase) || DEFAULT_ITEM_MAX_PURCHASE),
              sold: Math.max(0, Number(sold) || 0),
              shortDescription: shortDescription.trim(),
              detailDescription: detailDescription.trim(),
              saleMode,
              visibility,
            });
          }}
        >
          <div>
            <FormFieldLabel required>Tên mặt hàng</FormFieldLabel>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: TIKTOK >1K FL - SHOP..."
              className={inputClass}
              required
            />
          </div>

          <div className="max-w-xs">
            <FormFieldLabel required>Giá (đ)</FormFieldLabel>
            <input
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="15000"
              className={inputClass}
              required
            />
          </div>

          <div>
            <FormFieldLabelHoverHint
              hint={`Phần cuối URL trang gian hàng của mặt hàng. Ví dụ: ${PRODUCT_URL_PREFIX}ten-mat-hang. Để trống để hệ thống tự tạo slug.`}
            >
              Liên kết gian hàng (slug)
            </FormFieldLabelHoverHint>
            <div
              className={`flex overflow-hidden rounded-lg border bg-white ${
                slugInvalid
                  ? 'border-red-300 ring-2 ring-red-100'
                  : 'border-zinc-200 focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/10'
              }`}
            >
              <span className="shrink-0 border-r border-zinc-200 bg-zinc-50 px-2 py-2.5 text-[11px] font-medium text-zinc-500 sm:px-3 sm:text-[12px]">
                {PRODUCT_URL_PREFIX}
              </span>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                placeholder="Để trống để hệ thống tự tạo"
                className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2.5 text-sm font-medium text-zinc-800 outline-none placeholder:text-zinc-400"
              />
            </div>
            {slugInvalid && (
              <p className="mt-1 text-[12px] font-medium text-red-600">Slug không đúng định dạng.</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <FormFieldLabel required>Mua tối thiểu</FormFieldLabel>
              <input
                type="number"
                min={1}
                value={minPurchase}
                onChange={(e) => setMinPurchase(e.target.value)}
                placeholder={String(DEFAULT_ITEM_MIN_PURCHASE)}
                className={inputClass}
                required
              />
            </div>
            <div>
              <FormFieldLabel>Tối đa</FormFieldLabel>
              <input
                type="number"
                min={1}
                value={maxPurchase}
                onChange={(e) => setMaxPurchase(e.target.value)}
                placeholder={String(DEFAULT_ITEM_MAX_PURCHASE)}
                className={inputClass}
              />
            </div>
            <div>
              <FormFieldLabelHoverHint hint="Chỉ nhập khi mặt hàng đã có lịch sử bán (chuyển shop, nhập tay số cũ). Để trống hoặc 0 nếu mặt hàng mới — hệ thống sẽ đếm từ đơn bán thực tế.">
                Số lượng đã bán
              </FormFieldLabelHoverHint>
              <input
                type="number"
                min={0}
                value={sold}
                onChange={(e) => setSold(e.target.value)}
                placeholder="0"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <FormFieldLabel>Mô tả ngắn</FormFieldLabel>
            <textarea
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Hiển thị trên danh sách sản phẩm"
              rows={2}
              className={`${inputClass} resize-y`}
            />
          </div>

          <div>
            <FormFieldLabel>Mô tả chi tiết</FormFieldLabel>
            <DetailDescriptionEditor
              value={detailDescription}
              onChange={setDetailDescription}
              placeholder="Nội dung mô tả đầy đủ trên trang mặt hàng"
              aiContext={{
                name,
                shortDescription,
                price: Number(price) || 0,
              }}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FormFieldLabel required>Kiểu bán</FormFieldLabel>
              <select
                value={saleMode}
                onChange={(e) => setSaleMode(e.target.value as SaleMode)}
                className={`${inputClass} cursor-pointer`}
              >
                {SALE_MODE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <FormFieldLabel required>Chế độ hiển thị</FormFieldLabel>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as ShopStatus)}
                className={`${inputClass} cursor-pointer`}
              >
                <option value="visible">Hiển thị</option>
                <option value="hidden">Ẩn</option>
              </select>
            </div>
          </div>

          <p className="text-[12px] text-zinc-500">
            {isEdit
              ? 'Tồn kho quản lý trong mục Kho — không đổi khi sửa form này.'
              : 'Tồn kho lấy từ số tài nguyên trong Kho sau khi tạo mặt hàng.'}
          </p>

          <motion.div className="flex gap-2 border-t border-zinc-100 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-sm font-bold text-zinc-600 transition-colors hover:bg-zinc-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!name.trim() || slugInvalid}
              className="flex-[2] rounded-xl bg-brand-primary py-2.5 text-sm font-black text-white shadow-md shadow-emerald-200/50 transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isEdit ? 'Lưu thay đổi' : 'Tạo mặt hàng'}
            </button>
          </motion.div>
        </form>
      </motion.div>
    </motion.div>
  );

  return createPortal(modal, document.body);
}


function ServiceShopBlock({
  shop,
  onUpdateShop,
  onDeleteShop,
  onOpenStock,
}: {
  shop: ServiceShop;
  onUpdateShop: (shop: ServiceShop) => void;
  onDeleteShop: (shopId: number) => void;
  onOpenStock: (itemId: number) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [showEditShopModal, setShowEditShopModal] = useState(false);
  const [shopMenuOpen, setShopMenuOpen] = useState(false);
  const shopMenuRef = useRef<HTMLDivElement>(null);

  const categoryLink = shop.slug ? `${CATEGORY_URL_PREFIX}${shop.slug}` : '';

  useEffect(() => {
    if (!shopMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (shopMenuRef.current && !shopMenuRef.current.contains(e.target as Node)) {
        setShopMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [shopMenuOpen]);

  const addItem = (data: CreateItemInput) => {
    const newItem: ServiceItem = syncStock({
      id: Date.now(),
      name: data.name,
      slug: data.slug,
      createdAt: new Date().toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      price: data.price,
      minPurchase: data.minPurchase,
      maxPurchase: data.maxPurchase,
      stock: 0,
      sold: data.sold,
      shortDescription: data.shortDescription,
      detailDescription: data.detailDescription,
      saleMode: data.saleMode,
      visibility: data.visibility,
      enabled: data.visibility === 'visible',
      resources: [],
    });
    onUpdateShop({ ...shop, items: [...shop.items, newItem] });
    closeItemModal();
  };

  const updateItem = (itemId: number, data: CreateItemInput) => {
    onUpdateShop({
      ...shop,
      items: shop.items.map((i) =>
        i.id === itemId
          ? syncStock({
              ...i,
              name: data.name,
              slug: data.slug,
              price: data.price,
              minPurchase: data.minPurchase,
              maxPurchase: data.maxPurchase,
              sold: data.sold,
              shortDescription: data.shortDescription,
              detailDescription: data.detailDescription,
              saleMode: data.saleMode,
              visibility: data.visibility,
              enabled: data.visibility === 'visible',
            })
          : i
      ),
    });
    closeItemModal();
  };

  const editingItem =
    editingItemId != null ? shop.items.find((i) => i.id === editingItemId) : undefined;

  const openCreateItemModal = () => {
    setEditingItemId(null);
    setShowItemModal(true);
  };

  const openEditItemModal = (itemId: number) => {
    setEditingItemId(itemId);
    setShowItemModal(true);
  };

  const closeItemModal = () => {
    setShowItemModal(false);
    setEditingItemId(null);
  };

  const saveItem = (data: CreateItemInput) => {
    if (editingItem) {
      updateItem(editingItem.id, data);
      return;
    }
    addItem(data);
  };

  const saveShopEdit = (data: CreateParentCategoryInput) => {
    onUpdateShop({
      ...shop,
      title: data.title.toUpperCase(),
      slug: data.slug,
      iconUrl: data.iconUrl,
      iconName: data.iconName,
      status: data.status,
      seoDescription: data.seoDescription,
      category: data.title,
    });
    setShowEditShopModal(false);
  };

  const deleteItem = (itemId: number) => {
    if (confirm('Bạn có chắc muốn xóa mặt hàng này?')) {
      onUpdateShop({ ...shop, items: shop.items.filter((i) => i.id !== itemId) });
    }
  };

  const toggleItem = (itemId: number) => {
    onUpdateShop({
      ...shop,
      items: shop.items.map((i) => (i.id === itemId ? { ...i, enabled: !i.enabled } : i)),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)] ring-1 ring-zinc-100/80"
    >
      {/* Mục cha — header */}
      <div className="relative flex flex-col justify-between gap-4 border-b border-zinc-100 bg-gradient-to-r from-zinc-50/90 via-white to-emerald-50/30 px-5 py-4 lg:flex-row lg:items-center">
        <div className="absolute left-0 top-0 h-full w-1 rounded-r bg-gradient-to-b from-brand-primary to-emerald-400" />
        <div className="flex items-start gap-4 flex-1 min-w-0 pl-2">
          <motion.div whileHover={{ scale: 1.05 }}>
            <CategoryIconAvatar
              preset={resolveSocialIconPreset(shop.iconUrl)}
              iconUrl={shop.iconUrl}
              size="lg"
            />
          </motion.div>
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <h3 className="font-black text-sm uppercase leading-snug tracking-tight text-slate-900">
                {shop.title}
              </h3>
              <span
                className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                  shop.status === 'visible'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-zinc-200 text-zinc-600'
                }`}
              >
                {shop.status === 'visible' ? 'Hiển thị' : 'Ẩn'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] font-medium text-slate-600">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-primary" />
                {shop.date}
              </span>
              <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-bold text-zinc-600">
                {shop.items.length} mặt hàng
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={openCreateItemModal}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-emerald-600 text-white rounded-lg text-[12px] font-bold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Tạo mặt hàng
          </button>
          <button
            type="button"
            onClick={() => setShowEditShopModal(true)}
            aria-label="Sửa mục cha"
            className="rounded-xl border border-zinc-200 bg-white p-2 text-zinc-500 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-brand-primary"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm(`Xóa shop "${shop.title}" và tất cả mặt hàng bên trong?`)) {
                onDeleteShop(shop.id);
              }
            }}
            className="rounded-xl border border-zinc-200 bg-white p-2 text-red-500 transition-colors hover:border-red-200 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <div ref={shopMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setShopMenuOpen((open) => !open)}
              aria-expanded={shopMenuOpen}
              aria-haspopup="menu"
              aria-label="Tùy chọn mục cha"
              className="rounded-xl border border-zinc-200 bg-white p-2 text-zinc-500 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-brand-primary"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
            <AnimatePresence>
              {shopMenuOpen && (
                <motion.div
                  role="menu"
                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full z-30 mt-1 w-56 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-lg ring-1 ring-black/5"
                >
                  <button
                    type="button"
                    role="menuitem"
                    disabled={!categoryLink}
                    onClick={() => {
                      if (!categoryLink) return;
                      window.open(categoryLink, '_blank', 'noopener,noreferrer');
                      setShopMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm font-semibold text-zinc-700 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Link2 className="h-4 w-4 shrink-0 text-brand-primary" />
                    Xem link mục cha
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-xl border border-zinc-200 bg-white p-2 text-zinc-600 transition-colors hover:bg-zinc-50"
          >
            {collapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mặt hàng con — nền trắng */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden bg-white"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50/90">
                    <th className="w-[180px] px-4 py-3 text-left text-[11px] font-black uppercase tracking-wide text-zinc-600">
                      Hành động
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-black text-slate-700 uppercase tracking-wide">
                      Tên mặt hàng
                    </th>
                    <th className="w-[120px] whitespace-nowrap px-4 py-3 text-center text-[11px] font-black uppercase tracking-wide text-slate-700">
                      Đơn giá
                    </th>
                    <th className="px-4 py-3 text-center text-[11px] font-black text-slate-700 uppercase tracking-wide w-[80px]">
                      Tồn kho
                    </th>
                    <th className="px-4 py-3 text-center text-[11px] font-black text-slate-700 uppercase tracking-wide w-[80px]">
                      Đã bán
                    </th>
                    <th className="px-4 py-3 text-center text-[11px] font-black text-slate-700 uppercase tracking-wide w-[110px]">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-center text-[11px] font-black text-slate-700 uppercase tracking-wide w-[90px]">
                      Bật/tắt
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {shop.items.map((item, index) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.04 }}
                      className="border-b border-zinc-100 transition-colors hover:bg-emerald-50/30"
                    >
                      <td className="px-4 py-3">
                        <motion.div
                          initial={{ opacity: 0, x: -4 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-1.5"
                        >
                          <button
                            type="button"
                            onClick={() => onOpenStock(item.id)}
                            className="flex items-center gap-1 rounded-lg bg-brand-primary px-2.5 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-emerald-600"
                          >
                            <Box className="h-3.5 w-3.5" />
                            Kho
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditItemModal(item.id)}
                            aria-label="Sửa mặt hàng"
                            className="p-1.5 rounded-md hover:bg-emerald-50 text-brand-primary transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteItem(item.id)}
                            className="p-1.5 rounded-md hover:bg-red-50 text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 transition-colors">
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                        </motion.div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-3">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0"
                          >
                            <Box className="w-4 h-4 text-slate-400" />
                          </motion.div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                className="text-left text-[13px] font-bold leading-snug text-brand-primary hover:underline"
                              >
                                {item.name}
                              </button>
                              {item.visibility === 'hidden' && (
                                <span className="inline-block shrink-0 rounded bg-zinc-200 px-2 py-0.5 text-[10px] font-bold text-zinc-600">
                                  Ẩn
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                              ID: {item.id} · {item.createdAt}
                            </p>
                            {item.shortDescription && (
                              <p className="mt-0.5 line-clamp-1 text-[11px] text-zinc-500">{item.shortDescription}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center">
                        <span className="text-sm font-black tabular-nums text-slate-900">
                          {formatPrice(item.price)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-bold text-slate-700">{item.stock}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-bold text-emerald-600">{item.sold}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block rounded px-2.5 py-1 text-[10px] font-bold ${
                            item.enabled
                              ? 'bg-brand-primary text-white ring-1 ring-emerald-200'
                              : 'bg-zinc-100 text-zinc-500'
                          }`}
                        >
                          {item.enabled ? 'Đang bán' : 'Đã tắt'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          <ToggleSwitch enabled={item.enabled} onChange={() => toggleItem(item.id)} />
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {shop.items.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-sm font-bold text-slate-400">Chưa có mặt hàng nào</p>
                <button
                  onClick={openCreateItemModal}
                  className="mt-3 text-sm font-bold text-brand-primary hover:underline"
                >
                  + Tạo mặt hàng đầu tiên
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showItemModal && (
          <CreateItemModal
            key={editingItemId ?? 'create'}
            initialItem={editingItem}
            onClose={closeItemModal}
            onSave={saveItem}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEditShopModal && (
          <CreateShopModal
            initialShop={shop}
            onClose={() => setShowEditShopModal(false)}
            onSave={saveShopEdit}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function createEmptyShop(data: CreateParentCategoryInput): ServiceShop {
  const now = new Date().toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  return {
    id: Date.now(),
    title: data.title.toUpperCase(),
    slug: data.slug,
    iconUrl: data.iconUrl,
    iconName: data.iconName,
    status: data.status,
    seoDescription: data.seoDescription,
    category: data.title,
    date: now,
    username: 'admin',
    items: [],
  };
}

export default function CreateServiceSection() {
  const [shops, setShops] = useState<ServiceShop[]>(initialShops);
  const [showCreateShopModal, setShowCreateShopModal] = useState(false);
  const [stockNav, setStockNav] = useState<{ shopId: number; itemId: number } | null>(null);

  const stockContext = stockNav
    ? (() => {
        const shop = shops.find((s) => s.id === stockNav.shopId);
        const item = shop?.items.find((i) => i.id === stockNav.itemId);
        return shop && item ? { shop, item } : null;
      })()
    : null;

  const saveItemStock = (shopId: number, itemId: number, resources: StockResource[]) => {
    setShops((prev) =>
      prev.map((s) =>
        s.id === shopId
          ? {
              ...s,
              items: s.items.map((i) =>
                i.id === itemId ? syncStock({ ...i, resources }) : i
              ),
            }
          : s
      )
    );
  };

  const totalItems = shops.reduce((sum, s) => sum + s.items.length, 0);
  const totalStock = shops.reduce((sum, s) => sum + s.items.reduce((a, i) => a + i.stock, 0), 0);
  const activeItems = shops.reduce((sum, s) => sum + s.items.filter((i) => i.enabled).length, 0);

  const addShop = (data: CreateParentCategoryInput) => {
    setShops((prev) => [...prev, createEmptyShop(data)]);
    setShowCreateShopModal(false);
  };

  if (stockContext) {
    return (
      <ItemStockPage
        shopTitle={stockContext.shop.title}
        item={stockContext.item}
        onBack={() => setStockNav(null)}
        onSave={(resources) => {
          saveItemStock(stockContext.shop.id, stockContext.item.id, resources);
          setStockNav(null);
        }}
      />
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">Dịch vụ</p>
          <h2 className="mt-1 text-xl font-black tracking-tight text-zinc-900">Danh sách shop & mặt hàng</h2>
          <p className="mt-1 text-[13px] font-medium text-zinc-500">
            Mục cha (shop) · Mặt hàng con · Kho tài nguyên
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateShopModal(true)}
          className="flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-brand-primary px-5 py-2.5 text-[12px] font-bold text-white shadow-lg shadow-emerald-200/50 transition-colors hover:bg-emerald-600"
        >
          <Plus className="h-4 w-4" />
          Tạo Mục Cha
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: 'Mục cha (shop)', value: String(shops.length), icon: Layers },
          { label: 'Tổng mặt hàng', value: String(totalItems), icon: ShoppingBag },
          { label: 'Đang bán · Tồn', value: `${activeItems} · ${totalStock}`, icon: Archive },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 rounded-2xl border border-zinc-200/70 bg-white px-4 py-3.5 shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 ring-1 ring-emerald-100">
                <Icon className="h-5 w-5 text-brand-primary" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{stat.label}</p>
                <p className="text-lg font-black tabular-nums text-zinc-900">{stat.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {shops.length === 0 && (
        <div className="rounded-2xl border border-dashed border-emerald-200/80 bg-gradient-to-br from-emerald-50/30 to-white py-20 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 ring-1 ring-emerald-100">
            <Layers className="h-7 w-7 text-brand-primary" />
          </div>
          <p className="text-sm font-bold text-zinc-500">Chưa có mục cha nào</p>
          <p className="mt-1 text-[12px] text-zinc-400">Tạo shop đầu tiên để thêm mặt hàng con</p>
          <button
            type="button"
            onClick={() => setShowCreateShopModal(true)}
            className="mt-4 text-sm font-bold text-brand-primary hover:underline"
          >
            + Tạo Mục Cha
          </button>
        </div>
      )}

      {shops.map((shop) => (
        <Fragment key={shop.id}>
          <ServiceShopBlock
            shop={shop}
            onUpdateShop={(updated) =>
              setShops((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
            }
            onDeleteShop={(shopId) => setShops((prev) => prev.filter((s) => s.id !== shopId))}
            onOpenStock={(itemId) => setStockNav({ shopId: shop.id, itemId })}
          />
        </Fragment>
      ))}


      <AnimatePresence>
        {showCreateShopModal && (
          <CreateShopModal onClose={() => setShowCreateShopModal(false)} onSave={addShop} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
