import { DEFAULT_TRANSLATION_ENTRIES } from '../i18n/defaultTranslations';
import type { DynamicI18nEntry, Language, TranslationEntry } from '../types/locale';

const LANGUAGES_KEY = 'taphoammo_languages';
const TRANSLATIONS_KEY = 'taphoammo_translations';
const DYNAMIC_KEY = 'taphoammo_dynamic_i18n';
const CUSTOMER_LOCALE_KEY = 'taphoammo_customer_locale';

export const LOCALE_UPDATED = 'taphoammo-locale-updated';

const DEFAULT_LANGUAGES: Language[] = [
  {
    id: 'lang-vi',
    code: 'vi',
    name: 'Tiếng Việt',
    nativeName: 'Tiếng Việt',
    flag: '🇻🇳',
    enabled: true,
    isDefault: true,
    rtl: false,
  },
  {
    id: 'lang-en',
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    enabled: true,
    isDefault: false,
    rtl: false,
  },
  {
    id: 'lang-th',
    code: 'th',
    name: 'ภาษาไทย',
    nativeName: 'ไทย',
    flag: '🇹🇭',
    enabled: true,
    isDefault: false,
    rtl: false,
  },
];

function emit() {
  window.dispatchEvent(new CustomEvent(LOCALE_UPDATED));
}

export function loadLanguages(): Language[] {
  try {
    const raw = localStorage.getItem(LANGUAGES_KEY);
    if (!raw) return [...DEFAULT_LANGUAGES];
    const parsed = JSON.parse(raw) as Language[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...DEFAULT_LANGUAGES];
  } catch {
    return [...DEFAULT_LANGUAGES];
  }
}

export function saveLanguages(list: Language[]) {
  localStorage.setItem(LANGUAGES_KEY, JSON.stringify(list));
  emit();
}

function mergeDefaultTranslations(stored: TranslationEntry[]): TranslationEntry[] {
  const byKey = new Map(stored.map((e) => [e.key, e]));
  for (const def of DEFAULT_TRANSLATION_ENTRIES) {
    if (!byKey.has(def.key)) byKey.set(def.key, { ...def });
    else {
      const existing = byKey.get(def.key)!;
      byKey.set(def.key, {
        ...existing,
        values: { ...def.values, ...existing.values },
      });
    }
  }
  return [...byKey.values()];
}

export function loadTranslations(): TranslationEntry[] {
  try {
    const raw = localStorage.getItem(TRANSLATIONS_KEY);
    if (!raw) return mergeDefaultTranslations([]);
    const parsed = JSON.parse(raw) as TranslationEntry[];
    return mergeDefaultTranslations(Array.isArray(parsed) ? parsed : []);
  } catch {
    return mergeDefaultTranslations([]);
  }
}

export function saveTranslations(entries: TranslationEntry[]) {
  localStorage.setItem(TRANSLATIONS_KEY, JSON.stringify(entries));
  emit();
}

export function loadDynamicI18n(): DynamicI18nEntry[] {
  try {
    const raw = localStorage.getItem(DYNAMIC_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DynamicI18nEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveDynamicI18n(entries: DynamicI18nEntry[]) {
  localStorage.setItem(DYNAMIC_KEY, JSON.stringify(entries));
  emit();
}

export function getDefaultLanguage(): Language {
  return loadLanguages().find((l) => l.isDefault && l.enabled) ?? DEFAULT_LANGUAGES[0];
}

export function getEnabledLanguages() {
  return loadLanguages().filter((l) => l.enabled);
}

export function loadCustomerLocaleCode(): string {
  const saved = localStorage.getItem(CUSTOMER_LOCALE_KEY);
  if (saved) {
    const lang = loadLanguages().find((l) => l.code === saved && l.enabled);
    if (lang) return lang.code;
  }
  return getDefaultLanguage().code;
}

export function saveCustomerLocaleCode(code: string) {
  localStorage.setItem(CUSTOMER_LOCALE_KEY, code);
  emit();
}

export function translate(
  key: string,
  localeCode: string,
  fallback?: string,
): string {
  const entries = loadTranslations();
  const entry = entries.find((e) => e.key === key);
  if (entry?.values[localeCode]?.trim()) return entry.values[localeCode];
  const def = getDefaultLanguage().code;
  if (entry?.values[def]?.trim()) return entry.values[def];
  return fallback ?? key;
}

export function getDynamicText(
  entityType: string,
  entityId: string,
  field: string,
  localeCode: string,
  fallback: string,
): string {
  const entries = loadDynamicI18n();
  const hit = entries.find(
    (e) => e.entityType === entityType && e.entityId === entityId && e.field === field,
  );
  if (hit?.values[localeCode]?.trim()) return hit.values[localeCode];
  const def = getDefaultLanguage().code;
  if (hit?.values[def]?.trim()) return hit.values[def];
  return fallback;
}

export function upsertTranslation(entry: TranslationEntry) {
  const list = loadTranslations();
  const idx = list.findIndex((e) => e.key === entry.key);
  if (idx >= 0) list[idx] = entry;
  else list.push(entry);
  saveTranslations(list);
}

export function upsertDynamicI18n(entry: DynamicI18nEntry) {
  const list = loadDynamicI18n();
  const idx = list.findIndex(
    (e) =>
      e.entityType === entry.entityType &&
      e.entityId === entry.entityId &&
      e.field === entry.field,
  );
  if (idx >= 0) list[idx] = entry;
  else list.push(entry);
  saveDynamicI18n(list);
}

export function setLanguageEnabled(id: string, enabled: boolean) {
  const list = loadLanguages();
  const idx = list.findIndex((l) => l.id === id);
  if (idx < 0) return;
  list[idx].enabled = enabled;
  saveLanguages(list);
}

export function setDefaultLanguage(id: string) {
  const list = loadLanguages();
  for (const l of list) {
    l.isDefault = l.id === id;
  }
  saveLanguages(list);
}

export function ensureCategoryTranslations(categoryIds: { id: string; name: string }[]) {
  const list = loadTranslations();
  let changed = false;
  for (const cat of categoryIds) {
    const key = `cat_${cat.id}`;
    if (list.some((e) => e.key === key)) continue;
    list.push({
      key,
      group: 'category',
      values: { vi: cat.name, en: cat.name, th: cat.name },
    });
    changed = true;
  }
  if (changed) saveTranslations(list);
}
