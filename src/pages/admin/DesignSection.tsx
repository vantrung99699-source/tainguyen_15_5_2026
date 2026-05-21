import { useState } from 'react';
import { motion } from 'motion/react';
import { Palette, Save, RotateCcw, ImageIcon, LayoutGrid, List, PanelLeft } from 'lucide-react';
import type { SiteDesignConfig } from '../../types/siteDesign';
import {
  DEFAULT_SITE_DESIGN,
  loadSiteDesign,
  saveSiteDesign,
  resetSiteDesign,
} from '../../services/siteDesignConfig';

const inputClass =
  'w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10';

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-bold text-zinc-500">{label}</label>
      <div className="flex gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-11 w-14 cursor-pointer rounded-lg border border-slate-200" />
        <input className={inputClass} value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}

function OptionCards<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { id: T; title: string; desc: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-zinc-500">{label}</p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`rounded-xl border p-3 text-left transition-all ${
              value === opt.id
                ? 'border-brand-primary bg-emerald-50 ring-1 ring-emerald-100'
                : 'border-zinc-200 bg-white hover:border-zinc-300'
            }`}
          >
            <p className="text-[12px] font-black text-zinc-800">{opt.title}</p>
            <p className="mt-1 text-[11px] text-zinc-500">{opt.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export function DesignSection() {
  const [form, setForm] = useState<SiteDesignConfig>(() => loadSiteDesign());
  const [saved, setSaved] = useState(false);

  const patch = (partial: Partial<SiteDesignConfig>) => {
    setForm((prev) => ({ ...prev, ...partial }));
    setSaved(false);
  };

  const handleSave = () => {
    saveSiteDesign(form);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    if (!window.confirm('Khôi phục toàn bộ thiết kế về mặc định (bản gốc hiện tại)?')) return;
    setForm(resetSiteDesign());
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 ring-1 ring-emerald-100">
          <Palette className="h-5 w-5 text-brand-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-black text-zinc-900">Thiết kế</h2>
          <p className="text-[12px] text-zinc-500">Logo, màu header, kiểu thẻ sản phẩm và bố cục danh mục</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-[12px] font-bold text-zinc-600 hover:bg-zinc-50"
          >
            <RotateCcw className="h-4 w-4" />
            Trở về mặc định
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-[12px] font-black text-white shadow-md shadow-emerald-100"
          >
            <Save className="h-4 w-4" />
            {saved ? 'Đã lưu' : 'Lưu cấu hình'}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
        <p className="text-[12px] font-bold text-emerald-800">Xem trước màu</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <div className="h-10 min-w-[120px] rounded-lg px-3 text-[11px] font-bold text-white flex items-center" style={{ backgroundColor: form.topBarBg }}>
            Header trên
          </div>
          <div className="h-10 min-w-[120px] rounded-lg border border-slate-200 px-3 text-[11px] font-bold flex items-center" style={{ backgroundColor: form.mainHeaderBg }}>
            Header chính
          </div>
          <motion.div className="h-10 min-w-[80px] rounded-lg flex items-center justify-center text-[11px] font-bold text-white" style={{ backgroundColor: form.brandPrimary }}>
            Màu chủ đạo
          </motion.div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-[13px] font-black uppercase text-zinc-800">Logo trang chủ</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {(['default', 'custom-text', 'image'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => patch({ logoMode: mode })}
              className={`rounded-xl border p-3 text-[12px] font-bold ${form.logoMode === mode ? 'border-brand-primary bg-emerald-50' : 'border-zinc-200'}`}
            >
              {mode === 'default' && 'Mặc định (TapHoaMMO)'}
              {mode === 'custom-text' && 'Chữ tùy chỉnh'}
              {mode === 'image' && 'Ảnh logo (URL)'}
            </button>
          ))}
        </div>
        {form.logoMode === 'custom-text' && (
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-[11px] font-bold text-zinc-500">Ký tự logo</label>
              <input className={inputClass} value={form.logoMark} onChange={(e) => patch({ logoMark: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-bold text-zinc-500">Tên (phần 1)</label>
              <input className={inputClass} value={form.logoTitle} onChange={(e) => patch({ logoTitle: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-bold text-zinc-500">Tên (highlight)</label>
              <input className={inputClass} value={form.logoHighlight} onChange={(e) => patch({ logoHighlight: e.target.value })} />
            </div>
          </div>
        )}
        {form.logoMode === 'image' && (
          <div>
            <label className="mb-1 flex items-center gap-2 text-[11px] font-bold text-zinc-500">
              <ImageIcon className="h-3.5 w-3.5" /> URL ảnh logo
            </label>
            <input className={inputClass} value={form.logoImageUrl} onChange={(e) => patch({ logoImageUrl: e.target.value })} placeholder="https://..." />
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-[13px] font-black uppercase text-zinc-800">Màu sắc</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <ColorField label="Màu chủ đạo (nút, link)" value={form.brandPrimary} onChange={(brandPrimary) => patch({ brandPrimary })} />
          <ColorField label="Màu phụ" value={form.brandSecondary} onChange={(brandSecondary) => patch({ brandSecondary })} />
          <ColorField label="Header trên (nền xanh)" value={form.topBarBg} onChange={(topBarBg) => patch({ topBarBg })} />
          <ColorField label="Header chính" value={form.mainHeaderBg} onChange={(mainHeaderBg) => patch({ mainHeaderBg })} />
          <ColorField label="Nền trang" value={form.pageBg} onChange={(pageBg) => patch({ pageBg })} />
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm space-y-6">
        <h3 className="text-[13px] font-black uppercase text-zinc-800">Bố cục hiển thị</h3>
        <OptionCards
          label="Kiểu thẻ sản phẩm"
          value={form.productCardStyle}
          onChange={(productCardStyle) => patch({ productCardStyle })}
          options={[
            { id: 'grid', title: 'Lưới đầy đủ', desc: 'Ảnh lớn, đủ nút (mặc định)' },
            { id: 'compact', title: 'Gọn', desc: 'Thẻ nhỏ, có ảnh' },
            { id: 'list', title: 'Danh sách', desc: 'Hàng ngang, có ảnh' },
            { id: 'no-cover', title: 'Không ảnh', desc: 'Chỉ tên, mô tả, giá — không hiện ảnh' },
          ]}
        />
        <OptionCards
          label="Lưới sản phẩm (khi xem 1 danh mục)"
          value={form.productGridLayout}
          onChange={(productGridLayout) => patch({ productGridLayout })}
          options={[
            { id: 'grid-4', title: '4 cột', desc: 'Desktop 4 cột' },
            { id: 'grid-3', title: '3 cột', desc: 'Desktop 3 cột' },
            { id: 'list', title: 'Danh sách', desc: 'Một cột, dạng list' },
          ]}
        />
        <OptionCards
          label="Danh mục trang chủ (Tất cả sản phẩm)"
          value={form.categorySectionLayout}
          onChange={(categorySectionLayout) => patch({ categorySectionLayout })}
          options={[
            { id: 'blocks', title: 'Khối tiêu đề', desc: 'Header từng danh mục + lưới (mặc định)' },
            { id: 'list', title: 'Danh sách', desc: 'Sản phẩm dạng list theo nhóm' },
          ]}
        />
        <OptionCards
          label="Bộ lọc danh mục"
          value={form.categoryFilterLayout}
          onChange={(categoryFilterLayout) => patch({ categoryFilterLayout })}
          options={[
            { id: 'grid', title: 'Lưới nút', desc: 'Nhiều cột như hiện tại' },
            { id: 'sidebar', title: 'Sidebar', desc: 'Menu dọc bên trái' },
          ]}
        />
      </div>

      <p className="text-[11px] text-zinc-400">
        Mặc định: chủ đạo {DEFAULT_SITE_DESIGN.brandPrimary}, header trên {DEFAULT_SITE_DESIGN.topBarBg}
      </p>
    </motion.div>
  );
}
