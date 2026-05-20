import { motion } from 'motion/react';
import { MOCK_DEPOSIT_HISTORY } from '../../data/mockWalletHistory';
import type { DepositHistoryRecord } from '../../types/customerWallet';

function formatMoney(amount: number) {
  return `${amount.toLocaleString('vi-VN')}\u00a0đ`;
}

interface DepositHistoryTableProps {
  records?: DepositHistoryRecord[];
}

export default function DepositHistoryTable({
  records = MOCK_DEPOSIT_HISTORY,
}: DepositHistoryTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-base font-black text-slate-800">Lịch sử nạp tiền</h2>
        <p className="mt-0.5 text-[12px] font-medium text-slate-500">
          Các lần nạp tiền vào ví của bạn
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/90">
              <th className="w-14 px-4 py-3 text-center text-[11px] font-black uppercase tracking-wide text-slate-600">
                STT
              </th>
              <th className="px-4 py-3 text-right text-[11px] font-black uppercase tracking-wide text-slate-600">
                Số tiền
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wide text-slate-600">
                Thời gian
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wide text-slate-600">
                Phương thức nạp
              </th>
              <th className="px-4 py-3 text-right text-[11px] font-black uppercase tracking-wide text-slate-600">
                Số tiền khuyến mãi
              </th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm font-medium text-slate-500">
                  Chưa có lịch sử nạp tiền.
                </td>
              </tr>
            ) : (
              records.map((row, index) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="border-b border-slate-50 transition-colors hover:bg-emerald-50/40"
                >
                  <td className="px-4 py-3 text-center text-sm font-bold tabular-nums text-slate-500">
                    {index + 1}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-black tabular-nums text-emerald-700">
                    +{formatMoney(row.amount)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-slate-600">
                    {row.time}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-700">{row.method}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-bold tabular-nums text-amber-600">
                    {row.bonusAmount > 0 ? `+${formatMoney(row.bonusAmount)}` : '—'}
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
