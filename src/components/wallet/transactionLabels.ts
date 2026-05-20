import type { TransactionType } from '../../types/customerWallet';

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  deposit: 'Nạp tiền',
  credit: 'Cộng tiền',
  debit: 'Trừ tiền',
  purchase: 'Trừ tiền mua hàng',
  refund: 'Cộng tiền hoàn hàng',
};

export const TRANSACTION_TYPE_STYLES: Record<TransactionType, string> = {
  deposit: 'bg-emerald-100 text-emerald-800',
  credit: 'bg-sky-100 text-sky-800',
  debit: 'bg-red-100 text-red-700',
  purchase: 'bg-orange-100 text-orange-800',
  refund: 'bg-violet-100 text-violet-800',
};
