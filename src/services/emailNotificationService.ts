import type {
  EmailCampaign,
  EmailCampaignTarget,
  EmailLogEntry,
  EmailTemplate,
  SmtpConfig,
} from '../types/notification';
import { initialManagedUsers } from '../pages/admin/userData';
import { loadManagedUsers } from './userAdmin';

const SMTP_KEY = 'taphoammo_smtp_config';
const TEMPLATES_KEY = 'taphoammo_email_templates';
const CAMPAIGNS_KEY = 'taphoammo_email_campaigns';
const LOG_KEY = 'taphoammo_email_log';

export const EMAIL_NOTIF_UPDATED = 'taphoammo-email-notif-updated';

const DEFAULT_SMTP: SmtpConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  encryption: 'tls',
  username: '',
  password: '',
  fromEmail: 'noreply@taphoammo.vn',
  fromName: 'TapHoaMMO',
  enabled: false,
};

const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: 'tpl-register',
    slug: 'register_otp',
    name: 'Xác thực đăng ký (OTP)',
    subject: 'Mã OTP đăng ký — {{site_name}}',
    htmlBody: '<p>Mã OTP của bạn: <strong>{{otp}}</strong></p>',
    enabled: true,
  },
  {
    id: 'tpl-reset',
    slug: 'password_reset',
    name: 'Khôi phục mật khẩu',
    subject: 'Đặt lại mật khẩu — {{site_name}}',
    htmlBody: '<p>Nhấn link: <a href="{{reset_link}}">Đặt lại mật khẩu</a></p>',
    enabled: true,
  },
  {
    id: 'tpl-order',
    slug: 'order_success',
    name: 'Đơn hàng thành công',
    subject: 'Đơn #{{order_id}} đã hoàn thành',
    htmlBody: '<p>Đơn <strong>{{order_id}}</strong> — {{product_name}} — {{amount}} đ</p>',
    enabled: true,
  },
  {
    id: 'tpl-deposit',
    slug: 'deposit_invoice',
    name: 'Hóa đơn nạp tiền',
    subject: 'Nạp tiền thành công +{{amount}} đ',
    htmlBody: '<p>Bạn đã nạp <strong>{{amount}} đ</strong>. Số dư: {{balance}} đ</p>',
    enabled: true,
  },
];

function emit() {
  window.dispatchEvent(new CustomEvent(EMAIL_NOTIF_UPDATED));
}

export function loadSmtpConfig(): SmtpConfig {
  try {
    const raw = localStorage.getItem(SMTP_KEY);
    if (!raw) return { ...DEFAULT_SMTP };
    return { ...DEFAULT_SMTP, ...(JSON.parse(raw) as SmtpConfig) };
  } catch {
    return { ...DEFAULT_SMTP };
  }
}

export function saveSmtpConfig(patch: Partial<SmtpConfig>) {
  localStorage.setItem(SMTP_KEY, JSON.stringify({ ...loadSmtpConfig(), ...patch }));
  emit();
}

export function loadEmailTemplates(): EmailTemplate[] {
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY);
    const stored: EmailTemplate[] = raw ? (JSON.parse(raw) as EmailTemplate[]) : [];
    const byId = new Map(stored.map((t) => [t.id, t]));
    return DEFAULT_TEMPLATES.map((def) => {
      const existing = byId.get(def.id);
      if (!existing) return { ...def };
      return {
        ...def,
        ...existing,
        enabled: existing.enabled ?? def.enabled,
      };
    });
  } catch {
    return [...DEFAULT_TEMPLATES];
  }
}

export function saveEmailTemplates(list: EmailTemplate[]) {
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(list));
  emit();
}

export function upsertEmailTemplate(tpl: EmailTemplate) {
  const list = loadEmailTemplates();
  const idx = list.findIndex((t) => t.id === tpl.id);
  if (idx >= 0) list[idx] = tpl;
  else list.push(tpl);
  saveEmailTemplates(list);
}

