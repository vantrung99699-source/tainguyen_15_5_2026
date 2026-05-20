import type { DepositHistoryRecord, WalletTransaction } from '../types/customerWallet';

export const MOCK_DEPOSIT_HISTORY: DepositHistoryRecord[] = [
  { id: '1', amount: 500_000, time: '19/05/2026 09:42', method: 'Vietcombank — Chuyển khoản', bonusAmount: 50_000 },
  { id: '2', amount: 200_000, time: '17/05/2026 21:15', method: 'Techcombank — Chuyển khoản', bonusAmount: 0 },
  { id: '3', amount: 1_000_000, time: '15/05/2026 14:08', method: 'Momo — Ví điện tử', bonusAmount: 100_000 },
  { id: '4', amount: 100_000, time: '12/05/2026 08:30', method: 'MB Bank — Chuyển khoản', bonusAmount: 10_000 },
  { id: '5', amount: 300_000, time: '08/05/2026 16:55', method: 'ACB — Chuyển khoản', bonusAmount: 0 },
  { id: '6', amount: 50_000, time: '05/05/2026 11:20', method: 'ZaloPay — Ví điện tử', bonusAmount: 5_000 },
];

export const MOCK_WALLET_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'TX1006',
    type: 'deposit',
    amount: 500_000,
    balanceAfter: 2_500_000,
    time: '19/05/2026 09:43',
    note: 'Nạp tiền qua Vietcombank (+ KM 50.000đ)',
  },
  {
    id: 'TX1005',
    type: 'purchase',
    amount: -150_000,
    balanceAfter: 2_000_000,
    time: '18/05/2026 15:22',
    note: 'Mua TIKTOK >1K FL — Đơn #DH001240',
  },
  {
    id: 'TX1004',
    type: 'refund',
    amount: 45_000,
    balanceAfter: 2_150_000,
    time: '18/05/2026 10:05',
    note: 'Hoàn tiền đơn #DH001238 (hủy đơn)',
  },
  {
    id: 'TX1003',
    type: 'credit',
    amount: 20_000,
    balanceAfter: 2_105_000,
    time: '17/05/2026 18:40',
    note: 'Admin cộng tiền — Khuyến mãi thành viên mới',
  },
  {
    id: 'TX1002',
    type: 'debit',
    amount: -30_000,
    balanceAfter: 2_085_000,
    time: '16/05/2026 09:12',
    note: 'Admin trừ tiền — Điều chỉnh sai số dư',
  },
  {
    id: 'TX1001',
    type: 'deposit',
    amount: 200_000,
    balanceAfter: 2_115_000,
    time: '17/05/2026 21:16',
    note: 'Nạp tiền qua Techcombank',
  },
  {
    id: 'TX1000',
    type: 'purchase',
    amount: -850_000,
    balanceAfter: 1_915_000,
    time: '14/05/2026 11:30',
    note: 'Mua TIKTOK >10K FL — Đơn #DH001237',
  },
];
