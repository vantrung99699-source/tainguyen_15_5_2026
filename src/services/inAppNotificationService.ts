import type {
  InAppNotification,
  InAppNotificationType,
  NotificationDelivery,
  PopupScheduleMode,
  PopupVisualStyle,
} from '../types/notification';

const NOTIF_KEY = 'taphoammo_inapp_notifications';
const READS_KEY = 'taphoammo_inapp_reads';
const POPUP_DISMISSED_KEY = 'taphoammo_popup_dismissed';

export const INAPP_NOTIF_UPDATED = 'taphoammo-inapp-notif-updated';

function emit() {
  window.dispatchEvent(new CustomEvent(INAPP_NOTIF_UPDATED));
}

function normalizeNotification(raw: Partial<InAppNotification> & Record<string, unknown>): InAppNotification {
  const delivery = (['bell', 'popup', 'both'].includes(String(raw.delivery))
    ? raw.delivery
    : 'bell') as NotificationDelivery;
  const popupStyle = (['info', 'warning', 'promo'].includes(String(raw.popupStyle))
    ? raw.popupStyle
    : raw.type === 'alert'
      ? 'warning'
      : raw.type === 'promo'
        ? 'promo'
        : 'info') as PopupVisualStyle;
  const popupScheduleMode = (
    ['until_dismiss', 'after_interval', 'specific_date', 'expire_at_date'].includes(
      String(raw.popupScheduleMode),
    )
      ? raw.popupScheduleMode
      : 'until_dismiss'
  ) as PopupScheduleMode;
  const popupReshowHours = Math.max(
    1,
    Number(raw.popupReshowHours) || 24,
  );
  return {
    id: String(raw.id ?? `NT${Date.now()}`),
    type: (raw.type as InAppNotificationType) ?? 'system',
    title: String(raw.title ?? ''),
    shortContent: String(raw.shortContent ?? ''),
    detailContent: String(raw.detailContent ?? raw.shortContent ?? ''),
    targetUserId: raw.targetUserId != null ? String(raw.targetUserId) : null,
    delivery,
    popupStyle,
    popupScheduleMode,
    popupReshowHours,
    popupShowFrom: raw.popupShowFrom != null && String(raw.popupShowFrom).trim()
      ? String(raw.popupShowFrom)
      : null,
    popupShowUntil: raw.popupShowUntil != null && String(raw.popupShowUntil).trim()
      ? String(raw.popupShowUntil)
      : null,
    actionLabel: String(raw.actionLabel ?? 'Đã hiểu'),
    actionUrl: String(raw.actionUrl ?? ''),
    active: raw.active !== false,
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
    expiresAt: raw.expiresAt != null ? String(raw.expiresAt) : null,
  };
}

