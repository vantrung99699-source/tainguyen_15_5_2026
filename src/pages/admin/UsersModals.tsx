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
        } from 'lucide-react';
import type { BalanceTransaction, ManagedUser, UserRole, UserStatus } from '../../types/user';
import { USER_ROLE_LABELS, USER_STATUS_LABELS, DEFAULT_REFERRAL_RATE } from '../../types/user';
import {
  generateRandomPassword,
  formatUserDate,
  formatUserMoney,
  getReferralRate,
} from '../../services/userAdmin';

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
