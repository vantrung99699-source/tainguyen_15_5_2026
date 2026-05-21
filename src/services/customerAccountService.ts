const ACCOUNT_KEY = 'taphoammo_customer_account';

export interface CustomerAccountProfile {
  userId: string;
  displayName: string;
  email: string;
  phone: string;
  apiToken: string;
  /** Demo — không dùng plaintext trên production */
  password: string;
  twoFactorEnabled: boolean;
  lastLoginAt: string;
}

function randomToken() {
  return `tk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 14)}`;
}

function defaultProfile(userId: string, username: string): CustomerAccountProfile {
  return {
    userId,
    displayName: username,
    email: `${username}@demo.local`,
    phone: '',
    apiToken: randomToken(),
    password: '123456',
    twoFactorEnabled: false,
    lastLoginAt: new Date().toISOString(),
  };
}

function loadAll(): CustomerAccountProfile[] {
  try {
    const raw = localStorage.getItem(ACCOUNT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CustomerAccountProfile[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAll(list: CustomerAccountProfile[]) {
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify(list));
}

export function loadCustomerAccountProfile(
  userId: string,
  username: string,
): CustomerAccountProfile {
  const hit = loadAll().find((p) => p.userId === userId);
  if (hit) return { ...defaultProfile(userId, username), ...hit, userId };
  const created = defaultProfile(userId, username);
  saveAll([...loadAll(), created]);
  return created;
}

export function saveCustomerAccountProfile(profile: CustomerAccountProfile) {
  const list = loadAll().filter((p) => p.userId !== profile.userId);
  list.push(profile);
  saveAll(list);
}

export function changeCustomerPassword(
  userId: string,
  username: string,
  currentPassword: string,
  newPassword: string,
): { ok: true } | { ok: false; error: string } {
  const profile = loadCustomerAccountProfile(userId, username);
  if (currentPassword !== profile.password) {
    return { ok: false, error: 'Mật khẩu hiện tại không đúng' };
  }
  if (newPassword.length < 6) {
    return { ok: false, error: 'Mật khẩu mới tối thiểu 6 ký tự' };
  }
  saveCustomerAccountProfile({ ...profile, password: newPassword });
  return { ok: true };
}

export function regenerateApiToken(userId: string, username: string): string {
  const profile = loadCustomerAccountProfile(userId, username);
  const token = randomToken();
  saveCustomerAccountProfile({ ...profile, apiToken: token });
  return token;
}

export function maskApiToken(token: string): string {
  if (token.length <= 12) return token;
  return `${token.slice(0, 8)}••••••••${token.slice(-4)}`;
}
