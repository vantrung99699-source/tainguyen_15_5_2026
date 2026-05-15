import { CATEGORIES } from '../constants';
import * as LucideIcons from 'lucide-react';
import { motion } from 'motion/react';

interface CategoryFilterProps {
  activeCategory: string;
  setActiveCategory: (id: string) => void;
}

export default function CategoryFilter({ activeCategory, setActiveCategory }: CategoryFilterProps) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {CATEGORIES.map((cat, index) => {
          const Icon = (LucideIcons as any)[cat.icon] || LucideIcons.LayoutGrid;
          const isActive = activeCategory === cat.id;

          return (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.01 }}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all text-[11px] font-black tracking-tight border select-none cursor-pointer group hover:shadow-md ${
                isActive 
                  ? 'bg-brand-primary border-brand-primary text-white shadow-lg shadow-emerald-100' 
                  : 'bg-white border-slate-100 text-slate-500 hover:border-brand-primary/30 hover:text-brand-primary'
              }`}
            >
              <Icon 
                className={`w-5 h-5 shrink-0 transition-colors`} 
                style={{ color: isActive ? 'white' : cat.color }}
              />
              <span className="truncate uppercase">{cat.name}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
