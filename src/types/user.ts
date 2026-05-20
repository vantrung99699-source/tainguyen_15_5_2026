export type UserRole = 'admin' | 'user' | 'seller' | 'vip';
export type UserStatus = 'active' | 'blocked' | 'pending';

/** Tỷ lệ giới thiệu mặc định — không hiển thị % nếu user dùng mức này */
export const DEFAULT_REFERRAL_RATE = 5;

export interface UserLoginInfo {
  lastLoginAt: string;
  device: string;
  ip: string;
}

export interface ManagedUser {
  id: string;
  username: string;
  email: string;
  phone: string;
  fullName: string;
  balance: number;
  totalDeposit: number;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  referralCount: number;
  /** Mã ref — link ?ref=CODE */
  referralCode: string;
  /** User giới thiệu khi đăng ký */
  referredByUserId?: string | null;
  /** Số dư hoa hồng có thể rút */
  affiliateBalance: number;
  /** Tổng hoa hồng đã nhận (lịch sử) */
  affiliateTotalEarned: number;
  /** Tổng doanh thu đơn cấp dưới */
  affiliateRevenue: number;
  /** % hoa hồng giới thiệu (ẩn nếu bằng DEFAULT_REFERRAL_RATE) */
  referralRatePercent: number;
  /** % chiết khấu mua hàng */
  discountPercent: number;
  has2FA: boolean;
  /** API key của user (demo) */
  apiKey: string;
  /** Phiên đăng nhập đang hoạt động */
  sessionActive: boolean;
  loginInfo: UserLoginInfo;
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  user: 'Người dùng',
  seller: 'Nhà bán',
  vip: 'VIP',
};

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  active: 'Hoạt động',
  blocked: 'Đã khóa',
  pending: 'Chờ duyệt',
};

export type BalanceTxnType = 'credit' | 'debit';

export interface BalanceTransaction {
  id: string;
  type: BalanceTxnType;
  amount: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}
