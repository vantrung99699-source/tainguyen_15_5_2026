import { CATEGORIES } from '../constants';
import * as LucideIcons from 'lucide-react';
import { motion } from 'motion/react';
import type { CategoryFilterLayout } from '../types/siteDesign';
import { PanelLeft, LayoutGrid } from 'lucide-react';
import { useLocaleCurrency } from '../context/LocaleCurrencyContext';

interface CategoryFilterProps {
  activeCategory: string;
  setActiveCategory: (id: string) => void;
  layout?: CategoryFilterLayout;
}

export default function CategoryFilter({
  activeCategory,
  setActiveCategory,
  layout = 'grid',
}: CategoryFilterProps) {
  const { t } = useLocaleCurrency();
  const catLabel = (id: string, fallback: string) =>
    t(id === 'all' ? 'cat_all' : `cat_${id}`, fallback);

  if (layout === 'sidebar') {
    return (
      <aside className="w-full shrink-0 lg:w-[220px]">
        <p className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
          <PanelLeft className="h-3.5 w-3.5" />
          Danh mục
        </p>
        <nav className="flex flex-col gap-1">
          {CATEGORIES.map((cat, index) => {
            const Icon = (LucideIcons as Record<string, typeof LucideIcons.LayoutGrid>)[cat.icon] || LucideIcons.LayoutGrid;
            const isActive = activeCategory === cat.id;
            return (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[11px] font-black uppercase tracking-tight transition-all ${
                  isActive
                    ? 'bg-brand-primary text-white shadow-md shadow-emerald-100'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-brand-primary'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" style={{ color: isActive ? 'white' : cat.color }} />
                <span className="truncate">{catLabel(cat.id, cat.name)}</span>
              </motion.button>
            );
          })}
        </nav>
      </aside>
    );
  }

  return (
    <div className="w-full">
      <p className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
        <LayoutGrid className="h-3.5 w-3.5" />
        Danh mục
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {CATEGORIES.map((cat, index) => {
          const Icon = (LucideIcons as Record<string, typeof LucideIcons.LayoutGrid>)[cat.icon] || LucideIcons.LayoutGrid;
          const isActive = activeCategory === cat.id;

          return (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.01 }}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`flex cursor-pointer select-none items-center gap-2.5 rounded-xl border px-4 py-3 text-[11px] font-black tracking-tight transition-all hover:shadow-md ${
                isActive
                  ? 'border-brand-primary bg-brand-primary text-white shadow-lg shadow-emerald-100'
                  : 'border-slate-100 bg-white text-slate-500 hover:border-brand-primary/30 hover:text-brand-primary'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0 transition-colors" style={{ color: isActive ? 'white' : cat.color }} />
              <span className="truncate uppercase">{catLabel(cat.id, cat.name)}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
