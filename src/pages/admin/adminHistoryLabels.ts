import type { BankLedgerKind, NotificationLogStatus } from '../../types/adminHistory';
import {
  TRANSACTION_TYPE_LABELS,
  TRANSACTION_TYPE_STYLES,
} from '../../components/wallet/transactionLabels';

export { TRANSACTION_TYPE_LABELS, TRANSACTION_TYPE_STYLES };

export const BANK_LEDGER_LABELS: Record<BankLedgerKind, string> = {
  bank_credit: 'Cộng từ ngân hàng',
  bank_debit: 'Trừ ngân hàng',
  manual_credit: 'Cộng thủ công',
  manual_debit: 'Trừ thủ công',
};

export const BANK_LEDGER_STYLES: Record<BankLedgerKind, string> = {
  bank_credit: 'bg-emerald-100 text-emerald-800',
  bank_debit: 'bg-red-100 text-red-700',
  manual_credit: 'bg-sky-100 text-sky-800',
  manual_debit: 'bg-orange-100 text-orange-800',
};

export const NOTIFY_STATUS_LABELS: Record<NotificationLogStatus, string> = {
  sent: 'Đã gửi',
  failed: 'Thất bại',
  pending: 'Đang gửi',
};

export const NOTIFY_STATUS_STYLES: Record<NotificationLogStatus, string> = {
  sent: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-red-100 text-red-700',
  pending: 'bg-amber-100 text-amber-800',
};
