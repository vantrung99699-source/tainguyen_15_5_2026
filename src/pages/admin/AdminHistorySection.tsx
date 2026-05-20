import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  History,
  Mail,
  Search,
  Send,
  Wallet,
} from 'lucide-react';
import type { TransactionType } from '../../types/customerWallet';
import type { BankLedgerKind, NotificationLogStatus } from '../../types/adminHistory';
import {
  MOCK_BANK_LEDGER,
  MOCK_EMAIL_LOGS,
  MOCK_TELEGRAM_LOGS,
} from '../../data/mockAdminHistory';
import {
  getAdminBalanceMovements,
  WALLET_TX_UPDATED,
} from '../../services/walletTransactionService';
import type { AdminBalanceMovement } from '../../types/adminHistory';
import {
  BANK_LEDGER_LABELS,
  BANK_LEDGER_STYLES,
  NOTIFY_STATUS_LABELS,
  NOTIFY_STATUS_STYLES,
  TRANSACTION_TYPE_LABELS,
  TRANSACTION_TYPE_STYLES,
} from './adminHistoryLabels';

type HistoryTab = 'balance' | 'bank' | 'telegram' | 'email';

const HISTORY_TABS: {
  id: HistoryTab;
  label: string;
  icon: typeof Wallet;
  description: string;
}[] = [
  {
    id: 'balance',
    label: 'Biến động số dư',
    icon: Wallet,
    description: 'Nạp tiền, cộng/trừ, mua hàng, hoàn tiền trên ví khách',
  },
  {
    id: 'bank',
    label: 'Lịch sử ngân hàng',
    icon: Building2,
    description: 'Cộng/trừ qua cổng, webhook ngân hàng và thao tác thủ công',
  },
  {
    id: 'telegram',
    label: 'Telegram logs',
    icon: Send,
    description: 'Lịch sử tin nhắn Telegram gửi tới username',
  },
  {
    id: 'email',
    label: 'Email logs',
    icon: Mail,
    description: 'Lịch sử email gửi tới username',
  },
];

const ALL_BALANCE_TYPES: TransactionType[] = ['deposit', 'credit', 'debit', 'purchase', 'refund'];
const ALL_BANK_KINDS: BankLedgerKind[] = [
  'bank_credit',
  'bank_debit',
  'manual_credit',
  'manual_debit',
];
const ALL_NOTIFY_STATUS: NotificationLogStatus[] = ['sent', 'failed', 'pending'];

function formatMoney(amount: number, signed = true) {
  const prefix = signed && amount > 0 ? '+' : '';
  return `${prefix}${amount.toLocaleString('vi-VN')}\u00a0đ`;
}

