export type AffiliateCommissionSource = 'deposit' | 'order';

export type AffiliateCommissionStatus = 'pending' | 'credited' | 'reversed';

export type AffiliateWithdrawalMethod = 'bank' | 'momo' | 'crypto' | 'other';

export type AffiliateWithdrawalStatus = 'pending' | 'approved' | 'rejected';

export interface AffiliateSettings {
  enabled: boolean;
  defaultCommissionPercent: number;
  minWithdrawalAmount: number;
  cookieTtlDays: number;
  updatedAt: string;
}

export interface AffiliateCommission {
  id: string;
  referrerUserId: string;
  referrerUsername: string;
  buyerUserId: string;
  buyerUsername: string;
  /** Mã giao dịch nạp tiền (hoặc mã đơn — dữ liệu cũ) */
  orderId: string;
  /** Số tiền nạp / giá trị đơn (dữ liệu cũ) */
  orderAmount: number;
  sourceType?: AffiliateCommissionSource;
  depositTransactionId?: string;
  commissionPercent: number;
  commissionAmount: number;
  status: AffiliateCommissionStatus;
  createdAt: string;
  creditedAt: string | null;
  reversedAt: string | null;
  note: string;
}

export interface AffiliateWithdrawal {
  id: string;
  userId: string;
  username: string;
  amount: number;
  method: AffiliateWithdrawalMethod;
  accountInfo: string;
  accountName: string;
  status: AffiliateWithdrawalStatus;
  rejectReason: string | null;
  createdAt: string;
  processedAt: string | null;
}

export interface AffiliateCampaignLink {
  id: string;
  userId: string;
  label: string;
  targetPath: string;
  shortCode: string;
  createdAt: string;
}

export interface RefAttribution {
  referralCode: string;
  referrerUserId: string;
  capturedAt: number;
  expiresAt: number;
  visitorFingerprint: string;
}

export const AFFILIATE_WITHDRAWAL_METHOD_LABELS: Record<AffiliateWithdrawalMethod, string> = {
  bank: 'Ngân hàng',
  momo: 'Ví MoMo / ZaloPay',
  crypto: 'Crypto (USDT)',
  other: 'Khác',
};

export const AFFILIATE_COMMISSION_STATUS_LABELS: Record<AffiliateCommissionStatus, string> = {
  pending: 'Đang xử lý',
  credited: 'Đã cộng ngay',
  reversed: 'Đã thu hồi',
};

export const AFFILIATE_WITHDRAWAL_STATUS_LABELS: Record<AffiliateWithdrawalStatus, string> = {
  pending: 'Chờ duyệt',
  approved: 'Thành công',
  rejected: 'Bị từ chối',
};
