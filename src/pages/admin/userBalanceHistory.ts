import type { BalanceTransaction } from '../../types/user';

export const mockBalanceHistory: Record<string, BalanceTransaction[]> = {
  '8821': [
    {
      id: 'tx-8821-1',
      type: 'credit',
      amount: 1_000_000,
      balanceAfter: 2_500_000,
      description: 'Nạp tiền qua Vietcombank — NAPTIEN 8821',
      createdAt: '2026-05-19T10:15:00',
    },
    {
      id: 'tx-8821-2',
      type: 'credit',
      amount: 500_000,
      balanceAfter: 1_500_000,
      description: 'Admin cộng tiền — khuyến mãi VIP',
      createdAt: '2026-05-15T14:30:00',
    },
    {
      id: 'tx-8821-3',
      type: 'debit',
      amount: 200_000,
      balanceAfter: 1_000_000,
      description: 'Trừ tiền — hoàn đơn #ORD-9921',
      createdAt: '2026-05-12T09:00:00',
    },
    {
      id: 'tx-8821-4',
      type: 'credit',
      amount: 1_200_000,
      balanceAfter: 1_200_000,
      description: 'Nạp tiền qua Techcombank',
      createdAt: '2026-05-01T16:45:00',
    },
  ],
  '9104': [
    {
      id: 'tx-9104-1',
      type: 'credit',
      amount: 850_000,
      balanceAfter: 850_000,
      description: 'Nạp tiền qua MB Bank',
      createdAt: '2026-05-18T08:00:00',
    },
    {
      id: 'tx-9104-2',
      type: 'debit',
      amount: 50_000,
      balanceAfter: 0,
      description: 'Trừ tiền — mua dịch vụ Facebook',
      createdAt: '2026-05-10T11:20:00',
    },
  ],
  '7733': [
    {
      id: 'tx-7733-1',
      type: 'credit',
      amount: 500_000,
      balanceAfter: 500_000,
      description: 'Nạp tiền lần đầu',
      createdAt: '2025-03-21T10:00:00',
    },
    {
      id: 'tx-7733-2',
      type: 'debit',
      amount: 500_000,
      balanceAfter: 0,
      description: 'Trừ tiền — vi phạm điều khoản (admin)',
      createdAt: '2025-04-02T22:30:00',
    },
  ],
  '6601': [
    {
      id: 'tx-6601-1',
      type: 'credit',
      amount: 99_000_000,
      balanceAfter: 99_000_000,
      description: 'Admin cộng tiền test hệ thống',
      createdAt: '2026-05-19T16:00:00',
    },
  ],
};

export function getBalanceHistory(userId: string): BalanceTransaction[] {
  return mockBalanceHistory[userId] ?? [];
}
