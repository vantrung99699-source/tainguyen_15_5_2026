import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Mail,
  Server,
  Hash,
  User,
  KeyRound,
  AtSign,
  BadgeCheck,
  Shield,
  Wand2,
  Save,
  Eye,
  EyeOff,
  ExternalLink,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { EmailTemplate, SmtpConfig } from '../../types/notification';
import {
  EMAIL_NOTIF_UPDATED,
  loadEmailTemplates,
  loadSmtpConfig,
  saveSmtpConfig,
  setEmailTemplateEnabled,
  testSmtpConnection,
  upsertEmailTemplate,
} from '../../services/emailNotificationService';

const EMAIL_TEMPLATE_HINTS: Record<string, string> = {
  register_otp: 'Gửi mã OTP khi khách đăng ký tài khoản',
  password_reset: 'Gửi link đặt lại mật khẩu',
  order_success: 'Gửi sau khi đơn hàng hoàn thành',
  deposit_invoice: 'Gửi sau khi nạp tiền thành công',
};

const smtpInputClass =
  'w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm font-medium text-zinc-800 outline-none transition-all placeholder:text-zinc-400 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10';

function SmtpFieldLabel({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
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

export function EmailNotificationAdminSection() {
  const [tab, setTab] = useState<'smtp' | 'templates'>('smtp');
  const [smtp, setSmtp] = useState<SmtpConfig>(loadSmtpConfig);
  const [templates, setTemplates] = useState<EmailTemplate[]>(loadEmailTemplates);
  const [editingTpl, setEditingTpl] = useState<EmailTemplate | null>(null);
  const [testResult, setTestResult] = useState('');
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);

  const sync = () => {
    setSmtp(loadSmtpConfig());
    setTemplates(loadEmailTemplates());
  };

  const handleToggleTemplate = (id: string, enabled: boolean) => {
    setEmailTemplateEnabled(id, enabled);
    sync();
  };

  useEffect(() => {
    window.addEventListener(EMAIL_NOTIF_UPDATED, sync);
    return () => window.removeEventListener(EMAIL_NOTIF_UPDATED, sync);
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 ring-1 ring-emerald-100">
          <Mail className="h-5 w-5 text-brand-primary" />
        </div>
        <div>
          <h2 className="text-base font-black text-zinc-900">Thông báo Email</h2>
          <p className="text-[12px] text-zinc-500">SMTP, mẫu mail tự động</p>
        </div>
      </div>

      <div className="flex gap-2">
        {(['smtp', 'templates'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-xl px-4 py-2 text-sm font-bold ${
              tab === t ? 'bg-brand-primary text-white' : 'bg-white ring-1 ring-zinc-200'
            }`}
          >
            {t === 'smtp' ? 'SMTP' : 'Mẫu email'}
          </button>
        ))}
      </div>

      {tab === 'smtp' && (
        <div className="max-w-2xl space-y-6 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <AdminToggle
              enabled={smtp.enabled}
              onChange={(enabled) => setSmtp({ ...smtp, enabled })}
            />
            <span className="text-sm font-bold text-zinc-800">Bật gửi SMTP</span>
          </div>

          <div>
            <SmtpFieldLabel icon={Server}>Máy chủ SMTP (Host)</SmtpFieldLabel>
            <input
              value={smtp.host}
              onChange={(e) => setSmtp({ ...smtp, host: e.target.value })}
              placeholder="smtp.gmail.com"
              className={smtpInputClass}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <SmtpFieldLabel icon={Hash}>Cổng (Port)</SmtpFieldLabel>
              <input
                type="number"
                min={1}
                max={65535}
                value={smtp.port}
                onChange={(e) => setSmtp({ ...smtp, port: Number(e.target.value) || 587 })}
                placeholder="587"
                className={smtpInputClass}
              />
            </div>
            <div>
              <SmtpFieldLabel icon={Shield}>Mã hóa kết nối</SmtpFieldLabel>
              <div className="flex gap-2">
                {(
                  [
                    { value: 'tls' as const, label: 'TLS' },
                    { value: 'ssl' as const, label: 'SSL' },
                    { value: 'none' as const, label: 'None' },
                  ] as const
                ).map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSmtp({ ...smtp, encryption: value })}
                    className={`flex-1 rounded-xl border px-2 py-2.5 text-center text-sm font-bold transition ${
                      smtp.encryption === value
                        ? 'border-brand-primary bg-emerald-50 text-brand-primary ring-1 ring-emerald-100'
                        : 'border-zinc-200 bg-white text-zinc-600 hover:border-emerald-200 hover:bg-emerald-50/40'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[11px] text-zinc-400">
                TLS (587), SSL (465), None — chỉ dùng khi server hỗ trợ.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <SmtpFieldLabel icon={User}>Tên đăng nhập</SmtpFieldLabel>
              <input
                value={smtp.username}
                onChange={(e) => setSmtp({ ...smtp, username: e.target.value })}
                placeholder="noreply@domain.com"
                className={smtpInputClass}
                autoComplete="username"
              />
            </div>
            <div>
              <SmtpFieldLabel icon={KeyRound}>Mật khẩu / App Password</SmtpFieldLabel>
              <div className="relative">
                <input
                  type={showSmtpPassword ? 'text' : 'password'}
                  value={smtp.password}
                  onChange={(e) => setSmtp({ ...smtp, password: e.target.value })}
                  placeholder="••••••••"
                  className={`${smtpInputClass} pr-10`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowSmtpPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-brand-primary"
                  aria-label={showSmtpPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showSmtpPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <SmtpFieldLabel icon={AtSign}>Email gửi đi (From)</SmtpFieldLabel>
              <input
                type="email"
                value={smtp.fromEmail}
                onChange={(e) => setSmtp({ ...smtp, fromEmail: e.target.value })}
                placeholder="noreply@taphoammo.vn"
                className={smtpInputClass}
              />
            </div>
            <div>
              <SmtpFieldLabel icon={BadgeCheck}>Tên hiển thị</SmtpFieldLabel>
              <input
                value={smtp.fromName}
                onChange={(e) => setSmtp({ ...smtp, fromName: e.target.value })}
                placeholder="TapHoaMMO"
                className={smtpInputClass}
              />
            </div>
          </div>

          <a
            href="https://support.google.com/mail/answer/185833"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-primary hover:text-emerald-600"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Xem hướng dẫn App Password (Gmail / SMTP)
          </a>

          {testResult ? (
            <p
              className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                testResult.includes('OK') || testResult.includes('thành công')
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {testResult}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 border-t border-zinc-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              disabled={testingSmtp}
              onClick={async () => {
                setTestingSmtp(true);
                setTestResult('');
                const r = await testSmtpConnection();
                setTestResult(
                  r.ok ? 'Kiểm tra thành công — email test đã ghi log (demo).' : r.error ?? 'Lỗi kết nối',
                );
                setTestingSmtp(false);
                sync();
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-bold text-zinc-700 transition hover:border-emerald-200 hover:bg-emerald-50/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Wand2 className="h-4 w-4 text-brand-primary" />
              {testingSmtp ? 'Đang kiểm tra...' : 'Kiểm tra kết nối'}
            </button>
            <div className="flex gap-2 sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setSmtp(loadSmtpConfig());
                  setTestResult('');
                }}
                className="rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-2.5 text-sm font-bold text-zinc-700 transition hover:bg-zinc-200"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  saveSmtpConfig(smtp);
                  setTestResult('');
                  sync();
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-200/50 transition hover:bg-emerald-600"
              >
                <Save className="h-4 w-4" />
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'templates' && (
        <div className="max-w-2xl space-y-4 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm">
          <p className="text-sm text-zinc-600">
            Bật/tắt từng loại email tự động. Mẫu tắt sẽ không gửi (kể cả khi SMTP đã bật).
          </p>
          <div className="space-y-3">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-3 transition ${
                  tpl.enabled
                    ? 'border-emerald-100 bg-emerald-50/30'
                    : 'border-zinc-200 bg-zinc-50/60'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-zinc-800">{tpl.name}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        tpl.enabled
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-zinc-200 text-zinc-500'
                      }`}
                    >
                      {tpl.enabled ? 'Đang bật' : 'Đã tắt'}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[12px] text-zinc-500">
                    {EMAIL_TEMPLATE_HINTS[tpl.slug] ?? tpl.slug}
                  </p>
                  <p className="mt-1 truncate text-[11px] text-zinc-400">
                    Tiêu đề: {tpl.subject}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingTpl(tpl)}
                    className="text-sm font-bold text-brand-primary hover:text-emerald-600"
                  >
                    Sửa
                  </button>
                  <AdminToggle
                    enabled={tpl.enabled}
                    onChange={(enabled) => handleToggleTemplate(tpl.id, enabled)}
                  />
                </div>
              </div>
            ))}
          </div>
          {editingTpl && (
            <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4">
              <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
                <h3 className="font-black text-zinc-900">Sửa mẫu: {editingTpl.name}</h3>
                <div className="mt-4 flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/80 px-4 py-3">
                  <span className="text-sm font-bold text-zinc-700">Gửi email loại này</span>
                  <AdminToggle
                    enabled={editingTpl.enabled}
                    onChange={(enabled) => setEditingTpl({ ...editingTpl, enabled })}
                  />
                </div>
                <label className="mt-4 block text-xs font-bold uppercase text-zinc-500">
                  Tiêu đề
                </label>
                <input
                  value={editingTpl.subject}
                  onChange={(e) => setEditingTpl({ ...editingTpl, subject: e.target.value })}
                  className={`${smtpInputClass} mt-1`}
                  placeholder="Tiêu đề email"
                />
                <label className="mt-3 block text-xs font-bold uppercase text-zinc-500">
                  Nội dung HTML
                </label>
                <textarea
                  value={editingTpl.htmlBody}
                  onChange={(e) => setEditingTpl({ ...editingTpl, htmlBody: e.target.value })}
                  rows={10}
                  className={`${smtpInputClass} mt-1 font-mono text-xs`}
                />
                <p className="mt-2 text-[11px] text-zinc-400">
                  Biến: {'{{otp}}'}, {'{{order_id}}'}, {'{{amount}}'}, …
                </p>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingTpl(null)}
                    className="rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-2 text-sm font-bold text-zinc-700"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      upsertEmailTemplate(editingTpl);
                      setEditingTpl(null);
                      sync();
                    }}
                    className="rounded-xl bg-brand-primary px-4 py-2 text-sm font-bold text-white hover:bg-emerald-600"
                  >
                    Lưu
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
