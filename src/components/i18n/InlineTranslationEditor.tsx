import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Languages, Save, X } from 'lucide-react';
import { getTranslationEntryHint } from '../../i18n/defaultTranslations';
import type { TransDynamicTarget } from './Trans';
import {
  getEnabledLanguages,
  loadDynamicI18n,
  loadTranslations,
  upsertDynamicI18n,
  upsertTranslation,
} from '../../services/localeService';
import type { DynamicI18nEntry, TranslationEntry } from '../../types/locale';

export interface InlineEditorPayload {
  key?: string;
  dynamic?: TransDynamicTarget;
  fallback: string;
  hint?: string;
}

interface InlineTranslationEditorProps {
  payload: InlineEditorPayload;
  onClose: () => void;
}

export function InlineTranslationEditor({ payload, onClose }: InlineTranslationEditorProps) {
  const enabledLangs = getEnabledLanguages();
  const [draft, setDraft] = useState<Record<string, string>>({});
  const isDynamic = Boolean(payload.dynamic);

  const staticEntry = useMemo((): TranslationEntry | null => {
    if (!payload.key) return null;
    const list = loadTranslations();
    const found = list.find((e) => e.key === payload.key);
    if (found) return found;
    return {
      key: payload.key,
      group: 'menu',
      hint: payload.hint,
      values: Object.fromEntries(
        enabledLangs.map((l) => [l.code, l.code === 'vi' ? payload.fallback : '']),
      ),
    };
  }, [payload.key, payload.fallback, payload.hint, enabledLangs]);

  const dynamicEntry = useMemo((): DynamicI18nEntry | null => {
    if (!payload.dynamic) return null;
    const { entityType, entityId, field } = payload.dynamic;
    const list = loadDynamicI18n();
    const found = list.find(
      (e) =>
        e.entityType === entityType && e.entityId === entityId && e.field === field,
    );
    if (found) return found;
    return {
      entityType,
      entityId,
      field,
      values: Object.fromEntries(
        enabledLangs.map((l) => [l.code, l.code === 'vi' ? payload.fallback : '']),
      ),
    };
  }, [payload.dynamic, payload.fallback, enabledLangs]);

  const values = isDynamic ? dynamicEntry!.values : staticEntry!.values;

  useEffect(() => {
    setDraft({});
  }, [payload.key, payload.dynamic?.entityId, payload.dynamic?.field]);

  const hint = isDynamic
    ? payload.hint ??
      `Nội dung động — ${payload.dynamic!.entityType} «${payload.dynamic!.entityId}» / ${payload.dynamic!.field}`
    : getTranslationEntryHint({
        key: staticEntry!.key,
        group: staticEntry!.group,
        hint: staticEntry!.hint ?? payload.hint,
      });

  const label = isDynamic
    ? `${payload.dynamic!.entityType}/${payload.dynamic!.entityId}/${payload.dynamic!.field}`
    : payload.key;

  const getValue = (langCode: string) =>
    draft[langCode] ?? values[langCode] ?? (langCode === 'vi' ? payload.fallback : '');

  const handleSave = () => {
    const merged = { ...values, ...draft };
    if (isDynamic && dynamicEntry) {
      upsertDynamicI18n({ ...dynamicEntry, values: merged });
    } else if (staticEntry) {
      upsertTranslation({
        ...staticEntry,
        hint: staticEntry.hint ?? payload.hint,
        values: merged,
      });
    }
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.97 }}
          className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl"
          data-inline-i18n-ignore
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
            <div>
              <div className="flex items-center gap-2 text-brand-primary">
                <Languages className="h-4 w-4" />
                <span className="text-xs font-black uppercase tracking-widest">Sửa bản dịch</span>
              </div>
              <p className="mt-1 font-mono text-[11px] text-slate-400">{label}</p>
              <p className="mt-2 text-sm font-bold text-slate-600">{hint}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              aria-label="Đóng"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[min(60vh,420px)] space-y-3 overflow-y-auto px-5 py-4">
            {enabledLangs.map((lang) => (
              <label key={lang.id} className="block">
                <span className="mb-1.5 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400">
                  <span>{lang.flag}</span>
                  {lang.nativeName}
                  <span className="font-mono normal-case text-slate-300">({lang.code})</span>
                </span>
                <input
                  type="text"
                  value={getValue(lang.code)}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, [lang.code]: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-800 outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
                  placeholder={lang.code === 'vi' ? payload.fallback : `Bản dịch ${lang.name}`}
                />
              </label>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 transition-colors hover:bg-slate-100"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-black text-white shadow-md shadow-emerald-100 transition-colors hover:bg-brand-secondary"
            >
              <Save className="h-4 w-4" />
              Lưu bản dịch
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
