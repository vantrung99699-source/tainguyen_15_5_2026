export type GatewayStatus = 'connected' | 'disconnected' | 'error';
export type Environment = 'sandbox' | 'production';
export type ProviderType = 'bank' | 'third_party';
export type DepositCurrency = 'VND' | 'USD';

/** Kiểu nội dung chuyển khoản khi khách nạp tiền */
export type DepositSyntaxType = 'prefix_id' | 'fullname_transfer';

export interface PaymentGateway {
  id: string;
  bankCode: string;
  bankName: string;
  shortName: string;
  color: string;
  status: GatewayStatus;
  environment: Environment;
  merchantId: string;
  apiEndpoint: string;
  webhookUrl: string;
  lastSync: string;
  todayVolume: number;
  enabled: boolean;
  providerType: ProviderType;
  /** Số tiền nạp tối thiểu */
  minDepositAmount: number;
  minDepositCurrency: DepositCurrency;
  /** Lưu ý hiển thị trên trang nạp tiền khi khách chọn cổng này */
  depositNote: string;
  /** STK nhận (hiển thị QR VietQR) */
  accountNumber: string;
  accountHolder: string;
  /** Bật khuyến mãi nạp riêng cổng này */
  depositPromotionEnabled: boolean;
  /** Bậc khuyến mãi theo loại tiền của cổng (minDepositCurrency) */
  depositPromotionTiers: DepositPromotionTier[];
}

/** Bậc khuyến mãi khi nạp tiền (theo khoảng số tiền) */
export interface DepositPromotionTier {
  id: string;
  minAmount: number;
  /** null = không giới hạn trên */
  maxAmount: number | null;
  /** % thưởng thêm vào ví (VD: 1 = +1%) */
  bonusPercent: number;
  currency: DepositCurrency;
}

export interface PaymentGlobalSettings {
  globalWebhook: string;
  autoConfirm: boolean;
  /** Lưu ý chung trên trang nạp tiền của khách hàng */
  globalDepositNote: string;
  /** Bật cú pháp nội dung (Trạng thái ON) */
  depositSyntaxEnabled: boolean;
  depositSyntaxType: DepositSyntaxType;
  /** Prefix khi kiểu = Prefix + ID (VD: NAPTIEN) */
  depositPrefix: string;
}

/** Khuyến mãi nạp tiền toàn hệ thống (áp dụng mọi cổng, không phải mã coupon) */
export interface GlobalDepositPromotionSettings {
  enabled: boolean;
  /** Tên chương trình (hiển thị admin / gợi ý khách) */
  name: string;
  /** ISO datetime — null = không giới hạn thời gian */
  endsAt: string | null;
  currency: DepositCurrency;
  /** true = nhiều bậc theo số tiền; false = một mức % cố định */
  useTierMilestones: boolean;
  flatBonusPercent: number;
  flatMinAmount: number;
  tiers: DepositPromotionTier[];
}

export interface DepositUserProfile {
  id: string;
  username: string;
  fullName: string;
}

export type BankCatalogEntry = Pick<
  PaymentGateway,
  'id' | 'bankCode' | 'bankName' | 'shortName' | 'color' | 'apiEndpoint' | 'webhookUrl' | 'providerType'
>;

export interface Transaction {
  id: string;
  username: string;
  amount: number;
  bank: string;
  status: 'success' | 'pending' | 'failed';
  date: string;
  ref: string;
  content: string;
  note: string;
}

export const DEFAULT_MIN_DEPOSIT_VND = 1000;
export const DEFAULT_MIN_DEPOSIT_USD = 1;
