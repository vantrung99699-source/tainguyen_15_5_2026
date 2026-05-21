import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  Heading2,
  ImagePlus,
  Code2,
  X,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  /** Chiều cao tối thiểu vùng soạn (VD: 72px, 120px, 200px) */
  minHeight?: string;
  label?: string;
}

interface ToolbarButtonProps {
  label: string;
  onClick: () => void;
  children: ReactNode;
}

const editorContentClass =
  'px-3 py-2.5 text-sm font-medium leading-relaxed text-zinc-800 outline-none ' +
  'break-words [&_h3]:mb-2 [&_h3]:mt-2 [&_h3]:text-base [&_h3]:font-bold [&_li]:my-0.5 ' +
  '[&_p]:my-1.5 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 ' +
  '[&_img]:my-2 [&_img]:block [&_img]:max-h-32 [&_img]:w-auto [&_img]:max-w-full [&_img]:rounded-lg ' +
  '[&_img]:border [&_img]:border-zinc-200 [&_a]:text-brand-primary [&_a]:underline';

function ToolbarButton({ label, onClick, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-emerald-50 hover:text-brand-primary"
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Nhập nội dung…',
  minHeight = '200px',
  label,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [htmlModalOpen, setHtmlModalOpen] = useState(false);
  const [htmlDraft, setHtmlDraft] = useState('');
  const [htmlMode, setHtmlMode] = useState<'insert' | 'replace'>('insert');

  const emitChange = useCallback(() => {
    const html = editorRef.current?.innerHTML ?? '';
    onChange(html === '<br>' ? '' : html);
  }, [onChange]);

  const exec = useCallback(
    (command: string, arg?: string) => {
      editorRef.current?.focus();
      document.execCommand(command, false, arg);
      emitChange();
    },
    [emitChange],
  );

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (el.innerHTML !== value) {
      el.innerHTML = value || '';
    }
  }, [value]);

  const insertLink = () => {
    const url = window.prompt('Nhập URL liên kết:', 'https://');
    if (!url?.trim()) return;
    exec('createLink', url.trim());
  };

  const insertImage = () => {
    const url = window.prompt('Nhập URL hình ảnh:', 'https://');
    if (!url?.trim()) return;
    exec('insertImage', url.trim());
  };

  const openHtmlModal = (mode: 'insert' | 'replace') => {
    setHtmlMode(mode);
    setHtmlDraft(mode === 'replace' ? value || '' : '');
    setHtmlModalOpen(true);
  };

  const insertHtmlAtCursor = (html: string) => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (el.contains(range.commonAncestorContainer)) {
        range.deleteContents();
        const template = document.createElement('template');
        template.innerHTML = html;
        range.insertNode(template.content);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
        emitChange();
        return;
      }
    }
    el.insertAdjacentHTML('beforeend', html);
    emitChange();
  };

  const applyHtmlDraft = () => {
    const html = htmlDraft.trim();
    if (!html) {
      setHtmlModalOpen(false);
      return;
    }
    if (htmlMode === 'replace') {
      if (editorRef.current) {
        editorRef.current.innerHTML = html;
      }
      onChange(html);
    } else {
      insertHtmlAtCursor(html);
    }
    setHtmlModalOpen(false);
  };

  const isEmpty = !value || value === '<br>' || value.replace(/<[^>]*>/g, '').trim() === '';

  return (
    <div className="space-y-1.5">
      {label ? (
        <span className="text-[11px] font-bold uppercase tracking-wide text-zinc-400">{label}</span>
      ) : null}
      <div className="rounded-lg border border-zinc-200 bg-white ring-1 ring-zinc-100/80 focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/10">
        <div className="flex flex-wrap items-center gap-0.5 rounded-t-lg border-b border-zinc-100 bg-zinc-50/80 px-2 py-1.5">
          <ToolbarButton label="In đậm" onClick={() => exec('bold')}>
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="In nghiêng" onClick={() => exec('italic')}>
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Gạch chân" onClick={() => exec('underline')}>
            <Underline className="h-4 w-4" />
          </ToolbarButton>
          <span className="mx-1 h-5 w-px bg-zinc-200" />
          <ToolbarButton label="Tiêu đề" onClick={() => exec('formatBlock', 'h3')}>
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Danh sách bullet" onClick={() => exec('insertUnorderedList')}>
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Danh sách số" onClick={() => exec('insertOrderedList')}>
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Chèn liên kết" onClick={insertLink}>
            <Link2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Chèn hình ảnh" onClick={insertImage}>
            <ImagePlus className="h-4 w-4" />
          </ToolbarButton>
          <span className="mx-1 h-5 w-px bg-zinc-200" />
          <ToolbarButton label="Chèn HTML tại con trỏ" onClick={() => openHtmlModal('insert')}>
            <Code2 className="h-4 w-4" />
          </ToolbarButton>
          <button
            type="button"
            title="Sửa toàn bộ HTML"
            onClick={() => openHtmlModal('replace')}
            className="rounded-md px-2 py-1.5 text-[11px] font-bold text-zinc-500 transition-colors hover:bg-emerald-50 hover:text-brand-primary"
          >
            HTML
          </button>
        </div>

        <div
          className="relative max-h-[min(480px,50vh)] resize-y overflow-y-auto overflow-x-hidden bg-zinc-50/30"
          style={{ minHeight }}
        >
          {isEmpty && (
            <p className="pointer-events-none absolute left-3 top-2.5 z-[1] text-sm text-zinc-400">
              {placeholder}
            </p>
          )}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-multiline
            className={editorContentClass}
            style={{ minHeight: `calc(${minHeight} - 8px)` }}
            onInput={emitChange}
            onBlur={emitChange}
            onPaste={(e) => {
              const items = e.clipboardData?.items;
              if (!items) return;
              for (const item of items) {
                if (item.type.startsWith('image/')) {
                  e.preventDefault();
                  const file = item.getAsFile();
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    if (typeof reader.result === 'string') {
                      exec('insertImage', reader.result);
                    }
                  };
                  reader.readAsDataURL(file);
                  return;
                }
              }
            }}
          />
        </div>

        <p className="px-2.5 py-1.5 text-[10px] font-medium text-zinc-400">
          Nút &lt;/&gt; hoặc HTML — chèn/chỉnh mã HTML trực tiếp
        </p>
      </div>

      {htmlModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[500] flex items-center justify-center bg-black/50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rich-html-editor-title"
            onClick={() => setHtmlModalOpen(false)}
          >
            <div
              className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
                <div>
                  <h4 id="rich-html-editor-title" className="text-sm font-black text-zinc-900">
                    {htmlMode === 'replace' ? 'Sửa HTML toàn bộ' : 'Chèn HTML'}
                  </h4>
                  <p className="mt-0.5 text-[11px] font-medium text-zinc-500">
                    {htmlMode === 'replace'
                      ? 'Thay thế toàn bộ nội dung ô soạn thảo'
                      : 'HTML được chèn tại vị trí con trỏ'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setHtmlModalOpen(false)}
                  className="rounded-lg p-2 hover:bg-zinc-100"
                  aria-label="Đóng"
                >
                  <X className="h-5 w-5 text-zinc-500" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                <textarea
                  value={htmlDraft}
                  onChange={(e) => setHtmlDraft(e.target.value)}
                  spellCheck={false}
                  className="min-h-[240px] w-full resize-y rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2.5 font-mono text-[12px] leading-relaxed text-zinc-800 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
                  placeholder="<p>Nội dung HTML...</p>"
                />
              </div>
              <div className="flex justify-end gap-2 border-t border-zinc-100 px-5 py-4">
                <button
                  type="button"
                  onClick={() => setHtmlModalOpen(false)}
                  className="rounded-xl border border-zinc-200 px-4 py-2 text-[12px] font-bold text-zinc-600 hover:bg-zinc-50"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={applyHtmlDraft}
                  className="rounded-xl bg-brand-primary px-5 py-2 text-[12px] font-black text-white hover:opacity-90"
                >
                  Áp dụng
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
