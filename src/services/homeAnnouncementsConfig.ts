import type { HomeAnnouncementBlock, HomeAnnouncementsConfig } from '../types/homeAnnouncements';

export const HOME_ANNOUNCEMENTS_UPDATED = 'taphoammo-home-announcements-updated';
const STORAGE_KEY = 'taphoammo_home_announcements';

const defaultDisclaimer = (): HomeAnnouncementBlock => ({
  enabled: true,
  title: 'TUYÊN BỐ MIỄN TRỪ TRÁCH NHIỆM ( QUAN TRỌNG )',
  content:
    'Website chỉ cung cấp tài khoản mạng xã hội phục vụ quảng cáo và kinh doanh hợp pháp. Chúng tôi không chịu trách nhiệm nếu khách hàng sử dụng tài khoản mục đích vi phạm pháp luật Việt Nam.',
  highlightText: '',
  linkLabel: '',
  linkUrl: '',
  showZaloButton: false,
  zaloUrl: '',
  showTelegramButton: false,
  telegramUrl: '',
});

const defaultPolicy = (): HomeAnnouncementBlock => ({
  enabled: true,
  title: 'CHÍNH SÁCH BẢO HÀNH & NGUYÊN TẮC',
  content:
    'Tất cả sản phẩm được bảo hành theo chế độ ghi ở đầu trang và ghi chú chi tiết. Vui lòng đọc kỹ trước khi thanh toán.',
  highlightText: '',
  linkLabel: 'Xem chính sách bảo hành chi tiết',
  linkUrl: '#',
  showZaloButton: true,
  zaloUrl: '#',
  showTelegramButton: true,
  telegramUrl: '#',
});

export const DEFAULT_HOME_ANNOUNCEMENTS: HomeAnnouncementsConfig = {
  disclaimer: defaultDisclaimer(),
  policy: defaultPolicy(),
};

function normalizeBlock(
  raw: Partial<HomeAnnouncementBlock> | undefined,
  fallback: HomeAnnouncementBlock,
): HomeAnnouncementBlock {
  if (!raw) return { ...fallback };
  return {
    enabled: raw.enabled !== false,
    title: String(raw.title ?? fallback.title),
    content: String(raw.content ?? fallback.content),
    highlightText: String(raw.highlightText ?? fallback.highlightText),
    linkLabel: String(raw.linkLabel ?? fallback.linkLabel),
    linkUrl: String(raw.linkUrl ?? fallback.linkUrl),
    showZaloButton: raw.showZaloButton === true,
    zaloUrl: String(raw.zaloUrl ?? fallback.zaloUrl),
    showTelegramButton: raw.showTelegramButton === true,
    telegramUrl: String(raw.telegramUrl ?? fallback.telegramUrl),
  };
}

export function normalizeHomeAnnouncements(
  raw: Partial<HomeAnnouncementsConfig>,
): HomeAnnouncementsConfig {
  return {
    disclaimer: normalizeBlock(raw.disclaimer, DEFAULT_HOME_ANNOUNCEMENTS.disclaimer),
    policy: normalizeBlock(raw.policy, DEFAULT_HOME_ANNOUNCEMENTS.policy),
  };
}

export function loadHomeAnnouncements(): HomeAnnouncementsConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { ...DEFAULT_HOME_ANNOUNCEMENTS };
    return normalizeHomeAnnouncements(JSON.parse(stored) as Partial<HomeAnnouncementsConfig>);
  } catch {
    return { ...DEFAULT_HOME_ANNOUNCEMENTS };
  }
}

export function saveHomeAnnouncements(config: HomeAnnouncementsConfig) {
  const normalized = normalizeHomeAnnouncements(config);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new CustomEvent(HOME_ANNOUNCEMENTS_UPDATED, { detail: normalized }));
}
