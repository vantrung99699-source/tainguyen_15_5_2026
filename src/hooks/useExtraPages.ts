import { useEffect, useState } from 'react';
import type { ExtraPage } from '../types/extraPage';
import { EXTRA_PAGES_UPDATED, loadExtraPages } from '../services/extraPagesConfig';

export function useExtraPages() {
  const [pages, setPages] = useState<ExtraPage[]>(() => loadExtraPages());

  useEffect(() => {
    const sync = () => setPages(loadExtraPages());
    window.addEventListener(EXTRA_PAGES_UPDATED, sync);
    return () => window.removeEventListener(EXTRA_PAGES_UPDATED, sync);
  }, []);

  return pages;
}
