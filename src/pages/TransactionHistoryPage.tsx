import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, Search, Filter } from 'lucide-react';
import { motion } from 'motion/react';
import { loadCustomerSession } from '../services/customerSession';
import {
  getTransactionsForUser,
  WALLET_TX_UPDATED,
} from '../services/walletTransactionService';
import type { TransactionType, WalletTransaction } from '../types/customerWallet';
import {
  TRANSACTION_TYPE_LABELS,
  TRANSACTION_TYPE_STYLES,
} from '../components/wallet/transactionLabels';
import { useLocaleCurrency } from '../context/LocaleCurrencyContext';

const ALL_TYPES: TransactionType[] = ['deposit', 'credit', 'debit', 'purchase', 'refund'];

interface TransactionHistoryPageProps {
  onBack?: () => void;
}

export default function TransactionHistoryPage({ onBack }: TransactionHistoryPageProps) {
  const { formatMoney: fmt, t } = useLocaleCurrency();
  const formatMoney = (amount: number, signed = true) => {
    const prefix = signed && amount > 0 ? '+' : signed && amount < 0 ? '' : '';
    const abs = Math.abs(amount);
    return `${prefix}${fmt(abs)}`;
  };
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  const [transactions, setTransactions] = useState<WalletTransaction[]>(() =>
    getTransactionsForUser(loadCustomerSession().userId),
  );

  useEffect(() => {
    const sync = () =>
      setTransactions(getTransactionsForUser(loadCustomerSession().userId));
    window.addEventListener(WALLET_TX_UPDATED, sync);
    return () => window.removeEventListener(WALLET_TX_UPDATED, sync);
  }, []);

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        tx.id.toLowerCase().includes(q) ||
        tx.note.toLowerCase().includes(q) ||
        TRANSACTION_TYPE_LABELS[tx.type].toLowerCase().includes(q)
      );
    });
  }, [search, typeFilter, transactions]);

  return (
    <div className="min-h-screen bg-[#fcfcfd] pb-20">
      <div className="mx-auto max-w-[1400px] px-6 pt-10">
        <div className="mb-8 flex items-center gap-3">
          <button
            type="button"
            onClick={() => (onBack ? onBack() : window.history.back())}
            className="rounded-xl p-2 transition-colors hover:bg-slate-100"
            aria-label="Quay lại"
          >
            <ChevronLeft className="h-5 w-5 text-slate-600" />
          </button>
          <motion.div>
            <h1 className="text-2xl font-black text-slate-800">
              {t('page_transactions', 'Lịch sử giao dịch')}
            </h1>
            <p className="mt-0.5 text-[13px] font-medium text-slate-500">
              Nạp tiền, cộng/trừ tiền, mua hàng và hoàn tiền
            </p>
          </motion.div>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="flex flex-1 items-center gap-3">
              <Search className="h-5 w-5 shrink-0 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm mã GD, ghi chú..."
                className="w-full border-0 bg-transparent text-sm font-bold text-slate-800 outline-none placeholder:text-slate-400"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="hidden h-4 w-4 text-slate-400 sm:block" />
              <FilterChip
                active={typeFilter === 'all'}
                label="Tất cả"
                onClick={() => setTypeFilter('all')}
              />
              {ALL_TYPES.map((type) => (
                <FilterChip
                  key={type}
                  active={typeFilter === type}
                  label={TRANSACTION_TYPE_LABELS[type]}
                  onClick={() => setTypeFilter(type)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/90">
                  <th className="w-14 px-4 py-3 text-center text-[11px] font-black uppercase text-slate-600">
                    STT
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-black uppercase text-slate-600">
                    Loại giao dịch
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] font-black uppercase text-slate-600">
                    Số tiền
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] font-black uppercase text-slate-600">
                    Số dư sau GD
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-black uppercase text-slate-600">
                    Thời gian
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-black uppercase text-slate-600">
                    Ghi chú
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-14 text-center text-sm font-medium text-slate-500">
                      Không có giao dịch phù hợp.
                    </td>
                  </tr>
                ) : (
                  filtered.map((tx, index) => (
                    <TransactionRow key={tx.id} tx={tx} index={index} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition-colors ${
        active
          ? 'bg-brand-primary text-white shadow-sm'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
    >
      {label}
    </button>
  );
}

function TransactionRow({ tx, index }: { tx: WalletTransaction; index: number }) {
  const isPositive = tx.amount > 0;

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.03 }}
      className="border-b border-slate-50 transition-colors hover:bg-emerald-50/30"
    >
      <td className="px-4 py-3 text-center text-sm font-bold text-slate-500">{index + 1}</td>
      <td className="px-4 py-3">
        <span
          className={`inline-block rounded-md px-2.5 py-1 text-[11px] font-black ${TRANSACTION_TYPE_STYLES[tx.type]}`}
        >
          {TRANSACTION_TYPE_LABELS[tx.type]}
        </span>
      </td>
      <td
        className={`whitespace-nowrap px-4 py-3 text-right text-sm font-black tabular-nums ${
          isPositive ? 'text-emerald-700' : 'text-red-600'
        }`}
      >
        {formatMoney(tx.amount)}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-bold tabular-nums text-slate-700">
        {tx.balanceAfter.toLocaleString('vi-VN')}&nbsp;đ
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-slate-600">{tx.time}</td>
      <td className="max-w-xs px-4 py-3 text-sm font-medium text-slate-600">{tx.note}</td>
    </motion.tr>
  );
}
