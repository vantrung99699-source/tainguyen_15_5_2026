import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, ShieldCheck, Sparkles, X, ExternalLink } from 'lucide-react';
import type { InAppNotification, PopupVisualStyle } from '../../types/notification';
import { HtmlContent } from '../common/HtmlContent';

const STYLE_MAP: Record<
  PopupVisualStyle,
  { bar: string; iconBg: string; icon: typeof AlertCircle; card: string }
> = {
  warning: {
    bar: 'bg-orange-400',
    iconBg: 'bg-orange-100 text-orange-500',
    icon: AlertCircle,
    card: 'bg-gray-50 border-gray-200',
  },
  promo: {
    bar: 'bg-violet-500',
    iconBg: 'bg-violet-100 text-violet-600',
    icon: Sparkles,
    card: 'bg-violet-50/80 border-violet-100',
  },
  info: {
    bar: 'bg-brand-primary/60',
    iconBg: 'bg-emerald-50 text-brand-primary',
    icon: ShieldCheck,
    card: 'bg-white border-slate-100 shadow-sm',
  },
};

interface NotificationPopupProps {
  notification: InAppNotification | null;
  onDismiss: () => void;
  onAction?: () => void;
}

export function NotificationPopup({ notification, onDismiss, onAction }: NotificationPopupProps) {
  if (typeof document === 'undefined') return null;

  const style = notification ? STYLE_MAP[notification.popupStyle] : STYLE_MAP.info;
  const Icon = style.icon;

  return createPortal(
    <AnimatePresence>
      {notification ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99990] bg-black/40 backdrop-blur-[2px]"
            onClick={onDismiss}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="fixed inset-0 z-[99991] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className={`pointer-events-auto relative w-full max-w-lg overflow-hidden rounded-[20px] border p-6 ${style.card}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`absolute left-0 top-0 h-full w-1 ${style.bar}`} />
              <button
                type="button"
                onClick={onDismiss}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex items-start gap-4 pr-8">
                <div className={`shrink-0 rounded-full p-3 ${style.iconBg}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="min-w-0 space-y-2">
                  <HtmlContent
                    html={notification.title}
                    className="text-sm font-black uppercase tracking-tight text-slate-900 [&_p]:my-0"
                  />
                  <HtmlContent
                    html={notification.detailContent || notification.shortContent}
                    className="max-h-[min(320px,45vh)] overflow-y-auto"
                  />
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      type="button"
                      onClick={onDismiss}
                      className="rounded-[14px] bg-[#0F172A] px-5 py-2.5 text-[12px] font-bold text-white shadow-sm transition-colors hover:bg-slate-800"
                    >
                      {notification.actionLabel || 'Đã hiểu'}
                    </button>
                    {notification.actionUrl.trim() ? (
                      <a
                        href={notification.actionUrl}
                        onClick={() => {
                          onAction?.();
                          onDismiss();
                        }}
                        className="inline-flex items-center gap-2 rounded-[14px] border border-slate-200 bg-white px-5 py-2.5 text-[12px] font-bold text-brand-primary shadow-sm hover:bg-slate-50"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Xem thêm
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

/** Preview nhỏ trong admin */
export function NotificationPopupPreview({
  title,
  shortContent,
  popupStyle,
}: {
  title: string;
  shortContent: string;
  popupStyle: PopupVisualStyle;
}) {
  const style = STYLE_MAP[popupStyle];
  const Icon = style.icon;
  return (
    <div className={`relative overflow-hidden rounded-xl border p-4 ${style.card}`}>
      <div className={`absolute left-0 top-0 h-full w-1 ${style.bar}`} />
      <div className="flex items-start gap-3">
        <div className={`rounded-full p-2 ${style.iconBg}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <HtmlContent
            html={title || 'Tiêu đề popup'}
            className="text-[11px] font-black uppercase text-slate-800 [&_p]:my-0"
          />
          <HtmlContent
            html={shortContent || 'Nội dung hiển thị...'}
            className="mt-1 max-h-24 overflow-y-auto text-[12px] text-slate-500"
          />
        </div>
      </div>
    </div>
  );
}
