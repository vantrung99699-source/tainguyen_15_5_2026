import { Product } from '../types';
import { ShoppingCart, Package, Info } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
  index: number;
  key?: string | number;
}

export default function ProductCard({ product, index }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100 flex flex-col group h-full shadow-sm hover:shadow-md transition-all"
    >
      <div className="relative h-44 overflow-hidden shrink-0">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-3 py-1 bg-brand-primary text-white text-[9px] font-bold uppercase tracking-wider rounded-md shadow-sm">
            {product.category}
          </span>
        </div>
        <button className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-brand-primary rounded-lg transition-all">
          <Info className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-black uppercase text-[#1E293B] leading-snug grow line-clamp-2 text-[13px] group-hover:text-brand-primary transition-colors tracking-wide">
          {product.name}
        </h3>
        
        <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-4">
          <div className="flex flex-col">
            <span className="text-[9px] text-[#94A3B8] font-bold uppercase tracking-wider">Niêm yết</span>
            <span className="text-lg font-black text-red-600">
              {product.price.toLocaleString()}đ
            </span>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold italic bg-emerald-50 text-emerald-600">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              <span>Đã bán: {product.sold}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold italic bg-slate-50 text-slate-500 mt-1">
              <span>Kho: {product.stock}</span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <button className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-3 rounded-xl font-bold text-[12px] transition-all flex items-center justify-center gap-2 shadow-sm shadow-emerald-500/30">
            <ShoppingCart className="w-4 h-4" />
            <span>Mua ngay</span>
          </button>
          <button className="w-full bg-white border border-slate-200 hover:border-brand-primary hover:text-brand-primary text-slate-600 py-2 rounded-xl font-bold text-[11px] transition-all flex items-center justify-center gap-2 mt-2">
            <Info className="w-3.5 h-3.5" />
            <span>Chi tiết</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