export function setEmailTemplateEnabled(id: string, enabled: boolean) {
  const list = loadEmailTemplates().map((t) => (t.id === id ? { ...t, enabled } : t));
  saveEmailTemplates(list);
}

export function getTemplateBySlug(slug: string) {
  return loadEmailTemplates().find((t) => t.slug === slug && t.enabled);
}

function renderTemplate(html: string, vars: Record<string, string>) {
  let out = html;
  for (const [k, v] of Object.entries(vars)) {
    out = out.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), v);
  }
  return out;
}

function appendEmailLog(to: string, subject: string, status: 'sent' | 'failed') {
  const entry: EmailLogEntry = {
    id: `EM${Date.now()}`,
    to,
    subject,
    status,
    createdAt: new Date().toISOString(),
  };
  const logs = [entry, ...loadEmailLogs().slice(0, 199)];
  localStorage.setItem(LOG_KEY, JSON.stringify(logs));
}

export function loadEmailLogs(): EmailLogEntry[] {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as EmailLogEntry[];
  } catch {
    return [];
  }
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  htmlBody: string;
}): Promise<{ ok: boolean; error?: string }> {
  const smtp = loadSmtpConfig();
  if (!smtp.enabled) {
    appendEmailLog(params.to, params.subject, 'failed');
    return { ok: false, error: 'SMTP chưa bật' };
  }
  if (!smtp.host.trim() || !params.to.trim()) {
    appendEmailLog(params.to, params.subject, 'failed');
    return { ok: false, error: 'Thiếu cấu hình hoặc email nhận' };
  }
  await new Promise((r) => setTimeout(r, 500));
  appendEmailLog(params.to, params.subject, 'sent');
  return { ok: true };
}

export async function sendTemplateEmail(
  slug: string,
  to: string,
  vars: Record<string, string>,
) {
  const tpl = getTemplateBySlug(slug);
  if (!tpl) {
    const exists = loadEmailTemplates().some((t) => t.slug === slug);
    return {
      ok: false,
      error: exists ? 'Mẫu email đang tắt' : 'Không tìm thấy mẫu',
    };
  }
  return sendEmail({
    to,
    subject: renderTemplate(tpl.subject, vars),
    htmlBody: renderTemplate(tpl.htmlBody, vars),
  });
}

export async function testSmtpConnection(): Promise<{ ok: boolean; error?: string }> {
  const smtp = loadSmtpConfig();
  return sendEmail({
    to: smtp.fromEmail || smtp.username,
    subject: 'Test SMTP — TapHoaMMO',
    htmlBody: '<p>Kết nối SMTP demo thành công.</p>',
  });
}

function resolveCampaignRecipients(target: EmailCampaignTarget): string[] {
  const users = loadManagedUsers(initialManagedUsers);
  if (target === 'all') return users.filter((u) => u.email).map((u) => u.email);
  if (target === 'vip') return users.filter((u) => u.role === 'vip' && u.email).map((u) => u.email);
  return users.filter((u) => u.status === 'active' && u.email).map((u) => u.email);
}

export function loadEmailCampaigns(): EmailCampaign[] {
  try {
    const raw = localStorage.getItem(CAMPAIGNS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as EmailCampaign[];
  } catch {
    return [];
  }
}

export function saveEmailCampaigns(list: EmailCampaign[]) {
  localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(list));
  emit();
}

export async function sendBulkCampaign(campaign: Omit<EmailCampaign, 'id' | 'sentAt' | 'recipientCount' | 'status'>) {
  const emails = resolveCampaignRecipients(campaign.target);
  let sent = 0;
  for (const to of emails) {
    const r = await sendEmail({
      to,
      subject: campaign.subject,
      htmlBody: campaign.htmlBody,
    });
    if (r.ok) sent++;
  }
  const record: EmailCampaign = {
    ...campaign,
    id: `CMP${Date.now()}`,
    sentAt: new Date().toISOString(),
    recipientCount: sent,
    status: 'sent',
  };
  saveEmailCampaigns([record, ...loadEmailCampaigns()]);
  return { sent, total: emails.length };
}
