import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowLeft,
  Box,
  Code,
  Copy,
  Download,
  FileText,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import {
  createStockResourcesFromLines,
  normalizeStockResources,
  resourcesToTextLines,
  type StockResource,
} from './stockResource';

export interface StockServiceItem {
  id: number;
  name: string;
  createdAt: string;
  price: number;
  stock: number;
  sold: number;
  enabled: boolean;
  resources: StockResource[];
}

interface ItemStockPageProps {
  shopTitle: string;
  item: StockServiceItem;
  onBack: () => void;
  /** Lưu kho ngay (không đóng trang) */
  onPersist: (resources: StockResource[]) => void;
}

type AddResourceMode = 'single' | 'bulk' | 'txt' | 'api';

const ADD_RESOURCE_TABS: { id: AddResourceMode; label: string; icon: LucideIcon }[] = [
  { id: 'single', label: 'Nhập từng tài khoản', icon: Plus },
  { id: 'bulk', label: 'Nhập nhiều tài khoản', icon: FileText },
  { id: 'txt', label: 'Nhập bằng tệp .txt', icon: Upload },
  { id: 'api', label: 'Nhập bằng API', icon: Code },
];

function parseResourceLines(text: string) {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

function AddSingleResourceModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (line: string) => void;
}) {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const line = content.trim();
    if (!line) {
      setError('Vui lòng nhập nội dung tài nguyên');
      return;
    }
    onAdd(line);
    onClose();
  };

  const modal = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
          <h3 className="text-base font-black text-zinc-900">Thêm tài khoản</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-zinc-800">
              Nội dung tài nguyên <span className="text-red-500">*</span>
            </label>
            <input
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setError('');
              }}
              placeholder="VD: user|pass hoặc key-license-xxx"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm font-medium text-zinc-800 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
              autoFocus
            />
            <p className="mt-1.5 text-[12px] text-zinc-500">Một dòng = một tài khoản / key trong kho.</p>
            {error && <p className="mt-1 text-[12px] font-medium text-red-600">{error}</p>}
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-sm font-bold text-zinc-600 hover:bg-zinc-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-[2] rounded-xl bg-brand-primary py-2.5 text-sm font-black text-white shadow-md shadow-emerald-200/50 hover:bg-emerald-600"
            >
              Thêm
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );

  return createPortal(modal, document.body);
}

