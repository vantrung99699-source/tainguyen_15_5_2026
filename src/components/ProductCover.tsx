import type { ComponentType, CSSProperties } from 'react';
import { LayoutGrid } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { isPresetIconUrl, resolveSocialIconPreset } from '../constants/socialIcons';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=300&fit=crop';

interface ProductCoverProps {
  image: string;
  alt: string;
  className?: string;
  iconClassName?: string;
}

/** Ảnh sản phẩm: URL thật, preset mạng xã hội (preset:tiktok…), hoặc ảnh mặc định */
export function ProductCover({ image, alt, className = '', iconClassName = 'h-14 w-14' }: ProductCoverProps) {
  const preset = resolveSocialIconPreset(image);

  if (preset) {
    const Icon =
      (LucideIcons as Record<string, ComponentType<{ className?: string; style?: CSSProperties }>>)[
        preset.icon
      ] || LayoutGrid;
    return (
      <div
        className={`flex h-full w-full items-center justify-center ${className}`}
        style={{ backgroundColor: preset.color || '#10b981' }}
        role="img"
        aria-label={alt}
      >
        <Icon className={`${iconClassName} text-white/95 drop-shadow-sm`} />
      </div>
    );
  }

  if (image.startsWith('http') || image.startsWith('data:') || image.startsWith('/')) {
    return <img src={image} alt={alt} className={className} />;
  }

  return <img src={FALLBACK_IMAGE} alt={alt} className={className} />;
}