export function loadAllInAppNotifications(): InAppNotification[] {
  try {
    const raw = localStorage.getItem(NOTIF_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown[];
    return Array.isArray(parsed) ? parsed.map((n) => normalizeNotification(n as InAppNotification)) : [];
  } catch {
    return [];
  }
}

function saveAll(list: InAppNotification[]) {
  localStorage.setItem(NOTIF_KEY, JSON.stringify(list));
  emit();
}

interface ReadRecord {
  userId: string;
  notificationId: string;
  readAt: string;
}

function loadReads(): ReadRecord[] {
  try {
    const raw = localStorage.getItem(READS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ReadRecord[];
  } catch {
    return [];
  }
}

function saveReads(list: ReadRecord[]) {
  localStorage.setItem(READS_KEY, JSON.stringify(list));
  emit();
}

interface PopupDismissed {
  userId: string;
  notificationId: string;
  dismissedAt: string;
}

function loadPopupDismissed(): PopupDismissed[] {
  try {
    const raw = localStorage.getItem(POPUP_DISMISSED_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PopupDismissed[];
  } catch {
    return [];
  }
}

function savePopupDismissed(list: PopupDismissed[]) {
  localStorage.setItem(POPUP_DISMISSED_KEY, JSON.stringify(list));
  emit();
}

function isExpired(n: InAppNotification) {
  if (!n.expiresAt) return false;
  return new Date(n.expiresAt).getTime() < Date.now();
}

function matchesUser(n: InAppNotification, userId: string) {
  return n.targetUserId === null || n.targetUserId === userId;
}

function isPopupScheduleVisible(n: InAppNotification) {
  const now = Date.now();
  if (n.popupScheduleMode === 'specific_date') {
    if (!n.popupShowFrom) return true;
    return new Date(n.popupShowFrom).getTime() <= now;
  }
  if (n.popupScheduleMode === 'expire_at_date') {
    if (!n.popupShowUntil) return true;
    return new Date(n.popupShowUntil).getTime() > now;
  }
  return true;
}

function isPopupDismissBlocked(userId: string, n: InAppNotification): boolean {
  const records = loadPopupDismissed().filter(
    (d) => d.userId === userId && d.notificationId === n.id,
  );
  if (records.length === 0) return false;

  if (n.popupScheduleMode === 'after_interval') {
    const latest = records.reduce((a, b) =>
      new Date(a.dismissedAt).getTime() > new Date(b.dismissedAt).getTime() ? a : b,
    );
    const cooldownMs = n.popupReshowHours * 3600000;
    return Date.now() - new Date(latest.dismissedAt).getTime() < cooldownMs;
  }

  return true;
}

export function createInAppNotification(params: {
  type: InAppNotificationType;
  title: string;
  shortContent: string;
  detailContent: string;
  targetUserId?: string | null;
  delivery?: NotificationDelivery;
  popupStyle?: PopupVisualStyle;
  popupScheduleMode?: PopupScheduleMode;
  popupReshowHours?: number;
  popupShowFrom?: string | null;
  popupShowUntil?: string | null;
  actionLabel?: string;
  actionUrl?: string;
  expiresAt?: string | null;
}): InAppNotification {
  const n = normalizeNotification({
    id: `NT${Date.now()}`,
    ...params,
    active: true,
    createdAt: new Date().toISOString(),
  });
  saveAll([n, ...loadAllInAppNotifications()]);
  return n;
}

export function updateInAppNotification(id: string, patch: Partial<InAppNotification>) {
  const list = loadAllInAppNotifications();
  const idx = list.findIndex((n) => n.id === id);
  if (idx < 0) return;
  list[idx] = normalizeNotification({ ...list[idx], ...patch });
  saveAll(list);
}

export function deleteInAppNotification(id: string) {
  saveAll(loadAllInAppNotifications().filter((n) => n.id !== id));
}

export function getNotificationsForUser(userId: string): (InAppNotification & { read: boolean })[] {
  const reads = new Set(
    loadReads().filter((r) => r.userId === userId).map((r) => r.notificationId),
  );
  return loadAllInAppNotifications()
    .filter((n) => n.active && !isExpired(n) && matchesUser(n, userId))
    .filter((n) => n.delivery === 'bell' || n.delivery === 'both')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((n) => ({ ...n, read: reads.has(n.id) }));
}

export function getUnreadCount(userId: string): number {
  return getNotificationsForUser(userId).filter((n) => !n.read).length;
}

export function getActivePopupForUser(userId: string): InAppNotification | null {
  const popups = loadAllInAppNotifications()
    .filter(
      (n) =>
        n.active &&
        !isExpired(n) &&
        matchesUser(n, userId) &&
        (n.delivery === 'popup' || n.delivery === 'both') &&
        isPopupScheduleVisible(n) &&
        !isPopupDismissBlocked(userId, n),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return popups[0] ?? null;
}

export function dismissPopup(userId: string, notificationId: string) {
  const list = loadPopupDismissed();
  if (list.some((d) => d.userId === userId && d.notificationId === notificationId)) return;
  list.push({
    userId,
    notificationId,
    dismissedAt: new Date().toISOString(),
  });
  savePopupDismissed(list);
  markAsRead(userId, notificationId);
}

export function markAsRead(userId: string, notificationId: string) {
  const reads = loadReads();
  if (reads.some((r) => r.userId === userId && r.notificationId === notificationId)) return;
  reads.push({
    userId,
    notificationId,
    readAt: new Date().toISOString(),
  });
  saveReads(reads);
}

export function markAllAsRead(userId: string) {
  const list = getNotificationsForUser(userId).filter((n) => !n.read);
  const reads = loadReads();
  for (const n of list) {
    reads.push({ userId, notificationId: n.id, readAt: new Date().toISOString() });
  }
  saveReads(reads);
}

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}

export function getAdminNotificationStats() {
  const all = loadAllInAppNotifications();
  const active = all.filter((n) => n.active && !isExpired(n));
  return {
    total: all.length,
    active: active.length,
    popupActive: active.filter((n) => n.delivery === 'popup' || n.delivery === 'both').length,
    bellActive: active.filter((n) => n.delivery === 'bell' || n.delivery === 'both').length,
  };
}

export function startInAppNotificationPolling(
  userId: string,
  onUpdate: (payload: { unread: number; popup: InAppNotification | null }) => void,
  intervalMs = 3000,
): () => void {
  const tick = () =>
    onUpdate({
      unread: getUnreadCount(userId),
      popup: getActivePopupForUser(userId),
    });
  tick();
  const id = window.setInterval(tick, intervalMs);
  const onEvent = () => tick();
  window.addEventListener(INAPP_NOTIF_UPDATED, onEvent);
  return () => {
    clearInterval(id);
    window.removeEventListener(INAPP_NOTIF_UPDATED, onEvent);
  };
}
