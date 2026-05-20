import { useEffect, useState } from 'react';
import type { SiteDesignConfig } from '../types/siteDesign';
import { loadSiteDesign, SITE_DESIGN_UPDATED } from '../services/siteDesignConfig';

export function useSiteDesign(): SiteDesignConfig {
  const [config, setConfig] = useState<SiteDesignConfig>(() => loadSiteDesign());

  useEffect(() => {
    const refresh = () => setConfig(loadSiteDesign());
    window.addEventListener(SITE_DESIGN_UPDATED, refresh);
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'taphoammo_site_design') refresh();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(SITE_DESIGN_UPDATED, refresh);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return config;
}
