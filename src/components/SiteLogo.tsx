import type { SiteDesignConfig } from '../types/siteDesign';
import { DEFAULT_SITE_DESIGN } from '../services/siteDesignConfig';

interface SiteLogoProps {
  design?: Pick<
    SiteDesignConfig,
    'logoMode' | 'logoMark' | 'logoTitle' | 'logoHighlight' | 'logoImageUrl'
  >;
  markClassName?: string;
  textClassName?: string;
  showText?: boolean;
}

export function SiteLogo({
  design,
  markClassName = 'w-10 h-10',
  textClassName = 'text-[22px]',
  showText = true,
}: SiteLogoProps) {
  const cfg = design ?? DEFAULT_SITE_DESIGN;
  const mode = cfg.logoMode === 'default' ? 'custom-text' : cfg.logoMode;

  if (mode === 'image' && cfg.logoImageUrl.trim()) {
    return (
      <img
        src={cfg.logoImageUrl.trim()}
        alt={cfg.logoTitle}
        className={`${markClassName} object-contain`}
      />
    );
  }

  const mark = cfg.logoMode === 'default' ? DEFAULT_SITE_DESIGN.logoMark : cfg.logoMark;
  const title = cfg.logoMode === 'default' ? DEFAULT_SITE_DESIGN.logoTitle : cfg.logoTitle;
  const highlight =
    cfg.logoMode === 'default' ? DEFAULT_SITE_DESIGN.logoHighlight : cfg.logoHighlight;

  return (
    <>
      <div
        className={`${markClassName} flex shrink-0 items-center justify-center rounded-full bg-brand-primary shadow-lg shadow-emerald-100`}
      >
        <span className="select-none text-xl font-black italic leading-none text-white">{mark}</span>
      </div>
      {showText && (
        <span
          className={`hidden select-none font-black tracking-tight text-slate-800 lg:block ${textClassName}`}
        >
          {title}
          <span className="text-brand-primary">{highlight}</span>
        </span>
      )}
    </>
  );
}
