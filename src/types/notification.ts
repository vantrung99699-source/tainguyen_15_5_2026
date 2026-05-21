export type TelegramAdminEvent =
  | 'newOrder'
  | 'withdrawalRequest'
  | 'depositSuccess'
  | 'lowStock';

export type TelegramApiServer = 'official' | 'tnd-proxy' | 'custom';

export interface TelegramAdminConfig {
  botToken: string;
  adminChatId: string;
  botUsername: string;
  webhookSecret: string;
  apiServer: TelegramApiServer;
  enabled: boolean;
  events: Record<TelegramAdminEvent, boolean>;
}

export const TELEGRAM_API_SERVER_LABELS: Record<TelegramApiServer, string> = {
  official: 'Telegram Official API',
  'tnd-proxy': 'TND Proxy Server (Khuyến nghị cho VN)',
  custom: 'Custom API Server',
};

export interface TelegramUserPrefs {
  userId: string;
  chatId: string;
  linked: boolean;
  linkCode: string | null;
  notifyOrderComplete: boolean;
  notifyLoginAlert: boolean;
  notifyAffiliateCredit: boolean;
}

export interface TelegramLogEntry {
  id: string;
  chatId: string;
  message: string;
  status: 'sent' | 'failed';
  createdAt: string;
}

export type SmtpEncryption = 'none' | 'ssl' | 'tls';

export interface SmtpConfig {
  host: string;
  port: number;
  encryption: SmtpEncryption;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  enabled: boolean;
}

export interface EmailTemplate {
  id: string;
  slug: string;
  name: string;
  subject: string;
  htmlBody: string;
  enabled: boolean;
}

export type EmailCampaignTarget = 'all' | 'vip' | 'active';

export interface EmailCampaign {
  id: string;
  subject: string;
  htmlBody: string;
  target: EmailCampaignTarget;
  createdAt: string;
  sentAt: string | null;
  recipientCount: number;
  status: 'draft' | 'sent';
}

export interface EmailLogEntry {
  id: string;
  to: string;
  subject: string;
  status: 'sent' | 'failed';
  createdAt: string;
}

export type InAppNotificationType = 'promo' | 'maintenance' | 'alert' | 'system';

/** bell = chuông header; popup = modal/toast; both = cả hai */
export type NotificationDelivery = 'bell' | 'popup' | 'both';

export type PopupVisualStyle = 'info' | 'warning' | 'promo';

/** Cách hiển thị lại popup sau khi khách đóng */
export type PopupScheduleMode =
  | 'until_dismiss'
  | 'after_interval'
  | 'specific_date'
  | 'expire_at_date';

export interface InAppNotification {
  id: string;
  type: InAppNotificationType;
  title: string;
  shortContent: string;
  detailContent: string;
  /** null = broadcast to all */
  targetUserId: string | null;
  delivery: NotificationDelivery;
  popupStyle: PopupVisualStyle;
  /** Chỉ áp dụng khi delivery là popup hoặc both */
  popupScheduleMode: PopupScheduleMode;
  /** Giờ chờ hiện lại (after_interval) */
  popupReshowHours: number;
  /** Thời điểm bắt đầu hiện popup (specific_date) */
  popupShowFrom: string | null;
  /** Thời điểm kết thúc hiện popup (expire_at_date) */
  popupShowUntil: string | null;
  actionLabel: string;
  actionUrl: string;
  active: boolean;
  createdAt: string;
  expiresAt: string | null;
}

export const POPUP_SCHEDULE_LABELS: Record<PopupScheduleMode, string> = {
  until_dismiss: 'Không hiện lại khi đóng',
  after_interval: 'Hiện lại sau khoảng thời gian',
  specific_date: 'Hiện từ ngày giờ cụ thể',
  expire_at_date: 'Hết hạn vào ngày giờ cụ thể',
};

export const POPUP_SCHEDULE_HINTS: Record<PopupScheduleMode, string> = {
  until_dismiss: 'Khách đóng popup → ẩn vĩnh viễn (đến khi admin tắt TB)',
  after_interval: 'Đóng xong, sau X giờ sẽ hiện lại nếu TB vẫn bật',
  specific_date: 'Chỉ hiện popup khi đã đến thời điểm bạn chọn',
  expire_at_date: 'Popup tự ẩn sau thời điểm bạn chọn (trước đó vẫn hiện bình thường)',
};

export const INAPP_TYPE_LABELS: Record<InAppNotificationType, string> = {
  promo: 'Ưu đãi',
  maintenance: 'Bảo trì',
  alert: 'Cảnh báo',
  system: 'Hệ thống',
};

export const DELIVERY_LABELS: Record<NotificationDelivery, string> = {
  bell: 'Chuông',
  popup: 'Popup',
  both: 'Chuông + Popup',
};

export const POPUP_STYLE_LABELS: Record<PopupVisualStyle, string> = {
  info: 'Thông tin (xanh)',
  warning: 'Cảnh báo (cam)',
  promo: 'Ưu đãi (tím)',
};

export const TELEGRAM_EVENT_LABELS: Record<TelegramAdminEvent, string> = {
  newOrder: 'Đơn hàng mới',
  withdrawalRequest: 'Yêu cầu rút tiền affiliate',
  depositSuccess: 'Nạp tiền thành công',
  lowStock: 'Kho sắp hết',
};
