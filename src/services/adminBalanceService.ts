import type { ManagedUser } from '../types/user';
import { DEFAULT_REFERRAL_RATE } from '../types/user';
import { initialManagedUsers } from '../pages/admin/userData';
import { appendBalanceHistory } from '../pages/admin/userBalanceHistory';
import {
  adjustUserBalanceById,
  findUserById,
  formatUserMoney,
  getReferralRate,
  loadManagedUsers,
  saveManagedUsers,
} from './userAdmin';
import {
  findCreditedDepositCommissionsByAmount,
  loadAffiliateSettings,
  reverseDepositCommission,
} from './affiliateService';
import { dispatchDepositSuccess } from './notificationDispatcher';
import { addWalletTransaction } from './walletTransactionService';

export type AdminBalanceMode =
  | 'manual_credit'
  | 'manual_debit'
  | 'bank_deposit'
  | 'deposit_reversal';

export interface DepositReferrerPreview {
  referrer: ManagedUser;
  commissionPercent: number;
  affiliateEnabled: boolean;
}

export type ApplyAdminBalanceResult =
  | {
      ok: true;
      balance: number;
      totalDeposit: number;
      commissionAmount?: number;
      referrerUsername?: string;
      reversedCommissionAmount?: number;
      reversedCommissionCount?: number;
    }
  | { ok: false; error: string };

function commissionPercentForReferrer(referrer: ManagedUser): number {
  const settings = loadAffiliateSettings();
  const custom = getReferralRate(referrer);
  if (custom !== DEFAULT_REFERRAL_RATE) return custom;
  return settings.defaultCommissionPercent;
}

export function getDepositReferrerPreview(user: ManagedUser): DepositReferrerPreview | null {
  if (!user.referredByUserId) return null;
  const referrer = findUserById(user.referredByUserId, initialManagedUsers);
  if (!referrer) return null;
  const settings = loadAffiliateSettings();
  return {
    referrer,
    commissionPercent: commissionPercentForReferrer(referrer),
    affiliateEnabled: settings.enabled,
  };
}

export function estimateDepositCommission(amount: number, percent: number): number {
  if (amount <= 0 || percent <= 0) return 0;
  return Math.floor((amount * percent) / 100);
}

function defaultNote(mode: AdminBalanceMode): string {
  switch (mode) {
    case 'manual_credit':
      return 'Admin cộng tiền thủ công';
    case 'manual_debit':
      return 'Admin trừ tiền thủ công';
    case 'bank_deposit':
      return 'Nạp tiền qua ngân hàng (admin xác nhận)';
    case 'deposit_reversal':
      return 'Hoàn nạp nhầm — trừ số dư & thu hồi hoa hồng';
  }
}

function reverseCommissions(
  buyerUserId: string,
  amount: number,
  commissionIds: string[] | undefined,
  reason: string,
): { totalReversed: number; count: number; error?: string } {
  const matches =
    commissionIds && commissionIds.length > 0
      ? findCreditedDepositCommissionsByAmount(buyerUserId, amount).filter((c) =>
          commissionIds.includes(c.id),
        )
      : findCreditedDepositCommissionsByAmount(buyerUserId, amount);

  let totalReversed = 0;
  for (const c of matches) {
    const result = reverseDepositCommission(c.id, reason);
    if (!result.ok) return { totalReversed, count: 0, error: result.error };
    totalReversed += c.commissionAmount;
  }
  return { totalReversed, count: matches.length };
}

export function applyAdminBalanceChange(params: {
  user: ManagedUser;
  mode: AdminBalanceMode;
  amount: number;
  note?: string;
  /** Thu hồi hoa hồng khớp số tiền (manual_debit) */
  reverseCommissionIds?: string[];
}): ApplyAdminBalanceResult {
  const amount = Math.floor(params.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: 'Số tiền phải lớn hơn 0.' };
  }

  const users = loadManagedUsers(initialManagedUsers);
  const current = users.find((u) => u.id === params.user.id);
  if (!current) return { ok: false, error: 'Không tìm thấy tài khoản.' };

  if (
    (params.mode === 'manual_debit' || params.mode === 'deposit_reversal') &&
    current.balance < amount
  ) {
    return {
      ok: false,
      error: `Số dư không đủ (hiện có ${formatUserMoney(current.balance)}).`,
    };
  }

  const note = params.note?.trim() || defaultNote(params.mode);
  let reversedCommissionAmount = 0;
  let reversedCommissionCount = 0;

  if (params.mode === 'deposit_reversal') {
    const reversal = reverseCommissions(
      params.user.id,
      amount,
      undefined,
      note,
    );
    if (reversal.error) return { ok: false, error: reversal.error };
    reversedCommissionAmount = reversal.totalReversed;
    reversedCommissionCount = reversal.count;
  } else if (
    params.mode === 'manual_debit' &&
    params.reverseCommissionIds &&
    params.reverseCommissionIds.length > 0
  ) {
    const reversal = reverseCommissions(
      params.user.id,
      amount,
      params.reverseCommissionIds,
      note,
    );
    if (reversal.error) return { ok: false, error: reversal.error };
    reversedCommissionAmount = reversal.totalReversed;
    reversedCommissionCount = reversal.count;
  }

  const delta =
    params.mode === 'manual_debit' || params.mode === 'deposit_reversal' ? -amount : amount;
  const after = adjustUserBalanceById(params.user.id, delta);

  let totalDeposit = current.totalDeposit;
  if (params.mode === 'bank_deposit') {
    totalDeposit += amount;
  } else if (params.mode === 'deposit_reversal') {
    totalDeposit = Math.max(0, totalDeposit - amount);
  }

  if (params.mode === 'bank_deposit' || params.mode === 'deposit_reversal') {
    const refreshed = loadManagedUsers(initialManagedUsers).map((u) =>
      u.id === params.user.id ? { ...u, totalDeposit } : u,
    );
    saveManagedUsers(refreshed);
  }

  if (params.mode === 'bank_deposit') {
    addWalletTransaction({
      userId: params.user.id,
      type: 'deposit',
      amount,
      balanceAfter: after.balance,
      note,
    });
    void dispatchDepositSuccess({
      userId: params.user.id,
      amount,
      balanceAfter: after.balance,
    });
  } else if (params.mode === 'manual_credit') {
    addWalletTransaction({
      userId: params.user.id,
      type: 'credit',
      amount,
      balanceAfter: after.balance,
      note,
    });
  } else {
    addWalletTransaction({
      userId: params.user.id,
      type: 'debit',
      amount,
      balanceAfter: after.balance,
      note,
    });
  }

  appendBalanceHistory(params.user.id, {
    type: params.mode === 'manual_debit' || params.mode === 'deposit_reversal' ? 'debit' : 'credit',
    amount,
    balanceAfter: after.balance,
    description: note,
  });

  const preview =
    params.mode === 'bank_deposit' ? getDepositReferrerPreview(params.user) : null;
  const commissionAmount =
    preview?.affiliateEnabled && preview.commissionPercent > 0
      ? estimateDepositCommission(amount, preview.commissionPercent)
      : undefined;

  return {
    ok: true,
    balance: after.balance,
    totalDeposit,
    commissionAmount: commissionAmount && commissionAmount > 0 ? commissionAmount : undefined,
    referrerUsername: preview?.referrer.username,
    reversedCommissionAmount:
      reversedCommissionAmount > 0 ? reversedCommissionAmount : undefined,
    reversedCommissionCount: reversedCommissionCount > 0 ? reversedCommissionCount : undefined,
  };
}
