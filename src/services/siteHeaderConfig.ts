import type { HeaderNavLink, SiteHeaderConfig } from '../types/siteHeader';

export const SITE_HEADER_UPDATED = 'taphoammo-site-header-updated';
const STORAGE_KEY = 'taphoammo_site_header';

function newLinkId() {
  return `link-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export const DEFAULT_HEADER_NAV_LINKS: HeaderNavLink[] = [
  { id: 'about', label: 'Về chúng tôi', url: '#', enabled: true },
  { id: 'news', label: 'Tin tức', url: '#', enabled: true },
  { id: 'api', label: 'API Docs', url: '#', enabled: true },
];

export const DEFAULT_SITE_HEADER_CONFIG: SiteHeaderConfig = {
  topBarEnabled: true,
  contactDisplay: 'Kỹ thuật: 1900 xxxx (24/7)',
  contactPhone: '1900xxxx',
  contactEmail: 'hotro@taphoammo.vn',
  contactLinkType: 'phone',
  navLinks: DEFAULT_HEADER_NAV_LINKS,
  topBarCustomText: '',
  showTopBarCustomText: false,
  marqueeEnabled: true,
  marqueeLines: [
    'Chào mừng bạn đến với TapHoaMMO - Hệ thống giao dịch tài nguyên tự động 24/7.',
    'Hệ thống vừa cập nhật thêm nhiều sản phẩm Cloud API mới, mời các bạn tham khảo tại mục Sản phẩm.',
    'Cảnh báo: Không giao dịch bên ngoài hệ thống để tránh bị lừa đảo.',
  ],
};

function normalizeLink(raw: Partial<HeaderNavLink>): HeaderNavLink {
  return {
    id: String(raw.id ?? newLinkId()),
    label: String(raw.label ?? ''),
    url: String(raw.url ?? '#'),
    enabled: raw.enabled !== false,
  };
}

export function normalizeSiteHeaderConfig(raw: Partial<SiteHeaderConfig>): SiteHeaderConfig {
  const links =
    Array.isArray(raw.navLinks) && raw.navLinks.length > 0
      ? raw.navLinks.map((l) => normalizeLink(l))
      : DEFAULT_SITE_HEADER_CONFIG.navLinks.map((l) => ({ ...l }));

  const marqueeLines =
    Array.isArray(raw.marqueeLines) && raw.marqueeLines.length > 0
      ? raw.marqueeLines.map((line) => String(line).trim()).filter(Boolean)
      : [...DEFAULT_SITE_HEADER_CONFIG.marqueeLines];

  const contactLinkType =
    raw.contactLinkType === 'email' || raw.contactLinkType === 'none' ? raw.contactLinkType : 'phone';

  return {
    topBarEnabled: raw.topBarEnabled !== false,
    contactDisplay: String(raw.contactDisplay ?? DEFAULT_SITE_HEADER_CONFIG.contactDisplay),
    contactPhone: String(raw.contactPhone ?? DEFAULT_SITE_HEADER_CONFIG.contactPhone),
    contactEmail: String(raw.contactEmail ?? DEFAULT_SITE_HEADER_CONFIG.contactEmail),
    contactLinkType,
    navLinks: links,
    topBarCustomText: String(raw.topBarCustomText ?? ''),
    showTopBarCustomText: Boolean(raw.showTopBarCustomText),
    marqueeEnabled: raw.marqueeEnabled !== false,
    marqueeLines,
  };
}

export function loadSiteHeaderConfig(): SiteHeaderConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SITE_HEADER_CONFIG, navLinks: DEFAULT_HEADER_NAV_LINKS.map((l) => ({ ...l })) };
    return normalizeSiteHeaderConfig(JSON.parse(raw) as Partial<SiteHeaderConfig>);
  } catch {
    return { ...DEFAULT_SITE_HEADER_CONFIG, navLinks: DEFAULT_HEADER_NAV_LINKS.map((l) => ({ ...l })) };
  }
}

export function saveSiteHeaderConfig(config: SiteHeaderConfig) {
  const normalized = normalizeSiteHeaderConfig(config);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new CustomEvent(SITE_HEADER_UPDATED, { detail: normalized }));
}

export function getContactHref(config: SiteHeaderConfig): string | undefined {
  if (config.contactLinkType === 'phone' && config.contactPhone.trim()) {
    return `tel:${config.contactPhone.replace(/\s/g, '')}`;
  }
  if (config.contactLinkType === 'email' && config.contactEmail.trim()) {
    return `mailto:${config.contactEmail.trim()}`;
  }
  return undefined;
}

export function getContactDisplayText(config: SiteHeaderConfig): string {
  if (config.contactDisplay.trim()) return config.contactDisplay.trim();
  if (config.contactLinkType === 'email' && config.contactEmail.trim()) {
    return config.contactEmail.trim();
  }
  if (config.contactPhone.trim()) return config.contactPhone.trim();
  return DEFAULT_SITE_HEADER_CONFIG.contactDisplay;
}

export function createEmptyNavLink(): HeaderNavLink {
  return { id: newLinkId(), label: 'Liên kết mới', url: '#', enabled: true };
}
