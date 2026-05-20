export type AffiliateCommissionMode = 'first_order' | 'lifetime';

export type AffiliateCommissionStatus = 'pending' | 'credited' | 'reversed';

export type AffiliateWithdrawalMethod = 'bank' | 'momo' | 'crypto' | 'other';

export type AffiliateWithdrawalStatus = 'pending' | 'approved' | 'rejected';

export interface AffiliateSettings {
  enabled: boolean;
  defaultCommissionPercent: number;
  minWithdrawalAmount: number;
  commissionMode: AffiliateCommissionMode;
  autoApproveCommission: boolean;
  cookieTtlDays: number;
  updatedAt: string;
}

export interface AffiliateCommission {
  id: string;
  referrerUserId: string;
  referrerUsername: string;
  buyerUserId: string;
  buyerUsername: string;
  orderId: string;
  orderAmount: number;
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
  pending: 'Chờ duyệt',
  credited: 'Đã cộng số dư',
  reversed: 'Đã thu hồi',
};

export const AFFILIATE_WITHDRAWAL_STATUS_LABELS: Record<AffiliateWithdrawalStatus, string> = {
  pending: 'Chờ duyệt',
  approved: 'Thành công',
  rejected: 'Bị từ chối',
};
