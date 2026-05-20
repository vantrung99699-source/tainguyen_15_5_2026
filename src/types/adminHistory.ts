import type { TransactionType } from './customerWallet';

/** Biến động số dư ví khách (toàn hệ thống) */
export interface AdminBalanceMovement {
  id: string;
  userId: string;
  username: string;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  time: string;
  note: string;
}

export type BankLedgerKind =
  | 'bank_credit'
  | 'bank_debit'
  | 'manual_credit'
  | 'manual_debit';

/** Lịch sử ngân hàng / sổ quỹ cổng thanh toán */
export interface BankLedgerEntry {
  id: string;
  kind: BankLedgerKind;
  gatewayId: string;
  bankName: string;
  username: string;
  amount: number;
  ref: string;
  note: string;
  time: string;
  status: 'success' | 'pending' | 'failed';
}

export type NotificationLogStatus = 'sent' | 'failed' | 'pending';

export interface TelegramNotificationLog {
  id: string;
  username: string;
  telegramUsername: string;
  event: string;
  message: string;
  status: NotificationLogStatus;
  time: string;
}

export interface EmailNotificationLog {
  id: string;
  username: string;
  email: string;
  subject: string;
  status: NotificationLogStatus;
  time: string;
}
