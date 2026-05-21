import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Send,
  KeyRound,
  MessageSquare,
  User,
  Shield,
  Server,
  ExternalLink,
  BookOpen,
  Check,
  Wand2,
  Save,
  Eye,
  EyeOff,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { TelegramAdminEvent, TelegramApiServer } from '../../types/notification';
import {
  TELEGRAM_API_SERVER_LABELS,
  TELEGRAM_EVENT_LABELS,
} from '../../types/notification';
import {
  loadTelegramConfig,
  loadTelegramLogs,
  saveTelegramConfig,
  setTelegramWebhook,
  TELEGRAM_NOTIF_UPDATED,
  testTelegramConnection,
} from '../../services/telegramNotificationService';

const EVENT_KEYS = Object.keys(TELEGRAM_EVENT_LABELS) as TelegramAdminEvent[];

const inputClass =
  'w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm font-medium text-zinc-800 outline-none transition-all placeholder:text-zinc-400 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10';

function FieldLabel({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <span className="mb-1.5 flex items-center gap-2 text-sm font-bold text-zinc-700">
      <Icon className="h-4 w-4 shrink-0 text-brand-primary" aria-hidden />
      {children}
    </span>
  );
}

function AdminToggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        enabled ? 'bg-brand-primary' : 'bg-zinc-300'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          enabled ? 'translate-x-5' : ''
        }`}
      />
    </button>
  );
}

export function TelegramNotificationAdminSection() {
  const [config, setConfig] = useState(loadTelegramConfig);
  const [logs, setLogs] = useState(loadTelegramLogs);
  const [testMsg, setTestMsg] = useState('');
  const [testing, setTesting] = useState(false);
  const [settingWebhook, setSettingWebhook] = useState(false);
  const [webhookMsg, setWebhookMsg] = useState('');
  const [showToken, setShowToken] = useState(false);

  const sync = () => {
    setConfig(loadTelegramConfig());
    setLogs(loadTelegramLogs());
  };

  useEffect(() => {
    window.addEventListener(TELEGRAM_NOTIF_UPDATED, sync);
    return () => window.removeEventListener(TELEGRAM_NOTIF_UPDATED, sync);
  }, []);

  const handleTest = async () => {
    setTesting(true);
    setTestMsg('');
    const r = await testTelegramConnection();
    setTestMsg(r.ok ? 'Kiểm tra thành công! Kiểm tra Telegram.' : r.error ?? 'Lỗi kết nối');
    setTesting(false);
    sync();
  };

  const handleSetWebhook = async () => {
    setSettingWebhook(true);
    setWebhookMsg('');
    const r = await setTelegramWebhook();
    if (r.ok && r.secret) {
      setConfig((c) => ({ ...c, webhookSecret: r.secret! }));
      setWebhookMsg(`Đã set webhook (demo). Secret: ${r.secret}`);
    } else {
      setWebhookMsg(r.error ?? 'Không set được webhook');
    }
    setSettingWebhook(false);
    sync();
  };

  const handleSave = () => {
    saveTelegramConfig(config);
    setTestMsg('');
    setWebhookMsg('');
    sync();
  };

  const handleCancel = () => {
    setConfig(loadTelegramConfig());
    setTestMsg('');
    setWebhookMsg('');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 ring-1 ring-emerald-100">
          <Send className="h-5 w-5 text-brand-primary" />
        </div>
        <div>
          <h2 className="text-base font-black text-zinc-900">Cài đặt Telegram Bot</h2>
          <p className="text-[12px] text-zinc-500">Bot token, webhook, proxy API, sự kiện admin</p>
        </div>
      </div>

      <div className="max-w-2xl space-y-6 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <AdminToggle
            enabled={config.enabled}
            onChange={(enabled) => setConfig({ ...config, enabled })}
          />
          <span className="text-sm font-bold text-zinc-800">Bật Bot Telegram</span>
        </div>

        <div>
          <FieldLabel icon={KeyRound}>Bot Token</FieldLabel>
          <div className="relative">
            <input
              type={showToken ? 'text' : 'password'}
              value={config.botToken}
              onChange={(e) => setConfig({ ...config, botToken: e.target.value })}
              placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
              className={`${inputClass} pr-10 font-mono text-[12px]`}
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => setShowToken((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-brand-primary"
              aria-label={showToken ? 'Ẩn token' : 'Hiện token'}
            >
              {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <a
            href="https://core.telegram.org/bots#creating-a-new-bot"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-brand-primary hover:text-emerald-600"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Xem hướng dẫn tạo bot
          </a>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel icon={MessageSquare}>Chat ID</FieldLabel>
            <input
              value={config.adminChatId}
              onChange={(e) => setConfig({ ...config, adminChatId: e.target.value })}
              placeholder="-1001234567890"
              className={inputClass}
            />
          </div>
          <div>
            <FieldLabel icon={User}>Bot Username</FieldLabel>
            <input
              value={config.botUsername}
              onChange={(e) => setConfig({ ...config, botUsername: e.target.value })}
              placeholder="@YourBot"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <FieldLabel icon={Shield}>Webhook Secret</FieldLabel>
          <input
            value={config.webhookSecret}
            onChange={(e) => setConfig({ ...config, webhookSecret: e.target.value })}
            placeholder="Để trống sẽ tự động tạo khi set webhook"
            className={inputClass}
          />
          <button
            type="button"
            disabled={settingWebhook}
            onClick={handleSetWebhook}
            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
          >
            <Check className="h-4 w-4" />
            {settingWebhook ? 'Đang set...' : 'Set Webhook'}
          </button>
          {webhookMsg ? (
            <p
              className={`mt-2 text-[12px] font-semibold ${
                webhookMsg.includes('Đã set') ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {webhookMsg}
            </p>
          ) : null}
        </div>

        <div>
          <FieldLabel icon={Server}>API Server</FieldLabel>
          <select
            value={config.apiServer}
            onChange={(e) =>
              setConfig({ ...config, apiServer: e.target.value as TelegramApiServer })
            }
            className={inputClass}
          >
            {(Object.keys(TELEGRAM_API_SERVER_LABELS) as TelegramApiServer[]).map((key) => (
              <option key={key} value={key}>
                {TELEGRAM_API_SERVER_LABELS[key]}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-[11px] text-zinc-400">
            Sử dụng proxy nếu Telegram bị chặn tại Việt Nam
          </p>
        </div>

        <a
          href="https://core.telegram.org/bots/api#setwebhook"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-primary hover:text-emerald-600"
        >
          <BookOpen className="h-4 w-4" />
          Mở hướng dẫn chi tiết
        </a>

        {testMsg ? (
          <p
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${
              testMsg.includes('thành công') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
            }`}
          >
            {testMsg}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 border-t border-zinc-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            disabled={testing}
            onClick={handleTest}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-bold text-zinc-700 transition hover:border-emerald-200 hover:bg-emerald-50/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Wand2 className="h-4 w-4 text-brand-primary" />
            {testing ? 'Đang kiểm tra...' : 'Kiểm tra kết nối'}
          </button>
          <div className="flex gap-2 sm:justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-2.5 text-sm font-bold text-zinc-700 transition hover:bg-zinc-200"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-200/50 transition hover:bg-emerald-600"
            >
              <Save className="h-4 w-4" />
              Lưu
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl space-y-3 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold text-zinc-800">Sự kiện gửi cho Admin</p>
        <p className="text-[11px] text-zinc-400">Bật/tắt từng loại thông báo tự động qua Telegram</p>
        <div className="space-y-2">
          {EVENT_KEYS.map((key) => (
            <div
              key={key}
              className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-3 transition ${
                config.events[key]
                  ? 'border-emerald-100 bg-emerald-50/30'
                  : 'border-zinc-200 bg-zinc-50/60'
              }`}
            >
              <span className="text-sm font-bold text-zinc-700">{TELEGRAM_EVENT_LABELS[key]}</span>
              <AdminToggle
                enabled={config.events[key]}
                onChange={(enabled) => {
                  const next = {
                    ...config,
                    events: { ...config.events, [key]: enabled },
                  };
                  setConfig(next);
                  saveTelegramConfig(next);
                  sync();
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-2xl rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm">
        <p className="mb-2 text-sm font-black text-zinc-800">Log gửi (demo)</p>
        <div className="max-h-48 overflow-y-auto text-xs">
          {logs.length === 0 ? (
            <p className="text-zinc-400">Chưa có log.</p>
          ) : (
            logs.slice(0, 20).map((l) => (
              <div key={l.id} className="border-b border-zinc-50 py-2">
                <span className={l.status === 'sent' ? 'text-emerald-600' : 'text-red-600'}>
                  [{l.status}]
                </span>{' '}
                {l.chatId} — {l.message.slice(0, 80)}
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