function HistorySearchBar({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-2.5">
      <Search className="h-4 w-4 shrink-0 text-zinc-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border-0 bg-transparent text-sm font-bold text-zinc-800 outline-none placeholder:font-medium placeholder:text-zinc-400"
      />
    </div>
  );
}

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition-colors ${
        active
          ? 'bg-brand-primary text-white shadow-sm'
          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
      }`}
    >
      {label}
    </button>
  );
}

function EmptyRow({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-12 text-center text-[13px] font-medium text-zinc-400">
        {message}
      </td>
    </tr>
  );
}

export function AdminHistorySection() {
  const [activeTab, setActiveTab] = useState<HistoryTab>('balance');
  const [search, setSearch] = useState('');
  const [balanceType, setBalanceType] = useState<TransactionType | 'all'>('all');
  const [bankKind, setBankKind] = useState<BankLedgerKind | 'all'>('all');
  const [notifyStatus, setNotifyStatus] = useState<NotificationLogStatus | 'all'>('all');
  const [balanceMovements, setBalanceMovements] = useState<AdminBalanceMovement[]>(() =>
    getAdminBalanceMovements(),
  );

  useEffect(() => {
    const reload = () => setBalanceMovements(getAdminBalanceMovements());
    window.addEventListener(WALLET_TX_UPDATED, reload);
    return () => window.removeEventListener(WALLET_TX_UPDATED, reload);
  }, []);

  const activeMeta = HISTORY_TABS.find((t) => t.id === activeTab)!;

  const balanceRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return balanceMovements.filter((row) => {
      if (balanceType !== 'all' && row.type !== balanceType) return false;
      if (!q) return true;
      return (
        row.id.toLowerCase().includes(q) ||
        row.username.toLowerCase().includes(q) ||
        row.note.toLowerCase().includes(q)
      );
    });
  }, [search, balanceType, balanceMovements]);

  const bankRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return MOCK_BANK_LEDGER.filter((row) => {
      if (bankKind !== 'all' && row.kind !== bankKind) return false;
      if (!q) return true;
      return (
        row.id.toLowerCase().includes(q) ||
        row.username.toLowerCase().includes(q) ||
        row.bankName.toLowerCase().includes(q) ||
        row.ref.toLowerCase().includes(q) ||
        row.note.toLowerCase().includes(q)
      );
    });
  }, [search, bankKind]);

  const telegramRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return MOCK_TELEGRAM_LOGS.filter((row) => {
      if (notifyStatus !== 'all' && row.status !== notifyStatus) return false;
      if (!q) return true;
      return (
        row.username.toLowerCase().includes(q) ||
        row.telegramUsername.toLowerCase().includes(q) ||
        row.event.toLowerCase().includes(q) ||
        row.message.toLowerCase().includes(q)
      );
    });
  }, [search, notifyStatus]);

  const emailRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return MOCK_EMAIL_LOGS.filter((row) => {
      if (notifyStatus !== 'all' && row.status !== notifyStatus) return false;
      if (!q) return true;
      return (
        row.username.toLowerCase().includes(q) ||
        row.email.toLowerCase().includes(q) ||
        row.subject.toLowerCase().includes(q)
      );
    });
  }, [search, notifyStatus]);

  const handleTabChange = (tab: HistoryTab) => {
    setActiveTab(tab);
    setSearch('');
    setBalanceType('all');
    setBankKind('all');
    setNotifyStatus('all');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 ring-1 ring-emerald-100">
          <History className="h-5 w-5 text-brand-primary" />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-black tracking-tight text-zinc-900">Lịch sử</h2>
          <p className="mt-0.5 text-[12px] font-medium text-zinc-500">
            Theo dõi biến động ví, ngân hàng và log thông báo
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-zinc-200">
        {HISTORY_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-1.5 rounded-t-lg px-4 py-2.5 text-[12px] font-bold transition-colors ${
                isActive
                  ? 'border border-b-0 border-zinc-200 bg-white text-brand-primary shadow-sm'
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm">
        <div className="border-b border-zinc-100 px-5 py-4 sm:px-6">
          <p className="text-sm font-bold text-zinc-900">{activeMeta.label}</p>
          <p className="mt-0.5 text-[12px] text-zinc-500">{activeMeta.description}</p>
          <div className="mt-4 space-y-3">
            <HistorySearchBar
              value={search}
              onChange={setSearch}
              placeholder={
                activeTab === 'balance'
                  ? 'Tìm mã GD, username, ghi chú...'
                  : activeTab === 'bank'
                    ? 'Tìm mã, username, ngân hàng, ref...'
                    : activeTab === 'telegram'
                      ? 'Tìm username, @telegram, nội dung...'
                      : 'Tìm username, email, tiêu đề...'
              }
            />
            {activeTab === 'balance' && (
              <div className="flex flex-wrap gap-2">
                <FilterChip
                  active={balanceType === 'all'}
                  label="Tất cả"
                  onClick={() => setBalanceType('all')}
                />
                {ALL_BALANCE_TYPES.map((type) => (
                  <FilterChip
                    key={type}
                    active={balanceType === type}
                    label={TRANSACTION_TYPE_LABELS[type]}
                    onClick={() => setBalanceType(type)}
                  />
                ))}
              </div>
            )}
            {activeTab === 'bank' && (
              <div className="flex flex-wrap gap-2">
                <FilterChip active={bankKind === 'all'} label="Tất cả" onClick={() => setBankKind('all')} />
                {ALL_BANK_KINDS.map((kind) => (
                  <FilterChip
                    key={kind}
                    active={bankKind === kind}
                    label={BANK_LEDGER_LABELS[kind]}
                    onClick={() => setBankKind(kind)}
                  />
                ))}
              </div>
            )}
            {(activeTab === 'telegram' || activeTab === 'email') && (
              <div className="flex flex-wrap gap-2">
                <FilterChip
                  active={notifyStatus === 'all'}
                  label="Tất cả"
                  onClick={() => setNotifyStatus('all')}
                />
                {ALL_NOTIFY_STATUS.map((status) => (
                  <FilterChip
                    key={status}
                    active={notifyStatus === status}
                    label={NOTIFY_STATUS_LABELS[status]}
                    onClick={() => setNotifyStatus(status)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          {activeTab === 'balance' && (
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <Th>Mã</Th>
                  <Th>Username</Th>
                  <Th>Loại</Th>
                  <Th>Số tiền</Th>
                  <Th>Số dư sau</Th>
                  <Th>Ghi chú</Th>
                  <Th>Thời gian</Th>
                </tr>
              </thead>
              <tbody>
                {balanceRows.length === 0 ? (
                  <EmptyRow colSpan={7} message="Không có bản ghi phù hợp." />
                ) : (
                  balanceRows.map((row) => (
                    <tr key={row.id} className="border-b border-slate-100 hover:bg-emerald-50/30">
                      <Td className="font-bold text-brand-primary">{row.id}</Td>
                      <Td>{row.username}</Td>
                      <Td>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${TRANSACTION_TYPE_STYLES[row.type]}`}
                        >
                          {TRANSACTION_TYPE_LABELS[row.type]}
                        </span>
                      </Td>
                      <Td
                        className={`font-black tabular-nums ${row.amount >= 0 ? 'text-emerald-600' : 'text-red-600'}`}
                      >
                        {formatMoney(row.amount)}
                      </Td>
                      <Td className="tabular-nums">{formatMoney(row.balanceAfter, false)}</Td>
                      <Td className="max-w-[220px] truncate" title={row.note}>
                        {row.note}
                      </Td>
                      <Td muted>{row.time}</Td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'bank' && (
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <Th>Mã</Th>
                  <Th>Loại</Th>
                  <Th>Ngân hàng</Th>
                  <Th>Username</Th>
                  <Th>Số tiền</Th>
                  <Th>Mã ref</Th>
                  <Th>Trạng thái</Th>
                  <Th>Ghi chú</Th>
                  <Th>Thời gian</Th>
                </tr>
              </thead>
              <tbody>
                {bankRows.length === 0 ? (
                  <EmptyRow colSpan={9} message="Không có bản ghi phù hợp." />
                ) : (
                  bankRows.map((row) => (
                    <tr key={row.id} className="border-b border-slate-100 hover:bg-emerald-50/30">
                      <Td className="font-bold text-brand-primary">{row.id}</Td>
                      <Td>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${BANK_LEDGER_STYLES[row.kind]}`}
                        >
                          {row.amount >= 0 ? (
                            <ArrowDownLeft className="h-3 w-3" />
                          ) : (
                            <ArrowUpRight className="h-3 w-3" />
                          )}
                          {BANK_LEDGER_LABELS[row.kind]}
                        </span>
                      </Td>
                      <Td>{row.bankName}</Td>
                      <Td>{row.username}</Td>
                      <Td
                        className={`font-black tabular-nums ${row.amount >= 0 ? 'text-emerald-600' : 'text-red-600'}`}
                      >
                        {formatMoney(row.amount)}
                      </Td>
                      <Td className="font-mono text-[11px]">{row.ref}</Td>
                      <Td>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${NOTIFY_STATUS_STYLES[row.status === 'success' ? 'sent' : row.status === 'pending' ? 'pending' : 'failed']}`}
                        >
                          {row.status === 'success'
                            ? 'Thành công'
                            : row.status === 'pending'
                              ? 'Chờ xử lý'
                              : 'Thất bại'}
                        </span>
                      </Td>
                      <Td className="max-w-[180px] truncate" title={row.note}>
                        {row.note}
                      </Td>
                      <Td muted>{row.time}</Td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'telegram' && (
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <Th>Mã</Th>
                  <Th>Username</Th>
                  <Th>Telegram</Th>
                  <Th>Sự kiện</Th>
                  <Th>Nội dung</Th>
                  <Th>Trạng thái</Th>
                  <Th>Thời gian</Th>
                </tr>
              </thead>
              <tbody>
                {telegramRows.length === 0 ? (
                  <EmptyRow colSpan={7} message="Không có log Telegram phù hợp." />
                ) : (
                  telegramRows.map((row) => (
                    <tr key={row.id} className="border-b border-slate-100 hover:bg-emerald-50/30">
                      <Td className="font-bold text-brand-primary">{row.id}</Td>
                      <Td>{row.username}</Td>
                      <Td className="font-mono text-[12px] text-sky-700">{row.telegramUsername}</Td>
                      <Td>{row.event}</Td>
                      <Td className="max-w-[240px] truncate" title={row.message}>
                        {row.message}
                      </Td>
                      <Td>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${NOTIFY_STATUS_STYLES[row.status]}`}
                        >
                          {NOTIFY_STATUS_LABELS[row.status]}
                        </span>
                      </Td>
                      <Td muted>{row.time}</Td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'email' && (
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <Th>Mã</Th>
                  <Th>Username</Th>
                  <Th>Email</Th>
                  <Th>Tiêu đề</Th>
                  <Th>Trạng thái</Th>
                  <Th>Thời gian</Th>
                </tr>
              </thead>
              <tbody>
                {emailRows.length === 0 ? (
                  <EmptyRow colSpan={6} message="Không có log email phù hợp." />
                ) : (
                  emailRows.map((row) => (
                    <tr key={row.id} className="border-b border-slate-100 hover:bg-emerald-50/30">
                      <Td className="font-bold text-brand-primary">{row.id}</Td>
                      <Td>{row.username}</Td>
                      <Td className="text-[12px]">{row.email}</Td>
                      <Td className="max-w-[280px] truncate" title={row.subject}>
                        {row.subject}
                      </Td>
                      <Td>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${NOTIFY_STATUS_STYLES[row.status]}`}
                        >
                          {NOTIFY_STATUS_LABELS[row.status]}
                        </span>
                      </Td>
                      <Td muted>{row.time}</Td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function Th({ children }: { children: ReactNode }) {
  return (
    <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-wide text-slate-600 sm:px-6">
      {children}
    </th>
  );
}

function Td({
  children,
  className = '',
  muted,
  title,
}: {
  children: ReactNode;
  className?: string;
  muted?: boolean;
  title?: string;
}) {
  return (
    <td
      title={title}
      className={`px-5 py-3 text-[13px] sm:px-6 ${muted ? 'text-[12px] font-medium text-slate-400' : 'text-slate-700'} ${className}`}
    >
      {children}
    </td>
  );
}
