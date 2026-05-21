export type PromoDiscountType = 'percent' | 'fixed';

export type PromoAppliesTo = 'all' | 'instant' | 'preorder';

export interface PromoCode {
  id: string;
  code: string;
  name: string;
  discountType: PromoDiscountType;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number;
  usageLimit: number | null;
  usedCount: number;
  perUserLimit: number;
  appliesTo: PromoAppliesTo;
  enabled: boolean;
  startsAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface PromoCodeUsage {
  id: string;
  promoCodeId: string;
  code: string;
  userId: string;
  orderId: string;
  discountAmount: number;
  usedAt: string;
}

export interface AppliedPromoResult {
  promoId: string;
  code: string;
  discountAmount: number;
  subtotal: number;
  total: number;
}
