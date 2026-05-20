import { useEffect, useState, type ReactNode } from 'react';
import {
  LayoutDashboard,
  Users,
  Wrench,
  Package,
  CreditCard,
  ChevronLeft,
  ChevronDown,
  Menu,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  UserPlus,
  ShieldCheck,
  User,
  Home,
  LogOut,
  LucideIcon,
  Settings,
  Palette,
  Megaphone,
  Ticket,
  FileStack,
  Coins,
  Languages,
  Send,
  Mail,
  Bell,
  PanelTop,
  History,
  ShoppingBag,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import CreateServiceSection from './CreateServiceSection';
import PaymentsSection from './PaymentsSection';
import UsersSection from './UsersSection';
import { HeaderSettingsSection } from './GeneralSettingsSection';
import { DesignSection } from './DesignSection';
import {
  PromotionsSection,
  PromoCodesSection,
  CurrencySection,
  LanguageSection,
} from './AdminConfigSections';
import { ExtraPagesSection } from './ExtraPagesSection';
import {
  TelegramNotificationSection,
  EmailNotificationSection,
  UserNotificationSection,
} from './AdminNotificationSections';
import { AdminHistorySection } from './AdminHistorySection';
import { AdminOrdersSection } from './AdminOrdersSection';
import { ORDERS_UPDATED } from '../../services/orderService';
import {
  getUnreadPendingPreorderCount,
  markPendingPreordersAsSeen,
  PREORDERS_UPDATED,
} from '../../services/preorderService';

export type AdminSection =
  | 'statistics'
  | 'users'
  | 'create-service'
  | 'create-product'
  | 'payments'
  | 'orders'
  | 'settings-header'
  | 'design'
  | 'promotions'
  | 'promo-codes'
  | 'extra-pages'
  | 'currency'
  | 'language'
  | 'notify-telegram'
  | 'notify-email'
  | 'notify-user'
  | 'history';

export type AppPage = 'home' | 'order-history' | 'transaction-history' | 'deposit' | 'admin';

interface AdminPageProps {
  onNavigateHome: () => void;
}

const GENERAL_SETTINGS_GROUP_ID = 'general-settings';

interface AdminMenuLeaf {
  id: AdminSection;
  label: string;
  icon: LucideIcon;
}

interface AdminMenuGroup {
  groupId: string;
  label: string;
  icon: LucideIcon;
  children: AdminMenuLeaf[];
}

type AdminMenuItem = AdminMenuLeaf | AdminMenuGroup;

function isMenuGroup(item: AdminMenuItem): item is AdminMenuGroup {
  return 'groupId' in item;
}

const menuGroups: { title: string; items: AdminMenuItem[] }[] = [
  {
    title: 'Menu',
    items: [
      { id: 'statistics', label: 'Thống kê', icon: LayoutDashboard },
      { id: 'users', label: 'Quản lý người dùng', icon: Users },
      { id: 'create-service', label: 'Tạo dịch vụ', icon: Wrench },
      { id: 'create-product', label: 'Tạo sản phẩm', icon: Package },
      { id: 'payments', label: 'Quản lý thanh toán', icon: CreditCard },
      { id: 'orders', label: 'Đơn hàng', icon: ShoppingBag },
      { id: 'history', label: 'Lịch sử', icon: History },
    ],
  },
  {
    title: 'Cấu hình',
    items: [
      {
        groupId: GENERAL_SETTINGS_GROUP_ID,
        label: 'Cài đặt chung',
        icon: Settings,
        children: [{ id: 'settings-header', label: 'Cài header', icon: PanelTop }],
      },
      { id: 'design', label: 'Thiết kế', icon: Palette },
      { id: 'promotions', label: 'Khuyến mãi', icon: Megaphone },
      { id: 'promo-codes', label: 'Mã khuyến mãi', icon: Ticket },
      { id: 'extra-pages', label: 'Trang bổ sung', icon: FileStack },
      { id: 'currency', label: 'Tiền tệ', icon: Coins },
      { id: 'language', label: 'Ngôn ngữ', icon: Languages },
    ],
  },
  {
    title: 'Thông báo',
    items: [
      { id: 'notify-telegram', label: 'Thông báo Telegram', icon: Send },
      { id: 'notify-email', label: 'Thông báo Email', icon: Mail },
      { id: 'notify-user', label: 'Thông báo người dùng', icon: Bell },
    ],
  },
];

function flattenMenuLeaves(items: AdminMenuItem[]): AdminMenuLeaf[] {
  return items.flatMap((item) => (isMenuGroup(item) ? item.children : [item]));
}

function resolveNav(section: AdminSection) {
  for (const group of menuGroups) {
    for (const item of group.items) {
      if (isMenuGroup(item)) {
        const child = item.children.find((c) => c.id === section);
        if (child) return { parent: item, leaf: child };
      } else if (item.id === section) {
        return { parent: null, leaf: item };
      }
    }
  }
  return null;
}

export default function AdminPage({ onNavigateHome }: AdminPageProps) {
  const [activeSection, setActiveSection] = useState<AdminSection>('statistics');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set([GENERAL_SETTINGS_GROUP_ID]),
  );
  const [unreadPreorderCount, setUnreadPreorderCount] = useState(() =>
    getUnreadPendingPreorderCount(),
  );

  const nav = resolveNav(activeSection);
  const ActiveIcon = nav?.leaf.icon;

  useEffect(() => {
    if (activeSection === 'settings-header') {
      setExpandedGroups((prev) => new Set(prev).add(GENERAL_SETTINGS_GROUP_ID));
    }
  }, [activeSection]);

  useEffect(() => {
    const refresh = () => setUnreadPreorderCount(getUnreadPendingPreorderCount());
    refresh();
    window.addEventListener(PREORDERS_UPDATED, refresh);
    window.addEventListener(ORDERS_UPDATED, refresh);
    return () => {
      window.removeEventListener(PREORDERS_UPDATED, refresh);
      window.removeEventListener(ORDERS_UPDATED, refresh);
    };
  }, []);

  useEffect(() => {
    if (activeSection === 'orders') {
      markPendingPreordersAsSeen();
      setUnreadPreorderCount(getUnreadPendingPreorderCount());
    }
  }, [activeSection]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-zinc-50">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <motion.div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute right-0 top-1/4 h-80 w-80 rounded-full bg-teal-100/40 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-emerald-100/25 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#e4e4e7_1px,transparent_1px)] [background-size:20px_20px] opacity-40" />
      </div>

      <div className="relative flex flex-1 min-h-0">
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 flex w-[260px] shrink-0 flex-col border-r border-zinc-200/70 bg-white/75 backdrop-blur-xl transition-transform duration-300 lg:top-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="border-b border-zinc-100 px-5 py-5">
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary to-emerald-600 shadow-lg shadow-emerald-500/25">
                <span className="text-lg font-black italic leading-none text-white">T</span>
              </div>
              <div>
                <p className="text-[15px] font-black tracking-tight text-zinc-900">
                  TapHoa<span className="text-brand-primary">MMO</span>
                </p>
                <span className="mt-1 inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Admin
                </span>
              </div>
            </motion.div>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <div className="space-y-4">
              {menuGroups.map((group) => (
                <div key={group.title}>
                  <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                    {group.title}
                  </p>
                  <ul className="space-y-0.5">
                    {group.items.map((item) => {
                      if (isMenuGroup(item)) {
                        const Icon = item.icon;
                        const isExpanded = expandedGroups.has(item.groupId);
                        const childActive = item.children.some((c) => c.id === activeSection);
                        return (
                          <li key={item.groupId}>
                            <button
                              type="button"
                              onClick={() => toggleGroup(item.groupId)}
                              className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold transition-all duration-200 ${
                                childActive
                                  ? 'bg-emerald-50/80 text-emerald-900 ring-1 ring-emerald-100'
                                  : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                              }`}
                            >
                              <span
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                                  childActive
                                    ? 'bg-brand-primary text-white shadow-md shadow-emerald-200/50'
                                    : 'bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200 group-hover:text-zinc-700'
                                }`}
                              >
                                <Icon className="h-4 w-4" />
                              </span>
                              <span className="min-w-0 flex-1 truncate">{item.label}</span>
                              <ChevronDown
                                className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                              />
                            </button>
                            <AnimatePresence initial={false}>
                              {isExpanded && (
                                <motion.ul
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="mt-0.5 ml-4 space-y-0.5 overflow-hidden border-l border-zinc-200 pl-2"
                                >
                                  {item.children.map((child) => {
                                    const ChildIcon = child.icon;
                                    const isActive = activeSection === child.id;
                                    return (
                                      <li key={child.id}>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setActiveSection(child.id);
                                            setSidebarOpen(false);
                                          }}
                                          className={`group relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[12px] font-semibold transition-all ${
                                            isActive
                                              ? 'bg-emerald-50 text-emerald-900 shadow-sm ring-1 ring-emerald-100'
                                              : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800'
                                          }`}
                                        >
                                          <span
                                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors ${
                                              isActive
                                                ? 'bg-brand-primary text-white'
                                                : 'bg-zinc-100 text-zinc-400 group-hover:bg-zinc-200'
                                            }`}
                                          >
                                            <ChildIcon className="h-3.5 w-3.5" />
                                          </span>
                                          <span className="truncate">{child.label}</span>
                                        </button>
                                      </li>
                                    );
                                  })}
                                </motion.ul>
                              )}
                            </AnimatePresence>
                          </li>
                        );
                      }

                      const Icon = item.icon;
                      const isActive = activeSection === item.id;
                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveSection(item.id);
                              setSidebarOpen(false);
                            }}
                            className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold transition-all duration-200 ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-900 shadow-sm ring-1 ring-emerald-100'
                                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                            }`}
                          >
                            {isActive && (
                              <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-brand-primary" />
                            )}
                            <span
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                                isActive
                                  ? 'bg-brand-primary text-white shadow-md shadow-emerald-200/50'
                                  : 'bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200 group-hover:text-zinc-700'
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className="min-w-0 flex-1 truncate">{item.label}</span>
                            {item.id === 'orders' && unreadPreorderCount > 0 ? (
                              <span
                                className="shrink-0 rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-black tabular-nums text-white shadow-sm"
                                title={`${unreadPreorderCount} đơn đặt trước chưa xem`}
                              >
                                {unreadPreorderCount > 99 ? '99+' : unreadPreorderCount}
                              </span>
                            ) : null}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </nav>

          <div className="space-y-2 border-t border-zinc-100 p-3">
            {unreadPreorderCount > 0 && activeSection !== 'orders' ? (
              <button
                type="button"
                onClick={() => {
                  setActiveSection('orders');
                  setSidebarOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-xl bg-violet-50 px-3 py-2.5 text-left ring-1 ring-violet-100 transition-colors hover:bg-violet-100/80"
              >
                <ShoppingBag className="h-4 w-4 shrink-0 text-violet-600" />
                <p className="text-[11px] font-bold leading-snug text-violet-900">
                  {unreadPreorderCount} đơn đặt trước chờ xác nhận
                </p>
              </button>
            ) : null}
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 ring-1 ring-amber-100">
              <ShieldCheck className="h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-[11px] font-medium leading-snug text-amber-900/80">
                Chỉ tài khoản admin
              </p>
            </div>
            <button
              onClick={onNavigateHome}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-[12px] font-semibold text-zinc-600 shadow-sm transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900"
            >
              <ChevronLeft className="h-4 w-4" />
              Về trang chủ
            </button>
          </div>
        </aside>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex min-w-0 flex-1 flex-col"
        >
          <header className="sticky top-0 z-30 flex h-[68px] items-center border-b border-zinc-200/50 bg-white/70 shadow-[0_1px_0_rgba(0,0,0,0.03)] backdrop-blur-xl">
            <div className="mx-auto flex w-full max-w-[1700px] items-center justify-between gap-4 px-4 sm:px-6">
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex min-w-0 items-center gap-3 sm:gap-4"
              >
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="rounded-xl border border-zinc-200 bg-white p-2.5 shadow-sm transition-colors hover:bg-zinc-50 lg:hidden"
                >
                  <Menu className="h-5 w-5 text-zinc-600" />
                </button>
                {ActiveIcon && (
                  <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 ring-1 ring-emerald-100 sm:flex">
                    <ActiveIcon className="h-5 w-5 text-brand-primary" />
                  </div>
                )}
                <div className="min-w-0">
                  <motion.div className="mb-0.5 flex items-center gap-2 text-[11px] font-medium text-zinc-400">
                    <span>Admin</span>
                    {nav?.parent && (
                      <>
                        <span className="text-zinc-300">/</span>
                        <span className="truncate text-zinc-500">{nav.parent.label}</span>
                      </>
                    )}
                    <span className="text-zinc-300">/</span>
                    <span className="truncate text-zinc-600">{nav?.leaf.label}</span>
                  </motion.div>
                  <h1 className="truncate text-lg font-bold tracking-tight text-zinc-900 sm:text-xl">
                    {nav?.leaf.label}
                  </h1>
                </div>
              </motion.div>
              <AdminUserMenu onNavigateHome={onNavigateHome} />
            </div>
          </header>

          <main className="flex-1 overflow-auto pb-12">
            <div className="mx-auto w-full max-w-[1700px] space-y-8 px-4 py-6 sm:px-6 sm:py-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                >
                  {activeSection === 'statistics' && <StatisticsSection />}
                  {activeSection === 'users' && <UsersSection />}
                  {activeSection === 'create-service' && <CreateServiceSection />}
                  {activeSection === 'create-product' && <CreateProductSection />}
                  {activeSection === 'payments' && <PaymentsSection />}
                  {activeSection === 'orders' && <AdminOrdersSection />}
                  {activeSection === 'settings-header' && <HeaderSettingsSection />}
                  {activeSection === 'design' && <DesignSection />}
                  {activeSection === 'promotions' && <PromotionsSection />}
                  {activeSection === 'promo-codes' && <PromoCodesSection />}
                  {activeSection === 'extra-pages' && <ExtraPagesSection />}
                  {activeSection === 'currency' && <CurrencySection />}
                  {activeSection === 'language' && <LanguageSection />}
                  {activeSection === 'notify-telegram' && <TelegramNotificationSection />}
                  {activeSection === 'notify-email' && <EmailNotificationSection />}
                  {activeSection === 'notify-user' && <UserNotificationSection />}
                  {activeSection === 'history' && <AdminHistorySection />}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </motion.div>
      </div>
    </div>
  );
}

const ADMIN_USER = { name: 'Quản trị viên', role: 'Admin hệ thống' };

function AdminUserMenu({ onNavigateHome }: { onNavigateHome: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-zinc-100 sm:px-3"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary ring-2 ring-emerald-100">
          <span className="text-sm font-black text-white">
            {ADMIN_USER.name.charAt(0)}
          </span>
        </div>
        <span className="hidden max-w-[100px] truncate text-sm font-bold text-zinc-700 sm:inline">
          {ADMIN_USER.name.split(' ').pop()}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <button
              type="button"
              aria-label="Đóng menu"
              className="fixed inset-0 z-[100] cursor-default"
              onClick={() => setOpen(false)}
            />
            <motion.div
              role="menu"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-12 z-[150] w-56 overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-2xl"
            >
              <div className="border-b border-zinc-100 px-4 py-4">
                <p className="font-black text-zinc-800">{ADMIN_USER.name}</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-500">
                  <ShieldCheck className="h-3.5 w-3.5 text-brand-primary" />
                  {ADMIN_USER.role}
                </p>
              </div>
              <div className="p-2">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    onNavigateHome();
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-zinc-600 transition-colors hover:bg-zinc-50"
                >
                  <Home className="h-4 w-4" />
                  Về trang chủ
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-zinc-600 transition-colors hover:bg-zinc-50"
                  onClick={() => setOpen(false)}
                >
                  <User className="h-4 w-4" />
                  Hồ sơ admin
                </button>
              </div>
              <div className="border-t border-zinc-100 p-2">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    onNavigateHome();
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-500 transition-colors hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Thoát admin
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Section header — style-main-ui §6 */
function AdminSectionHeader({
  title,
  subtitle,
  icon: Icon,
  action,
}: {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 ring-1 ring-emerald-100">
          <Icon className="h-5 w-5 text-brand-primary" />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-black tracking-tight text-zinc-900">{title}</h2>
          {subtitle && <p className="mt-0.5 text-[12px] font-medium text-zinc-500">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

function AdminCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-zinc-200/70 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-shadow duration-300 hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.08)] ${className}`}
    >
      {children}
    </div>
  );
}

function FormLabel({ children }: { children: ReactNode }) {
  return (
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
      {children}
    </label>
  );
}

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 outline-none text-sm font-bold text-slate-800 placeholder:text-slate-400 transition-all';

function PrimaryButton({ children, type = 'submit' }: { children: ReactNode; type?: 'submit' | 'button' }) {
  return (
    <button
      type={type}
      className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-3 rounded-xl font-bold text-[12px] transition-all flex items-center justify-center gap-2 shadow-sm shadow-emerald-500/30"
    >
      {children}
    </button>
  );
}

function StatisticsSection() {
  const stats = [
    { label: 'Doanh thu hôm nay', value: '12.450.000đ', icon: DollarSign, change: '+12%' },
    { label: 'Đơn hàng mới', value: '156', icon: ShoppingCart, change: '+8%' },
    { label: 'Người dùng mới', value: '42', icon: UserPlus, change: '+24%' },
    { label: 'Tỷ lệ chuyển đổi', value: '3.2%', icon: TrendingUp, change: '+0.4%' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <AdminSectionHeader title="Thống kê" subtitle="Tổng quan hệ thống" icon={LayoutDashboard} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -3 }}
              className="group rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm transition-all duration-300 hover:border-emerald-200/80 hover:shadow-[0_12px_28px_-12px_rgba(16,185,129,0.2)]"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 ring-1 ring-emerald-100 transition-transform group-hover:scale-105">
                <Icon className="h-5 w-5 text-brand-primary" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{stat.label}</p>
              <p className="mt-1 text-2xl font-black tabular-nums text-zinc-900">{stat.value}</p>
              <p className="mt-2 text-xs font-bold text-emerald-600">{stat.change} so với hôm qua</p>
            </motion.div>
          );
        })}
      </div>

      <AdminCard className="p-6">
        <h3 className="font-bold text-slate-800 tracking-tight text-sm uppercase mb-4">
          Tổng quan hoạt động
        </h3>
        <div className="h-48 flex items-center justify-center bg-slate-50 rounded-xl border border-dashed border-gray-300">
          <p className="text-[13px] font-bold text-slate-400">Biểu đồ thống kê sẽ được cập nhật tại đây</p>
        </div>
      </AdminCard>
    </motion.div>
  );
}

function CreateProductSection() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <AdminSectionHeader title="Tạo sản phẩm" subtitle="Thêm sản phẩm mới" icon={Package} />

      <AdminCard className="max-w-2xl p-6">
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <FormLabel>Tên sản phẩm</FormLabel>
            <input type="text" placeholder="VD: Tài khoản Gmail 1 năm" className={inputClass} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FormLabel>Giá bán</FormLabel>
              <input type="number" placeholder="500000" className={inputClass} />
            </div>
            <div>
              <FormLabel>Số lượng kho</FormLabel>
              <input type="number" placeholder="100" className={inputClass} />
            </div>
          </div>
          <div>
            <FormLabel>Danh mục sản phẩm</FormLabel>
            <select className={`${inputClass} bg-white`}>
              <option>Gmail</option>
              <option>Tài khoản Facebook</option>
              <option>Tool / Phần mềm</option>
              <option>Proxy</option>
            </select>
          </div>
          <div>
            <FormLabel>Mô tả sản phẩm</FormLabel>
            <textarea
              rows={4}
              placeholder="Thông tin chi tiết sản phẩm..."
              className={`${inputClass} resize-none`}
            />
          </div>
          <PrimaryButton>Tạo sản phẩm</PrimaryButton>
        </form>
      </AdminCard>
    </motion.div>
  );
}
