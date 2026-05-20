const SESSION_KEY = 'taphoammo_customer_session';

export interface CustomerSession {
  userId: string;
  username: string;
  balance: number;
}

const DEFAULT_SESSION: CustomerSession = {
  userId: 'demo-customer',
  username: 'nguyenvana',
  balance: 2_500_000,
};

export function loadCustomerSession(): CustomerSession {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return { ...DEFAULT_SESSION };
    return { ...DEFAULT_SESSION, ...JSON.parse(raw) } as CustomerSession;
  } catch {
    return { ...DEFAULT_SESSION };
  }
}

export function saveCustomerSession(session: CustomerSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new CustomEvent('taphoammo-customer-session-updated'));
}

export const CUSTOMER_SESSION_UPDATED = 'taphoammo-customer-session-updated';

export function adjustCustomerBalance(delta: number): CustomerSession {
  const session = loadCustomerSession();
  const next = { ...session, balance: Math.max(0, session.balance + delta) };
  saveCustomerSession(next);
  return next;
}
