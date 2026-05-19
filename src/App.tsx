import { useState, useMemo } from 'react';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import CategoryFilter from './components/CategoryFilter';
import ProductCard from './components/ProductCard';
import OrderHistory from './pages/OrderHistory';
import DepositPage from './pages/DepositPage';
import AdminPage, { type AppPage } from './pages/admin/AdminPage';
import { PRODUCTS, CATEGORIES } from './constants';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, Sparkles } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

export default function App() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [visibleCount, setVisibleCount] = useState(12);
  const [currentPage, setCurrentPage] = useState<AppPage>('home');

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') return PRODUCTS;
    return PRODUCTS.filter(p => p.category === activeCategory);
  }, [activeCategory]);

  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const loadMore = () => {
    setVisibleCount(prev => prev + 12);
  };

  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId);
    setVisibleCount(12); // Reset count when changing category
  };

  const activeCategoryObj = useMemo(() => {
    return CATEGORIES.find(c => c.id === activeCategory);
  }, [activeCategory]);

  const activeCategoryName = useMemo(() => {
    return activeCategoryObj?.name || 'Tất cả sản phẩm';
  }, [activeCategoryObj]);

  const ActiveIcon = activeCategoryObj ? (LucideIcons as any)[activeCategoryObj.icon] || Sparkles : Sparkles;

  const GroupedProducts = useMemo(() => {
    if (activeCategory !== 'all') return null;
    
    return CATEGORIES.filter(cat => cat.id !== 'all').map(category => {
      const categoryProducts = PRODUCTS.filter(p => p.category === category.id);
      if (categoryProducts.length === 0) return null;

      const IconComp = (LucideIcons as any)[category.icon] || Sparkles;

      return (
        <div key={category.id} className="mb-20">
          <div 
            className="flex w-full items-center gap-4 px-6 py-4 rounded-xl shadow-xl shadow-slate-200/40 border border-slate-100 border-l-[6px] border-l-brand-primary mb-6 relative z-10 overflow-hidden group bg-white cursor-pointer hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300"
            onClick={() => handleCategoryChange(category.id)}
          >
            <div 
              className="p-3 rounded-xl bg-emerald-50 transition-transform duration-500 group-hover:scale-110"
            >
              <IconComp 
                className="w-5 h-5 text-brand-primary" 
              />
            </div>
            <div className="flex flex-col">
              <h3 className="text-xl font-black text-brand-primary tracking-tighter uppercase italic leading-none">
                Danh mục <span className="text-brand-primary">{category.name}</span>
              </h3>
              <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Nhấp để xem tất cả</span>
            </div>
            
            {/* Subtle pattern for the 'block' feel */}
            <div className="absolute right-0 top-0 bottom-0 w-48 bg-gradient-to-l from-emerald-50 to-transparent pointer-events-none" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {categoryProducts.slice(0, 4).map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      );
    });
  }, [activeCategory]);

  if (currentPage === 'admin') {
    return <AdminPage onNavigateHome={() => setCurrentPage('home')} />;
  }

  return (
    <div className="min-h-screen bg-[#fcfcfd]">
      <Navbar onNavigate={setCurrentPage} />
      
      <main className="pb-32">
        {currentPage === 'order-history' ? (
          <OrderHistory />
        ) : currentPage === 'deposit' ? (
          <DepositPage />
        ) : (
          <>
            <HeroBanner />
        
        <div className="max-w-7xl mx-auto px-6 mt-16 mb-12">
          <CategoryFilter 
            activeCategory={activeCategory} 
            setActiveCategory={handleCategoryChange} 
          />
        </div>

<section className="max-w-7xl mx-auto px-6 mt-20">

          {activeCategory === 'all' ? (
            <div className="space-y-6">
              {GroupedProducts}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                <AnimatePresence mode="popLayout">
                  {displayedProducts.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index % 12} />
                  ))}
                </AnimatePresence>
              </div>
              
              {visibleCount < filteredProducts.length && (
                <div className="mt-20 flex justify-center">
                  <button 
                    onClick={loadMore}
                    className="group relative px-10 py-4 bg-white border-2 border-slate-100 hover:border-brand-primary/30 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1"
                  >
                    <span className="relative z-10 flex items-center gap-3 text-slate-800 font-extrabold text-[14px]">
                      <span>Xem thêm sản phẩm</span>
                      <div className="w-6 h-6 bg-slate-50 group-hover:bg-brand-primary/10 rounded-lg flex items-center justify-center transition-colors">
                        <TrendingUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-primary transition-colors" />
                      </div>
                    </span>
                    <div className="absolute inset-x-0 bottom-0 h-1.5 bg-brand-primary/5 rounded-full scale-x-0 group-hover:scale-x-90 transition-transform origin-center"></div>
                  </button>
                </div>
              )}
            </>
          )}

          {filteredProducts.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-300"
            >
              <div className="bg-gray-50 p-6 rounded-full mb-4">
                <Sparkles className="w-12 h-12 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-500">Chưa có sản phẩm nào trong danh mục này</h3>
              <button 
                onClick={() => setActiveCategory('all')}
                className="mt-4 text-brand-primary font-bold hover:underline"
              >
                Xem tất cả sản phẩm
              </button>
            </motion.div>
          )}
        </section>
          </>
        )}
      </main>

      <footer className="bg-white border-t border-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-primary rounded-full flex items-center justify-center text-white font-black text-xl italic shadow-md">
              T
            </div>
            <span className="font-black text-xl tracking-tight text-slate-800 italic uppercase">TapHoa<span className="text-brand-primary">MMO</span></span>
          </div>
          <p className="text-[13px] font-bold text-slate-400">
            © 2026 TapHoaMMO. Hệ thống mua bán tài nguyên tự động.
          </p>
          <div className="flex space-x-8">
            <a href="#" className="font-bold text-[13px] text-slate-500 hover:text-brand-primary transition-colors">Điều khoản</a>
            <a href="#" className="font-bold text-[13px] text-slate-500 hover:text-brand-primary transition-colors">Bảo mật</a>
            <a href="#" className="font-bold text-[13px] text-slate-500 hover:text-brand-primary transition-colors">API</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

