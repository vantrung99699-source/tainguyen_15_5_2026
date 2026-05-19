from pathlib import Path

path = Path(__file__).resolve().parents[1] / "src/pages/admin/PaymentsSection.tsx"
lines = path.read_text(encoding="utf-8").splitlines()

start = next(i for i, l in enumerate(lines) if l.startswith("type GatewayStatus"))
end = next(i for i, l in enumerate(lines) if l.startswith("function formatMoney"))

new_header = """import type { BankCatalogEntry, DepositCurrency, GatewayStatus, PaymentGateway, Transaction } from '../../types/payment';
import {
  DEFAULT_MIN_DEPOSIT_USD,
  DEFAULT_MIN_DEPOSIT_VND,
} from '../../types/payment';
import {
  loadGateways,
  saveGateways,
  loadGlobalSettings,
  saveGlobalSettings,
  formatMinDeposit,
} from '../../services/paymentConfig';
import {
  initialPaymentGateways,
  initialTransactions,
  BANK_CATALOG,
  THIRD_PARTY_CATALOG,
  catalogToGateway,
} from './paymentData';"""

lines = lines[:22] + new_header.splitlines() + lines[end:]

text = "\n".join(lines) + "\n"

# imports block at top - fix duplicate
text = text.replace(
    "import { AddBankModal, TransactionDetailModal } from './PaymentsModals';",
    "import { AddProviderModal, TransactionDetailModal } from './PaymentsModals';",
)

# Gateway modal subtitle by type
text = text.replace(
    '<p className="text-[11px] text-slate-500">Tích hợp cổng thanh toán ngân hàng</p>',
    '<p className="text-[11px] text-slate-500">{form.providerType === \'third_party\' ? \'Nhà cung cấp thanh toán thứ 3\' : \'Tích hợp cổng thanh toán ngân hàng\'}</p>',
)

# Add deposit fields before Kích hoạt cổng
deposit_fields = """
          <motion.div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 space-y-3">
            <p className="text-xs font-bold uppercase text-slate-500">Nạp tiền (trang khách hàng)</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[11px] font-bold text-slate-500">Nạp tối thiểu</label>
                <input
                  type="number"
                  min={0}
                  step={form.minDepositCurrency === 'USD' ? 0.01 : 1}
                  value={form.minDepositAmount}
                  onChange={(e) =>
                    setForm({ ...form, minDepositAmount: Number(e.target.value) || 0 })
                  }
                  className={inputClass}
                />
              </motion.div>
              <div>
                <label className="mb-1.5 block text-[11px] font-bold text-slate-500">Loại tiền</label>
                <select
                  value={form.minDepositCurrency}
                  onChange={(e) => {
                    const currency = e.target.value as DepositCurrency;
                    setForm({
                      ...form,
                      minDepositCurrency: currency,
                      minDepositAmount:
                        currency === 'USD' ? DEFAULT_MIN_DEPOSIT_USD : DEFAULT_MIN_DEPOSIT_VND,
                    });
                  }}
                  className={inputClass}
                >
                  <option value="VND">VND (Việt Nam đồng)</option>
                  <option value="USD">USD (Đô la Mỹ)</option>
                </select>
              </motion.div>
            </motion.div>
            <p className="text-[11px] text-slate-400">
              Mặc định: {formatMinDeposit(DEFAULT_MIN_DEPOSIT_VND, 'VND')} hoặc{' '}
              {formatMinDeposit(DEFAULT_MIN_DEPOSIT_USD, 'USD')}
            </p>
            <div>
              <label className="mb-1.5 block text-[11px] font-bold text-slate-500">
                Lưu ý nạp tiền riêng cổng này
              </label>
              <textarea
                value={form.depositNote}
                onChange={(e) => setForm({ ...form, depositNote: e.target.value })}
                rows={3}
                placeholder="VD: Chỉ chấp nhận chuyển khoản nội địa, không nhận qua trung gian..."
                className={`${inputClass} resize-y text-[13px] font-medium`}
              />
            </motion.div>
          </motion.div>
"""

# Fix deposit_fields - use div not motion.div in template - write with div only
deposit_fields = deposit_fields.replace("<motion.div", "<div").replace("</motion.div>", "</div>")

text = text.replace(
    '          <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">\n            <div>\n              <p className="text-sm font-bold text-slate-800">Kích hoạt cổng</p>',
    deposit_fields
    + '          <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">\n            <motion.div>\n              <p className="text-sm font-bold text-slate-800">Kích hoạt cổng</p>',
)

text = text.replace(
    '              <p className="text-[12px] text-slate-500">Bật/tắt nhận thanh toán qua ngân hàng này</p>\n            </motion.div>',
    '              <p className="text-[12px] text-slate-500">Bật/tắt nhận thanh toán qua ngân hàng này</p>\n            </motion.div>',
)

# Remove ALL_BANK_TEMPLATES if still there
import re
text = re.sub(
    r"\nconst ALL_BANK_TEMPLATES: BankCatalogEntry\[\] = \[.*?\];\n",
    "\nconst ALL_BANK_TEMPLATES = [\n  ...initialPaymentGateways.map((g) => ({\n    id: g.id,\n    bankCode: g.bankCode,\n    bankName: g.bankName,\n    shortName: g.shortName,\n    color: g.color,\n    apiEndpoint: g.apiEndpoint,\n    webhookUrl: g.webhookUrl,\n    providerType: g.providerType,\n  })),\n  ...BANK_CATALOG.filter((c) => !initialPaymentGateways.some((g) => g.id === c.id)),\n];\n",
    text,
    flags=re.DOTALL,
)

path.write_text(text, encoding="utf-8")
print("phase1")
