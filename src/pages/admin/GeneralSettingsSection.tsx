import { useState } from 'react';
import { motion } from 'motion/react';
import { Settings, Plus, Trash2, Save, Eye, Phone, Link2, AlignLeft } from 'lucide-react';
import type { SiteHeaderConfig } from '../../types/siteHeader';
import {
  loadSiteHeaderConfig,
  saveSiteHeaderConfig,
  createEmptyNavLink,
} from '../../services/siteHeaderConfig';

const inputClass =
  'w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-800 outline-none transition-all focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10';

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

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      layout
      className="rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm"
    >
      <h3 className="text-[13px] font-black uppercase tracking-wide text-zinc-800">{title}</h3>
      <motion.div layout className="mt-4 space-y-4">
        {children}
      </motion.div>
    </motion.div>
  );
}

function HeaderPreview({
  form,
  enabledLinks,
}: {
  form: SiteHeaderConfig;
  enabledLinks: { id: string; label: string }[];
}) {
  return (
    <motion.div layout className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
      <p className="flex items-center gap-2 text-[12px] font-bold text-emerald-800">
        <Eye className="h-4 w-4" />
        Xem trước thanh header
      </p>
      <div className="mt-3 rounded-xl bg-[#2a5b46] px-4 py-2 text-[11px] font-bold text-white/90">
        <div className="flex flex-wrap items-center gap-3">
          <span>{form.contactDisplay || '—'}</span>
          {enabledLinks.length > 0 && (
            <>
              <span className="text-white/30">|</span>
              {enabledLinks.map((l) => (
                <span key={l.id} className="flex items-center gap-1 text-white/70">
                  <Link2 className="h-3 w-3" />
                  {l.label}
                </span>
              ))}
            </>
          )}
          {form.showTopBarCustomText && form.topBarCustomText.trim() && (
            <span className="ml-auto text-white/60">{form.topBarCustomText.trim()}</span>
          )}
        </div>
      </div>
      {form.marqueeEnabled && form.marqueeLines.length > 0 && (
        <p className="mt-2 truncate text-[11px] text-zinc-500">
          Marquee: {form.marqueeLines[0]}
          {form.marqueeLines.length > 1 ? ` (+${form.marqueeLines.length - 1} dòng)` : ''}
        </p>
      )}
    </motion.div>
  );
}

