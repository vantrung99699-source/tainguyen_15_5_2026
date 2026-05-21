import type {
  TelegramAdminConfig,
  TelegramAdminEvent,
  TelegramLogEntry,
  TelegramUserPrefs,
} from '../types/notification';

const CONFIG_KEY = 'taphoammo_telegram_config';
const USER_PREFS_KEY = 'taphoammo_telegram_user_prefs';
const LOG_KEY = 'taphoammo_telegram_log';

export const TELEGRAM_NOTIF_UPDATED = 'taphoammo-telegram-notif-updated';

const DEFAULT_CONFIG: TelegramAdminConfig = {
  botToken: '',
  adminChatId: '',
  botUsername: '',
  webhookSecret: '',
  apiServer: 'tnd-proxy',
  enabled: false,
  events: {
    newOrder: true,
    withdrawalRequest: true,
    depositSuccess: true,
    lowStock: true,
  },
};

function emit() {
  window.dispatchEvent(new CustomEvent(TELEGRAM_NOTIF_UPDATED));
}

export function loadTelegramConfig(): TelegramAdminConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return { ...DEFAULT_CONFIG };
    return { ...DEFAULT_CONFIG, ...(JSON.parse(raw) as TelegramAdminConfig) };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function saveTelegramConfig(patch: Partial<TelegramAdminConfig>) {
  const next = { ...loadTelegramConfig(), ...patch };
  localStorage.setItem(CONFIG_KEY, JSON.stringify(next));
  emit();
}

function loadAllUserPrefs(): TelegramUserPrefs[] {
  try {
    const raw = localStorage.getItem(USER_PREFS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TelegramUserPrefs[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAllUserPrefs(list: TelegramUserPrefs[]) {
  localStorage.setItem(USER_PREFS_KEY, JSON.stringify(list));
  emit();
}

export function getTelegramPrefsForUser(userId: string): TelegramUserPrefs {
  const hit = loadAllUserPrefs().find((p) => p.userId === userId);
  return (
    hit ?? {
      userId,
      chatId: '',
      linked: false,
      linkCode: null,
      notifyOrderComplete: true,
      notifyLoginAlert: true,
      notifyAffiliateCredit: true,
    }
  );
}

export function saveTelegramPrefsForUser(prefs: TelegramUserPrefs) {
  const list = loadAllUserPrefs().filter((p) => p.userId !== prefs.userId);
  list.push(prefs);
  saveAllUserPrefs(list);
}

export function generateTelegramLinkCode(userId: string): string {
  const code = `TG${userId.slice(-4)}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const prefs = getTelegramPrefsForUser(userId);
  saveTelegramPrefsForUser({ ...prefs, linkCode: code, linked: false });
  return code;
}

export function linkTelegramByCode(userId: string, chatId: string, code: string): boolean {
  const list = loadAllUserPrefs();
  const owner = list.find((p) => p.linkCode === code);
  if (!owner || owner.userId !== userId) return false;
  saveTelegramPrefsForUser({
    ...owner,
    chatId: chatId.trim(),
    linked: true,
    linkCode: null,
  });
  return true;
}

function appendLog(chatId: string, message: string, status: 'sent' | 'failed') {
  const entry: TelegramLogEntry = {
    id: `TG${Date.now()}`,
    chatId,
    message,
    status,
    createdAt: new Date().toISOString(),
  };
  const logs = [entry, ...loadTelegramLogs().slice(0, 99)];
  localStorage.setItem(LOG_KEY, JSON.stringify(logs));
}

export function loadTelegramLogs(): TelegramLogEntry[] {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as TelegramLogEntry[];
  } catch {
    return [];
  }
}

/** Demo: gọi Telegram API thật khi có backend; hiện mô phỏng gửi thành công */
export async function sendTelegramMessage(
  chatId: string,
  text: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!chatId.trim()) return { ok: false, error: 'Thiếu Chat ID' };
  const config = loadTelegramConfig();
  if (!config.botToken.trim()) {
    appendLog(chatId, text, 'failed');
    return { ok: false, error: 'Chưa cấu hình Bot Token' };
  }
  await new Promise((r) => setTimeout(r, 400));
  appendLog(chatId, text, 'sent');
  return { ok: true };
}

export async function setTelegramWebhook(): Promise<{
  ok: boolean;
  secret?: string;
  error?: string;
}> {
  const config = loadTelegramConfig();
  if (!config.botToken.trim()) {
    return { ok: false, error: 'Chưa cấu hình Bot Token' };
  }
  const secret =
    config.webhookSecret.trim() ||
    `wh_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  saveTelegramConfig({ webhookSecret: secret });
  await new Promise((r) => setTimeout(r, 400));
  return { ok: true, secret };
}

export async function testTelegramConnection(): Promise<{ ok: boolean; error?: string }> {
  const config = loadTelegramConfig();
  if (!config.botToken.trim() || !config.adminChatId.trim()) {
    return { ok: false, error: 'Nhập Bot Token và Admin Chat ID' };
  }
  return sendTelegramMessage(
    config.adminChatId,
    '✅ Test kết nối Telegram — TapHoaMMO',
  );
}

export async function notifyAdminTelegram(
  event: TelegramAdminEvent,
  message: string,
): Promise<void> {
  const config = loadTelegramConfig();
  if (!config.enabled || !config.events[event]) return;
  if (!config.adminChatId.trim()) return;
  await sendTelegramMessage(config.adminChatId, message);
}

export async function notifyUserTelegram(
  userId: string,
  message: string,
  check?: (prefs: TelegramUserPrefs) => boolean,
): Promise<void> {
  const prefs = getTelegramPrefsForUser(userId);
  if (!prefs.linked || !prefs.chatId.trim()) return;
  if (check && !check(prefs)) return;
  await sendTelegramMessage(prefs.chatId, message);
}
