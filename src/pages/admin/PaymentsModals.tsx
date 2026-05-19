import { createPortal } from 'react-dom';
import { Plus, X } from 'lucide-react';
import { motion } from 'motion/react';

import type { BankCatalogEntry, Transaction } from '../../types/payment';

export type { BankCatalogEntry, Transaction };

function formatMoney(amount: number) {
  return `${amount.toLocaleString('vi-VN')}\u00a0đ`;
}

export function AddProviderModal({
  title,
  subtitle,
  banks,
  existingIds,
  onClose,
  onAdd,
}: {
  title: string;
  subtitle: string;
  banks: BankCatalogEntry[];
  existingIds: Set<string>;
  onClose: () => void;
  onAdd: (entry: BankCatalogEntry) => void;
}) {
  const available = banks.filter((b) => !existingIds.has(b.id));

  const modal = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
          <div>
            <h3 className="text-base font-black text-zinc-900">{title}</h3>
            <p className="mt-0.5 text-[12px] text-zinc-500">{subtitle}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 hover:bg-zinc-100">
            <X className="h-5 w-5 text-zinc-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {available.length === 0 ? (
            <p className="py-12 text-center text-sm font-medium text-zinc-500">
              Đã thêm tất cả ngân hàng trong danh mục.
            </p>
          ) : (
            <ul className="space-y-2">
              {available.map((bank) => (
                <li key={bank.id}>
                  <button
                    type="button"
                    onClick={() => onAdd(bank)}
                    className="flex w-full items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 text-left transition-colors hover:border-emerald-200 hover:bg-emerald-50/50"
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[10px] font-black text-white"
                      style={{ backgroundColor: bank.color }}
                    >
                      {bank.bankCode}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-zinc-900">{bank.shortName}</p>
                      <p className="truncate text-[11px] text-zinc-500">{bank.bankName}</p>
                    </div>
                    <Plus className="h-4 w-4 shrink-0 text-brand-primary" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>
    </motion.div>
  );

  return createPortal(modal, document.body);
}

export function TransactionDetailModal({ tx, onClose }: { tx: Transaction; onClose: () => void }) {
  const txStatus = {
    success: { label: 'Thành công', className: 'bg-emerald-50 text-emerald-600' },
    pending: { label: 'Chờ xử lý', className: 'bg-amber-100 text-amber-700' },
    failed: { label: 'Thất bại', className: 'bg-red-100 text-red-700' },
  };
  const s = txStatus[tx.status];

  const modal = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
          <div>
            <h3 className="text-base font-black text-zinc-900">Chi tiết giao dịch</h3>
            <p className="mt-0.5 font-mono text-[12px] text-brand-primary">{tx.id}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 hover:bg-zinc-100">
            <X className="h-5 w-5 text-zinc-500" />
          </button>
        </div>
        <div className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${s.className}`}>{s.label}</span>
            <span className="text-[12px] text-zinc-500">{tx.date}</span>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-zinc-400">Số tiền</p>
            <p className="text-xl font-black tabular-nums text-red-600">{formatMoney(tx.amount)}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-[10px] font-bold uppercase text-zinc-400">Username</p>
              <p className="font-semibold text-zinc-800">{tx.username}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-zinc-400">Ngân hàng</p>
              <p className="font-semibold text-zinc-800">{tx.bank}</p>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-zinc-400">Mã giao dịch</p>
            <p className="font-mono text-[13px] text-zinc-700">{tx.ref}</p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3">
            <p className="mb-1 text-[10px] font-bold uppercase text-emerald-700">Nội dung giao dịch</p>
            <p className="text-sm font-medium leading-relaxed text-zinc-800">{tx.content}</p>
          </div>
          <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-3">
            <p className="mb-1 text-[10px] font-bold uppercase text-zinc-500">Ghi chú hệ thống</p>
            <p className="text-[13px] leading-relaxed text-zinc-600">{tx.note}</p>
          </div>
        </div>
        <div className="border-t border-zinc-100 px-6 py-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-brand-primary py-2.5 text-sm font-bold text-white hover:bg-emerald-600"
          >
            Đóng
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  return createPortal(modal, document.body);
}
