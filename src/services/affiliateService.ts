import type { CustomerOrder } from '../types/customerOrder';
import type {
  AffiliateCampaignLink,
  AffiliateCommission,
  AffiliateCommissionStatus,
  AffiliateSettings,
  AffiliateWithdrawal,
  AffiliateWithdrawalMethod,
  RefAttribution,
} from '../types/affiliate';
import type { ManagedUser } from '../types/user';
import { DEFAULT_REFERRAL_RATE } from '../types/user';
import { initialManagedUsers } from '../pages/admin/userData';
import {
  findUserById,
  ensureUserReferralCode,
  getReferralRate,
  loadManagedUsers,
  saveManagedUsers,
} from './userAdmin';
import { loadCustomerOrders, ORDERS_UPDATED } from './orderService';
import {
  dispatchAffiliateCredit,
  dispatchWithdrawalRequest,
} from './notificationDispatcher';

const SETTINGS_KEY = 'taphoammo_affiliate_settings';
const COMMISSIONS_KEY = 'taphoammo_affiliate_commissions';
const WITHDRAWALS_KEY = 'taphoammo_affiliate_withdrawals';
const CAMPAIGNS_KEY = 'taphoammo_affiliate_campaign_links';
const REF_ATTR_KEY = 'taphoammo_ref_attribution';
const REF_COOKIE = 'taphoammo_ref';

export const AFFILIATE_UPDATED = 'taphoammo-affiliate-updated';

const DEFAULT_SETTINGS: AffiliateSettings = {
  enabled: true,
  defaultCommissionPercent: 10,
  minWithdrawalAmount: 100_000,
  commissionMode: 'lifetime',
  autoApproveCommission: true,
  cookieTtlDays: 30,
  updatedAt: new Date().toISOString(),
};

function emitAffiliateUpdated() {
  window.dispatchEvent(new CustomEvent(AFFILIATE_UPDATED));
}

function getUsers(): ManagedUser[] {
  return loadManagedUsers(initialManagedUsers);
}

function patchUser(userId: string, patch: Partial<ManagedUser>): ManagedUser | null {
  const users = getUsers();
  let target: ManagedUser | null = null;
  const next = users.map((u) => {
    if (u.id !== userId) return u;
    target = { ...u, ...patch };
    return target;
  });
  if (!target) return null;
  saveManagedUsers(next);
  return target;
}

function visitorFingerprint(): string {
  try {
    return `${navigator.userAgent}|${screen.width}x${screen.height}`;
  } catch {
    return 'unknown';
  }
}

// ——— Settings ———

export function loadAffiliateSettings(): AffiliateSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as AffiliateSettings) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveAffiliateSettings(patch: Partial<AffiliateSettings>) {
  const next = { ...loadAffiliateSettings(), ...patch, updatedAt: new Date().toISOString() };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  emitAffiliateUpdated();
}

// ——— Referral capture ———

export function resolveReferrerByCode(code: string): ManagedUser | undefined {
  const normalized = code.trim().toLowerCase();
  return getUsers().find(
    (u) =>
      u.referralCode.toLowerCase() === normalized ||
      u.username.toLowerCase() === normalized,
  );
}

function setRefCookie(code: string, ttlDays: number) {
  const maxAge = ttlDays * 86400;
  document.cookie = `${REF_COOKIE}=${encodeURIComponent(code)};path=/;max-age=${maxAge};SameSite=Lax`;
}

export const AFFILIATE_INVITE_PATH_PREFIX = '/i/';

