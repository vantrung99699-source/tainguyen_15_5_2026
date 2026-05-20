import { useState, useMemo, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import CategoryFilter from './components/CategoryFilter';
import ProductCard from './components/ProductCard';
import OrderHistory from './pages/OrderHistory';
import TransactionHistoryPage from './pages/TransactionHistoryPage';
import DepositPage from './pages/DepositPage';
import AffiliatePage from './pages/AffiliatePage';
import { captureReferralFromUrl } from './services/affiliateService';
import { CATEGORIES } from './constants';
import { ensureCategoryTranslations } from './services/localeService';
import ExtraPageView from './pages/ExtraPageView';
import {
  findExtraPageBySlug,
  parseExtraPageSlugFromPath,
  pushExtraPagePath,
  pushHomePath,
} from './services/extraPagesConfig';
import { useExtraPages } from './hooks/useExtraPages';
import AdminPage, { type AppPage } from './pages/admin/AdminPage';
import { CATEGORIES } from './constants';
import type { Product } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, Sparkles } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useSiteDesign } from './hooks/useSiteDesign';
import { getProductGridClass, resolveCardStyle } from './utils/productLayout';
import { loadStorefrontProducts } from './services/storefrontCatalog';
import { SERVICE_SHOPS_UPDATED } from './services/serviceShopConfig';
import { PreorderCheckoutModal } from './components/preorder/PreorderCheckoutModal';
import { BuyNowModal } from './components/storefront/BuyNowModal';
import { PreorderStockBlockedModal } from './components/storefront/PreorderStockBlockedModal';
import { PurchaseSuccessModal } from './components/storefront/PurchaseSuccessModal';
import { ensureDemoCustomerHistory } from './data/demoCustomerHistorySeed';
import { ensureDemoAffiliateCommissions } from './data/demoAffiliateSeed';

interface PurchaseSuccessState {
  variant: 'buy' | 'preorder';
  productName: string;
  orderId?: string;
  deliveredCount?: number;
}