export function HeaderSettingsSection() {
  const [form, setForm] = useState<SiteHeaderConfig>(() => loadSiteHeaderConfig());
  const [saved, setSaved] = useState(false);

  const patch = (partial: Partial<SiteHeaderConfig>) => {
    setForm((prev) => ({ ...prev, ...partial }));
    setSaved(false);
  };

  const handleSave = () => {
    saveSiteHeaderConfig(form);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  const enabledLinks = form.navLinks.filter((l) => l.enabled && l.label.trim());

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <motion.div layout className="flex min-w-0 items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 ring-1 ring-emerald-100">
          <Settings className="h-5 w-5 text-brand-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-black tracking-tight text-zinc-900">Cài header</h2>
          <p className="mt-0.5 text-[12px] font-medium text-zinc-500">
            Thanh header trên, liên hệ, liên kết và dòng chạy trang chủ
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-[12px] font-black text-white shadow-md shadow-emerald-100 transition-colors hover:bg-brand-secondary"
        >
          <Save className="h-4 w-4" />
          {saved ? 'Đã lưu' : 'Lưu cấu hình'}
        </button>
      </motion.div>

      <HeaderPreview form={form} enabledLinks={enabledLinks} />

      <Card title="Thanh header trên (nền xanh)">
        <Toggle
          label="Hiển thị thanh header trên"
          checked={form.topBarEnabled}
          onChange={(topBarEnabled) => patch({ topBarEnabled })}
        />

        <motion.div layout className="space-y-3 border-t border-zinc-100 pt-4">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-zinc-500">
            <Phone className="h-3.5 w-3.5" />
            Liên hệ hiển thị
          </p>
          <motion.div layout>
            <label className="mb-1.5 block text-[11px] font-bold text-zinc-500">Nội dung hiển thị (ví dụ: Kỹ thuật: 1900 xxxx 24/7)</label>
            <input
              className={inputClass}
              value={form.contactDisplay}
              onChange={(e) => patch({ contactDisplay: e.target.value })}
              placeholder="Kỹ thuật: 1900 xxxx (24/7)"
            />
          </motion.div>
          <div className="grid gap-3 sm:grid-cols-2">
            <motion.div layout>
              <label className="mb-1.5 block text-[11px] font-bold text-zinc-500">Số điện thoại</label>
              <input
                className={inputClass}
                value={form.contactPhone}
                onChange={(e) => patch({ contactPhone: e.target.value })}
                placeholder="1900123456"
              />
            </motion.div>
            <motion.div layout>
              <label className="mb-1.5 block text-[11px] font-bold text-zinc-500">Email</label>
              <input
                type="email"
                className={inputClass}
                value={form.contactEmail}
                onChange={(e) => patch({ contactEmail: e.target.value })}
                placeholder="hotro@shop.vn"
              />
            </motion.div>
          </div>
          <motion.div layout>
            <label className="mb-1.5 block text-[11px] font-bold text-zinc-500">Khi bấm vào dòng liên hệ</label>
            <select
              className={inputClass}
              value={form.contactLinkType}
              onChange={(e) =>
                patch({ contactLinkType: e.target.value as SiteHeaderConfig['contactLinkType'] })
              }
            >
              <option value="phone">Gọi SĐT (tel:)</option>
              <option value="email">Gửi email (mailto:)</option>
              <option value="none">Không liên kết</option>
            </select>
          </motion.div>
        </motion.div>

        <motion.div layout className="space-y-3 border-t border-zinc-100 pt-4">
          <Toggle
            label="Hiển thị nội dung tùy chỉnh trên thanh header"
            checked={form.showTopBarCustomText}
            onChange={(showTopBarCustomText) => patch({ showTopBarCustomText })}
          />
          {form.showTopBarCustomText && (
            <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <label className="mb-1.5 flex items-center gap-2 text-[11px] font-bold text-zinc-500">
                <AlignLeft className="h-3.5 w-3.5" />
                Nội dung bất kỳ (hiển thị bên phải thanh header)
              </label>
              <textarea
                className={`${inputClass} min-h-[72px] resize-y`}
                value={form.topBarCustomText}
                onChange={(e) => patch({ topBarCustomText: e.target.value })}
                placeholder="VD: Khuyến mãi 20% — Nạp tiền nhận thưởng ngay hôm nay!"
              />
            </motion.div>
          )}
        </motion.div>
      </Card>

      <Card title="Liên kết & bài viết (menu thanh header)">
        <p className="text-[12px] text-zinc-500">
          Các mục như Về chúng tôi, Tin tức, API Docs. URL có thể là trang nội bộ hoặc link ngoài.
        </p>
        <div className="space-y-3">
          {form.navLinks.map((link, index) => (
            <motion.div
              layout
              key={link.id}
              className="flex flex-col gap-2 rounded-xl border border-zinc-100 bg-zinc-50/50 p-3 sm:flex-row sm:items-center"
            >
              <label className="flex shrink-0 items-center gap-2">
                <input
                  type="checkbox"
                  checked={link.enabled}
                  onChange={(e) => {
                    const navLinks = [...form.navLinks];
                    navLinks[index] = { ...link, enabled: e.target.checked };
                    patch({ navLinks });
                  }}
                  className="h-4 w-4 rounded border-zinc-300 text-brand-primary"
                />
                <span className="text-[11px] font-bold text-zinc-500">Hiện</span>
              </label>
              <input
                className={`${inputClass} flex-1 py-2.5`}
                value={link.label}
                onChange={(e) => {
                  const navLinks = [...form.navLinks];
                  navLinks[index] = { ...link, label: e.target.value };
                  patch({ navLinks });
                }}
                placeholder="Tên hiển thị"
              />
              <input
                className={`${inputClass} flex-[2] py-2.5`}
                value={link.url}
                onChange={(e) => {
                  const navLinks = [...form.navLinks];
                  navLinks[index] = { ...link, url: e.target.value };
                  patch({ navLinks });
                }}
                placeholder="https:// hoặc #"
              />
              <button
                type="button"
                onClick={() => patch({ navLinks: form.navLinks.filter((l) => l.id !== link.id) })}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-100 text-red-500 hover:bg-red-50"
                aria-label="Xóa liên kết"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => patch({ navLinks: [...form.navLinks, createEmptyNavLink()] })}
          className="flex items-center gap-2 rounded-xl border border-dashed border-zinc-300 px-4 py-2.5 text-[12px] font-bold text-zinc-600 hover:border-brand-primary hover:text-brand-primary"
        >
          <Plus className="h-4 w-4" />
          Thêm liên kết
        </button>
      </Card>

      <Card title="Dòng chạy dưới menu (marquee)">
        <Toggle
          label="Bật dòng chạy thông báo"
          checked={form.marqueeEnabled}
          onChange={(marqueeEnabled) => patch({ marqueeEnabled })}
        />
        <motion.div layout>
          <label className="mb-1.5 block text-[11px] font-bold text-zinc-500">
            Mỗi dòng một nội dung (xuống dòng = dòng mới)
          </label>
          <textarea
            className={`${inputClass} min-h-[120px] resize-y font-medium`}
            value={form.marqueeLines.join('\n')}
            onChange={(e) =>
              patch({
                marqueeLines: e.target.value
                  .split('\n')
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            placeholder="Dòng thông báo 1&#10;Dòng thông báo 2"
          />
        </motion.div>
      </Card>
    </motion.div>
  );
}

export const GeneralSettingsSection = HeaderSettingsSection;
