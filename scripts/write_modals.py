from pathlib import Path

# Build PaymentsModals.tsx without ambiguous tags
d_open = "<div"
d_close = "</div>"
m_open = "<motion.div"
m_close = "</motion.div>"

def L(*parts):
    return "".join(parts) + "\n"

lines = []
lines.append("import { createPortal } from 'react-dom';")
lines.append("import { Plus, X } from 'lucide-react';")
lines.append("import { motion } from 'motion/react';")
lines.append("")
lines.append("export interface BankCatalogEntry {")
lines.append("  id: string;")
lines.append("  bankCode: string;")
lines.append("  bankName: string;")
lines.append("  shortName: string;")
lines.append("  color: string;")
lines.append("  apiEndpoint: string;")
lines.append("  webhookUrl: string;")
lines.append("}")
lines.append("")
lines.append("export interface Transaction {")
lines.append("  id: string;")
lines.append("  user: string;")
lines.append("  amount: number;")
lines.append("  bank: string;")
lines.append("  status: 'success' | 'pending' | 'failed';")
lines.append("  date: string;")
lines.append("  ref: string;")
lines.append("  content: string;")
lines.append("  note: string;")
lines.append("}")
lines.append("")
lines.append("function formatMoney(amount: number) {")
lines.append("  return `${amount.toLocaleString('vi-VN')}\\u00a0đ`;")
lines.append("}")
lines.append("")
lines.append("export function AddBankModal({")
lines.append("  banks,")
lines.append("  existingIds,")
lines.append("  onClose,")
lines.append("  onAdd,")
lines.append("}: {")
lines.append("  banks: BankCatalogEntry[];")
lines.append("  existingIds: Set<string>;")
lines.append("  onClose: () => void;")
lines.append("  onAdd: (entry: BankCatalogEntry) => void;")
lines.append("}) {")
lines.append("  const available = banks.filter((b) => !existingIds.has(b.id));")
lines.append("")
lines.append("  const modal = (")
lines.append(m_open)
lines.append('      initial={{ opacity: 0 }}')
lines.append('      animate={{ opacity: 1 }}')
lines.append('      exit={{ opacity: 0 }}')
lines.append('      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4"')
lines.append("      onClick={onClose}")
lines.append("    >")
lines.append(m_open)
lines.append('        initial={{ opacity: 0, scale: 0.95, y: 12 }}')
lines.append('        animate={{ opacity: 1, scale: 1, y: 0 }}')
lines.append('        exit={{ opacity: 0, scale: 0.95, y: 12 }}')
lines.append('        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"')
lines.append("        onClick={(e) => e.stopPropagation()}")
lines.append("      >")
lines.append('        <motion.div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">')
lines.append("          <motion.div>")
lines.append('            <h3 className="text-base font-black text-zinc-900">Thêm ngân hàng</h3>')
lines.append('            <p className="mt-0.5 text-[12px] text-zinc-500">Chọn ngân hàng để tích hợp API</p>')
lines.append(d_close)
lines.append('          <button type="button" onClick={onClose} className="rounded-lg p-1.5 hover:bg-zinc-100">')
lines.append('            <X className="h-5 w-5 text-zinc-500" />')
lines.append("          </button>")
lines.append(d_close)
# fix header - I used motion.div wrongly. Let me fix script - header should be div not motion

path = Path(__file__).resolve().parents[1] / "src/pages/admin/PaymentsModals.tsx"
# Simpler: read template from heredoc in file
template = r'''import { createPortal } from 'react-dom';
import { Plus, X } from 'lucide-react';
import { motion } from 'motion/react';

export interface BankCatalogEntry {
  id: string;
  bankCode: string;
  bankName: string;
  shortName: string;
  color: string;
  apiEndpoint: string;
  webhookUrl: string;
}

export interface Transaction {
  id: string;
  user: string;
  amount: number;
  bank: string;
  status: 'success' | 'pending' | 'failed';
  date: string;
  ref: string;
  content: string;
  note: string;
}

function formatMoney(amount: number) {
  return `${amount.toLocaleString('vi-VN')}\u00a0đ`;
}

export function AddBankModal({
  banks,
  existingIds,
  onClose,
  onAdd,
}: {
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
        __HEADER_ADD__
        __BODY_ADD__
      __CLOSE_PANEL__
    __CLOSE_OVERLAY__
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
        __HEADER_TX__
        __BODY_TX__
        __FOOTER_TX__
      __CLOSE_PANEL__
    __CLOSE_OVERLAY__
  );

  return createPortal(modal, document.body);
}
'''

header_add = f"""{d_open} className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
          {d_open}>
            <h3 className="text-base font-black text-zinc-900">Thêm ngân hàng</h3>
            <p className="mt-0.5 text-[12px] text-zinc-500">Chọn ngân hàng để tích hợp API</p>
          {d_close}
          <button type="button" onClick={{onClose}} className="rounded-lg p-1.5 hover:bg-zinc-100">
            <X className="h-5 w-5 text-zinc-500" />
          </button>
        {d_close}"""

path.write_text("placeholder", encoding="utf-8")
