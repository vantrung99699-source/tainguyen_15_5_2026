import { useEffect, useState } from 'react';
import type { SiteHeaderConfig } from '../types/siteHeader';
import { loadSiteHeaderConfig, SITE_HEADER_UPDATED } from '../services/siteHeaderConfig';

export function useSiteHeaderConfig(): SiteHeaderConfig {
  const [config, setConfig] = useState<SiteHeaderConfig>(() => loadSiteHeaderConfig());

  useEffect(() => {
    const refresh = () => setConfig(loadSiteHeaderConfig());
    window.addEventListener(SITE_HEADER_UPDATED, refresh);
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'taphoammo_site_header') refresh();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(SITE_HEADER_UPDATED, refresh);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return config;
}
