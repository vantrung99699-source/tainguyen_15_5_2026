export type PreorderStatus =
  | 'pending_admin'
  | 'approved'
  | 'fulfilled'
  | 'rejected'
  | 'cancelled_by_user'
  | 'expired_refunded';

export interface PreorderOrder {
  id: string;
  userId: string;
  username: string;
  shopId: number;
  itemId: number;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  subtotalAmount?: number;
  discountAmount?: number;
  promoCode?: string | null;
  maxWaitDays: number;
  createdAt: string;
  expiresAt: string;
  status: PreorderStatus;
  deliveredContents: string[];
  processedAt: string | null;
  rejectReason: string | null;
}
