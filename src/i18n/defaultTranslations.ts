import type { TranslationEntry } from '../types/locale';

/** Nhãn nhóm — hiển thị trong admin Translation Manager */
export const TRANSLATION_GROUP_LABELS: Record<string, string> = {
  menu: 'Menu điều hướng (Navbar)',
  auth: 'Đăng nhập / Đăng ký',
  product: 'Thẻ sản phẩm & modal mua hàng',
  wallet: 'Ví khách hàng',
  category: 'Bộ lọc danh mục (trang chủ)',
  page: 'Tiêu đề trang nội bộ',
  ui: 'Switcher tiền tệ & ngôn ngữ',
  home: 'Trang chủ — danh sách sản phẩm',
  footer: 'Chân trang (footer)',
};

/** Chuỗi UI mặc định — admin có thể ghi đè trong Translation Manager */
export const DEFAULT_TRANSLATION_ENTRIES: TranslationEntry[] = [
  {
    key: 'menu_home',
    group: 'menu',
    hint: 'Navbar — mục «Trang chủ» (menu chính)',
    values: { vi: 'Trang chủ', en: 'Home', th: 'หน้าแรก' },
  },
  {
    key: 'menu_services',
    group: 'menu',
    hint: 'Navbar — mục «Dịch vụ»',
    values: { vi: 'Dịch vụ', en: 'Services', th: 'บริการ' },
  },
  {
    key: 'menu_products',
    group: 'menu',
    hint: 'Navbar — mục «Sản phẩm»',
    values: { vi: 'Sản phẩm', en: 'Products', th: 'สินค้า' },
  },
  {
    key: 'menu_deposit',
    group: 'menu',
    hint: 'Navbar — nút «Nạp tiền» (góc phải header)',
    values: { vi: 'Nạp tiền', en: 'Deposit', th: 'เติมเงิน' },
  },
  {
    key: 'menu_history',
    group: 'menu',
    hint: 'Navbar — mục «Lịch sử» (nếu hiển thị)',
    values: { vi: 'Lịch sử', en: 'History', th: 'ประวัติ' },
  },
  {
    key: 'menu_affiliate',
    group: 'menu',
    hint: 'Menu tài khoản (dropdown avatar) — «Kiếm tiền / Affiliate»',
    values: { vi: 'Kiếm tiền / Affiliate', en: 'Affiliate', th: 'แอฟฟิลิเอต' },
  },
  {
    key: 'menu_order_history',
    group: 'menu',
    hint: 'Menu tài khoản — «Lịch sử đơn hàng»',
    values: { vi: 'Lịch sử đơn hàng', en: 'Order history', th: 'ประวัติคำสั่งซื้อ' },
  },
  {
    key: 'menu_transactions',
    group: 'menu',
    hint: 'Menu tài khoản — «Lịch sử giao dịch»',
    values: { vi: 'Lịch sử giao dịch', en: 'Transactions', th: 'ธุรกรรม' },
  },
  {
    key: 'auth_login',
    group: 'auth',
    hint: 'Modal đăng nhập — tab «Đăng nhập»',
    values: { vi: 'Đăng nhập', en: 'Log in', th: 'เข้าสู่ระบบ' },
  },
  {
    key: 'auth_register',
    group: 'auth',
    hint: 'Modal đăng nhập — tab «Đăng ký»',
    values: { vi: 'Đăng ký', en: 'Sign up', th: 'สมัคร' },
  },
  {
    key: 'auth_logout',
    group: 'auth',
    hint: 'Menu tài khoản — nút «Đăng xuất»',
    values: { vi: 'Đăng xuất', en: 'Log out', th: 'ออกจากระบบ' },
  },
  {
    key: 'product_buy_now',
    group: 'product',
    hint: 'Thẻ sản phẩm / modal — nút «Mua ngay»',
    values: { vi: 'Mua ngay', en: 'Buy now', th: 'ซื้อเลย' },
  },
  {
    key: 'product_preorder',
    group: 'product',
    hint: 'Thẻ sản phẩm — nút «Đặt trước» (khi hết kho)',
    values: { vi: 'Đặt trước', en: 'Pre-order', th: 'สั่งจอง' },
  },
  {
    key: 'product_out_of_stock',
    group: 'product',
    hint: 'Thẻ sản phẩm — nhãn «Hết hàng»',
    values: { vi: 'Hết hàng', en: 'Out of stock', th: 'สินค้าหมด' },
  },
  {
    key: 'product_sold',
    group: 'product',
    hint: 'Thẻ sản phẩm — số «Đã bán»',
    values: { vi: 'Đã bán', en: 'Sold', th: 'ขายแล้ว' },
  },
  {
    key: 'product_stock',
    group: 'product',
    hint: 'Thẻ sản phẩm — số «Kho» còn lại',
    values: { vi: 'Kho', en: 'Stock', th: 'คลัง' },
  },
  {
    key: 'product_sold_short',
    group: 'product',
    hint: 'Thẻ sản phẩm (compact) — nhãn «Bán»',
    values: { vi: 'Bán', en: 'Sold', th: 'ขาย' },
  },
  {
    key: 'product_price_label',
    group: 'product',
    hint: 'Thẻ sản phẩm — nhãn «Giá» (list)',
    values: { vi: 'Giá', en: 'Price', th: 'ราคา' },
  },
  {
    key: 'product_price',
    group: 'product',
    hint: 'Thẻ sản phẩm (no-cover) — cột «Giá»',
    values: { vi: 'Giá', en: 'Price', th: 'ราคา' },
  },
  {
    key: 'product_listed',
    group: 'product',
    hint: 'Thẻ sản phẩm (grid) — nhãn «Niêm yết»',
    values: { vi: 'Niêm yết', en: 'Listed', th: 'ราคา' },
  },
  {
    key: 'product_no_features',
    group: 'product',
    hint: 'Thẻ sản phẩm (no-cover) — «Chưa có mô tả tính năng»',
    values: { vi: 'Chưa có mô tả tính năng.', en: 'No feature description yet.', th: 'ยังไม่มีคำอธิบาย' },
  },
  {
    key: 'product_country',
    group: 'product',
    hint: 'Thẻ sản phẩm (no-cover) — cột «Quốc gia»',
    values: { vi: 'Quốc gia', en: 'Country', th: 'ประเทศ' },
  },
  {
    key: 'product_in_stock',
    group: 'product',
    hint: 'Thẻ sản phẩm (no-cover) — cột «Hiện có»',
    values: { vi: 'Hiện có', en: 'In stock', th: 'คงเหลือ' },
  },
  {
    key: 'product_view_detail',
    group: 'product',
    hint: 'Thẻ sản phẩm — nút «Xem chi tiết»',
    values: { vi: 'Xem chi tiết', en: 'View details', th: 'ดูรายละเอียด' },
  },
  {
    key: 'product_detail',
    group: 'product',
    hint: 'Thẻ sản phẩm (grid) — nút «Chi tiết»',
    values: { vi: 'Chi tiết', en: 'Details', th: 'รายละเอียด' },
  },
  {
    key: 'menu_account',
    group: 'menu',
    hint: 'Menu tài khoản — «Tài khoản của tôi»',
    values: { vi: 'Tài khoản của tôi', en: 'My account', th: 'บัญชีของฉัน' },
  },
  {
    key: 'menu_admin',
    group: 'menu',
    hint: 'Menu tài khoản — «Quản lý admin»',
    values: { vi: 'Quản lý admin', en: 'Admin panel', th: 'แผงแอดมิน' },
  },
  {
    key: 'menu_notifications',
    group: 'menu',
    hint: 'Menu tài khoản — «Thông báo»',
    values: { vi: 'Thông báo', en: 'Notifications', th: 'การแจ้งเตือน' },
  },
  {
    key: 'nav_view_all',
    group: 'menu',
    hint: 'Navbar dropdown — link «Xem tất cả»',
    values: { vi: 'Xem tất cả', en: 'View all', th: 'ดูทั้งหมด' },
  },
  {
    key: 'search_placeholder',
    group: 'menu',
    hint: 'Navbar — ô tìm kiếm placeholder',
    values: {
      vi: 'Tìm tài khoản, phần mềm, dịch vụ...',
      en: 'Search accounts, software, services...',
      th: 'ค้นหาบัญชี ซอฟต์แวร์ บริการ...',
    },
  },
  {
    key: 'cat_section_label',
    group: 'category',
    hint: 'Trang chủ — tiêu đề khối «Danh mục»',
    values: { vi: 'Danh mục', en: 'Categories', th: 'หมวดหมู่' },
  },
  {
    key: 'balance_label',
    group: 'wallet',
    hint: 'Menu tài khoản — dòng mô tả số dư (vd: «… trong tài khoản»)',
    values: { vi: 'Số dư', en: 'Balance', th: 'ยอดคงเหลือ' },
  },
  {
    key: 'cat_all',
    group: 'category',
    hint: 'Trang chủ — tab lọc «Tất cả sản phẩm»',
    values: { vi: 'Tất cả sản phẩm', en: 'All products', th: 'สินค้าทั้งหมด' },
  },
  {
    key: 'cat_tiktok',
    group: 'category',
    hint: 'Trang chủ — tab danh mục TikTok',
    values: { vi: 'TIKTOK VIỆT', en: 'TIKTOK VIETNAM', th: 'TIKTOK เวียดนาม' },
  },
  {
    key: 'cat_facebook',
    group: 'category',
    hint: 'Trang chủ — tab danh mục Facebook',
    values: { vi: 'CLONE FACEBOOK', en: 'FACEBOOK CLONE', th: 'โคลน FACEBOOK' },
  },
  {
    key: 'cat_gmail',
    group: 'category',
    hint: 'Trang chủ — tab danh mục Gmail',
    values: { vi: 'GMAIL VIỆT - NGOẠI', en: 'GMAIL ACCOUNTS', th: 'GMAIL' },
  },
  {
    key: 'page_order_history',
    group: 'page',
    hint: 'Trang Lịch sử đơn hàng — tiêu đề / heading',
    values: { vi: 'Lịch sử đơn hàng', en: 'Order history', th: 'ประวัติคำสั่งซื้อ' },
  },
  {
    key: 'page_transactions',
    group: 'page',
    hint: 'Trang Lịch sử giao dịch — tiêu đề / heading',
    values: { vi: 'Lịch sử giao dịch', en: 'Transaction history', th: 'ประวัติธุรกรรม' },
  },
  {
    key: 'page_deposit',
    group: 'page',
    hint: 'Trang Nạp tiền — tiêu đề / heading',
    values: { vi: 'Nạp tiền vào ví', en: 'Deposit funds', th: 'เติมเงิน' },
  },
  {
    key: 'currency_switch',
    group: 'ui',
    hint: 'Header — nhãn chọn tiền tệ (CurrencyLanguageSwitcher)',
    values: { vi: 'Tiền tệ', en: 'Currency', th: 'สกุลเงิน' },
  },
  {
    key: 'language_switch',
    group: 'ui',
    hint: 'Header — nhãn chọn ngôn ngữ (CurrencyLanguageSwitcher)',
    values: { vi: 'Ngôn ngữ', en: 'Language', th: 'ภาษา' },
  },
  {
    key: 'home_load_more',
    group: 'home',
    hint: 'Trang chủ — nút «Xem thêm sản phẩm»',
    values: { vi: 'Xem thêm sản phẩm', en: 'Load more products', th: 'ดูสินค้าเพิ่ม' },
  },
  {
    key: 'home_empty_category',
    group: 'home',
    hint: 'Trang chủ — khi danh mục trống',
    values: {
      vi: 'Chưa có sản phẩm nào trong danh mục này',
      en: 'No products in this category',
      th: 'ไม่มีสินค้าในหมวดนี้',
    },
  },
  {
    key: 'home_view_all_products',
    group: 'home',
    hint: 'Trang chủ — link «Xem tất cả sản phẩm»',
    values: { vi: 'Xem tất cả sản phẩm', en: 'View all products', th: 'ดูสินค้าทั้งหมด' },
  },
  {
    key: 'home_category_prefix',
    group: 'home',
    hint: 'Trang chủ — tiêu đề khối danh mục (tiền tố «Danh mục»)',
    values: { vi: 'Danh mục', en: 'Category', th: 'หมวด' },
  },
  {
    key: 'home_category_click_hint',
    group: 'home',
    hint: 'Trang chủ — gợi ý «Nhấp để xem tất cả» trên khối danh mục',
    values: { vi: 'Nhấp để xem tất cả', en: 'Click to view all', th: 'คลิกเพื่อดูทั้งหมด' },
  },
  {
    key: 'page_not_found',
    group: 'page',
    hint: 'Trang extra — «Không tìm thấy trang»',
    values: { vi: 'Không tìm thấy trang', en: 'Page not found', th: 'ไม่พบหน้า' },
  },
  {
    key: 'home_back',
    group: 'page',
    hint: 'Nút «Về trang chủ»',
    values: { vi: 'Về trang chủ', en: 'Back to home', th: 'กลับหน้าแรก' },
  },
  {
    key: 'page_transactions_subtitle',
    group: 'page',
    hint: 'Trang lịch sử giao dịch — mô tả phụ',
    values: {
      vi: 'Nạp tiền, cộng/trừ tiền, mua hàng và hoàn tiền',
      en: 'Deposits, credits, purchases and refunds',
      th: 'เติมเงิน ซื้อ คืนเงิน',
    },
  },
  {
    key: 'footer_copyright',
    group: 'footer',
    hint: 'Footer — dòng bản quyền',
    values: {
      vi: '© 2026 TapHoaMMO. Hệ thống mua bán tài nguyên tự động.',
      en: '© 2026 TapHoaMMO. Automated digital goods marketplace.',
      th: '© 2026 TapHoaMMO',
    },
  },
  {
    key: 'footer_terms',
    group: 'footer',
    hint: 'Footer — link «Điều khoản»',
    values: { vi: 'Điều khoản', en: 'Terms', th: 'ข้อกำหนด' },
  },
  {
    key: 'footer_privacy',
    group: 'footer',
    hint: 'Footer — link «Bảo mật»',
    values: { vi: 'Bảo mật', en: 'Privacy', th: 'ความเป็นส่วนตัว' },
  },
  {
    key: 'footer_api',
    group: 'footer',
    hint: 'Footer — link «API»',
    values: { vi: 'API', en: 'API', th: 'API' },
  },
];

export function getTranslationEntryHint(entry: Pick<TranslationEntry, 'key' | 'group' | 'hint'>): string {
  if (entry.hint?.trim()) return entry.hint.trim();
  const groupLabel = TRANSLATION_GROUP_LABELS[entry.group] ?? entry.group;
  return `${groupLabel} — key «${entry.key}»`;
}
