import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Languages, Search, Save } from 'lucide-react';
import type { Language, TranslationEntry } from '../../types/locale';
import {
  getEnabledLanguages,
  loadLanguages,
  loadTranslations,
  LOCALE_UPDATED,
  saveLanguages,
  saveTranslations,
  setDefaultLanguage,
  setLanguageEnabled,
  upsertTranslation,
} from '../../services/localeService';

export function LanguageAdminSection() {
  const [languages, setLanguages] = useState<Language[]>(() => loadLanguages());
  const [entries, setEntries] = useState<TranslationEntry[]>(() => loadTranslations());
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [draft, setDraft] = useState<Record<string, Record<string, string>>>({});

  const sync = () => {
    setLanguages(loadLanguages());
    setEntries(loadTranslations());
  };

  useEffect(() => {
    window.addEventListener(LOCALE_UPDATED, sync);
    return () => window.removeEventListener(LOCALE_UPDATED, sync);
  }, []);

  const enabledLangs = getEnabledLanguages();
  const groups = useMemo(() => {
    const set = new Set(entries.map((e) => e.group));
    return ['all', ...set];
  }, [entries]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries.filter((e) => {
      if (groupFilter !== 'all' && e.group !== groupFilter) return false;
      if (!q) return true;
      if (e.key.toLowerCase().includes(q)) return true;
      return Object.values(e.values).some((v) => v.toLowerCase().includes(q));
    });
  }, [entries, search, groupFilter]);

  const getDraftValue = (key: string, langCode: string, original: string) =>
    draft[key]?.[langCode] ?? original;

  const setDraftValue = (key: string, langCode: string, value: string) => {
    setDraft((prev) => ({
      ...prev,
      [key]: { ...prev[key], [langCode]: value },
    }));
  };

  const saveRow = (entry: TranslationEntry) => {
    const patch = draft[entry.key] ?? {};
    const next: TranslationEntry = {
      ...entry,
      values: { ...entry.values, ...patch },
    };
    upsertTranslation(next);
    setDraft((prev) => {
      const copy = { ...prev };
      delete copy[entry.key];
      return copy;
    });
    sync();
  };

  const saveAllVisible = () => {
    const next = entries.map((e) => {
      const patch = draft[e.key];
      if (!patch) return e;
      return { ...e, values: { ...e.values, ...patch } };
    });
    saveTranslations(next);
    setDraft({});
    sync();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 ring-1 ring-emerald-100">
          <Languages className="h-5 w-5 text-brand-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-black tracking-tight text-zinc-900">Ngôn ngữ</h2>
          <p className="mt-0.5 text-[12px] font-medium text-zinc-500">
            Bật/tắt ngôn ngữ, mặc định và Translation Manager (Key → Value)
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-zinc-200/70 bg-white p-4 shadow-sm">
        <p className="mb-3 text-sm font-black text-zinc-800">Danh sách ngôn ngữ</p>
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead>
            <tr className="border-b text-[11px] font-bold uppercase text-zinc-500">
              <th className="py-2">Ngôn ngữ</th>
              <th className="py-2">Mã</th>
              <th className="py-2">Bật</th>
              <th className="py-2">Mặc định</th>
            </tr>
          </thead>
          <tbody>
            {languages.map((l) => (
              <tr key={l.id} className="border-b border-zinc-50">
                <td className="py-2 font-bold">
                  {l.flag} {l.nativeName}
                </td>
                <td className="py-2">{l.code}</td>
                <td className="py-2">
                  <input
                    type="checkbox"
                    checked={l.enabled}
                    disabled={l.isDefault}
                    onChange={(e) => {
                      setLanguageEnabled(l.id, e.target.checked);
                      sync();
                    }}
                  />
                </td>
                <td className="py-2">
                  <input
                    type="radio"
                    name="default-lang"
                    checked={l.isDefault}
                    onChange={() => {
                      setDefaultLanguage(l.id);
                      sync();
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl border border-zinc-200/70 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-zinc-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-black text-zinc-800">Translation Manager</p>
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 sm:min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm key hoặc nội dung..."
                className="w-full rounded-xl border border-zinc-200 py-2 pl-9 pr-3 text-sm"
              />
            </div>
            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="rounded-xl border border-zinc-200 px-3 py-2 text-sm"
            >
              {groups.map((g) => (
                <option key={g} value={g}>
                  {g === 'all' ? 'Tất cả nhóm' : g}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={saveAllVisible}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2 text-sm font-bold text-white"
            >
              <Save className="h-4 w-4" /> Lưu tất cả
            </button>
          </div>
        </div>

        <div className="max-h-[480px] overflow-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="sticky top-0 bg-zinc-50">
              <tr className="text-[11px] font-bold uppercase text-zinc-500">
                <th className="px-4 py-3 w-48">Key</th>
                <th className="px-4 py-3 w-20">Nhóm</th>
                {enabledLangs.map((l) => (
                  <th key={l.code} className="px-4 py-3">
                    {l.flag} {l.code}
                  </th>
                ))}
                <th className="px-4 py-3 w-20" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => (
                <tr key={entry.key} className="border-t border-zinc-50">
                  <td className="px-4 py-2 font-mono text-xs text-zinc-600">{entry.key}</td>
                  <td className="px-4 py-2 text-xs text-zinc-400">{entry.group}</td>
                  {enabledLangs.map((l) => (
                    <td key={l.code} className="px-4 py-2">
                      <input
                        value={getDraftValue(entry.key, l.code, entry.values[l.code] ?? '')}
                        onChange={(e) => setDraftValue(entry.key, l.code, e.target.value)}
                        className="w-full min-w-[120px] rounded-lg border border-zinc-200 px-2 py-1 text-xs"
                      />
                    </td>
                  ))}
                  <td className="px-4 py-2">
                    {draft[entry.key] ? (
                      <button
                        type="button"
                        onClick={() => saveRow(entry)}
                        className="text-xs font-bold text-brand-primary hover:underline"
                      >
                        Lưu
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="border-t border-zinc-100 p-3 text-[11px] text-zinc-400">
          Nội dung động (tên sản phẩm): dùng key{' '}
          <code className="rounded bg-zinc-100 px-1">product_[id]</code> hoặc bảng dynamic_i18n.
        </p>
      </div>
    </motion.div>
  );
}
