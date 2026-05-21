import { useEffect, useState } from 'react';
import { ChevronLeft, Bell, Send } from 'lucide-react';
import { motion } from 'motion/react';
import { loadCustomerSession } from '../services/customerSession';
import {
  formatRelativeTime,
  getNotificationsForUser,
  markAsRead,
  INAPP_NOTIF_UPDATED,
} from '../services/inAppNotificationService';
import { INAPP_TYPE_LABELS } from '../types/notification';
import { HtmlContent } from '../components/common/HtmlContent';
import { stripHtml } from '../utils/htmlContent';
import {
  generateTelegramLinkCode,
  getTelegramPrefsForUser,
  saveTelegramPrefsForUser,
  TELEGRAM_NOTIF_UPDATED,
} from '../services/telegramNotificationService';

interface NotificationsPageProps {
  onBack?: () => void;
}

export default function NotificationsPage({ onBack }: NotificationsPageProps) {
  const session = loadCustomerSession();
  const [items, setItems] = useState(() => getNotificationsForUser(session.userId));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tgPrefs, setTgPrefs] = useState(() => getTelegramPrefsForUser(session.userId));
  const [linkCode, setLinkCode] = useState<string | null>(tgPrefs.linkCode);
  const [chatIdInput, setChatIdInput] = useState(tgPrefs.chatId);

  const sync = () => {
    setItems(getNotificationsForUser(session.userId));
    const p = getTelegramPrefsForUser(session.userId);
    setTgPrefs(p);
    setLinkCode(p.linkCode);
    setChatIdInput(p.chatId);
  };

  useEffect(() => {
    window.addEventListener(INAPP_NOTIF_UPDATED, sync);
    window.addEventListener(TELEGRAM_NOTIF_UPDATED, sync);
    return () => {
      window.removeEventListener(INAPP_NOTIF_UPDATED, sync);
      window.removeEventListener(TELEGRAM_NOTIF_UPDATED, sync);
    };
  }, []);

  const selected = items.find((n) => n.id === selectedId);

  return (
    <div className="min-h-screen bg-[#fcfcfd] pb-20">
      <div className="mx-auto max-w-[900px] px-6 pt-10">
        <div className="mb-8 flex items-center gap-3">
          <button
            type="button"
            onClick={() => (onBack ? onBack() : window.history.back())}
            className="rounded-xl p-2 hover:bg-slate-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800">Thông báo</h1>
            <p className="text-[13px] text-slate-500">Lịch sử & cài đặt Telegram</p>
          </div>
        </div>

        <div className="mb-8 rounded-2xl border border-sky-100 bg-sky-50/50 p-5">
          <div className="mb-3 flex items-center gap-2">
            <Send className="h-5 w-5 text-sky-600" />
            <h2 className="font-black text-slate-800">Kết nối Telegram</h2>
          </div>
          {tgPrefs.linked ? (
            <p className="text-sm font-bold text-emerald-600">
              Đã liên kết Chat ID: {tgPrefs.chatId}
            </p>
          ) : (
            <p className="text-sm text-slate-600">
              Nhập Chat ID hoặc lấy mã kết nối gửi cho Bot.
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <input
              value={chatIdInput}
              onChange={(e) => setChatIdInput(e.target.value)}
              placeholder="Chat ID Telegram"
              className="flex-1 rounded-xl border px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => {
                saveTelegramPrefsForUser({
                  ...tgPrefs,
                  chatId: chatIdInput.trim(),
                  linked: Boolean(chatIdInput.trim()),
                });
                sync();
              }}
              className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-bold text-white"
            >
              Lưu Chat ID
            </button>
            <button
              type="button"
              onClick={() => setLinkCode(generateTelegramLinkCode(session.userId))}
              className="rounded-xl bg-white px-4 py-2 text-sm font-bold ring-1 ring-sky-200"
            >
              Lấy mã kết nối
            </button>
          </div>
          {linkCode ? (
            <p className="mt-2 text-xs font-mono font-bold text-sky-800">
              Mã: {linkCode} — gửi /start {linkCode} cho Bot (demo)
            </p>
          ) : null}
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {(
              [
                ['notifyOrderComplete', 'Đơn hoàn tất'],
                ['notifyLoginAlert', 'Đăng nhập lạ'],
                ['notifyAffiliateCredit', 'Hoa hồng affiliate'],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={tgPrefs[key]}
                  onChange={(e) => {
                    saveTelegramPrefsForUser({ ...tgPrefs, [key]: e.target.checked });
                    sync();
                  }}
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            {items.length === 0 ? (
              <p className="text-slate-500">Chưa có thông báo.</p>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(n.id);
                    markAsRead(session.userId, n.id);
                    sync();
                  }}
                  className={`w-full rounded-2xl border p-4 text-left transition-shadow ${
                    selectedId === n.id ? 'border-brand-primary shadow-md' : 'border-slate-100 bg-white'
                  } ${!n.read ? 'ring-1 ring-emerald-100' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-brand-primary" />
                    <span className="text-[10px] font-bold uppercase text-zinc-400">
                      {INAPP_TYPE_LABELS[n.type]}
                    </span>
                    {!n.read ? (
                      <span className="rounded-full bg-red-500 px-1.5 text-[9px] font-bold text-white">
                        Mới
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 line-clamp-2 font-black text-slate-800">{stripHtml(n.title)}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">{stripHtml(n.shortContent)}</p>
                  <p className="mt-2 text-[11px] text-slate-400">
                    {formatRelativeTime(n.createdAt)}
                  </p>
                </button>
              ))
            )}
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-6 lg:sticky lg:top-24 lg:self-start">
            {selected ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <HtmlContent
                  html={selected.title}
                  className="text-lg font-black text-slate-900 [&_p]:my-0"
                />
                <HtmlContent
                  html={selected.detailContent || selected.shortContent}
                  className="mt-4 max-h-[60vh] overflow-y-auto"
                />
              </motion.div>
            ) : (
              <p className="text-sm text-slate-400">Chọn thông báo để xem chi tiết</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
