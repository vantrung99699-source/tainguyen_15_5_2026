import type { AffiliateCommission } from '../types/affiliate';

const SEED_KEY = 'taphoammo_affiliate_demo_seeded';

export function ensureDemoAffiliateCommissions() {
  if (localStorage.getItem(SEED_KEY)) return;
  const existing = localStorage.getItem('taphoammo_affiliate_commissions');
  if (existing) {
    try {
      const parsed = JSON.parse(existing) as unknown[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        localStorage.setItem(SEED_KEY, '1');
        return;
      }
    } catch {
      /* continue seed */
    }
  }

  const now = Date.now();
  const demo: AffiliateCommission[] = [
    {
      id: `AFF${now - 86400000}`,
      referrerUserId: '8821',
      referrerUsername: 'minhnv',
      buyerUserId: '9104',
      buyerUsername: 'lantran',
      orderId: 'DH-DEMO-001',
      orderAmount: 450_000,
      commissionPercent: 8,
      commissionAmount: 36_000,
      status: 'credited',
      createdAt: new Date(now - 86400000).toISOString(),
      creditedAt: new Date(now - 86400000).toISOString(),
      reversedAt: null,
      note: 'Hoa hồng đơn demo',
    },
    {
      id: `AFF${now - 43200000}`,
      referrerUserId: '8821',
      referrerUsername: 'minhnv',
      buyerUserId: '9104',
      buyerUsername: 'lantran',
      orderId: 'DH-DEMO-002',
      orderAmount: 120_000,
      commissionPercent: 8,
      commissionAmount: 9_600,
      status: 'pending',
      createdAt: new Date(now - 43200000).toISOString(),
      creditedAt: null,
      reversedAt: null,
      note: 'Chờ duyệt — demo',
    },
  ];
  localStorage.setItem('taphoammo_affiliate_commissions', JSON.stringify(demo));
  localStorage.setItem(SEED_KEY, '1');
}
