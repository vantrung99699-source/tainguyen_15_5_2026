import { useState } from 'react';
import { motion } from 'motion/react';
import { Megaphone, Save, AlertCircle, ShieldCheck } from 'lucide-react';
import type { HomeAnnouncementBlock, HomeAnnouncementsConfig } from '../../types/homeAnnouncements';
import {
  loadHomeAnnouncements,
  saveHomeAnnouncements,
} from '../../services/homeAnnouncementsConfig';
import { RichTextEditor } from '../../components/admin/RichTextEditor';

const inputClass =
  'w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm font-medium text-zinc-800 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10';

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-zinc-100 bg-zinc-50/80 px-4 py-3">
      <span className="text-[12px] font-bold text-zinc-700">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-brand-primary' : 'bg-zinc-300'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : ''}`}
        />
      </button>
    </label>
  );
}

function BlockEditor({
  title,
  icon: Icon,
  blockKey,
  block,
  onChange,
}: {
  title: string;
  icon: typeof AlertCircle;
  blockKey: 'disclaimer' | 'policy';
  block: HomeAnnouncementBlock;
  onChange: (key: 'disclaimer' | 'policy', patch: Partial<HomeAnnouncementBlock>) => void;
}) {
  const showPolicyExtras = blockKey === 'policy';

  return (
    <div className="rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
          <Icon className="h-5 w-5 text-brand-primary" />
        </div>
        <h3 className="text-sm font-black text-zinc-900">{title}</h3>
      </div>
      <div className="space-y-4">
        <Toggle
          label="Hiển thị trên trang chủ"
          checked={block.enabled}
          onChange={(enabled) => onChange(blockKey, { enabled })}
        />
        <label className="block">
          <span className="text-[11px] font-bold uppercase text-zinc-400">Tiêu đề</span>
          <input
            value={block.title}
            onChange={(e) => onChange(blockKey, { title: e.target.value })}
            className={`${inputClass} mt-1 font-bold uppercase`}
          />
        </label>
        <RichTextEditor
          label="Nội dung"
          value={block.content}
          onChange={(content) => onChange(blockKey, { content })}
          placeholder="Nội dung thông báo…"
          minHeight="120px"
        />
        <label className="block">
          <span className="text-[11px] font-bold uppercase text-zinc-400">
            Dòng nhấn mạnh (tùy chọn, màu cam)
          </span>
          <input
            value={block.highlightText}
            onChange={(e) => onChange(blockKey, { highlightText: e.target.value })}
            className={`${inputClass} mt-1`}
            placeholder="VD: xin chào"
          />
        </label>
        {showPolicyExtras ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-[11px] font-bold uppercase text-zinc-400">Nhãn liên kết</span>
                <input
                  value={block.linkLabel}
                  onChange={(e) => onChange(blockKey, { linkLabel: e.target.value })}
                  className={`${inputClass} mt-1`}
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-bold uppercase text-zinc-400">URL liên kết</span>
                <input
                  value={block.linkUrl}
                  onChange={(e) => onChange(blockKey, { linkUrl: e.target.value })}
                  className={`${inputClass} mt-1`}
                  placeholder="https://..."
                />
              </label>
            </div>
            <Toggle
              label="Nút Hỗ trợ Zalo"
              checked={block.showZaloButton}
              onChange={(showZaloButton) => onChange(blockKey, { showZaloButton })}
            />
            {block.showZaloButton ? (
              <input
                value={block.zaloUrl}
                onChange={(e) => onChange(blockKey, { zaloUrl: e.target.value })}
                placeholder="Link Zalo"
                className={inputClass}
              />
            ) : null}
            <Toggle
              label="Nút Cộng đồng Telegram"
              checked={block.showTelegramButton}
              onChange={(showTelegramButton) => onChange(blockKey, { showTelegramButton })}
            />
            {block.showTelegramButton ? (
              <input
                value={block.telegramUrl}
                onChange={(e) => onChange(blockKey, { telegramUrl: e.target.value })}
                placeholder="Link Telegram"
                className={inputClass}
              />
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}

export function HomeAnnouncementsSection() {
  const [form, setForm] = useState<HomeAnnouncementsConfig>(() => loadHomeAnnouncements());
  const [saved, setSaved] = useState(false);

  const patchBlock = (
    key: 'disclaimer' | 'policy',
    patch: Partial<HomeAnnouncementBlock>,
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...patch },
    }));
    setSaved(false);
  };

  const handleSave = () => {
    saveHomeAnnouncements(form);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 ring-1 ring-emerald-100">
          <Megaphone className="h-5 w-5 text-brand-primary" />
        </div>
        <div>
          <h2 className="text-base font-black text-zinc-900">Thông báo trang chủ</h2>
          <p className="text-[12px] text-zinc-500">
            Hai khối hiển thị phía trên danh sách sản phẩm (miễn trừ trách nhiệm & chính sách bảo hành)
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <BlockEditor
          title="Khối 1 — Tuyên bố miễn trừ"
          icon={AlertCircle}
          blockKey="disclaimer"
          block={form.disclaimer}
          onChange={patchBlock}
        />
        <BlockEditor
          title="Khối 2 — Chính sách bảo hành"
          icon={ShieldCheck}
          blockKey="policy"
          block={form.policy}
          onChange={patchBlock}
        />
      </div>

      <button
        type="button"
        onClick={handleSave}
        className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-6 py-3 text-sm font-bold text-white hover:bg-emerald-600"
      >
        <Save className="h-4 w-4" />
        {saved ? 'Đã lưu!' : 'Lưu thông báo trang chủ'}
      </button>
    </motion.div>
  );
}
