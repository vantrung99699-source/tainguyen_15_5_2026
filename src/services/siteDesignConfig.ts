import type { SiteDesignConfig } from '../types/siteDesign';

export const SITE_DESIGN_UPDATED = 'taphoammo-site-design-updated';
const STORAGE_KEY = 'taphoammo_site_design';

export const DEFAULT_SITE_DESIGN: SiteDesignConfig = {
  logoMode: 'default',
  logoMark: 'T',
  logoTitle: 'TapHoa',
  logoHighlight: 'MMO',
  logoImageUrl: '',
  brandPrimary: '#53b88d',
  brandSecondary: '#42a379',
  topBarBg: '#2a5b46',
  mainHeaderBg: '#ffffff',
  pageBg: '#fcfcfd',
  productCardStyle: 'grid',
  productGridLayout: 'grid-4',
  categorySectionLayout: 'blocks',
  categoryFilterLayout: 'grid',
};

function pickEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

export function normalizeSiteDesign(raw: Partial<SiteDesignConfig>): SiteDesignConfig {
  return {
    logoMode: pickEnum(raw.logoMode, ['default', 'custom-text', 'image'] as const, DEFAULT_SITE_DESIGN.logoMode),
    logoMark: String(raw.logoMark ?? DEFAULT_SITE_DESIGN.logoMark),
    logoTitle: String(raw.logoTitle ?? DEFAULT_SITE_DESIGN.logoTitle),
    logoHighlight: String(raw.logoHighlight ?? DEFAULT_SITE_DESIGN.logoHighlight),
    logoImageUrl: String(raw.logoImageUrl ?? ''),
    brandPrimary: String(raw.brandPrimary ?? DEFAULT_SITE_DESIGN.brandPrimary),
    brandSecondary: String(raw.brandSecondary ?? DEFAULT_SITE_DESIGN.brandSecondary),
    topBarBg: String(raw.topBarBg ?? DEFAULT_SITE_DESIGN.topBarBg),
    mainHeaderBg: String(raw.mainHeaderBg ?? DEFAULT_SITE_DESIGN.mainHeaderBg),
    pageBg: String(raw.pageBg ?? DEFAULT_SITE_DESIGN.pageBg),
    productCardStyle: pickEnum(
      raw.productCardStyle,
      ['grid', 'compact', 'list'] as const,
      DEFAULT_SITE_DESIGN.productCardStyle,
    ),
    productGridLayout: pickEnum(
      raw.productGridLayout,
      ['grid-4', 'grid-3', 'list'] as const,
      DEFAULT_SITE_DESIGN.productGridLayout,
    ),
    categorySectionLayout: pickEnum(
      raw.categorySectionLayout,
      ['blocks', 'list'] as const,
      DEFAULT_SITE_DESIGN.categorySectionLayout,
    ),
    categoryFilterLayout: pickEnum(
      raw.categoryFilterLayout,
      ['grid', 'sidebar'] as const,
      DEFAULT_SITE_DESIGN.categoryFilterLayout,
    ),
  };
}

export function loadSiteDesign(): SiteDesignConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SITE_DESIGN };
    return normalizeSiteDesign(JSON.parse(raw) as Partial<SiteDesignConfig>);
  } catch {
    return { ...DEFAULT_SITE_DESIGN };
  }
}

export function saveSiteDesign(config: SiteDesignConfig) {
  const normalized = normalizeSiteDesign(config);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  applySiteDesign(normalized);
  window.dispatchEvent(new CustomEvent(SITE_DESIGN_UPDATED, { detail: normalized }));
}

export function resetSiteDesign(): SiteDesignConfig {
  const defaults = { ...DEFAULT_SITE_DESIGN };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
  applySiteDesign(defaults);
  window.dispatchEvent(new CustomEvent(SITE_DESIGN_UPDATED, { detail: defaults }));
  return defaults;
}

export function applySiteDesign(config: SiteDesignConfig) {
  const root = document.documentElement;
  root.style.setProperty('--color-brand-primary', config.brandPrimary);
  root.style.setProperty('--color-brand-secondary', config.brandSecondary);
  root.style.setProperty('--header-top-bg', config.topBarBg);
  root.style.setProperty('--header-main-bg', config.mainHeaderBg);
  root.style.setProperty('--page-bg', config.pageBg);
}

/** Gọi một lần khi app khởi động */
export function initSiteDesign() {
  applySiteDesign(loadSiteDesign());
}
