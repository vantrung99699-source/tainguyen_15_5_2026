import { Search, ChevronDown, Phone, Globe, Coins, Mail, User, Facebook, X, Bell, ChevronRight, History, Shield, FileText } from 'lucide-react';
import { useExtraPages } from '../hooks/useExtraPages';
import { getMenuExtraPages } from '../services/extraPagesConfig';
import type { AppPage } from '../pages/admin/AdminPage';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useSiteHeaderConfig } from '../hooks/useSiteHeaderConfig';
import { getContactDisplayText, getContactHref } from '../services/siteHeaderConfig';
import { useSiteDesign } from '../hooks/useSiteDesign';
import { SiteLogo } from './SiteLogo';

// Mock user data
interface UserData {
  name: string;
  balance: number;
  notifications: { id: number; text: string; time: string; unread: boolean }[];
}

const mockUser: UserData = {
  name: 'Nguyễn Văn Minh',
  balance: 2500000,
  notifications: [
    { id: 1, text: 'Đơn hàng #12345 đã được xử lý thành công', time: '5 phút trước', unread: true },
    { id: 2, text: 'Tài khoản TikTok của bạn đã được kích hoạt', time: '1 giờ trước', unread: true },
    { id: 3, text: 'Khuyến mãi 20% cho các tài khoản mới', time: '2 giờ trước', unread: false },
  ],
};

