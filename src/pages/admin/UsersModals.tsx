import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Monitor,
  Globe,
  Clock,
  Copy,
  Check,
  RefreshCw,
  Plus,
  Minus,
  Landmark,
  AlertCircle,
  Undo2,
  History,
} from 'lucide-react';
import type { BalanceTransaction, ManagedUser, UserRole, UserStatus } from '../../types/user';
import { USER_ROLE_LABELS, USER_STATUS_LABELS, DEFAULT_REFERRAL_RATE } from '../../types/user';
import { AFFILIATE_COMMISSION_STATUS_LABELS } from '../../types/affiliate';
import {
  generateRandomPassword,
  formatUserDate,
  formatUserMoney,
  getReferralRate,
} from '../../services/userAdmin';
import {
  findCreditedDepositCommissionsByAmount,
  getCommissionsForBuyer,
} from '../../services/affiliateService';
import {
  applyAdminBalanceChange,
  estimateDepositCommission,
  getDepositReferrerPreview,
  type AdminBalanceMode,
} from '../../services/adminBalanceService';

const inputClass =
  'w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10';

interface ModalShellProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}

function ModalShell({ title, subtitle, onClose, children, wide }: ModalShellProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className={`max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white shadow-2xl ${
          wide ? 'max-w-2xl' : 'max-w-md'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h3 className="text-sm font-black text-slate-800">{title}</h3>
            {subtitle ? <p className="mt-0.5 text-[11px] text-slate-500">{subtitle}</p> : null}
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </motion.div>
  );
}


export function SystemInfoModal({
  user,
  onClose,
}: {
  user: ManagedUser;
  onClose: () => void;
}) {
  const { loginInfo } = user;

  return (
    <ModalShell
      title="Thông tin hệ thống"
      subtitle={`${user.fullName} (@${user.username})`}
      onClose={onClose}
    >
      <div className="space-y-3">
        <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
          <Clock className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary" />
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-500">Lần đăng nhập gần nhất</p>
            <p className="mt-1 text-sm font-bold text-slate-800">{formatUserDate(loginInfo.lastLoginAt)}</p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
          <Monitor className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary" />
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-500">Thiết bị</p>
            <p className="mt-1 text-sm font-bold text-slate-800">{loginInfo.device}</p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
          <Globe className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary" />
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-500">Địa chỉ IP</p>
            <p className="mt-1 font-mono text-sm font-bold text-slate-800">{loginInfo.ip}</p>
          </div>
        </div>
        <p className="text-center text-[11px] text-slate-400">
          ID: {user.id} · 2FA: {user.has2FA ? 'Đang bật' : 'Chưa bật'}
        </p>
      </div>
    </ModalShell>
  );
}

export function Remove2FAConfirmModal({
  user,
  onClose,
  onConfirm,
}: {
  user: ManagedUser;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <ModalShell title="Xóa mã 2FA" subtitle={`@${user.username}`} onClose={onClose}>
      <p className="mb-6 text-sm text-slate-600">
        Bạn có chắc muốn xóa mã xác thực 2 lớp (2FA) của tài khoản{' '}
        <strong className="text-slate-800">{user.fullName}</strong>? Người dùng sẽ cần thiết lập lại
        2FA khi đăng nhập lần sau.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          Hủy
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-black text-white hover:bg-red-700"
        >
          Xóa 2FA
        </button>
      </div>
    </ModalShell>
  );
}

export function EditReferralRateModal({
  user,
  onClose,
  onSave,
}: {
  user: ManagedUser;
  onClose: () => void;
  onSave: (referralRatePercent: number) => void;
}) {
  const currentRate = getReferralRate(user);
  const [useDefault, setUseDefault] = useState(currentRate === DEFAULT_REFERRAL_RATE);
  const [customRate, setCustomRate] = useState(
    currentRate === DEFAULT_REFERRAL_RATE ? 10 : currentRate
  );

  return (
    <ModalShell
      title="Chỉnh chiết khấu giới thiệu"
      subtitle={`@${user.username}`}
      onClose={onClose}
    >
      <div className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
        <p className="text-[11px] font-bold uppercase text-emerald-700">Mặc định hệ thống</p>
        <p className="mt-1 text-lg font-black text-emerald-800">{DEFAULT_REFERRAL_RATE}%</p>
        <p className="mt-1 text-[12px] text-emerald-700/80">
          Tỷ lệ hoa hồng giới thiệu áp dụng cho user chưa được chỉnh riêng.
        </p>
      </div>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSave(useDefault ? DEFAULT_REFERRAL_RATE : Number(customRate) || DEFAULT_REFERRAL_RATE);
        }}
      >
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 hover:bg-slate-50">
          <input
            type="radio"
            name="referral-mode"
            checked={useDefault}
            onChange={() => setUseDefault(true)}
            className="text-brand-primary focus:ring-brand-primary"
          />
          <span className="text-sm font-bold text-slate-800">
            Dùng mặc định hệ thống ({DEFAULT_REFERRAL_RATE}%)
          </span>
        </label>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 px-4 py-3 hover:bg-slate-50">
          <input
            type="radio"
            name="referral-mode"
            checked={!useDefault}
            onChange={() => setUseDefault(false)}
            className="mt-1 text-brand-primary focus:ring-brand-primary"
          />
          <div className="flex-1">
            <span className="text-sm font-bold text-slate-800">Tỷ lệ tùy chỉnh</span>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={100}
                step={0.5}
                disabled={useDefault}
                value={customRate}
                onChange={(e) => setCustomRate(Number(e.target.value))}
                className={`${inputClass} max-w-[120px] disabled:opacity-50`}
              />
              <span className="text-sm font-bold text-slate-600">%</span>
            </div>
          </div>
        </label>

        <button
          type="submit"
          className="w-full rounded-xl bg-brand-primary py-3 text-sm font-black text-white hover:bg-emerald-600"
        >
          Lưu tỷ lệ giới thiệu
        </button>
      </form>
    </ModalShell>
  );
}

export function BalanceHistoryModal({
  user,
  transactions,
  onClose,
}: {
  user: ManagedUser;
  transactions: BalanceTransaction[];
  onClose: () => void;
}) {
  const totalCredit = transactions
    .filter((t) => t.type === 'credit')
    .reduce((s, t) => s + t.amount, 0);
  const totalDebit = transactions
    .filter((t) => t.type === 'debit')
    .reduce((s, t) => s + t.amount, 0);

  return (
    <ModalShell
      wide
      title="Lịch sử nạp / trừ tiền"
      subtitle={`@${user.username} · Số dư hiện tại: ${formatUserMoney(user.balance)}`}
      onClose={onClose}
    >
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3">
          <p className="text-[10px] font-bold uppercase text-emerald-700">Tổng cộng tiền</p>
          <p className="mt-1 text-lg font-black text-emerald-700">+{formatUserMoney(totalCredit)}</p>
        </div>
        <div className="rounded-xl border border-red-100 bg-red-50/50 px-4 py-3">
          <p className="text-[10px] font-bold uppercase text-red-700">Tổng trừ tiền</p>
          <p className="mt-1 text-lg font-black text-red-600">-{formatUserMoney(totalDebit)}</p>
        </div>
      </div>

      {transactions.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500">
          Chưa có giao dịch số dư.
        </p>
      ) : (
        <div className="max-h-[360px] overflow-y-auto rounded-xl border border-slate-200">
          <table className="w-full border-collapse text-left">
            <thead className="sticky top-0 bg-slate-50">
              <tr className="border-b border-slate-200">
                <th className="border-r border-slate-200 px-3 py-2.5 text-[10px] font-black uppercase text-slate-600">
                  Thời gian
                </th>
                <th className="border-r border-slate-200 px-3 py-2.5 text-[10px] font-black uppercase text-slate-600">
                  Loại
                </th>
                <th className="border-r border-slate-200 px-3 py-2.5 text-right text-[10px] font-black uppercase text-slate-600">
                  Số tiền
                </th>
                <th className="border-r border-slate-200 px-3 py-2.5 text-right text-[10px] font-black uppercase text-slate-600">
                  Số dư sau
                </th>
                <th className="px-3 py-2.5 text-[10px] font-black uppercase text-slate-600">Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-slate-100 last:border-0">
                  <td className="whitespace-nowrap border-r border-slate-100 px-3 py-2.5 text-[11px] text-slate-600">
                    {formatUserDate(tx.createdAt)}
                  </td>
                  <td className="border-r border-slate-100 px-3 py-2.5">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        tx.type === 'credit'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {tx.type === 'credit' ? 'Cộng tiền' : 'Trừ tiền'}
                    </span>
                  </td>
                  <td
                    className={`whitespace-nowrap border-r border-slate-100 px-3 py-2.5 text-right text-[12px] font-bold tabular-nums ${
                      tx.type === 'credit' ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {tx.type === 'credit' ? '+' : '-'}
                    {formatUserMoney(tx.amount)}
                  </td>
                  <td className="whitespace-nowrap border-r border-slate-100 px-3 py-2.5 text-right text-[12px] font-bold tabular-nums text-slate-800">
                    {formatUserMoney(tx.balanceAfter)}
                  </td>
                  <td className="px-3 py-2.5 text-[11px] text-slate-600">{tx.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ModalShell>
  );
}

const BALANCE_MODES: {
  id: AdminBalanceMode;
  label: string;
  description: string;
  icon: typeof Plus;
  accent: string;
}[] = [
  {
    id: 'manual_credit',
    label: 'Cộng tiền thủ công',
    description: 'Cộng số dư trực tiếp — không tính hoa hồng affiliate.',
    icon: Plus,
    accent: 'border-emerald-200 bg-emerald-50/60 text-emerald-800',
  },
  {
    id: 'manual_debit',
    label: 'Trừ tiền thủ công',
    description: 'Trừ số dư — xem lịch sử HH bên dưới nếu khớp lần nạp cũ.',
    icon: Minus,
    accent: 'border-red-200 bg-red-50/60 text-red-800',
  },
  {
    id: 'bank_deposit',
    label: 'Cộng tiền theo ngân hàng',
    description: 'Ghi nhận nạp tiền — tính hoa hồng cho người giới thiệu.',
    icon: Landmark,
    accent: 'border-blue-200 bg-blue-50/60 text-blue-800',
  },
  {
    id: 'deposit_reversal',
    label: 'Hoàn nạp nhầm',
    description: 'Trừ số dư + giảm tổng nạp + tự thu hồi hoa hồng khớp số tiền.',
    icon: Undo2,
    accent: 'border-amber-200 bg-amber-50/60 text-amber-900',
  },
];

export function BalanceManageModal({
  user,
  onClose,
  onSuccess,
}: {
  user: ManagedUser;
  onClose: () => void;
  onSuccess: (result: { balance: number; totalDeposit: number }) => void;
}) {
  const [mode, setMode] = useState<AdminBalanceMode>('manual_credit');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reverseIds, setReverseIds] = useState<string[]>([]);

  const parsedAmount = Number(amount.replace(/\./g, '').replace(/,/g, ''));
  const referrerPreview = getDepositReferrerPreview(user);
  const buyerCommissions = getCommissionsForBuyer(user.id).slice(0, 5);
  const matchingCommissions =
    parsedAmount > 0 ? findCreditedDepositCommissionsByAmount(user.id, parsedAmount) : [];

  const showCommission =
    mode === 'bank_deposit' &&
    referrerPreview?.affiliateEnabled &&
    Number.isFinite(parsedAmount) &&
    parsedAmount > 0;
  const estimatedCommission = showCommission
    ? estimateDepositCommission(parsedAmount, referrerPreview!.commissionPercent)
    : 0;

  const toggleReverseId = (id: string) => {
    setReverseIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const result = applyAdminBalanceChange({
      user,
      mode,
      amount: parsedAmount,
      note: note.trim() || undefined,
      reverseCommissionIds:
        mode === 'manual_debit' && reverseIds.length > 0 ? reverseIds : undefined,
    });

    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    let message = `Đã cập nhật số dư @${user.username}.\nSố dư mới: ${formatUserMoney(result.balance)}`;
    if (mode === 'bank_deposit') {
      message += `\nTổng nạp: ${formatUserMoney(result.totalDeposit)}`;
      if (result.commissionAmount && result.referrerUsername) {
        message += `\nHoa hồng @${result.referrerUsername}: +${formatUserMoney(result.commissionAmount)}`;
      } else if (!referrerPreview) {
        message += '\nKhông có người giới thiệu — không tính hoa hồng.';
      }
    } else if (mode === 'deposit_reversal') {
      message += `\nTổng nạp: ${formatUserMoney(result.totalDeposit)}`;
      if (result.reversedCommissionCount && result.reversedCommissionAmount) {
        message += `\nĐã thu hồi ${result.reversedCommissionCount} khoản hoa hồng (−${formatUserMoney(result.reversedCommissionAmount)}).`;
      } else if (matchingCommissions.length === 0) {
        message += '\nKhông tìm thấy hoa hồng khớp số tiền — chỉ trừ số dư.';
      }
    } else if (mode === 'manual_debit' && result.reversedCommissionAmount) {
      message += `\nĐã thu hồi hoa hồng: −${formatUserMoney(result.reversedCommissionAmount)}.`;
    } else if (mode !== 'bank_deposit') {
      message += '\nKhông tạo hoa hồng mới.';
    }

    alert(message);
    onSuccess({ balance: result.balance, totalDeposit: result.totalDeposit });
  };

  return (
    <ModalShell
      wide
      title="Quản lý số dư"
      subtitle={`@${user.username} · Số dư: ${formatUserMoney(user.balance)} · Tổng nạp: ${formatUserMoney(user.totalDeposit)}`}
      onClose={onClose}
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">Loại thao tác</p>
          <div className="grid gap-2 sm:grid-cols-1">
            {BALANCE_MODES.map((item) => {
              const Icon = item.icon;
              const active = mode === item.id;
              return (
                <label
                  key={item.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors ${
                    active
                      ? `${item.accent} ring-2 ring-brand-primary/20`
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="balance-mode"
                    checked={active}
                    onChange={() => setMode(item.id)}
                    className="mt-1 text-brand-primary focus:ring-brand-primary"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="text-sm font-bold text-slate-800">{item.label}</span>
                    </div>
                    <p className="mt-1 text-[12px] text-slate-600">{item.description}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-violet-100 bg-violet-50/40 px-4 py-3">
          <div className="flex items-start gap-2">
            <History className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-black uppercase text-violet-700">
                Lịch sử hoa hồng gần nhất
              </p>
              {referrerPreview ? (
                <p className="mt-1 text-[12px] text-violet-800/90">
                  Người giới thiệu:{' '}
                  <strong>@{referrerPreview.referrer.username}</strong> · {referrerPreview.commissionPercent}% ·
                  Số dư HH:{' '}
                  <strong>{formatUserMoney(referrerPreview.referrer.affiliateBalance)}</strong>
                </p>
              ) : (
                <p className="mt-1 text-[12px] text-slate-600">
                  Tài khoản không có người giới thiệu.
                </p>
              )}

              {mode === 'bank_deposit' && showCommission && estimatedCommission > 0 ? (
                <p className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] font-bold text-emerald-800">
                  Nạp mới ước tính: +{formatUserMoney(estimatedCommission)} cho @
                  {referrerPreview!.referrer.username}
                </p>
              ) : null}

              {buyerCommissions.length === 0 ? (
                <p className="mt-3 rounded-lg border border-dashed border-violet-200 bg-white/60 px-3 py-4 text-center text-[12px] text-slate-500">
                  Chưa có hoa hồng phát sinh từ lần nạp của user này.
                </p>
              ) : (
                <div className="mt-3 overflow-hidden rounded-lg border border-violet-100 bg-white">
                  <table className="w-full border-collapse text-left text-[11px]">
                    <thead className="bg-violet-50/80">
                      <tr>
                        <th className="border-b border-violet-100 px-2.5 py-2 font-black uppercase text-violet-700">
                          Thời gian
                        </th>
                        <th className="border-b border-violet-100 px-2.5 py-2 font-black uppercase text-violet-700">
                          Nạp
                        </th>
                        <th className="border-b border-violet-100 px-2.5 py-2 font-black uppercase text-violet-700">
                          → HH
                        </th>
                        <th className="border-b border-violet-100 px-2.5 py-2 font-black uppercase text-violet-700">
                          Trạng thái
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {buyerCommissions.map((c) => (
                        <tr key={c.id} className="border-b border-violet-50 last:border-0">
                          <td className="whitespace-nowrap px-2.5 py-2 text-slate-600">
                            {formatUserDate(c.createdAt)}
                          </td>
                          <td className="whitespace-nowrap px-2.5 py-2 font-bold tabular-nums text-slate-800">
                            {formatUserMoney(c.orderAmount)}
                          </td>
                          <td className="whitespace-nowrap px-2.5 py-2">
                            <span className="font-bold text-emerald-700">
                              +{formatUserMoney(c.commissionAmount)}
                            </span>
                            <span className="ml-1 text-slate-500">@{c.referrerUsername}</span>
                          </td>
                          <td className="px-2.5 py-2">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                c.status === 'credited'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : c.status === 'reversed'
                                    ? 'bg-slate-100 text-slate-600'
                                    : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {AFFILIATE_COMMISSION_STATUS_LABELS[c.status]}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {mode === 'deposit_reversal' && parsedAmount > 0 ? (
                <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2.5 text-[12px] text-amber-900">
                  <p className="font-bold">Hoàn {formatUserMoney(parsedAmount)}</p>
                  {matchingCommissions.length > 0 ? (
                    <ul className="mt-1.5 space-y-1">
                      {matchingCommissions.map((c) => (
                        <li key={c.id}>
                          Tự thu hồi <strong>−{formatUserMoney(c.commissionAmount)}</strong> từ @
                          {c.referrerUsername}
                          {referrerPreview ? (
                            <span className="text-amber-800/80">
                              {' '}
                              (số dư HH hiện: {formatUserMoney(referrerPreview.referrer.affiliateBalance)})
                            </span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-1 text-amber-800/90">
                      Không tìm thấy hoa hồng khớp — chỉ trừ số dư và giảm tổng nạp.
                    </p>
                  )}
                </div>
              ) : null}

              {mode === 'manual_debit' && parsedAmount > 0 && matchingCommissions.length > 0 ? (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
                  <p className="flex items-start gap-1.5 text-[12px] font-bold text-red-800">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    Trừ {formatUserMoney(parsedAmount)} khớp lần nạp đã tính hoa hồng
                  </p>
                  <div className="mt-2 space-y-2">
                    {matchingCommissions.map((c) => {
                      const referrer = referrerPreview?.referrer;
                      const checked = reverseIds.includes(c.id);
                      return (
                        <label
                          key={c.id}
                          className="flex cursor-pointer items-start gap-2 rounded-lg border border-red-100 bg-white px-3 py-2"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleReverseId(c.id)}
                            className="mt-0.5 text-brand-primary focus:ring-brand-primary"
                          />
                          <span className="text-[12px] text-red-900">
                            Thu hồi <strong>−{formatUserMoney(c.commissionAmount)}</strong> từ @
                            {c.referrerUsername}
                            {referrer && referrer.username === c.referrerUsername ? (
                              <span className="block text-[11px] font-medium text-red-700/80">
                                Số dư HH @{referrer.username}:{' '}
                                {formatUserMoney(referrer.affiliateBalance)} — kiểm tra trước khi trừ
                              </span>
                            ) : null}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-[11px] text-red-700/80">
                    Ví dụ: A nạp 10 triệu → B nhận 1 triệu. Nếu chỉ trừ A mà không thu hồi, B vẫn giữ
                    hoa hồng.
                  </p>
                </div>
              ) : mode === 'manual_debit' ? (
                <p className="mt-2 text-[11px] text-slate-500">
                  Trừ thủ công không tạo hoa hồng mới. Nếu khớp số tiền nạp cũ, hệ thống gợi ý thu hồi
                  ở trên.
                </p>
              ) : mode === 'manual_credit' ? (
                <p className="mt-2 text-[11px] text-slate-500">
                  Cộng thủ công không tạo hoa hồng affiliate.
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[11px] font-black uppercase text-slate-500">
            Số tiền (VNĐ)
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))}
            placeholder="VD: 500000"
            className={inputClass}
            required
          />
          {parsedAmount > 0 ? (
            <p className="mt-1 text-[11px] font-medium text-slate-500">
              {formatUserMoney(parsedAmount)}
            </p>
          ) : null}
        </div>

        <div>
          <label className="mb-1.5 block text-[11px] font-black uppercase text-slate-500">
            Ghi chú (tuỳ chọn)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Lý do cộng/trừ tiền..."
            className={`${inputClass} resize-none font-medium`}
          />
        </div>

        {error ? (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={submitting || !parsedAmount}
          className="w-full rounded-xl bg-brand-primary py-3 text-sm font-black text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Đang xử lý...' : 'Xác nhận'}
        </button>
      </form>
    </ModalShell>
  );
}
