import type { ApiProvider } from '../types/apiProvider';
import { notifyAdminTelegram } from './telegramNotificationService';

const ALERT_STATE_KEY = 'taphoammo_provider_balance_alert_state';
const ALERT_COOLDOWN_MS = 6 * 60 * 60 * 1000;

interface ProviderAlertState {
  lastBalance: number;
  alertedAt: string | null;
}

function loadAlertState(): Record<string, ProviderAlertState> {
  try {
    const raw = localStorage.getItem(ALERT_STATE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, ProviderAlertState>;
  } catch {
    return {};
  }
}

function saveAlertState(state: Record<string, ProviderAlertState>) {
  localStorage.setItem(ALERT_STATE_KEY, JSON.stringify(state));
}

export function convertProviderBalanceToVnd(balance: number, provider: ApiProvider): number {
  if (provider.balanceCurrency === 'VND') return Math.round(balance);
  const rate = provider.exchangeRateToVnd || 27000;
  return Math.round(balance * rate);
}

export function formatProviderBalanceDisplay(
  balance: number,
  provider: ApiProvider,
): { main: string; sub: string | null } {
  if (provider.balanceCurrency === 'USD') {
    const main = `$${balance.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
    const vnd = convertProviderBalanceToVnd(balance, provider);
    return { main, sub: `≈ ${vnd.toLocaleString('vi-VN')}đ` };
  }
  return { main: `${balance.toLocaleString('vi-VN')}đ`, sub: null };
}

function formatThreshold(provider: ApiProvider): string {
  if (provider.balanceCurrency === 'USD') {
    return `$${provider.lowBalanceThreshold.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return `${provider.lowBalanceThreshold.toLocaleString('vi-VN')}đ`;
}

export async function checkAndNotifyLowProviderBalance(
  provider: ApiProvider,
  balance: number,
): Promise<void> {
  if (!provider.enabled || !provider.telegramBalanceAlert) return;
  if (provider.lowBalanceThreshold <= 0) return;
  if (balance >= provider.lowBalanceThreshold) return;

  const state = loadAlertState();
  const prev = state[provider.id];
  if (
    prev?.alertedAt &&
    Date.now() - new Date(prev.alertedAt).getTime() < ALERT_COOLDOWN_MS
  ) {
    return;
  }

  const display = formatProviderBalanceDisplay(balance, provider);
  const vndLine =
    provider.balanceCurrency === 'USD'
      ? `\nQuy đổi: ${display.sub ?? ''} (tỉ giá ${provider.exchangeRateToVnd.toLocaleString('vi-VN')}đ/USD)`
      : '';

  await notifyAdminTelegram(
    'lowProviderBalance',
    [
      '⚠️ Cảnh báo số dư NCC thấp',
      '',
      `NCC: ${provider.name}`,
      `Số dư hiện tại: ${display.main}${vndLine}`,
      `Ngưỡng cảnh báo: ${formatThreshold(provider)}`,
      `Thời gian: ${new Date().toLocaleString('vi-VN')}`,
    ].join('\n'),
  );

  state[provider.id] = { lastBalance: balance, alertedAt: new Date().toISOString() };
  saveAlertState(state);
}
