import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import {
  FileStack,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Link2,
  FileText,
  ExternalLink,
  Eye,
  EyeOff,
} from 'lucide-react';
import type { ExtraPage } from '../../types/extraPage';
import DetailDescriptionEditor from '../../components/admin/DetailDescriptionEditor';
import {
  createEmptyExtraPage,
  finalizeExtraPage,
  getExtraPagePublicPath,
  loadExtraPages,
  saveExtraPages,
} from '../../services/extraPagesConfig';
import { slugifyTitle } from '../../utils/slugify';

const inputClass =
  'w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10';

export function ExtraPagesSection() {
  const [pages, setPages] = useState<ExtraPage[]>(() => loadExtraPages());
  const [editing, setEditing] = useState<ExtraPage | null>(null);
  const [saved, setSaved] = useState(false);

  const persist = (next: ExtraPage[]) => {
    const finalized = next.map((p, i) => finalizeExtraPage({ ...p, sortOrder: i + 1 }, next));
    setPages(finalized);
    saveExtraPages(finalized);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  const openCreate = () => setEditing(createEmptyExtraPage(pages));
  const openEdit = (page: ExtraPage) => setEditing({ ...page });
  const closeModal = () => setEditing(null);

  const handleSavePage = () => {
    if (!editing) return;
    if (!editing.title.trim()) {
      window.alert('Vui lòng nhập tiêu đề trang.');
      return;
    }
    if (editing.linkType === 'external' && !editing.externalUrl.trim()) {
      window.alert('Vui lòng nhập đường link khi chọn loại link ngoài.');
      return;
    }
    const exists = pages.some((p) => p.id === editing.id);
    const next = exists ? pages.map((p) => (p.id === editing.id ? editing : p)) : [...pages, editing];
    persist(next);
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Xóa trang bổ sung này?')) return;
    persist(pages.filter((p) => p.id !== id));
  };

  const toggleFlag = (id: string, key: 'enabled' | 'showInMenu') => {
    persist(pages.map((p) => (p.id === id ? { ...p, [key]: !p[key] } : p)));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 ring-1 ring-emerald-100">
          <FileStack className="h-5 w-5 text-brand-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-black text-zinc-900">Trang bổ sung</h2>
          <p className="mt-0.5 text-[12px] font-medium text-zinc-500">
            Tạo tab nội dung (giới thiệu, hướng dẫn…) hoặc link ngoài — hiển thị menu Khác
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-[12px] font-black text-white shadow-md shadow-emerald-100"
        >
          <Plus className="h-4 w-4" />
          Tạo trang mới
        </button>
      </div>

      {saved && (
        <p className="rounded-lg bg-emerald-50 px-4 py-2 text-[12px] font-bold text-emerald-700">
          Đã lưu cấu hình trang bổ sung.
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/90">
                <th className="px-4 py-3 text-left text-[11px] font-black uppercase text-zinc-600">Tiêu đề</th>
                <th className="px-4 py-3 text-left text-[11px] font-black uppercase text-zinc-600">Slug / Link</th>
                <th className="px-4 py-3 text-center text-[11px] font-black uppercase text-zinc-600">Loại</th>
                <th className="px-4 py-3 text-center text-[11px] font-black uppercase text-zinc-600">Menu Khác</th>
                <th className="px-4 py-3 text-center text-[11px] font-black uppercase text-zinc-600">Bật</th>
                <th className="px-4 py-3 text-right text-[11px] font-black uppercase text-zinc-600">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {pages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-zinc-500">
                    Chưa có trang nào. Nhấn &quot;Tạo trang mới&quot; để bắt đầu.
                  </td>
                </tr>
              ) : (
                pages.map((page) => (
                  <tr key={page.id} className="border-b border-zinc-50 hover:bg-emerald-50/30">
                    <td className="px-4 py-3">
                      <p className="text-sm font-bold text-zinc-800">{page.title}</p>
                      <p className="text-[11px] text-zinc-400">{page.updatedAt}</p>
                    </td>
                    <td className="px-4 py-3 text-[12px] font-medium text-zinc-600">
                      {page.linkType === 'external' ? (
                        <span className="line-clamp-1">{page.externalUrl || '—'}</span>
                      ) : (
                        <span className="font-mono text-brand-primary">{getExtraPagePublicPath(page.slug)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          page.linkType === 'external'
                            ? 'bg-sky-100 text-sky-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {page.linkType === 'external' ? 'Link ngoài' : 'Nội dung'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => toggleFlag(page.id, 'showInMenu')}
                        className={`rounded-lg px-2 py-1 text-[11px] font-bold ${
                          page.showInMenu ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-500'
                        }`}
                      >
                        {page.showInMenu ? 'Hiện' : 'Ẩn'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => toggleFlag(page.id, 'enabled')}
                        aria-label={page.enabled ? 'Tắt trang' : 'Bật trang'}
                        className="mx-auto flex items-center justify-center rounded-lg p-1.5 hover:bg-zinc-100"
                      >
                        {page.enabled ? (
                          <Eye className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-zinc-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(page)}
                          className="rounded-md p-1.5 text-brand-primary hover:bg-emerald-50"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(page.id)}
                          className="rounded-md p-1.5 text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && createPortal(<ExtraPageModal page={editing} onChange={setEditing} onClose={closeModal} onSave={handleSavePage} />, document.body)}
    </motion.div>
  );
}

function ExtraPageModal({
  page,
  onChange,
  onClose,
  onSave,
}: {
  page: ExtraPage;
  onChange: (p: ExtraPage) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const slugPreview =
    page.slug.trim() || (page.title.trim() ? slugifyTitle(page.title) : 'tu-dong-tao-khi-luu');

  return (
    <motion.div
      className="fixed inset-0 z-[400] flex items-center justify-center bg-black/50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
          <h3 className="text-base font-black text-zinc-900">
            {page.title ? `Sửa: ${page.title}` : 'Tạo trang bổ sung'}
          </h3>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-zinc-100">
            <X className="h-5 w-5 text-zinc-500" />
          </button>
        </div>

        <div className="max-h-[calc(92vh-130px)] space-y-5 overflow-y-auto px-6 py-5">
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase text-zinc-500">Tiêu đề *</label>
            <input
              className={inputClass}
              value={page.title}
              onChange={(e) => onChange({ ...page, title: e.target.value })}
              placeholder="VD: Giới thiệu, Chính sách bảo mật..."
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase text-zinc-500">
              Slug (để trống = hệ thống tự tạo)
            </label>
            <div className="flex overflow-hidden rounded-xl border border-zinc-200 bg-white focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/10">
              <span className="shrink-0 border-r border-zinc-200 bg-zinc-50 px-3 py-2.5 text-[11px] font-medium text-zinc-500">
                /trang/
              </span>
              <input
                className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2.5 text-sm font-medium outline-none"
                value={page.slug}
                onChange={(e) =>
                  onChange({ ...page, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })
                }
                placeholder="gioi-thieu"
                disabled={page.linkType === 'external'}
              />
            </div>
            {page.linkType === 'content' && (
              <p className="mt-1 text-[11px] text-zinc-400">
                Xem trước: <span className="font-mono text-brand-primary">{getExtraPagePublicPath(slugPreview)}</span>
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase text-zinc-500">Kiểu hiển thị</label>
            <div className="grid grid-cols-2 gap-2">
              <LinkTypeOption
                active={page.linkType === 'content'}
                icon={FileText}
                label="Trang nội dung"
                desc="Giới thiệu, hướng dẫn, có ảnh trong bài"
                onClick={() => onChange({ ...page, linkType: 'content' })}
              />
              <LinkTypeOption
                active={page.linkType === 'external'}
                icon={ExternalLink}
                label="Đường link"
                desc="Mở URL khi khách chọn menu"
                onClick={() => onChange({ ...page, linkType: 'external' })}
              />
            </div>
          </div>

          {page.linkType === 'external' ? (
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase text-zinc-500">
                <Link2 className="h-3.5 w-3.5" />
                URL đích *
              </label>
              <input
                className={inputClass}
                value={page.externalUrl}
                onChange={(e) => onChange({ ...page, externalUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
          ) : (
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase text-zinc-500">Nội dung trang</label>
              <DetailDescriptionEditor
                value={page.content}
                onChange={(content) => onChange({ ...page, content })}
                placeholder="Giới thiệu, chức năng, hình ảnh..."
                aiContext={{ name: page.title || 'Trang bổ sung', shortDescription: 'Nội dung trang tĩnh' }}
              />
            </div>
          )}

          <div className="flex flex-wrap gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-zinc-700">
              <input
                type="checkbox"
                checked={page.showInMenu}
                onChange={(e) => onChange({ ...page, showInMenu: e.target.checked })}
                className="h-4 w-4 rounded border-zinc-300 text-brand-primary"
              />
              Hiển thị trong menu &quot;Khác&quot;
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-zinc-700">
              <input
                type="checkbox"
                checked={page.enabled}
                onChange={(e) => onChange({ ...page, enabled: e.target.checked })}
                className="h-4 w-4 rounded border-zinc-300 text-brand-primary"
              />
              Đang bật
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-zinc-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-200 px-4 py-2.5 text-[12px] font-bold text-zinc-600 hover:bg-zinc-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onSave}
            className="flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-[12px] font-black text-white"
          >
            <Save className="h-4 w-4" />
            Lưu trang
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function LinkTypeOption({
  active,
  icon: Icon,
  label,
  desc,
  onClick,
}: {
  active: boolean;
  icon: typeof FileText;
  label: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-3 text-left transition-all ${
        active ? 'border-brand-primary bg-emerald-50 ring-1 ring-emerald-100' : 'border-zinc-200 hover:border-zinc-300'
      }`}
    >
      <Icon className={`mb-2 h-5 w-5 ${active ? 'text-brand-primary' : 'text-zinc-400'}`} />
      <p className="text-[12px] font-black text-zinc-800">{label}</p>
      <p className="mt-0.5 text-[10px] font-medium text-zinc-500">{desc}</p>
    </button>
  );
}
