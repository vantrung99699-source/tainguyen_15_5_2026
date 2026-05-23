import { initialManagedUsers } from '../pages/admin/userData';
import { CUSTOMER_SESSION_UPDATED, loadCustomerSession } from './customerSession';
import { findUserById } from './userAdmin';

const EDIT_MODE_KEY = 'taphoammo_inline_i18n_edit';

export function isStorefrontTranslationAdmin(): boolean {
  try {
    const session = loadCustomerSession();
    const user = findUserById(session.userId, initialManagedUsers);
    return user?.role === 'admin';
  } catch {
    return false;
  }
}

export function loadInlineEditMode(): boolean {
  try {
    return sessionStorage.getItem(EDIT_MODE_KEY) === '1';
  } catch {
    return false;
  }
}

export function saveInlineEditMode(on: boolean) {
  try {
    if (on) sessionStorage.setItem(EDIT_MODE_KEY, '1');
    else sessionStorage.removeItem(EDIT_MODE_KEY);
  } catch {
    /* ignore */
  }
}

export { CUSTOMER_SESSION_UPDATED };
