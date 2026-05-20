import type { ManagedUser } from '../types/user';
import { DEFAULT_REFERRAL_RATE } from '../types/user';
import { loadCustomerSession, saveCustomerSession } from './customerSession';

const USERS_KEY = 'taphoammo_managed_users';

function normalizeUser(raw: Partial<ManagedUser> & Record<string, unknown>): ManagedUser {
  return {
    id: String(raw.id ?? ''),
    username: String(raw.username ?? ''),
    email: String(raw.email ?? ''),
    phone: String(raw.phone ?? ''),
    fullName: String(raw.fullName ?? ''),
    balance: Number(raw.balance ?? 0),
    totalDeposit: Number(raw.totalDeposit ?? 0),
    role: (['admin', 'user', 'seller', 'vip'].includes(String(raw.role))
      ? raw.role
      : 'user') as ManagedUser['role'],
    status: (['active', 'blocked', 'pending'].includes(String(raw.status))
      ? raw.status
      : 'active') as ManagedUser['status'],
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
    referralCount: Number(raw.referralCount ?? 0),
    referralCode: (() => {
      const code = String(raw.referralCode ?? raw.username ?? '').trim().toLowerCase();
      return code || `user${String(raw.id ?? Date.now())}`;
    })(),
    referredByUserId: raw.referredByUserId != null ? String(raw.referredByUserId) : null,
    affiliateBalance: Number(raw.affiliateBalance ?? 0),
    affiliateTotalEarned: Number(raw.affiliateTotalEarned ?? 0),
    affiliateRevenue: Number(raw.affiliateRevenue ?? 0),
    referralRatePercent: (() => {
      const v = raw.referralRatePercent ?? raw.referralRate;
      const n = Number(v);
      return Number.isFinite(n) ? n : DEFAULT_REFERRAL_RATE;
    })(),
    discountPercent: (() => {
      const n = Number(raw.discountPercent);
      return Number.isFinite(n) ? n : 0;
    })(),
    has2FA: Boolean(raw.has2FA),
    apiKey: (() => {
      const k = String(raw.apiKey ?? '').trim();
      return k || generateApiKey();
    })(),
    sessionActive: raw.sessionActive !== false,
    loginInfo: {
      lastLoginAt: String((raw.loginInfo as ManagedUser['loginInfo'])?.lastLoginAt ?? '—'),
      device: String((raw.loginInfo as ManagedUser['loginInfo'])?.device ?? '—'),
      ip: String((raw.loginInfo as ManagedUser['loginInfo'])?.ip ?? '—'),
    },
  };
}

export function getReferralRate(user: Pick<ManagedUser, 'referralRatePercent'>): number {
  const n = user.referralRatePercent;
  if (typeof n === 'number' && Number.isFinite(n)) return n;
  return DEFAULT_REFERRAL_RATE;
}

export function loadManagedUsers(fallback: ManagedUser[]): ManagedUser[] {
  const fallbackById = new Map(fallback.map((u) => [u.id, normalizeUser(u)]));
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return fallback.map(normalizeUser);
    const parsed = JSON.parse(raw) as unknown[];
    if (!Array.isArray(parsed)) return fallback.map(normalizeUser);
    return parsed.map((item) => {
      const partial = item as Partial<ManagedUser>;
      const base = fallbackById.get(String(partial.id ?? ''));
      return normalizeUser({ ...(base ?? {}), ...partial } as ManagedUser);
    });
  } catch {
    return fallback.map(normalizeUser);
  }
}

export function saveManagedUsers(users: ManagedUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/** Cộng/trừ số dư user; ưu tiên bảng quản lý user, fallback session khách demo */
export function adjustUserBalanceById(
  userId: string,
  delta: number,
): { userId: string; username: string; balance: number } {
  const raw = localStorage.getItem(USERS_KEY);
  if (raw) {
    let target: ManagedUser | null = null;
    const users = (JSON.parse(raw) as ManagedUser[]).map((u) => {
      const normalized = normalizeUser(u);
      if (normalized.id !== userId) return normalized;
      target = { ...normalized, balance: Math.max(0, normalized.balance + delta) };
      return target;
    });
    if (target) {
      saveManagedUsers(users);
      const session = loadCustomerSession();
      if (session.userId === userId) {
        saveCustomerSession({ ...session, balance: target.balance });
      }
      return { userId: target.id, username: target.username, balance: target.balance };
    }
  }
  const session = loadCustomerSession();
  if (session.userId === userId) {
    const next = { ...session, balance: Math.max(0, session.balance + delta) };
    saveCustomerSession(next);
    return next;
  }
  return { userId, username: 'unknown', balance: 0 };
}

export function findUserById(userId: string, fallback: ManagedUser[]): ManagedUser | undefined {
  return loadManagedUsers(fallback).find((u) => u.id === userId);
}

export function resolveUsernameById(userId: string): string {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { id?: string; username?: string }[];
      if (Array.isArray(parsed)) {
        const hit = parsed.find((u) => String(u.id) === userId);
        if (hit?.username) return String(hit.username);
      }
    }
  } catch {
    /* ignore */
  }
  const session = loadCustomerSession();
  if (session.userId === userId) return session.username;
  return userId;
}

export function formatUserMoney(amount: number) {
  return `${amount.toLocaleString('vi-VN')}\u00a0đ`;
}

export function formatUserDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function generateApiKey() {
  const segment = () => Math.random().toString(36).slice(2, 10);
  return `sk_live_${segment()}${segment()}`;
}

export function maskApiKey(key: string) {
  if (key.length <= 12) return key;
  return `${key.slice(0, 8)}••••${key.slice(-4)}`;
}

export function generateRandomPassword(length = 12) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
