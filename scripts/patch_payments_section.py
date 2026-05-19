from pathlib import Path

path = Path(__file__).resolve().parents[1] / "src/pages/admin/PaymentsSection.tsx"
lines = path.read_text(encoding="utf-8").splitlines()

# Remove broken AddBankModal + TransactionDetailModal
start = next(i for i, l in enumerate(lines) if l.startswith("function AddBankModal"))
end = next(i for i, l in enumerate(lines) if l.startswith("function GatewayBankTable"))
lines = lines[:start] + lines[end:]

text = "\n".join(lines) + "\n"

# imports
text = text.replace(
    "import { useState, useEffect } from 'react';\nimport { createPortal } from 'react-dom';",
    "import { useState, useEffect } from 'react';",
)
text = text.replace(
    "import { motion, AnimatePresence } from 'motion/react';",
    "import { motion, AnimatePresence } from 'motion/react';\nimport { AddBankModal, TransactionDetailModal } from './PaymentsModals';",
)

# Gateway table header - remove Môi trường, widen actions
text = text.replace(
    '              <th className="hidden px-4 py-3 text-left text-[11px] font-black uppercase tracking-wide text-slate-600 md:table-cell">Môi trường</th>\n',
    "",
)
text = text.replace(
    '              <th className="w-28 px-4 py-3 text-right text-[11px] font-black uppercase tracking-wide text-slate-600">Cài đặt</th>',
    '              <th className="w-40 px-4 py-3 text-right text-[11px] font-black uppercase tracking-wide text-slate-600">Thao tác</th>',
)

# Remove env td block (per row)
text = text.replace(
    """                <td className="hidden px-4 py-3 md:table-cell">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                      gateway.environment === 'production'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {gateway.environment}
                  </span>
                </td>
""",
    "",
)

# Replace settings button cell with settings + delete
old_btn = """                <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => onOpenConfig(gateway)}
                    className="inline-flex items-center gap-1 rounded-lg bg-zinc-900 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-zinc-800"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    Cài đặt
                  </button>
                </td>"""

new_btn = """                <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => onOpenConfig(gateway)}
                      className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100"
                    >
                      <Settings className="h-3.5 w-3.5" />
                      Cài đặt
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(gateway.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] font-bold text-red-600 hover:bg-red-100"
                      title="Xóa khỏi bảng"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </motion.div>
                </td>"""

text = text.replace(old_btn, new_btn.replace("<motion.div", "<div").replace("</motion.div>", "</div>"))

# State in PaymentsSection
text = text.replace(
    "  const [configGateway, setConfigGateway] = useState<PaymentGateway | null>(null);",
    "  const [configGateway, setConfigGateway] = useState<PaymentGateway | null>(null);\n  const [showAddBankModal, setShowAddBankModal] = useState(false);\n  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);",
)

text = text.replace(
    "  const testConnection = (gateway: PaymentGateway) => {",
    "  const existingBankIds = new Set(gateways.map((g) => g.id));\n\n  const handleAddBank = (entry: BankCatalogEntry) => {\n    setGateways((prev) => [...prev, catalogToGateway(entry)]);\n    setShowAddBankModal(false);\n  };\n\n  const handleDeleteBank = (id: string) => {\n    const bank = gateways.find((g) => g.id === id);\n    if (!bank) return;\n    if (!window.confirm(`Xóa ${bank.shortName} khỏi bảng tích hợp API?`)) return;\n    setGateways((prev) => prev.filter((g) => g.id !== id));\n  };\n\n  const testConnection = (gateway: PaymentGateway) => {",
)

# Thêm ngân hàng button
text = text.replace(
    """        <button
          type="button"
          className="flex items-center gap-2 self-start rounded-xl bg-brand-primary px-4 py-2.5 text-[12px] font-bold text-white shadow-md shadow-emerald-200 hover:bg-emerald-600"
        >
          <Plus className="h-4 w-4" />
          Thêm ngân hàng
        </button>""",
    """        <button
          type="button"
          onClick={() => setShowAddBankModal(true)}
          className="flex items-center gap-2 self-start rounded-xl bg-brand-primary px-4 py-2.5 text-[12px] font-bold text-white shadow-md shadow-emerald-200 hover:bg-emerald-600"
        >
          <Plus className="h-4 w-4" />
          Thêm ngân hàng
        </button>""",
)