export default function Navbar({
  onNavigate,
  onOpenExtraPage,
}: {
  onNavigate?: (page: AppPage) => void;
  onOpenExtraPage?: (slug: string) => void;
}) {
  const extraPages = useExtraPages();
  const khacMenuItems = useMemo(() => {
    return getMenuExtraPages(extraPages).map((page) => {
      if (page.linkType === 'external' && page.externalUrl.trim()) {
        return {
          label: page.title,
          href: page.externalUrl.trim(),
          external: true,
        };
      }
      return {
        label: page.title,
        onClick: () => onOpenExtraPage?.(page.slug),
      };
    });
  }, [extraPages, onOpenExtraPage]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const headerConfig = useSiteHeaderConfig();
  const design = useSiteDesign();
  const contactText = getContactDisplayText(headerConfig);
  const contactHref = getContactHref(headerConfig);
  const visibleNavLinks = headerConfig.navLinks.filter((l) => l.enabled && l.label.trim());

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="w-full relative z-[100]">
      {/* Header Top - Becomes relative so it scrolls away */}
      {headerConfig.topBarEnabled && (
      <motion.div
        className={`w-full border-b border-white/5 py-1.5 backdrop-blur-md transition-all duration-300 ${isScrolled ? 'opacity-0 -translate-y-full h-0 py-0' : 'opacity-100 translate-y-0 h-auto'}`}
        style={{ backgroundColor: design.topBarBg }}
      >
        <div className="max-w-[1700px] mx-auto px-6 flex items-center justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-6">
            {contactText &&
              (contactHref ? (
                <a
                  href={contactHref}
                  className="flex items-center gap-2 text-white/80 transition-colors hover:text-white"
                >
                  <Phone className="h-3.5 w-3.5 opacity-70" />
                  <span className="text-[11px] font-bold tracking-tight">{contactText}</span>
                </a>
              ) : (
                <div className="flex items-center gap-2 text-white/80">
                  <Phone className="h-3.5 w-3.5 opacity-70" />
                  <span className="text-[11px] font-bold tracking-tight">{contactText}</span>
                </div>
              ))}
            {visibleNavLinks.length > 0 && contactText && (
              <div className="h-3 w-px shrink-0 bg-white/20" />
            )}
            {visibleNavLinks.length > 0 && (
              <div className="flex flex-wrap items-center gap-4">
                {visibleNavLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url || '#'}
                    className="text-[11px] font-bold text-white/60 transition-colors hover:text-white"
                    {...(link.url.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-4">
            {headerConfig.showTopBarCustomText && headerConfig.topBarCustomText.trim() && (
              <p className="hidden max-w-md truncate text-right text-[11px] font-bold text-white/90 md:block">
                {headerConfig.topBarCustomText.trim()}
              </p>
            )}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-white/90 hover:bg-white/10 transition-all cursor-pointer group">
              <Coins className="w-3 h-3 text-yellow-400" />
              <span className="text-[10px] font-black tracking-widest uppercase">VND</span>
              <ChevronDown className="w-3 h-3 opacity-40 group-hover:translate-y-0.5 transition-transform" />
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-white/90 hover:bg-white/10 transition-all cursor-pointer group">
              <Globe className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] font-black tracking-widest uppercase">VN - VI</span>
              <ChevronDown className="w-3 h-3 opacity-40 group-hover:translate-y-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </motion.div>
      )}

      {/* Main Header - Always Sticky */}
      <header
        className={`w-full h-[70px] flex items-center border-b border-slate-100 sticky top-0 z-[100] transition-all duration-300 shadow-emerald-950/10 ${isScrolled ? 'shadow-md h-[64px]' : 'shadow-none'}`}
        style={{ backgroundColor: design.mainHeaderBg }}
      >
        <div className="max-w-[1700px] mx-auto px-6 w-full flex items-center justify-between gap-4">
          
          {/* Left: Logo & Nav */}
          <div className="flex items-center gap-10 shrink-0">
            <a href="/" className="group flex items-center gap-3.5">
              <SiteLogo design={design} markClassName="w-10 h-10 group-hover:scale-105 transition-transform duration-300" />
            </a>

            {/* Nav Menu Items - Dark Text for White Header */}
            <nav className="hidden xl:flex items-center gap-7">
              <NavItem label="Dịch vụ" hasSub isDark />
              <NavItem 
                label="Sản phẩm" 
                hasSub 
                isDark 
                subItems={[
                  { label: 'Gmail', href: '#' },
                  { label: 'Tài khoản', href: '#' },
                  { label: 'Tài khoản Facebook', href: '#' },
                ]}
              />
              <NavItem label="Khác" hasSub isDark subItems={khacMenuItems} hideFooter />
              <NavItem label="Công cụ" hasSub isDark />
              <NavItem
                label="Lịch sử"
                hasSub
                isDark
                subItems={[
                  {
                    label: 'Lịch sử giao dịch',
                    onClick: () => onNavigate?.('transaction-history'),
                  },
                  {
                    label: 'Lịch sử đơn hàng',
                    onClick: () => onNavigate?.('order-history'),
                  },
                ]}
              />
              <button
                type="button"
                onClick={() => onNavigate?.('deposit')}
                className="flex items-center gap-1.5 text-orange-500 font-black text-[13px] uppercase tracking-wider hover:text-brand-primary transition-all ml-2"
              >
                <span className="relative">Nạp tiền</span>
              </button>
            </nav>
          </div>

          {/* Right: Search, Auth */}
          <div className="flex items-center gap-6 flex-1 justify-end max-w-5xl">
            {/* Main Huge Search Input - Refined for White Background */}
            <div className="relative group flex-1 max-w-2xl hidden md:block">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary">
                <Search className="w-5 h-5" />
              </div>
              <input 
                type="text" 
                placeholder="Tìm tài khoản, phần mềm, dịch vụ..." 
                className="w-full bg-slate-50 focus:bg-white rounded-full py-2.5 pl-12 pr-6 text-[13px] font-bold text-slate-800 placeholder:text-slate-400 outline-none transition-all border border-slate-200 focus:border-brand-primary/30 focus:ring-4 focus:ring-brand-primary/5"
              />
            </div>

            <div className="flex items-center gap-4 shrink-0">
              {isLoggedIn && userData ? (
                <>
                  {/* Notifications */}
                  <div className="relative">
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      <Bell className="w-5 h-5 text-slate-600" />
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>
                    
                    {/* Notifications Dropdown */}
                    <AnimatePresence>
                      {showNotifications && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          className="absolute top-12 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[150]"
                        >
                          <div className="px-4 py-3 bg-emerald-50 border-b border-slate-100">
                            <h3 className="font-black text-slate-800">Thông báo</h3>
                          </div>
                          <div className="max-h-80 overflow-y-auto">
                            {userData.notifications.map((notif) => (
                              <div
                                key={notif.id}
                                className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${
                                  notif.unread ? 'bg-emerald-50/50' : ''
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  {notif.unread && <span className="w-2 h-2 bg-brand-primary rounded-full mt-1.5 shrink-0"></span>}
                                  <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-700">{notif.text}</p>
                                    <p className="text-xs text-slate-400 mt-1">{notif.time}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="px-4 py-3 border-t border-slate-100">
                            <button className="w-full text-center text-sm font-bold text-brand-primary hover:underline">
                              Xem tất cả thông báo
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Balance */}
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100">
                    <Coins className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-black text-emerald-700">
                      {userData.balance.toLocaleString('vi-VN')}đ
                    </span>
                  </div>

                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center">
                        <span className="text-white font-black text-sm">{userData.name.charAt(0)}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-700">{userData.name.split(' ').pop()}</span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {showUserMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          className="absolute top-12 right-0 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[150]"
                        >
                          <div className="px-4 py-4 border-b border-slate-100">
                            <p className="font-black text-slate-800">{userData.name}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{userData.balance.toLocaleString('vi-VN')}đ trong tài khoản</p>
                          </div>
                          <div className="p-2">
                            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 text-sm font-bold text-slate-600 transition-colors">
                              <User className="w-4 h-4" /> Tài khoản của tôi
                            </a>
                            <button
                              type="button"
                              onClick={() => {
                                onNavigate?.('transaction-history');
                                setShowUserMenu(false);
                              }}
                              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
                            >
                              <Coins className="h-4 w-4" /> Lịch sử giao dịch
                            </button>
                            <button 
                              onClick={() => onNavigate?.('order-history')}
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 text-sm font-bold text-slate-600 transition-colors"
                            >
                              <History className="w-4 h-4" /> Lịch sử đơn hàng
                            </button>
                            <button
                              onClick={() => {
                                onNavigate?.('admin');
                                setShowUserMenu(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-emerald-50 text-sm font-bold text-brand-primary transition-colors"
                            >
                              <Shield className="w-4 h-4" /> Quản lý admin
                            </button>
                            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 text-sm font-bold text-slate-600 transition-colors">
                              <Bell className="w-4 h-4" /> Thông báo
                            </a>
                          </div>
                          <div className="p-2 border-t border-slate-100">
                            <button
                              onClick={() => { setIsLoggedIn(false); setUserData(null); setShowUserMenu(false); }}
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-sm font-bold text-red-500 transition-colors"
                            >
                              Đăng xuất
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <>
                  <button onClick={() => { setAuthTab('login'); setShowAuthModal(true); }} className="text-slate-600 hover:text-brand-primary text-[14px] font-black px-4 py-2 transition-all whitespace-nowrap cursor-pointer">
                    Đăng nhập
                  </button>
                  <button onClick={() => { setAuthTab('register'); setShowAuthModal(true); }} className="bg-brand-primary hover:bg-brand-secondary text-white text-[14px] font-black px-6 py-2.5 rounded-full transition-all whitespace-nowrap cursor-pointer shadow-md shadow-emerald-100">
                    Đăng ký
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Clean Marquee Ticker - Scrolled state hides this */}
      {headerConfig.marqueeEnabled && headerConfig.marqueeLines.length > 0 && (
      <div className={`w-full overflow-hidden m-0 p-0 bg-transparent border-none transition-all duration-300 ${isScrolled ? 'opacity-0 -translate-y-full h-0 pointer-events-none' : 'opacity-100 translate-y-0 h-8 mt-1'}`}>
        <div className="max-w-[1700px] mx-auto px-6">
          <div className="relative flex items-center h-full overflow-hidden">
            <motion.div
              animate={{ x: ['50%', '-100%'] }}
              transition={{
                duration: 30,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="whitespace-nowrap text-[13px] font-bold text-slate-400 flex gap-20 select-none pointer-events-none lowercase tracking-tight"
            >
              {headerConfig.marqueeLines.map((line, i) => (
                <div key={`${i}-${line.slice(0, 24)}`} className="flex items-center gap-4">
                  <span className={`h-1.5 w-1.5 rounded-full ${i % 3 === 2 ? 'bg-orange-400/40' : 'bg-brand-primary/40'}`} />
                  <span>{line}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
      )}

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
            onClick={() => setShowAuthModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative bg-gradient-to-r from-emerald-600 to-emerald-500 px-8 py-8 text-center">
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-black text-white">
                  {authTab === 'login' ? 'Chào mừng trở lại!' : 'Tạo tài khoản mới'}
                </h2>
                <p className="text-emerald-100 text-sm mt-1">
                  {authTab === 'login' ? 'Đăng nhập để tiếp tục mua sắm' : 'Đăng ký để bắt đầu mua sắm'}
                </p>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-100">
                <button
                  onClick={() => setAuthTab('login')}
                  className={`flex-1 py-4 text-sm font-black transition-colors ${
                    authTab === 'login' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => setAuthTab('register')}
                  className={`flex-1 py-4 text-sm font-black transition-colors ${
                    authTab === 'register' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Đăng ký
                </button>
              </div>

              {/* Form */}
              <div className="p-8">
                {authTab === 'login' ? (
                  <form className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Email</label>
                      <input
                        type="email"
                        placeholder="email@example.com"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 outline-none transition-all text-sm font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Mật khẩu</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 outline-none transition-all text-sm font-bold"
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary" />
                        <span className="font-bold text-slate-500">Ghi nhớ đăng nhập</span>
                      </label>
                      <a href="#" className="font-bold text-brand-primary hover:underline">Quên mật khẩu?</a>
                    </div>
                    <button type="submit" onClick={(e) => { e.preventDefault(); setIsLoggedIn(true); setUserData(mockUser); setShowAuthModal(false); }} className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-black py-3 rounded-xl transition-colors shadow-lg shadow-emerald-100 cursor-pointer">
                      Đăng nhập
                    </button>
                  </form>
                ) : (
                  <form className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Họ và tên</label>
                      <input
                        type="text"
                        placeholder="Nguyễn Văn A"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 outline-none transition-all text-sm font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Email</label>
                      <input
                        type="email"
                        placeholder="email@example.com"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 outline-none transition-all text-sm font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Mật khẩu</label>
                      <input
                        type="password"
                        placeholder="Tối thiểu 8 ký tự"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 outline-none transition-all text-sm font-bold"
                      />
                    </div>
                    <label className="flex items-start gap-2 cursor-pointer text-xs">
                      <input type="checkbox" className="w-4 h-4 mt-0.5 rounded border-slate-300 text-brand-primary focus:ring-brand-primary" />
                      <span className="font-bold text-slate-500">
                        Tôi đồng ý với <a href="#" className="text-brand-primary hover:underline">Điều khoản dịch vụ</a> và <a href="#" className="text-brand-primary hover:underline">Chính sách bảo mật</a>
                      </span>
                    </label>
                    <button type="submit" onClick={(e) => { e.preventDefault(); setIsLoggedIn(true); setUserData(mockUser); setShowAuthModal(false); }} className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-black py-3 rounded-xl transition-colors shadow-lg shadow-emerald-100 cursor-pointer">
                      Tạo tài khoản
                    </button>
                  </form>
                )}

                {/* Divider */}
                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-px bg-slate-100"></div>
                  <span className="text-xs font-bold text-slate-400">hoặc</span>
                  <div className="flex-1 h-px bg-slate-100"></div>
                </div>

                {/* Social Login */}
                <button className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors font-bold text-sm text-slate-600">
                  <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Tiếp tục với Google
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavItem({
  label,
  hasSub,
  isDark,
  subItems,
  hideFooter,
}: {
  label: string;
  hasSub?: boolean;
  isDark?: boolean;
  hideFooter?: boolean;
  subItems?: { label: string; href?: string; onClick?: () => void; external?: boolean }[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const hasDropdown = Boolean(subItems && subItems.length > 0);
  const linkClass = `flex items-center gap-1.5 ${
    isDark ? 'text-slate-600 hover:text-brand-primary' : 'text-white hover:text-white/80'
  } text-[14px] font-black tracking-tight transition-all py-2`;

  useEffect(() => {
    if (!isOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [isOpen]);

  return (
    <div
      ref={rootRef}
      className="relative flex h-full items-center"
      onMouseEnter={() => hasDropdown && setIsOpen(true)}
      onMouseLeave={() => hasDropdown && setIsOpen(false)}
    >
      {hasSub ? (
        <button
          type="button"
          aria-expanded={hasDropdown ? isOpen : undefined}
          aria-haspopup={hasDropdown ? 'menu' : undefined}
          onClick={() => hasDropdown && setIsOpen((v) => !v)}
          className={linkClass}
        >
          <span>{label}</span>
          <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className={`w-3.5 h-3.5 ${isDark ? 'opacity-30' : 'opacity-60'}`} />
          </motion.span>
        </button>
      ) : (
        <a href="#" className={linkClass}>
          <span>{label}</span>
        </a>
      )}

      <AnimatePresence>
        {isOpen && hasDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute left-1/2 top-full z-[110] -translate-x-1/2 pt-2"
          >
            <div
              role="menu"
              className="w-56 rounded-2xl border border-slate-100 bg-white p-2 shadow-[0_20px_50px_rgba(0,0,0,0.1)]"
            >
            <div className="flex flex-col gap-1">
              {subItems!.map((item) =>
                item.onClick ? (
                  <button
                    key={item.label}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      item.onClick?.();
                      setIsOpen(false);
                    }}
                    className="group flex w-full items-center gap-3 rounded-[12px] px-4 py-3 text-left text-[13px] font-bold text-slate-600 transition-all hover:bg-slate-50 hover:text-brand-primary"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 transition-colors group-hover:bg-brand-primary/10">
                      {item.label.includes('giao dịch') && (
                        <Coins className="h-4 w-4 text-slate-400 group-hover:text-brand-primary" />
                      )}
                      {item.label.includes('đơn hàng') && (
                        <History className="h-4 w-4 text-slate-400 group-hover:text-brand-primary" />
                      )}
                      {!item.label.includes('giao dịch') && !item.label.includes('đơn hàng') && (
                        <FileText className="h-4 w-4 text-slate-400 group-hover:text-brand-primary" />
                      )}
                    </span>
                    <span>{item.label}</span>
                  </button>
                ) : (
                  <a
                    key={item.label}
                    href={item.href ?? '#'}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noopener noreferrer' : undefined}
                    role="menuitem"
                    onClick={() => setIsOpen(false)}
                    className="group flex items-center gap-3 rounded-[12px] px-4 py-3 text-[13px] font-bold text-slate-600 transition-all hover:bg-slate-50 hover:text-brand-primary"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 transition-colors group-hover:bg-brand-primary/10">
                      {item.label === 'Gmail' && <Mail className="h-4 w-4 text-slate-400 group-hover:text-brand-primary" />}
                      {item.label === 'Tài khoản' && <User className="h-4 w-4 text-slate-400 group-hover:text-brand-primary" />}
                      {item.label === 'Tài khoản Facebook' && (
                        <Facebook className="h-4 w-4 text-slate-400 group-hover:text-brand-primary" />
                      )}
                      {!['Gmail', 'Tài khoản', 'Tài khoản Facebook'].includes(item.label) && (
                        <FileText className="h-4 w-4 text-slate-400 group-hover:text-brand-primary" />
                      )}
                    </div>
                    <span>{item.label}</span>
                  </a>
                ),
              )}
            </div>
            
            {!hideFooter && (
              <div className="mt-2 border-t border-slate-50 pt-2">
                <a
                  href="#"
                  className="flex items-center justify-center py-2 text-[11px] font-black uppercase tracking-widest text-slate-400 transition-colors hover:text-brand-primary"
                >
                  Xem tất cả
                </a>
              </div>
            )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