export function parseReferralCodeFromLocation(
  pathname = window.location.pathname,
  search = window.location.search,
): string | null {
  const params = new URLSearchParams(search);
  const legacyRef = params.get('ref')?.trim();
  if (legacyRef) return legacyRef;

  const inviteMatch = pathname.match(/^\/i\/([^/?#]+)/i);
  if (inviteMatch?.[1]) {
    return decodeURIComponent(inviteMatch[1]).trim();
  }

  const registerMatch = pathname.match(/^\/register\/([^/?#]+)/i);
  if (registerMatch?.[1]) {
    return decodeURIComponent(registerMatch[1]).trim();
  }

  const segments = pathname.split('/').filter(Boolean);
  if (segments.length >= 2 && segments[0] !== 'trang' && segments[0] !== 'admin') {
    const last = decodeURIComponent(segments[segments.length - 1] ?? '').trim();
    if (last && resolveReferrerByCode(last)) return last;
  }

  return null;
}

export function captureReferralFromUrl(search?: string, pathname?: string) {
  const settings = loadAffiliateSettings();
  if (!settings.enabled) return;

  const ref = parseReferralCodeFromLocation(
    pathname ?? window.location.pathname,
    search ?? window.location.search,
  );
  if (!ref) return;

  const referrer = resolveReferrerByCode(ref);
  if (!referrer) return;

  const attr: RefAttribution = {
    referralCode: referrer.referralCode,
    referrerUserId: referrer.id,
    capturedAt: Date.now(),
    expiresAt: Date.now() + settings.cookieTtlDays * 86400000,
    visitorFingerprint: visitorFingerprint(),
  };
  localStorage.setItem(REF_ATTR_KEY, JSON.stringify(attr));
  setRefCookie(referrer.referralCode, settings.cookieTtlDays);
}

export function loadRefAttribution(): RefAttribution | null {
  try {
    const raw = localStorage.getItem(REF_ATTR_KEY);
    if (!raw) return readRefFromCookie();
    const attr = JSON.parse(raw) as RefAttribution;
    if (attr.expiresAt < Date.now()) {
      localStorage.removeItem(REF_ATTR_KEY);
      return null;
    }
    return attr;
  } catch {
    return null;
  }
}

function readRefFromCookie(): RefAttribution | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${REF_COOKIE}=([^;]*)`));
  if (!match) return null;
  const code = decodeURIComponent(match[1]);
  const referrer = resolveReferrerByCode(code);
  if (!referrer) return null;
  const settings = loadAffiliateSettings();
  return {
    referralCode: referrer.referralCode,
    referrerUserId: referrer.id,
    capturedAt: Date.now(),
    expiresAt: Date.now() + settings.cookieTtlDays * 86400000,
    visitorFingerprint: visitorFingerprint(),
  };
}

export function isSelfReferral(
  referrer: ManagedUser,
  buyerUserId?: string,
  buyerUsername?: string,
): boolean {
  if (buyerUserId && buyerUserId === referrer.id) return true;
  if (buyerUsername && buyerUsername.toLowerCase() === referrer.username.toLowerCase()) return true;
  const attr = loadRefAttribution();
  if (attr?.referrerUserId === referrer.id) {
    const fp = visitorFingerprint();
    if (attr.visitorFingerprint === fp && !buyerUserId) return true;
  }
  return false;
}

/** Gán người giới thiệu khi đăng ký user mới */
export function attachReferrerOnRegister(
  newUserId: string,
  newUsername: string,
): { ok: true; referrerId: string } | { ok: false; reason: string } {
  const settings = loadAffiliateSettings();
  if (!settings.enabled) return { ok: false, reason: 'Affiliate tắt' };

  const attr = loadRefAttribution();
  if (!attr) return { ok: false, reason: 'Không có ref' };

  const referrer = findUserById(attr.referrerUserId, initialManagedUsers);
  if (!referrer) return { ok: false, reason: 'Ref không hợp lệ' };
  if (isSelfReferral(referrer, newUserId, newUsername)) {
    return { ok: false, reason: 'Không được tự giới thiệu' };
  }

  patchUser(newUserId, { referredByUserId: referrer.id });
  patchUser(referrer.id, { referralCount: referrer.referralCount + 1 });
  localStorage.removeItem(REF_ATTR_KEY);
  emitAffiliateUpdated();
  return { ok: true, referrerId: referrer.id };
}

export function getPublicReferralCode(userId: string): string {
  return ensureUserReferralCode(userId, initialManagedUsers);
}

export function buildRegisterAffiliateUrl(referralCode: string, origin = window.location.origin) {
  const code = encodeURIComponent(referralCode.trim().toLowerCase());
  return `${origin}${AFFILIATE_INVITE_PATH_PREFIX}${code}`;
}

export function buildCampaignUrl(
  referralCode: string,
  targetPath: string,
  shortCode?: string,
  origin = window.location.origin,
) {
  const code = encodeURIComponent(referralCode.trim().toLowerCase());
  const queryIndex = targetPath.indexOf('?');
  const pathOnly = (queryIndex >= 0 ? targetPath.slice(0, queryIndex) : targetPath).trim() || '/';
  const normalizedPath = pathOnly.startsWith('/') ? pathOnly : `/${pathOnly}`;
  const existingQuery = queryIndex >= 0 ? targetPath.slice(queryIndex + 1) : '';
  const params = new URLSearchParams(existingQuery);
  if (shortCode) params.set('c', shortCode);
  const qs = params.toString();

  if (normalizedPath === '/' || normalizedPath === '/register') {
    return `${origin}${AFFILIATE_INVITE_PATH_PREFIX}${code}${qs ? `?${qs}` : ''}`;
  }

  const base = `${origin}${normalizedPath.replace(/\/$/, '')}/${code}`;
  return qs ? `${base}?${qs}` : base;
}

// ——— Commissions storage ———

function loadCommissions(): AffiliateCommission[] {
  try {
    const raw = localStorage.getItem(COMMISSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AffiliateCommission[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCommissions(list: AffiliateCommission[]) {
  localStorage.setItem(COMMISSIONS_KEY, JSON.stringify(list));
  emitAffiliateUpdated();
}

function markOrderCommission(orderId: string, commissionId: string | null, paid: boolean) {
  const orders = loadCustomerOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx < 0) return;
  orders[idx] = {
    ...orders[idx],
    affiliateCommissionPaid: paid,
    affiliateCommissionId: commissionId,
  };
  localStorage.setItem('taphoammo_customer_orders', JSON.stringify(orders));
  window.dispatchEvent(new CustomEvent(ORDERS_UPDATED));
}

function getCommissionRateForUser(user: ManagedUser, settings: AffiliateSettings): number {
  const custom = getReferralRate(user);
  if (custom !== DEFAULT_REFERRAL_RATE) return custom;
  return settings.defaultCommissionPercent;
}

function hasPriorCreditedCommission(referrerId: string, buyerId: string): boolean {
  return loadCommissions().some(
    (c) =>
      c.referrerUserId === referrerId &&
      c.buyerUserId === buyerId &&
      c.status === 'credited',
  );
}

/** Tính hoa hồng khi đơn hoàn thành */
export function processOrderCommission(order: CustomerOrder): AffiliateCommission | null {
  const settings = loadAffiliateSettings();
  if (!settings.enabled) return null;
  if (order.status !== 'completed') return null;
  if (order.affiliateCommissionPaid) return null;

  const buyer = findUserById(order.userId, initialManagedUsers);
  if (!buyer?.referredByUserId) return null;

  const referrer = findUserById(buyer.referredByUserId, initialManagedUsers);
  if (!referrer) return null;
  if (isSelfReferral(referrer, buyer.id, buyer.username)) return null;

  if (settings.commissionMode === 'first_order') {
    if (hasPriorCreditedCommission(referrer.id, buyer.id)) return null;
  }

  const existing = loadCommissions().find(
    (c) => c.orderId === order.id && c.status !== 'reversed',
  );
  if (existing) return existing;

  const percent = getCommissionRateForUser(referrer, settings);
  const commissionAmount = Math.floor((order.totalAmount * percent) / 100);
  if (commissionAmount <= 0) return null;

  const status: AffiliateCommissionStatus = settings.autoApproveCommission
    ? 'credited'
    : 'pending';

  const record: AffiliateCommission = {
    id: `AFF${Date.now()}`,
    referrerUserId: referrer.id,
    referrerUsername: referrer.username,
    buyerUserId: buyer.id,
    buyerUsername: buyer.username,
    orderId: order.id,
    orderAmount: order.totalAmount,
    commissionPercent: percent,
    commissionAmount,
    status,
    createdAt: new Date().toISOString(),
    creditedAt: status === 'credited' ? new Date().toISOString() : null,
    reversedAt: null,
    note: `Hoa hồng đơn #${order.id}`,
  };

  saveCommissions([record, ...loadCommissions()]);
  markOrderCommission(order.id, record.id, true);

  const revPatch = {
    affiliateRevenue: referrer.affiliateRevenue + order.totalAmount,
  };
  if (status === 'credited') {
    patchUser(referrer.id, {
      ...revPatch,
      affiliateBalance: referrer.affiliateBalance + commissionAmount,
      affiliateTotalEarned: referrer.affiliateTotalEarned + commissionAmount,
    });
    void dispatchAffiliateCredit({
      userId: referrer.id,
      amount: commissionAmount,
      orderId: order.id,
    });
  } else {
    patchUser(referrer.id, revPatch);
  }

  return record;
}

/** Thu hồi hoa hồng khi hoàn tiền */
export function reverseOrderCommission(orderId: string, refundAmount: number) {
  const settings = loadAffiliateSettings();
  if (!settings.enabled) return;

  const commissions = loadCommissions();
  const idx = commissions.findIndex(
    (c) => c.orderId === orderId && c.status !== 'reversed',
  );
  if (idx < 0) return;

  const record = commissions[idx];
  const order = loadCustomerOrders().find((o) => o.id === orderId);
  const ratio =
    order && order.totalAmount > 0
      ? Math.min(1, refundAmount / order.totalAmount)
      : 1;
  const clawback = Math.floor(record.commissionAmount * ratio);

  commissions[idx] = {
    ...record,
    status: 'reversed',
    reversedAt: new Date().toISOString(),
    note: `${record.note} — Thu hồi ${clawback.toLocaleString('vi-VN')} đ`,
  };
  saveCommissions(commissions);
  markOrderCommission(orderId, null, false);

  const referrer = findUserById(record.referrerUserId, initialManagedUsers);
  if (!referrer) return;

  if (record.status === 'credited' && clawback > 0) {
    patchUser(referrer.id, {
      affiliateBalance: Math.max(0, referrer.affiliateBalance - clawback),
      affiliateTotalEarned: Math.max(0, referrer.affiliateTotalEarned - clawback),
    });
  }
}

export function approveCommission(commissionId: string): { ok: boolean; error?: string } {
  const list = loadCommissions();
  const idx = list.findIndex((c) => c.id === commissionId);
  if (idx < 0) return { ok: false, error: 'Không tìm thấy' };
  const c = list[idx];
  if (c.status !== 'pending') return { ok: false, error: 'Trạng thái không hợp lệ' };

  list[idx] = {
    ...c,
    status: 'credited',
    creditedAt: new Date().toISOString(),
  };
  saveCommissions(list);

  const referrer = findUserById(c.referrerUserId, initialManagedUsers);
  if (referrer) {
    patchUser(referrer.id, {
      affiliateBalance: referrer.affiliateBalance + c.commissionAmount,
      affiliateTotalEarned: referrer.affiliateTotalEarned + c.commissionAmount,
    });
  }
  return { ok: true };
}

export function getCommissionsForReferrer(userId: string) {
  return loadCommissions()
    .filter((c) => c.referrerUserId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getAllCommissions() {
  return loadCommissions().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// ——— Withdrawals ———

function loadWithdrawals(): AffiliateWithdrawal[] {
  try {
    const raw = localStorage.getItem(WITHDRAWALS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AffiliateWithdrawal[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveWithdrawals(list: AffiliateWithdrawal[]) {
  localStorage.setItem(WITHDRAWALS_KEY, JSON.stringify(list));
  emitAffiliateUpdated();
}

export function getWithdrawalsForUser(userId: string) {
  return loadWithdrawals()
    .filter((w) => w.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getAllWithdrawals() {
  return loadWithdrawals().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function requestWithdrawal(params: {
  userId: string;
  username: string;
  amount: number;
  method: AffiliateWithdrawalMethod;
  accountInfo: string;
  accountName: string;
}): { ok: true; withdrawal: AffiliateWithdrawal } | { ok: false; error: string } {
  const settings = loadAffiliateSettings();
  if (!settings.enabled) return { ok: false, error: 'Chương trình affiliate đang tắt.' };

  const user = findUserById(params.userId, initialManagedUsers);
  if (!user) return { ok: false, error: 'Không tìm thấy user.' };

  const amount = Math.floor(params.amount);
  if (amount < settings.minWithdrawalAmount) {
    return {
      ok: false,
      error: `Số tiền tối thiểu ${settings.minWithdrawalAmount.toLocaleString('vi-VN')} đ.`,
    };
  }
  if (amount > user.affiliateBalance) {
    return { ok: false, error: 'Số dư affiliate không đủ.' };
  }

  patchUser(user.id, { affiliateBalance: user.affiliateBalance - amount });

  const withdrawal: AffiliateWithdrawal = {
    id: `WD${Date.now()}`,
    userId: params.userId,
    username: params.username,
    amount,
    method: params.method,
    accountInfo: params.accountInfo.trim(),
    accountName: params.accountName.trim(),
    status: 'pending',
    rejectReason: null,
    createdAt: new Date().toISOString(),
    processedAt: null,
  };
  saveWithdrawals([withdrawal, ...loadWithdrawals()]);
  void dispatchWithdrawalRequest({
    withdrawalId: withdrawal.id,
    username: params.username,
    amount,
  });
  return { ok: true, withdrawal };
}

export function approveWithdrawal(id: string): { ok: boolean; error?: string } {
  const list = loadWithdrawals();
  const idx = list.findIndex((w) => w.id === id);
  if (idx < 0) return { ok: false, error: 'Không tìm thấy' };
  if (list[idx].status !== 'pending') return { ok: false, error: 'Đã xử lý' };
  list[idx] = {
    ...list[idx],
    status: 'approved',
    processedAt: new Date().toISOString(),
  };
  saveWithdrawals(list);
  return { ok: true };
}

export function rejectWithdrawal(
  id: string,
  reason: string,
): { ok: boolean; error?: string } {
  const list = loadWithdrawals();
  const idx = list.findIndex((w) => w.id === id);
  if (idx < 0) return { ok: false, error: 'Không tìm thấy' };
  const w = list[idx];
  if (w.status !== 'pending') return { ok: false, error: 'Đã xử lý' };

  const user = findUserById(w.userId, initialManagedUsers);
  if (user) {
    patchUser(user.id, { affiliateBalance: user.affiliateBalance + w.amount });
  }

  list[idx] = {
    ...w,
    status: 'rejected',
    rejectReason: reason.trim() || 'Từ chối',
    processedAt: new Date().toISOString(),
  };
  saveWithdrawals(list);
  return { ok: true };
}

// ——— Campaign links ———

function loadCampaigns(): AffiliateCampaignLink[] {
  try {
    const raw = localStorage.getItem(CAMPAIGNS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AffiliateCampaignLink[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCampaigns(list: AffiliateCampaignLink[]) {
  localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(list));
  emitAffiliateUpdated();
}

export function getCampaignsForUser(userId: string) {
  return loadCampaigns().filter((c) => c.userId === userId);
}

export function createCampaignLink(params: {
  userId: string;
  label: string;
  targetPath: string;
}): AffiliateCampaignLink {
  const shortCode = Math.random().toString(36).slice(2, 8);
  const link: AffiliateCampaignLink = {
    id: `CMP${Date.now()}`,
    userId: params.userId,
    label: params.label.trim() || 'Chiến dịch',
    targetPath: params.targetPath.trim() || '/',
    shortCode,
    createdAt: new Date().toISOString(),
  };
  saveCampaigns([link, ...loadCampaigns()]);
  return link;
}

export function deleteCampaignLink(id: string, userId: string) {
  saveCampaigns(loadCampaigns().filter((c) => !(c.id === id && c.userId === userId)));
}

// ——— Stats ———

export function getAffiliateOverviewForUser(userId: string) {
  const user = findUserById(userId, initialManagedUsers);
  const commissions = getCommissionsForReferrer(userId);
  const referred = getUsers().filter((u) => u.referredByUserId === userId);
  const pendingCommission = commissions
    .filter((c) => c.status === 'pending')
    .reduce((s, c) => s + c.commissionAmount, 0);
  const creditedCommission = commissions
    .filter((c) => c.status === 'credited')
    .reduce((s, c) => s + c.commissionAmount, 0);

  return {
    user,
    referralCount: user?.referralCount ?? referred.length,
    affiliateBalance: user?.affiliateBalance ?? 0,
    affiliateRevenue: user?.affiliateRevenue ?? 0,
    affiliateTotalEarned: user?.affiliateTotalEarned ?? 0,
    pendingCommission,
    creditedCommission,
    referralCode: user ? ensureUserReferralCode(userId, initialManagedUsers) : '',
  };
}

export function getAffiliateAdminStats() {
  const commissions = getAllCommissions();
  const withdrawals = getAllWithdrawals();
  const users = getUsers().filter((u) => u.referralCount > 0 || u.affiliateTotalEarned > 0);

  const creditedByDay = new Map<string, number>();
  for (const c of commissions.filter((x) => x.status === 'credited')) {
    const day = c.creditedAt?.slice(0, 10) ?? c.createdAt.slice(0, 10);
    creditedByDay.set(day, (creditedByDay.get(day) ?? 0) + c.commissionAmount);
  }

  const revenueFromAffiliate = commissions
    .filter((c) => c.status === 'credited')
    .reduce((s, c) => s + c.orderAmount, 0);

  const totalPaidOut = commissions
    .filter((c) => c.status === 'credited')
    .reduce((s, c) => s + c.commissionAmount, 0);

  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'pending');

  return {
    affiliateUsers: users.length,
    totalCommissionPaid: totalPaidOut,
    affiliateRevenue: revenueFromAffiliate,
    pendingWithdrawalCount: pendingWithdrawals.length,
    pendingWithdrawalAmount: pendingWithdrawals.reduce((s, w) => s + w.amount, 0),
    chartByDay: [...creditedByDay.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, amount]) => ({ date, amount })),
    topReferrers: [...users]
      .sort((a, b) => b.affiliateRevenue - a.affiliateRevenue)
      .slice(0, 10),
  };
}

export function getAffiliateUsersForAdmin() {
  return getUsers()
    .filter((u) => u.referralCount > 0 || u.affiliateTotalEarned > 0 || u.referredByUserId)
    .sort((a, b) => b.affiliateRevenue - a.affiliateRevenue);
}
