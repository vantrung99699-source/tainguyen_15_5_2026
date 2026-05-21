import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Bell } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { loadCustomerSession } from '../../services/customerSession';
import {
  formatRelativeTime,
  getNotificationsForUser,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
  startInAppNotificationPolling,
} from '../../services/inAppNotificationService';
import { stripHtml } from '../../utils/htmlContent';

interface NotificationBellProps {
  onViewAll?: () => void;
}

export function NotificationBell({ onViewAll }: NotificationBellProps) {
  const session = loadCustomerSession();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(() => getUnreadCount(session.userId));
  const [items, setItems] = useState(() => getNotificationsForUser(session.userId));
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, right: 0 });

  const refresh = () => {
    setUnread(getUnreadCount(session.userId));
    setItems(getNotificationsForUser(session.userId).slice(0, 8));
  };

  useEffect(() => {
    return startInAppNotificationPolling(session.userId, () => refresh());
  }, [session.userId]);

  useEffect(() => {
    if (!open || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    const close = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const dropdown =
    open && typeof document !== 'undefined'
      ? createPortal(
          <AnimatePresence>
            <motion.div
              ref={panelRef}
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              style={{
                position: 'fixed',
                top: pos.top,
                right: pos.right,
                zIndex: 99999,
              }}
              className="w-80 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 bg-emerald-50 px-4 py-3">
                <h3 className="font-black text-slate-800">Thông báo</h3>
                {unread > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      markAllAsRead(session.userId);
                      refresh();
                    }}
                    className="text-[11px] font-bold text-brand-primary hover:underline"
                  >
                    Đọc tất cả
                  </button>
                ) : null}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {items.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-slate-400">Chưa có thông báo</p>
                ) : (
                  items.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => {
                        markAsRead(session.userId, n.id);
                        refresh();
                      }}
                      className={`w-full border-b border-slate-50 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${
                        !n.read ? 'bg-emerald-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {!n.read ? (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-primary" />
                        ) : (
                          <span className="mt-1.5 h-2 w-2 shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm font-bold text-slate-700">
                            {stripHtml(n.title)}
                          </p>
                          <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                            {stripHtml(n.shortContent)}
                          </p>
                          <p className="mt-1 text-[10px] text-slate-400">
                            {formatRelativeTime(n.createdAt)}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
              <div className="border-t border-slate-100 px-4 py-3">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onViewAll?.();
                  }}
                  className="w-full text-center text-sm font-bold text-brand-primary hover:underline"
                >
                  Xem tất cả thông báo
                </button>
              </div>
            </motion.div>
          </AnimatePresence>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          refresh();
        }}
        className="relative rounded-xl p-2 transition-colors hover:bg-slate-100"
        aria-label="Thông báo"
      >
        <Bell className="h-5 w-5 text-slate-600" />
        {unread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white">
            {unread > 99 ? '99+' : unread}
          </span>
        ) : null}
      </button>
      {dropdown}
    </>
  );
}
