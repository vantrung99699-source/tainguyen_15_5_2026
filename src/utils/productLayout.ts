import type { ProductCardStyle, ProductGridLayout } from '../types/siteDesign';

export function resolveCardStyle(
  cardStyle: ProductCardStyle,
  gridLayout: ProductGridLayout,
): ProductCardStyle {
  if (gridLayout === 'list') return 'list';
  return cardStyle;
}

export function getProductGridClass(layout: ProductGridLayout): string {
  switch (layout) {
    case 'grid-3':
      return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8';
    case 'list':
      return 'flex flex-col gap-4';
    default:
      return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8';
  }
}