# GatewayBankTable onDelete
text = text.replace(
    """        <GatewayBankTable
          gateways={gateways}
          onOpenConfig={setConfigGateway}
          onToggle={(id) =>
            setGateways((prev) => prev.map((g) => (g.id === id ? { ...g, enabled: !g.enabled } : g)))
          }
        />""",
    """        <GatewayBankTable
          gateways={gateways}
          onOpenConfig={setConfigGateway}
          onToggle={(id) =>
            setGateways((prev) => prev.map((g) => (g.id === id ? { ...g, enabled: !g.enabled } : g)))
          }
          onDelete={handleDeleteBank}
        />""",
)

# Transactions table - add Nội dung column and Chi tiết
text = text.replace(
    """                <th className="px-6 py-3 text-left text-[11px] font-black uppercase tracking-wide text-slate-600">
                  Mã tham chiếu
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-black uppercase tracking-wide text-slate-600">
                  Trạng thái
                </th>""",
    """                <th className="hidden px-6 py-3 text-left text-[11px] font-black uppercase tracking-wide text-slate-600 xl:table-cell">
                  Nội dung
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-black uppercase tracking-wide text-slate-600">
                  Mã tham chiếu
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-black uppercase tracking-wide text-slate-600">
                  Trạng thái
                </th>""",
)

text = text.replace(
    """                <motion.tr
                  key={tx.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.04 }}
                  className="border-b border-slate-100 hover:bg-slate-50/50"
                >""",
    """                <motion.tr
                  key={tx.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.04 }}
                  onClick={() => setSelectedTransaction(tx)}
                  className="cursor-pointer border-b border-slate-100 hover:bg-emerald-50/40"
                >""",
)

text = text.replace(
    """                  <td className="px-6 py-3 text-[13px] text-slate-500">{tx.bank}</td>
                  <td className="px-6 py-3 font-mono text-[12px] text-slate-500">{tx.ref}</td>""",
    """                  <td className="px-6 py-3 text-[13px] text-slate-500">{tx.bank}</td>
                  <td className="hidden max-w-[200px] truncate px-6 py-3 text-[12px] text-slate-600 xl:table-cell" title={tx.content}>
                    {tx.content}
                  </td>
                  <td className="px-6 py-3 font-mono text-[12px] text-slate-500">{tx.ref}</td>""",
)

text = text.replace(
    """                  <td className="px-6 py-3 text-[12px] font-medium text-slate-400">{tx.date}</td>
                </motion.tr>""",
    """                  <td className="px-6 py-3 text-[12px] font-medium text-slate-400">{tx.date}</td>
                  <td className="px-6 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setSelectedTransaction(tx)}
                      className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Chi tiết
                    </button>
                  </td>
                </motion.tr>""",
)

# Add Thao tác header for transactions
text = text.replace(
    """                <th className="px-6 py-3 text-left text-[11px] font-black uppercase tracking-wide text-slate-600">
                  Thời gian
                </th>
              </tr>""",
    """                <th className="px-6 py-3 text-left text-[11px] font-black uppercase tracking-wide text-slate-600">
                  Thời gian
                </th>
                <th className="w-24 px-6 py-3 text-right text-[11px] font-black uppercase tracking-wide text-slate-600" />
              </tr>""",
)

# AnimatePresence modals
text = text.replace(
    """      <AnimatePresence>
        {configGateway && (
          <GatewayConfigModal
            gateway={configGateway}
            onClose={() => setConfigGateway(null)}
            onSave={saveGateway}
            onTest={testConnection}
          />
        )}
      </AnimatePresence>""",
    """      <AnimatePresence>
        {configGateway && (
          <GatewayConfigModal
            key={configGateway.id}
            gateway={configGateway}
            onClose={() => setConfigGateway(null)}
            onSave={saveGateway}
            onTest={testConnection}
          />
        )}
        {showAddBankModal && (
          <AddBankModal
            key="add-bank"
            banks={ALL_BANK_TEMPLATES}
            existingIds={existingBankIds}
            onClose={() => setShowAddBankModal(false)}
            onAdd={handleAddBank}
          />
        )}
        {selectedTransaction && (
          <TransactionDetailModal
            key={selectedTransaction.id}
            tx={selectedTransaction}
            onClose={() => setSelectedTransaction(null)}
          />
        )}
      </AnimatePresence>""",
)

path.write_text(text, encoding="utf-8")
print("patched")
