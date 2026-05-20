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
  deliveredContents: string[];
  preorderStatus?: PreorderStatus;
}

export type RefundMode = 'full' | 'partial' | 'percent';
