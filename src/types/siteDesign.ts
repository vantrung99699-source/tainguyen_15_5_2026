export type ProductCardStyle = 'grid' | 'compact' | 'list' | 'no-cover';
export type ProductGridLayout = 'grid-4' | 'grid-3' | 'list';
export type CategorySectionLayout = 'blocks' | 'list';
export type CategoryFilterLayout = 'grid' | 'sidebar';
export type LogoMode = 'default' | 'custom-text' | 'image';

export interface SiteDesignConfig {
  logoMode: LogoMode;
  logoMark: string;
  logoTitle: string;
  logoHighlight: string;
  logoImageUrl: string;
  brandPrimary: string;
  brandSecondary: string;
  topBarBg: string;
  mainHeaderBg: string;
  pageBg: string;
  productCardStyle: ProductCardStyle;
  productGridLayout: ProductGridLayout;
  categorySectionLayout: CategorySectionLayout;
  categoryFilterLayout: CategoryFilterLayout;
}