export default function App() {
  const design = useSiteDesign();
  const cardStyle = resolveCardStyle(design.productCardStyle, design.productGridLayout);
  const [activeCategory, setActiveCategory] = useState('all');
  const [visibleCount, setVisibleCount] = useState(12);
  const [currentPage, setCurrentPage] = useState<AppPage>('home');
  const [products, setProducts] = useState<Product[]>(() => loadStorefrontProducts());
  const [buyProduct, setBuyProduct] = useState<Product | null>(null);
  const [preorderProduct, setPreorderProduct] = useState<Product | null>(null);
  const [preorderBlockedProduct, setPreorderBlockedProduct] = useState<Product | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState<PurchaseSuccessState | null>(null);
  const [orderHistoryTab, setOrderHistoryTab] = useState<'orders' | 'preorders'>('orders');
  const [orderHistoryKey, setOrderHistoryKey] = useState(0);
  const [extraPageSlug, setExtraPageSlug] = useState<string | null>(() => parseExtraPageSlugFromPath());
  const extraPages = useExtraPages();
  const activeExtraPage = extraPageSlug ? findExtraPageBySlug(extraPages, extraPageSlug) : null;

  const openExtraPage = useCallback((slug: string) => {
    setExtraPageSlug(slug);
    setCurrentPage('home');
    pushExtraPagePath(slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const closeExtraPage = useCallback(() => {
    setExtraPageSlug(null);
    pushHomePath();
  }, []);

  useEffect(() => {
    const onPopState = () => {
      const slug = parseExtraPageSlugFromPath();
      setExtraPageSlug(slug);
      if (slug) setCurrentPage('home');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    ensureDemoCustomerHistory();
    ensureDemoAffiliateCommissions();
    ensureCategoryTranslations(CATEGORIES.map((c) => ({ id: c.id, name: c.name })));
    captureReferralFromUrl();
  }, []);

  useEffect(() => {
    const sync = () => setProducts(loadStorefrontProducts());
    window.addEventListener(SERVICE_SHOPS_UPDATED, sync);
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'taphoammo_service_shops') sync();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(SERVICE_SHOPS_UPDATED, sync);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const handleBuy = useCallback((product: Product) => {
    if (product.stock <= 0) {
      alert('Kho đang hết — vui lòng dùng Đặt trước nếu được hỗ trợ.');
      return;
    }
    setBuyProduct(product);
  }, []);

  const goToOrderHistory = useCallback(
    (tab: 'orders' | 'preorders') => {
      setPurchaseSuccess(null);
      setExtraPageSlug(null);
      pushHomePath();
      setOrderHistoryTab(tab);
      setOrderHistoryKey((k) => k + 1);
      setCurrentPage('order-history');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [],
  );

  const handlePreorder = useCallback((product: Product) => {
    if (product.stock > 0) {
      setPreorderBlockedProduct(product);
      return;
    }
    setPreorderProduct(product);
  }, []);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') return products;
    return products.filter(
      (p) =>
        p.category === activeCategory ||
        p.category.toLowerCase() === activeCategory.toLowerCase(),
    );
  }, [activeCategory, products]);

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

    const sectionCardStyle = design.categorySectionLayout === 'list' ? 'list' : cardStyle;
    const sectionGridClass =
      design.categorySectionLayout === 'list'
        ? 'flex flex-col gap-4'
        : getProductGridClass(design.productGridLayout === 'list' ? 'list' : design.productGridLayout);

    const categoryKeys = [...new Set(products.map((p) => p.category))];

    return categoryKeys.map((catKey) => {
      const categoryProducts = products.filter((p) => p.category === catKey);
      if (categoryProducts.length === 0) return null;
      const category = CATEGORIES.find(
        (c) => c.id === catKey || c.name.toLowerCase() === catKey.toLowerCase(),
      );
      const categoryName = category?.name ?? catKey;

      const IconComp = category ? (LucideIcons as any)[category.icon] || Sparkles : Sparkles;

      return (
        <div key={catKey} className="mb-20">
          <div 
            className="flex w-full items-center gap-4 px-6 py-4 rounded-xl shadow-xl shadow-slate-200/40 border border-slate-100 border-l-[6px] border-l-brand-primary mb-6 relative z-10 overflow-hidden group bg-white cursor-pointer hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300"
            onClick={() => handleCategoryChange(category?.id ?? catKey)}
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
                Danh mục <span className="text-brand-primary">{categoryName}</span>
              </h3>
              <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Nhấp để xem tất cả</span>
            </div>
            
            {/* Subtle pattern for the 'block' feel */}
            <div className="absolute right-0 top-0 bottom-0 w-48 bg-gradient-to-l from-emerald-50 to-transparent pointer-events-none" />
          </div>
          <div className={sectionGridClass}>
            {categoryProducts
              .slice(0, design.categorySectionLayout === 'list' ? 6 : 4)
              .map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  variant={sectionCardStyle}
                  onBuy={handleBuy}
                  onPreorder={handlePreorder}
                />
              ))}
          </div>
        </div>
      );
    });
  }, [activeCategory, cardStyle, design.categorySectionLayout, design.productGridLayout, products, handleBuy, handlePreorder]);

  if (currentPage === 'admin') {
    return <AdminPage onNavigateHome={() => setCurrentPage('home')} />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: design.pageBg }}>
      <Navbar
        onNavigate={(page) => {
          setExtraPageSlug(null);
          pushHomePath();
          setCurrentPage(page);
        }}
        onOpenExtraPage={openExtraPage}
      />

      <main className="pb-32">
        {extraPageSlug && !activeExtraPage ? (
          <motion.div className="mx-auto max-w-2xl px-6 py-20 text-center">
            <p className="text-lg font-black text-slate-800">Không tìm thấy trang</p>
            <button
              type="button"
              onClick={closeExtraPage}
              className="mt-4 rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-bold text-white"
            >
              Về trang chủ
            </button>
          </motion.div>
        ) : activeExtraPage ? (
          <ExtraPageView page={activeExtraPage} onBack={closeExtraPage} />
        ) : currentPage === 'order-history' ? (
          <OrderHistory key={orderHistoryKey} initialTab={orderHistoryTab} />
        ) : currentPage === 'transaction-history' ? (
          <TransactionHistoryPage onBack={() => setCurrentPage('home')} />
        ) : currentPage === 'deposit' ? (
          <DepositPage />
        ) : currentPage === 'affiliate' ? (
          <AffiliatePage onBack={() => setCurrentPage('home')} />
        ) : (
          <>
            <HeroBanner />
        
            <div
              className={`mx-auto max-w-7xl px-6 mt-16 mb-12 ${
                design.categoryFilterLayout === 'sidebar' ? 'flex flex-col gap-6 lg:flex-row lg:items-start' : ''
              }`}
            >
              <CategoryFilter
                activeCategory={activeCategory}
                setActiveCategory={handleCategoryChange}
                layout={design.categoryFilterLayout}
              />
              <motion.div className={design.categoryFilterLayout === 'sidebar' ? 'min-w-0 flex-1' : 'w-full'}>
                <section
                  className={`mx-auto max-w-7xl px-6 mt-20 ${
                    design.categoryFilterLayout === 'sidebar' ? 'mt-8 max-w-none px-0' : ''
                  }`}
                >

          {activeCategory === 'all' ? (
            <div className="space-y-6">
              {GroupedProducts}
            </div>
          ) : (
            <>
              <motion.div className={getProductGridClass(design.productGridLayout)}>
                <AnimatePresence>
                  {displayedProducts.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={index % 12}
                      variant={cardStyle}
                      onBuy={handleBuy}
                      onPreorder={handlePreorder}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
              
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
              </motion.div>
            </div>
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

      <AnimatePresence>
        {preorderBlockedProduct ? (
          <PreorderStockBlockedModal
            key={`blocked-${preorderBlockedProduct.id}`}
            product={preorderBlockedProduct}
            onClose={() => setPreorderBlockedProduct(null)}
            onBuyNow={() => {
              const p = preorderBlockedProduct;
              setPreorderBlockedProduct(null);
              setBuyProduct(p);
            }}
          />
        ) : null}
        {buyProduct ? (
          <BuyNowModal
            key={`buy-${buyProduct.id}`}
            product={buyProduct}
            onClose={() => setBuyProduct(null)}
            onSuccess={({ deliveredContents, orderId }) => {
              const name = buyProduct.name;
              setProducts(loadStorefrontProducts());
              setBuyProduct(null);
              setPurchaseSuccess({
                variant: 'buy',
                productName: name,
                orderId,
                deliveredCount: deliveredContents.length,
              });
            }}
          />
        ) : null}
        {preorderProduct ? (
          <PreorderCheckoutModal
            key={`pre-${preorderProduct.id}`}
            product={preorderProduct}
            onClose={() => setPreorderProduct(null)}
            onSuccess={(orderId) => {
              const name = preorderProduct.name;
              setProducts(loadStorefrontProducts());
              setPreorderProduct(null);
              setPurchaseSuccess({
                variant: 'preorder',
                productName: name,
                orderId,
              });
            }}
          />
        ) : null}
        {purchaseSuccess ? (
          <PurchaseSuccessModal
            variant={purchaseSuccess.variant}
            productName={purchaseSuccess.productName}
            orderId={purchaseSuccess.orderId}
            deliveredCount={purchaseSuccess.deliveredCount}
            onClose={() => setPurchaseSuccess(null)}
            onGoToOrderHistory={() =>
              goToOrderHistory(purchaseSuccess.variant === 'preorder' ? 'preorders' : 'orders')
            }
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