export default function ItemStockPage({ shopTitle, item, onBack, onPersist }: ItemStockPageProps) {
  const [resources, setResources] = useState<StockResource[]>(() =>
    normalizeStockResources(item.resources)
  );

  const updateResources = (updater: (prev: StockResource[]) => StockResource[]) => {
    setResources((prev) => {
      const next = updater(prev);
      onPersist(next);
      return next;
    });
  };
  const [addMode, setAddMode] = useState<AddResourceMode>('single');
  const [showSingleModal, setShowSingleModal] = useState(false);
  const [bulkDraft, setBulkDraft] = useState('');
  const [txtFileName, setTxtFileName] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [addMessage, setAddMessage] = useState('');
  const [selectedIndexes, setSelectedIndexes] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allSelected = resources.length > 0 && selectedIndexes.size === resources.length;
  const someSelected = selectedIndexes.size > 0;

  const getExportResources = () => {
    if (someSelected) return resources.filter((_, i) => selectedIndexes.has(i));
    return resources;
  };

  const copyResources = async () => {
    const list = getExportResources();
    if (list.length === 0) {
      setAddMessage('Không có tài nguyên để copy.');
      return;
    }
    try {
      await navigator.clipboard.writeText(resourcesToTextLines(list));
      setAddMessage(
        someSelected
          ? `Đã copy ${list.length} tài khoản đã chọn.`
          : `Đã copy ${list.length} tài khoản.`
      );
    } catch {
      setAddMessage('Không copy được. Vui lòng thử lại.');
    }
  };

  const exportTxt = () => {
    const list = getExportResources();
    if (list.length === 0) {
      setAddMessage('Không có tài nguyên để xuất file.');
      return;
    }
    const text = resourcesToTextLines(list);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kho-mat-hang-${item.id}-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setAddMessage(
      someSelected
        ? `Đã xuất ${list.length} tài khoản đã chọn ra file .txt.`
        : `Đã xuất ${list.length} tài khoản ra file .txt.`
    );
  };

  const appendResources = (lines: string[]) => {
    const valid = createStockResourcesFromLines(parseResourceLines(lines.join('\n')));
    if (valid.length === 0) {
      setAddMessage('Không có dữ liệu hợp lệ để thêm.');
      return;
    }
    updateResources((prev) => [...prev, ...valid]);
    setAddMessage(`Đã thêm ${valid.length} tài nguyên và lưu kho.`);
    setBulkDraft('');
    setTxtFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addSingleResource = (line: string) => {
    appendResources([line]);
  };

  const addFromBulk = () => {
    appendResources(parseResourceLines(bulkDraft));
  };

  const handleTxtFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.txt')) {
      setAddMessage('Chỉ hỗ trợ file .txt');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      setTxtFileName(file.name);
      appendResources(parseResourceLines(text));
    };
    reader.readAsText(file, 'utf-8');
  };

  const fetchFromApi = () => {
    if (!apiUrl.trim()) {
      setAddMessage('Vui lòng nhập URL API.');
      return;
    }
    setAddMessage('Đang kết nối API… (demo: thêm 1 dòng mẫu)');
    const demoLine = `api-import|${Date.now()}`;
    setTimeout(() => {
      appendResources([demoLine]);
    }, 400);
  };

  const clearSelection = () => setSelectedIndexes(new Set());

  const toggleSelect = (index: number) => {
    setSelectedIndexes((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      clearSelection();
      return;
    }
    setSelectedIndexes(new Set(resources.map((_, i) => i)));
  };

  const removeResource = (index: number) => {
    if (!confirm('Xóa tài khoản này khỏi kho?')) return;
    updateResources((prev) => prev.filter((_, i) => i !== index));
    setAddMessage('Đã xóa và lưu kho.');
    clearSelection();
  };

  const deleteSelected = () => {
    if (!someSelected) return;
    if (!confirm(`Xóa ${selectedIndexes.size} tài khoản đã chọn?`)) return;
    updateResources((prev) => prev.filter((_, i) => !selectedIndexes.has(i)));
    setAddMessage(`Đã xóa ${selectedIndexes.size} tài khoản và lưu kho.`);
    clearSelection();
  };

  const deleteAllResources = () => {
    if (resources.length === 0) return;
    if (!confirm('Xóa toàn bộ tài khoản trong kho?')) return;
    updateResources(() => []);
    setAddMessage('Đã xóa toàn bộ kho và lưu.');
    clearSelection();
  };

  const handleBack = () => {
    onBack();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <button
        type="button"
        onClick={handleBack}
        className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-bold text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại danh sách
      </button>

      <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)] ring-1 ring-zinc-100/80">
        <div className="border-b border-emerald-100/80 bg-gradient-to-r from-emerald-50 via-white to-teal-50/80 px-6 py-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">Kho tài nguyên</p>
          <p className="mt-1 truncate text-[12px] font-medium text-zinc-500">{shopTitle}</p>
          <h2 className="mt-2 text-lg font-black leading-snug text-zinc-900">{item.name}</h2>
          <div className="mt-3 flex flex-wrap gap-3 text-[12px] font-semibold text-zinc-600">
            <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-emerald-700">
              Tồn kho: {resources.length}
            </span>
            <span className="rounded-lg bg-zinc-100 px-2.5 py-1">ID mặt hàng: {item.id}</span>
            <span className="rounded-lg bg-zinc-100 px-2.5 py-1">{item.createdAt}</span>
          </div>
        </div>

        <div className="space-y-6 p-6">
          <section className="rounded-xl border border-zinc-200 bg-zinc-50/40 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-black text-zinc-800">
              <Plus className="h-4 w-4 text-brand-primary" />
              Thêm tài nguyên
            </h3>

            <div className="mb-4 flex flex-wrap gap-1 rounded-xl border border-zinc-200/80 bg-zinc-100/80 p-1">
              {ADD_RESOURCE_TABS.map((tab) => {
                const Icon = tab.icon;
                const active = addMode === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setAddMode(tab.id);
                      setAddMessage('');
                    }}
                    className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[11px] font-bold transition-all sm:text-[12px] ${
                      active
                        ? 'bg-white text-brand-primary shadow-sm ring-1 ring-brand-primary/20'
                        : 'text-zinc-500 hover:text-zinc-700'
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 shrink-0 ${active ? 'text-brand-primary' : ''}`} />
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {addMode === 'single' && (
              <div className="rounded-xl border border-dashed border-zinc-200 bg-white px-4 py-8 text-center">
                <p className="text-[13px] font-medium text-zinc-600">
                  Thêm từng tài khoản / key qua form popup.
                </p>
                <button
                  type="button"
                  onClick={() => setShowSingleModal(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-200/50 transition-colors hover:bg-emerald-600"
                >
                  <Plus className="h-4 w-4" />
                  Thêm
                </button>
              </div>
            )}

            {addMode === 'bulk' && (
              <div>
                <p className="mb-3 text-[12px] text-zinc-500">Mỗi dòng một tài khoản, key hoặc nội dung bán.</p>
                <textarea
                  value={bulkDraft}
                  onChange={(e) => setBulkDraft(e.target.value)}
                  placeholder={'user1|pass1\nuser2|pass2\n...'}
                  rows={8}
                  className="w-full resize-y rounded-xl border border-zinc-200 bg-white px-4 py-3 font-mono text-[13px] outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
                />
                <button
                  type="button"
                  onClick={addFromBulk}
                  disabled={!bulkDraft.trim()}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  Thêm vào kho
                </button>
              </div>
            )}

            {addMode === 'txt' && (
              <div>
                <p className="mb-3 text-[12px] text-zinc-500">
                  Tải file .txt — mỗi dòng là một tài nguyên trong kho.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,text/plain"
                  className="hidden"
                  onChange={handleTxtFile}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-zinc-200 bg-white px-4 py-10 transition-colors hover:border-brand-primary/40 hover:bg-emerald-50/30"
                >
                  <Upload className="h-8 w-8 text-brand-primary" />
                  <span className="text-sm font-bold text-zinc-700">Chọn file .txt</span>
                  {txtFileName && (
                    <span className="text-[12px] font-medium text-emerald-700">{txtFileName}</span>
                  )}
                </button>
              </div>
            )}

            {addMode === 'api' && (
              <div className="space-y-3">
                <p className="text-[12px] text-zinc-500">
                  Lấy danh sách tài nguyên từ API đối tác (mỗi phần tử response = 1 dòng).
                </p>
                <div>
                  <label className="mb-1 block text-[12px] font-semibold text-zinc-700">URL API</label>
                  <input
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    placeholder="https://api.example.com/stock"
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[12px] font-semibold text-zinc-700">Token / Key</label>
                  <input
                    value={apiToken}
                    onChange={(e) => setApiToken(e.target.value)}
                    placeholder="Bearer token..."
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
                  />
                </div>
                <button
                  type="button"
                  onClick={fetchFromApi}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-600"
                >
                  <Code className="h-4 w-4" />
                  Lấy dữ liệu từ API
                </button>
              </div>
            )}

            {addMessage && (
              <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-[12px] font-medium text-emerald-800">
                {addMessage}
              </p>
            )}
          </section>

          <section className="rounded-xl border border-zinc-200 p-4">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="flex items-center gap-2 text-sm font-black text-zinc-800">
                <Box className="h-4 w-4 text-brand-primary" />
                Danh sách trong kho ({resources.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResources}
                  disabled={resources.length === 0}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-[12px] font-bold text-zinc-700 transition-colors hover:border-brand-primary/30 hover:bg-emerald-50 hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </button>
                <button
                  type="button"
                  onClick={exportTxt}
                  disabled={resources.length === 0}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-[12px] font-bold text-zinc-700 transition-colors hover:border-brand-primary/30 hover:bg-emerald-50 hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Download className="h-3.5 w-3.5" />
                  Xuất .txt
                </button>
                <button
                  type="button"
                  onClick={deleteSelected}
                  disabled={!someSelected}
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-[12px] font-bold text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Xóa tài khoản đã chọn
                  {someSelected ? ` (${selectedIndexes.size})` : ''}
                </button>
                <button
                  type="button"
                  onClick={deleteAllResources}
                  disabled={resources.length === 0}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-[12px] font-bold text-zinc-700 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Xóa toàn bộ
                </button>
              </div>
            </div>

            {resources.length === 0 ? (
              <p className="rounded-xl border border-dashed border-zinc-200 py-12 text-center text-sm text-zinc-400">
                Chưa có tài nguyên. Thêm ở phần trên.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-zinc-200">
                <table className="w-full min-w-[680px] border-collapse text-left text-[13px]">
                  <thead>
                    <tr className="bg-zinc-50/90">
                      <th className="w-12 border border-zinc-200 px-3 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={toggleSelectAll}
                          className="h-4 w-4 rounded border-zinc-300 text-brand-primary focus:ring-brand-primary/30"
                          aria-label="Chọn tất cả"
                        />
                      </th>
                      <th className="w-16 border border-zinc-200 px-3 py-3 text-center text-[11px] font-black uppercase tracking-wide text-zinc-600">
                        STT
                      </th>
                      <th className="border border-zinc-200 px-3 py-3 text-[11px] font-black uppercase tracking-wide text-zinc-600">
                        Tài khoản / tài nguyên
                      </th>
                      <th className="w-40 border border-zinc-200 px-3 py-3 text-center text-[11px] font-black uppercase tracking-wide text-zinc-600">
                        Thời gian thêm
                      </th>
                      <th className="w-28 border border-zinc-200 px-3 py-3 text-center text-[11px] font-black uppercase tracking-wide text-zinc-600">
                        Xóa từng
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {resources.map((entry, index) => (
                      <tr
                        key={`${index}-${entry.content.slice(0, 16)}`}
                        className={`transition-colors ${
                          selectedIndexes.has(index) ? 'bg-emerald-50/60' : 'bg-white hover:bg-zinc-50/80'
                        }`}
                      >
                        <td className="border border-zinc-200 px-3 py-2.5 text-center">
                          <input
                            type="checkbox"
                            checked={selectedIndexes.has(index)}
                            onChange={() => toggleSelect(index)}
                            className="h-4 w-4 rounded border-zinc-300 text-brand-primary focus:ring-brand-primary/30"
                            aria-label={`Chọn dòng ${index + 1}`}
                          />
                        </td>
                        <td className="border border-zinc-200 px-3 py-2.5 text-center text-[12px] font-bold text-zinc-500">
                          {index + 1}
                        </td>
                        <td className="max-w-0 border border-zinc-200 px-3 py-2.5">
                          <span
                            className="block truncate font-mono text-[12px] text-zinc-800"
                            title={entry.content}
                          >
                            {entry.content}
                          </span>
                        </td>
                        <td className="whitespace-nowrap border border-zinc-200 px-3 py-2.5 text-center text-[11px] font-medium text-zinc-600">
                          {entry.addedAt}
                        </td>
                        <td className="border border-zinc-200 px-3 py-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => removeResource(index)}
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-red-600 transition-colors hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>

      <AnimatePresence>
        {showSingleModal && (
          <AddSingleResourceModal
            onClose={() => setShowSingleModal(false)}
            onAdd={addSingleResource}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}