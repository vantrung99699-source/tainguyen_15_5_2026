import { useEffect, useState } from 'react';
import type { HomeAnnouncementsConfig } from '../types/homeAnnouncements';
import {
  loadHomeAnnouncements,
  HOME_ANNOUNCEMENTS_UPDATED,
} from '../services/homeAnnouncementsConfig';

export function useHomeAnnouncements(): HomeAnnouncementsConfig {
  const [config, setConfig] = useState(loadHomeAnnouncements);

  useEffect(() => {
    const refresh = () => setConfig(loadHomeAnnouncements());
    window.addEventListener(HOME_ANNOUNCEMENTS_UPDATED, refresh);
    return () => window.removeEventListener(HOME_ANNOUNCEMENTS_UPDATED, refresh);
  }, []);

  return config;
}
