import type { ExtraPage } from '../types/extraPage';
import { resolveExtraPageSlug, slugifyTitle } from '../utils/slugify';

export const EXTRA_PAGES_UPDATED = 'taphoammo-extra-pages-updated';
export const EXTRA_PAGE_URL_PREFIX = '/trang/';

const STORAGE_KEY = 'taphoammo_extra_pages';

const now = () =>
  new Date().toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export const DEFAULT_EXTRA_PAGES: ExtraPage[] = [
  {
    id: 'ep-1',
    title: 'Giới thiệu',
    slug: 'gioi-thieu',
    content:
      '<h3>Giới thiệu TapHoaMMO</h3><p>Nền tảng mua bán tài nguyên số tự động, uy tín và hỗ trợ 24/7.</p>',
    showInMenu: true,
    enabled: true,
    linkType: 'content',
    externalUrl: '',
    sortOrder: 1,
    updatedAt: now(),
  },
  {
    id: 'ep-2',
    title: 'Hướng dẫn sử dụng',
    slug: 'huong-dan',
    content:
      '<h3>Hướng dẫn</h3><ul><li>Đăng ký tài khoản</li><li>Nạp tiền vào ví</li><li>Chọn sản phẩm và thanh toán</li></ul>',
    showInMenu: true,
    enabled: true,
    linkType: 'content',
    externalUrl: '',
    sortOrder: 2,
    updatedAt: now(),
  },
  {
    id: 'ep-3',
    title: 'Điều khoản dịch vụ',
    slug: 'dieu-khoan',
    content: '<h3>Điều khoản</h3><p>Nội dung điều khoản sử dụng dịch vụ...</p>',
    showInMenu: false,
    enabled: true,
    linkType: 'content',
    externalUrl: '',
    sortOrder: 3,
    updatedAt: now(),
  },
];

function normalizePage(raw: Partial<ExtraPage>, index: number): ExtraPage {
  const title = String(raw.title ?? 'Trang mới').trim() || 'Trang mới';
  const slug = String(raw.slug ?? '').trim() || slugifyTitle(title) || `trang-${index}`;
  return {
    id: String(raw.id ?? `ep-${Date.now()}`),
    title,
    slug,
    content: String(raw.content ?? ''),
    showInMenu: raw.showInMenu !== false,
    enabled: raw.enabled !== false,
    linkType: raw.linkType === 'external' ? 'external' : 'content',
    externalUrl: String(raw.externalUrl ?? ''),
    sortOrder: typeof raw.sortOrder === 'number' ? raw.sortOrder : index + 1,
    updatedAt: String(raw.updatedAt ?? now()),
  };
}

export function loadExtraPages(): ExtraPage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_EXTRA_PAGES.map((p, i) => normalizePage(p, i));
    const parsed = JSON.parse(raw) as Partial<ExtraPage>[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_EXTRA_PAGES.map((p, i) => normalizePage(p, i));
    }
    return parsed
      .map((p, i) => normalizePage(p, i))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  } catch {
    return DEFAULT_EXTRA_PAGES.map((p, i) => normalizePage(p, i));
  }
}

export function saveExtraPages(pages: ExtraPage[]) {
  const sorted = [...pages].sort((a, b) => a.sortOrder - b.sortOrder);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
  window.dispatchEvent(new CustomEvent(EXTRA_PAGES_UPDATED));
}

export function getMenuExtraPages(pages: ExtraPage[]) {
  return pages.filter((p) => p.enabled && p.showInMenu);
}

export function findExtraPageBySlug(pages: ExtraPage[], slug: string) {
  return pages.find((p) => p.enabled && p.slug === slug && p.linkType === 'content');
}

export function createEmptyExtraPage(pages: ExtraPage[]): ExtraPage {
  const maxOrder = pages.reduce((m, p) => Math.max(m, p.sortOrder), 0);
  return {
    id: `ep-${Date.now()}`,
    title: '',
    slug: '',
    content: '',
    showInMenu: true,
    enabled: true,
    linkType: 'content',
    externalUrl: '',
    sortOrder: maxOrder + 1,
    updatedAt: now(),
  };
}

export function finalizeExtraPage(page: ExtraPage, allPages: ExtraPage[]): ExtraPage {
  const slugs = allPages.filter((p) => p.id !== page.id).map((p) => p.slug);
  const slug = resolveExtraPageSlug(page.title, page.slug, slugs, page.id);
  return { ...page, slug, updatedAt: now() };
}

export function getExtraPagePublicPath(slug: string) {
  return `${EXTRA_PAGE_URL_PREFIX}${slug}`;
}

export function parseExtraPageSlugFromPath(pathname = window.location.pathname): string | null {
  const m = pathname.match(/^\/trang\/([^/?#]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

export function pushExtraPagePath(slug: string) {
  window.history.pushState({ extraPage: slug }, '', getExtraPagePublicPath(slug));
}

export function pushHomePath() {
  window.history.pushState({}, '', '/');
}
