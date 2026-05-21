import type { PreorderStatus } from './preorder';

export type CustomerOrderKind = 'instant' | 'preorder';

export type CustomerOrderStatus =
  | 'completed'
  | 'pending'
  | 'cancelled'
  | 'refunded'
  | 'partial_refunded';

export interface CustomerOrder {
  id: string;
  kind: CustomerOrderKind;
  userId: string;
  username: string;
  shopId: number;
  itemId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  refundedAmount: number;
  status: CustomerOrderStatus;
  createdAt: string;
  note: string;
  /** Tổng trước giảm */
  subtotalAmount?: number;
  discountAmount?: number;
  promoCode?: string | null;
  deliveredContents: string[];
  preorderStatus?: PreorderStatus;
  /** Đã tạo hoa hồng affiliate cho đơn này */
  affiliateCommissionPaid?: boolean;
  affiliateCommissionId?: string | null;
}

export type RefundMode = 'full' | 'partial' | 'percent';
