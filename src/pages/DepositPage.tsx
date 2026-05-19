import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertCircle,
  Building2,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  Copy,
  Check,
  QrCode,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import {
  loadGateways,
  loadGlobalSettings,
  formatMinDeposit,
} from '../services/paymentConfig';
import {
  buildDepositTransferContent,
  buildVietQrImageUrl,
  MOCK_DEPOSIT_USER,
} from '../services/depositContent';
import type { PaymentGateway } from '../types/payment';
import { initialPaymentGateways } from './admin/paymentData';

type DepositStep = 'bank' | 'amount' | 'qr';

const AMOUNT_PRESETS_VND = [10_000, 50_000, 100_000, 200_000, 500_000, 1_000_000];

function formatAmount(amount: number, currency: 'VND' | 'USD') {
  if (currency === 'USD') {
    return `$${amount.toLocaleString('en-US')}`;
  }
  return `${amount.toLocaleString('vi-VN')}\u00a0đ`;
}

export default function DepositPage() {
  const gateways = useMemo(
    () => loadGateways(initialPaymentGateways).filter((g) => g.enabled),
    []
  );
  const settings = useMemo(() => loadGlobalSettings(), []);
  const [step, setStep] = useState<DepositStep>('bank');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [copied, setCopied] = useState(false);

  const selected = gateways.find((g) => g.id === selectedId) ?? null;
  const transferContent = buildDepositTransferContent(settings, MOCK_DEPOSIT_USER);

  const finalAmount = amount ?? (customAmount ? Number(customAmount.replace(/\D/g, '')) : 0);

  const minAmount = selected?.minDepositAmount ?? 1000;
  const currency = selected?.minDepositCurrency ?? 'VND';
  const amountValid = finalAmount >= minAmount;

  const vietQrUrl =
    selected && amountValid
      ? buildVietQrImageUrl({
          gatewayId: selected.id,
          accountNumber: selected.accountNumber,
          accountHolder: selected.accountHolder,
          amount: finalAmount,
          transferContent,
        })
      : null;

  const handleSelectBank = (id: string) => {
    setSelectedId(id);
    setAmount(null);
    setCustomAmount('');
    setStep('amount');
  };

  const handleConfirmAmount = () => {
    if (!amountValid) return;
    setStep('qr');
  };

  const handleCopyContent = async () => {
    await navigator.clipboard.writeText(transferContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-lg px-4 py-8 sm:px-6"
    >
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-zinc-900">Nạp tiền vào ví</h1>
        <p className="mt-1 text-[13px] font-medium text-zinc-500">
          {step === 'bank' && 'Bước 1: Chọn ngân hàng'}
          {step === 'amount' && 'Bước 2: Chọn số tiền nạp'}
          {step === 'qr' && 'Bước 3: Quét mã QR để chuyển khoản'}
        </p>
        <StepIndicator step={step} />
      </div>

      {settings.globalDepositNote.trim() ? (
        <div className="mb-6 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-amber-800">Lưu ý nạp tiền</p>
            <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-amber-900/90">
              {settings.globalDepositNote}
            </p>
          </div>
        </div>
      ) : null}

      <AnimatePresence mode="wait">
        {step === 'bank' && (
          <motion.div
            key="bank"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            className="space-y-3"
          >
            {gateways.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-zinc-200 py-12 text-center text-sm text-zinc-500">
                Chưa có phương thức nạp tiền.
              </p>
            ) : (
              gateways.map((gateway) => (
                <GatewayOption
                  key={gateway.id}
                  gateway={gateway}
                  onSelect={() => handleSelectBank(gateway.id)}
                />
              ))
            )}
          </motion.div>
        )}

        {step === 'amount' && selected && (
          <motion.div
            key="amount"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            className="space-y-4"
          >
            <SelectedBankSummary gateway={selected} onBack={() => setStep('bank')} />

            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="mb-3 text-sm font-bold text-zinc-900">Chọn số tiền</p>
              <p className="mb-4 text-[12px] text-zinc-500">
                Tối thiểu:{' '}
                <strong className="text-brand-primary">{formatMinDeposit(minAmount, currency)}</strong>
              </p>

              {currency === 'VND' ? (
                <div className="mb-4 grid grid-cols-3 gap-2">
                  {AMOUNT_PRESETS_VND.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setAmount(preset);
                        setCustomAmount('');
                      }}
                      className={`rounded-xl border py-2.5 text-[12px] font-bold transition-colors ${
                        amount === preset
                          ? 'border-brand-primary bg-emerald-50 text-brand-primary'
                          : 'border-zinc-200 text-zinc-700 hover:border-emerald-200'
                      }`}
                    >
                      {formatAmount(preset, 'VND')}
                    </button>
                  ))}
                </div>
              ) : null}

              <label className="mb-1.5 block text-[11px] font-bold uppercase text-zinc-400">
                Hoặc nhập số tiền
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setAmount(null);
                }}
                placeholder={currency === 'VND' ? 'VD: 100000' : 'VD: 10'}
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm font-bold text-zinc-800 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
              />

              {!amountValid && finalAmount > 0 ? (
                <p className="mt-2 text-[12px] font-medium text-red-600">
                  Số tiền phải từ {formatMinDeposit(minAmount, currency)} trở lên.
                </p>
              ) : null}

              <button
                type="button"
                disabled={!amountValid}
                onClick={handleConfirmAmount}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary py-3 text-sm font-bold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Tạo mã QR nạp tiền
                <QrCode className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 'qr' && selected && amountValid && (
          <motion.div
            key="qr"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            className="space-y-4"
          >
            <SelectedBankSummary gateway={selected} onBack={() => setStep('amount')} />

            <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
              <div className="mb-4 text-center">
                <p className="text-[11px] font-bold uppercase text-zinc-400">Số tiền chuyển</p>
                <p className="text-2xl font-black tabular-nums text-brand-primary">
                  {formatAmount(finalAmount, currency)}
                </p>
              </div>

              <div className="flex justify-center">
                {vietQrUrl ? (
                  <img
                    src={vietQrUrl}
                    alt="Mã QR VietQR"
                    className="h-56 w-56 rounded-xl border border-zinc-100 object-contain"
                  />
                ) : (
                  <div className="rounded-xl border border-zinc-200 bg-white p-4">
                    <QRCodeSVG value={transferContent} size={200} level="M" />
                    <p className="mt-2 max-w-[200px] text-center text-[10px] text-zinc-400">
                      QR dự phòng (chưa cấu hình STK VietQR)
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-5 space-y-3 rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
                <div>
                  <p className="text-[10px] font-bold uppercase text-emerald-700">Nội dung chuyển khoản</p>
                  <p className="mt-1 font-mono text-sm font-bold tracking-wide text-zinc-900">{transferContent}</p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyContent}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-white py-2 text-[12px] font-bold text-emerald-700 hover:bg-emerald-50"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Đã sao chép' : 'Sao chép nội dung'}
                </button>
                {selected.accountNumber ? (
                  <div className="border-t border-emerald-100 pt-3 text-[12px] text-zinc-600">
                    <p>
                      <span className="font-bold">STK:</span> {selected.accountNumber}
                    </p>
                    <p>
                      <span className="font-bold">Chủ TK:</span> {selected.accountHolder}
                    </p>
                  </div>
                ) : null}
              </div>

              <p className="mt-4 text-center text-[11px] text-zinc-400">
                Chuyển đúng số tiền và nội dung. Hệ thống tự cộng tiền sau 1–15 phút.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StepIndicator({ step }: { step: DepositStep }) {
  const steps: { id: DepositStep; label: string }[] = [
    { id: 'bank', label: 'Ngân hàng' },
    { id: 'amount', label: 'Số tiền' },
    { id: 'qr', label: 'QR' },
  ];
  const current = steps.findIndex((s) => s.id === step);

  return (
    <div className="mt-4 flex gap-2">
      {steps.map((s, i) => (
        <div
          key={s.id}
          className={`flex-1 rounded-full py-1 text-center text-[10px] font-bold uppercase tracking-wide ${
            i <= current ? 'bg-brand-primary text-white' : 'bg-zinc-100 text-zinc-400'
          }`}
        >
          {s.label}
        </div>
      ))}
    </div>
  );
}

function SelectedBankSummary({ gateway, onBack }: { gateway: PaymentGateway; onBack: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3">
      <button
        type="button"
        onClick={onBack}
        className="rounded-lg p-2 hover:bg-zinc-100"
        aria-label="Quay lại"
      >
        <ChevronLeft className="h-5 w-5 text-zinc-600" />
      </button>
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[10px] font-black text-white"
        style={{ backgroundColor: gateway.color }}
      >
        {gateway.bankCode}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-zinc-900">{gateway.shortName}</p>
        <p className="truncate text-[11px] text-zinc-500">{gateway.bankName}</p>
      </div>
    </div>
  );
}

function GatewayOption({ gateway, onSelect }: { gateway: PaymentGateway; onSelect: () => void }) {
  const Icon = gateway.providerType === 'third_party' ? CreditCard : Building2;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 text-left transition-all hover:border-emerald-200 hover:bg-emerald-50/30"
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[10px] font-black text-white"
        style={{ backgroundColor: gateway.color }}
      >
        {gateway.providerType === 'third_party' ? <Icon className="h-5 w-5" /> : gateway.bankCode}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-zinc-900">{gateway.shortName}</p>
        <p className="truncate text-[12px] text-zinc-500">{gateway.bankName}</p>
        <p className="mt-0.5 text-[11px] font-semibold text-brand-primary">
          Tối thiểu {formatMinDeposit(gateway.minDepositAmount, gateway.minDepositCurrency)}
        </p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-zinc-300" />
    </button>
  );
}
