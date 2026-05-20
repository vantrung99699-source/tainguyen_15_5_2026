import type { WalletTransaction, TransactionType } from '../types/customerWallet';
import type { AdminBalanceMovement } from '../types/adminHistory';
import { loadCustomerSession } from './customerSession';
import { resolveUsernameById } from './userAdmin';

export const WALLET_TX_UPDATED = 'taphoammo-wallet-tx-updated';
const STORAGE_KEY = 'taphoammo_wallet_transactions';

export interface StoredWalletTransaction extends WalletTransaction {
  userId: string;
  orderId?: string;
}

function emitUpdated() {
  window.dispatchEvent(new CustomEvent(WALLET_TX_UPDATED));
}

export function loadAllWalletTransactions(): StoredWalletTransaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredWalletTransaction[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAll(list: StoredWalletTransaction[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  emitUpdated();
}

export function getTransactionsForUser(userId: string): WalletTransaction[] {
  return loadAllWalletTransactions()
    .filter((t) => t.userId === userId)
    .sort((a, b) => b.time.localeCompare(a.time))
    .map(({ userId: _u, orderId: _o, ...tx }) => tx);
}

/** Biến động ví toàn hệ thống — dùng tab Lịch sử admin */
export function getAdminBalanceMovements(): AdminBalanceMovement[] {
  return loadAllWalletTransactions()
    .map((tx) => ({
      id: tx.id,
      userId: tx.userId,
      username: resolveUsernameById(tx.userId),
      type: tx.type,
      amount: tx.amount,
      balanceAfter: tx.balanceAfter,
      time: tx.time,
      note: tx.note,
    }))
    .sort((a, b) => b.time.localeCompare(a.time));
}

export function addWalletTransaction(params: {
  userId: string;
  type: TransactionType;
  amount: number;
  note: string;
  orderId?: string;
  balanceAfter?: number;
}): StoredWalletTransaction {
  const session = loadCustomerSession();
  const balanceAfter =
    params.balanceAfter ??
    (params.userId === session.userId ? session.balance : 0);

  const tx: StoredWalletTransaction = {
    id: `TX${Date.now()}`,
    userId: params.userId,
    type: params.type,
    amount: params.amount,
    balanceAfter,
    time: new Date().toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    note: params.note,
    orderId: params.orderId,
  };
  saveAll([tx, ...loadAllWalletTransactions()]);
  return tx;
}
