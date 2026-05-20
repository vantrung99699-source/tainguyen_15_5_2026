export type TransactionType =
  | 'deposit'
  | 'credit'
  | 'debit'
  | 'purchase'
  | 'refund';

export interface DepositHistoryRecord {
  id: string;
  amount: number;
  time: string;
  method: string;
  bonusAmount: number;
}

export interface WalletTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  time: string;
  note: string;
}
