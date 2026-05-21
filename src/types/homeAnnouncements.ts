export interface HomeAnnouncementBlock {
  enabled: boolean;
  title: string;
  /** Nội dung HTML */
  content: string;
  /** Dòng nhấn mạnh (khối cảnh báo — màu cam) */
  highlightText: string;
  linkLabel: string;
  linkUrl: string;
  showZaloButton: boolean;
  zaloUrl: string;
  showTelegramButton: boolean;
  telegramUrl: string;
}

export interface HomeAnnouncementsConfig {
  disclaimer: HomeAnnouncementBlock;
  policy: HomeAnnouncementBlock;
}
