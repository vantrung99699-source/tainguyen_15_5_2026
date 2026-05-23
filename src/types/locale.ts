export interface Language {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  enabled: boolean;
  isDefault: boolean;
  rtl: boolean;
}

export interface TranslationEntry {
  key: string;
  group: string;
  /** Mô tả vị trí hiển thị trên giao diện (giúp admin biết cần dịch gì) */
  hint?: string;
  values: Record<string, string>;
}

export interface DynamicI18nEntry {
  entityType: string;
  entityId: string;
  field: string;
  values: Record<string, string>;
}
