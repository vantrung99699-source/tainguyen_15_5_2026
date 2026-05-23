import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  InlineTranslationEditor,
  type InlineEditorPayload,
} from '../components/i18n/InlineTranslationEditor';
import { decodeDynamicAttr } from '../components/i18n/Trans';
import {
  CUSTOMER_SESSION_UPDATED,
  isStorefrontTranslationAdmin,
  loadInlineEditMode,
  saveInlineEditMode,
} from '../services/storefrontTranslationAdmin';

interface InlineTranslationContextValue {
  canEdit: boolean;
  editMode: boolean;
  toggleEditMode: () => void;
  setEditMode: (on: boolean) => void;
  openEditor: (payload: InlineEditorPayload) => void;
}

const InlineTranslationContext = createContext<InlineTranslationContextValue | null>(null);

const EDIT_MODE_STYLE_ID = 'taphoammo-inline-i18n-style';

function setEditModeStyles(active: boolean) {
  let el = document.getElementById(EDIT_MODE_STYLE_ID) as HTMLStyleElement | null;
  if (!active) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('style');
    el.id = EDIT_MODE_STYLE_ID;
    document.head.appendChild(el);
  }
  el.textContent = `
    [data-i18n-key], [data-i18n-dynamic] {
      outline: 2px dashed rgba(56, 189, 248, 0.85) !important;
      outline-offset: 2px;
      border-radius: 3px;
      cursor: pointer !important;
    }
    [data-i18n-key]:hover, [data-i18n-dynamic]:hover {
      background-color: rgba(56, 189, 248, 0.1) !important;
    }
  `;
}

export function InlineTranslationProvider({ children }: { children: ReactNode }) {
  const [canEdit, setCanEdit] = useState(isStorefrontTranslationAdmin);
  const [editMode, setEditModeState] = useState(loadInlineEditMode);
  const [editor, setEditor] = useState<InlineEditorPayload | null>(null);

  useEffect(() => {
    const sync = () => setCanEdit(isStorefrontTranslationAdmin());
    sync();
    window.addEventListener(CUSTOMER_SESSION_UPDATED, sync);
    return () => window.removeEventListener(CUSTOMER_SESSION_UPDATED, sync);
  }, []);

  useEffect(() => {
    if (!canEdit && editMode) {
      setEditModeState(false);
      saveInlineEditMode(false);
      setEditor(null);
    }
  }, [canEdit, editMode]);

  useEffect(() => {
    setEditModeStyles(canEdit && editMode);
    return () => setEditModeStyles(false);
  }, [canEdit, editMode]);

  const setEditMode = useCallback((on: boolean) => {
    setEditModeState(on);
    saveInlineEditMode(on);
    if (!on) setEditor(null);
  }, []);

  const toggleEditMode = useCallback(() => {
    setEditModeState((prev) => {
      const next = !prev;
      saveInlineEditMode(next);
      if (!next) setEditor(null);
      return next;
    });
  }, []);

  const openEditor = useCallback(
    (payload: InlineEditorPayload) => {
      if (!canEdit || !editMode) return;
      setEditor(payload);
    },
    [canEdit, editMode],
  );

  useEffect(() => {
    if (!canEdit || !editMode) return;

    const onCaptureClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest('[data-inline-i18n-ignore]')) return;

      const el = target.closest('[data-i18n-key], [data-i18n-dynamic]') as HTMLElement | null;
      if (!el) return;

      e.preventDefault();
      e.stopPropagation();

      const dynamicRaw = el.getAttribute('data-i18n-dynamic');
      if (dynamicRaw) {
        const dynamic = decodeDynamicAttr(dynamicRaw);
        if (!dynamic) return;
        openEditor({
          dynamic,
          fallback: el.getAttribute('data-i18n-fallback') ?? el.textContent?.trim() ?? '',
          hint: el.getAttribute('data-i18n-hint') ?? undefined,
        });
        return;
      }

      const key = el.getAttribute('data-i18n-key');
      if (!key) return;
      openEditor({
        key,
        fallback: el.getAttribute('data-i18n-fallback') ?? el.textContent?.trim() ?? '',
        hint: el.getAttribute('data-i18n-hint') ?? undefined,
      });
    };

    document.addEventListener('click', onCaptureClick, true);
    return () => document.removeEventListener('click', onCaptureClick, true);
  }, [canEdit, editMode, openEditor]);

  const value = useMemo(
    (): InlineTranslationContextValue => ({
      canEdit,
      editMode,
      toggleEditMode,
      setEditMode,
      openEditor,
    }),
    [canEdit, editMode, toggleEditMode, setEditMode, openEditor],
  );

  return (
    <InlineTranslationContext.Provider value={value}>
      {children}
      {editor && (
        <InlineTranslationEditor payload={editor} onClose={() => setEditor(null)} />
      )}
      {canEdit && editMode && (
        <div className="pointer-events-none fixed bottom-4 left-1/2 z-[99990] -translate-x-1/2 px-4">
          <div className="rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-center text-[11px] font-black text-sky-800 shadow-lg shadow-sky-100/80">
            Chế độ sửa bản dịch — click vào bất kỳ chữ có viền xanh trên trang
          </div>
        </div>
      )}
    </InlineTranslationContext.Provider>
  );
}

export function useInlineTranslation() {
  const ctx = useContext(InlineTranslationContext);
  if (!ctx) {
    throw new Error('useInlineTranslation must be used within InlineTranslationProvider');
  }
  return ctx;
}

export function useInlineTranslationOptional() {
  return useContext(InlineTranslationContext);
}
