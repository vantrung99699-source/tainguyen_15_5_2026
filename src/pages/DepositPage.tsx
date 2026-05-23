import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertCircle,
  ChevronLeft,
  Copy,
  Check,
  QrCode,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Trans } from '../components/i18n/Trans';
import {
  loadGateways,
  loadGlobalSettings,
  formatMinDeposit,
  PAYMENT_SETTINGS_UPDATED,
  PAYMENT_GATEWAYS_UPDATED,
} from '../services/paymentConfig';
import {
  buildDepositTransferContent,
  buildVietQrImageUrl,
  MOCK_DEPOSIT_USER,
} from '../services/depositContent';
import {
  calcDepositBonus,
  getPromotionTierForAmount,
} from '../services/depositPromotion';
import {
  formatPromotionEndLabel,
  GLOBAL_DEPOSIT_PROMOTION_UPDATED,
  isGlobalDepositPromotionActive,
  loadGlobalDepositPromotion,
  resolveGlobalPromotionTiers,
} from '../services/globalDepositPromotion';
import type { PaymentGateway } from '../types/payment';
import { initialPaymentGateways } from './admin/paymentData';
import DepositHistoryTable from '../components/wallet/DepositHistoryTable';
import { BankSelectDropdown } from '../components/deposit/BankSelectDropdown';
import { DepositPromotionPanel } from '../components/deposit/DepositPromotionPanel';

type DepositStep = 'amount' | 'qr';

const AMOUNT_PRESETS_VND = [10_000, 50_000, 100_000, 200_000, 500_000, 1_000_000];
const AMOUNT_PRESETS_USD = [10, 25, 50, 100, 200, 500];

function formatAmount(amount: number, currency: 'VND' | 'USD') {
  if (currency === 'USD') {
    return `$${amount.toLocaleString('en-US')}`;
  }
  return `${amount.toLocaleString('vi-VN')}\u00a0đ`;
}

export default function DepositPage() {
  const [gateways, setGateways] = useState<PaymentGateway[]>(() =>
    loadGateways(initialPaymentGateways).filter((g) => g.enabled),
  );
  const [settings, setSettings] = useState(() => loadGlobalSettings());
  const [globalPromo, setGlobalPromo] = useState(() => loadGlobalDepositPromotion());
  const [step, setStep] = useState<DepositStep>('amount');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const syncSettings = () => setSettings(loadGlobalSettings());
    const syncPromo = () => setGlobalPromo(loadGlobalDepositPromotion());
    window.addEventListener(PAYMENT_SETTINGS_UPDATED, syncSettings);
    window.addEventListener(GLOBAL_DEPOSIT_PROMOTION_UPDATED, syncPromo);
    return () => {
      window.removeEventListener(PAYMENT_SETTINGS_UPDATED, syncSettings);
      window.removeEventListener(GLOBAL_DEPOSIT_PROMOTION_UPDATED, syncPromo);
    };
  }, []);

  const reloadGateways = () => {
    const loaded = loadGateways(initialPaymentGateways).filter((g) => g.enabled);
    setGateways(loaded);
    setSelectedId((prev) => {
      if (prev && loaded.some((g) => g.id === prev)) return prev;
      return loaded[0]?.id ?? null;
    });
  };

  useEffect(() => {
    reloadGateways();
    const onGatewaysUpdate = () => reloadGateways();
    window.addEventListener(PAYMENT_GATEWAYS_UPDATED, onGatewaysUpdate);
    return () => window.removeEventListener(PAYMENT_GATEWAYS_UPDATED, onGatewaysUpdate);
  }, []);

  const selected = gateways.find((g) => g.id === selectedId) ?? null;
  const transferContent = buildDepositTransferContent(settings, MOCK_DEPOSIT_USER);

  const finalAmount = amount ?? (customAmount ? Number(customAmount.replace(/\D/g, '')) : 0);

  const minAmount = selected?.minDepositAmount ?? 1000;
  const currency = selected?.minDepositCurrency ?? 'VND';
  const amountValid = finalAmount >= minAmount;

  const globalPromoActive = isGlobalDepositPromotionActive(globalPromo);
  const globalTiers = globalPromoActive
    ? resolveGlobalPromotionTiers(globalPromo, currency)
    : [];
  const useGlobalPromo = globalTiers.length > 0;

  const promoEnabled = useGlobalPromo
    ? true
    : (selected?.depositPromotionEnabled ?? false);
  const promoTiers = useGlobalPromo ? globalTiers : (selected?.depositPromotionTiers ?? []);
  const promoCampaignName = useGlobalPromo ? globalPromo.name : undefined;
  const promoEndsAtLabel = useGlobalPromo ? formatPromotionEndLabel(globalPromo.endsAt) : null;
  const activePromo =
    promoEnabled && finalAmount > 0
      ? getPromotionTierForAmount(finalAmount, currency, promoTiers)
      : null;
  const bonusAmount = activePromo ? calcDepositBonus(finalAmount, activePromo.bonusPercent) : 0;

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

  const amountPresets = useMemo(
    () => (currency === 'USD' ? AMOUNT_PRESETS_USD : AMOUNT_PRESETS_VND),
    [currency],
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6"
    >
      <div className="mb-8 grid gap-8 xl:grid-cols-[minmax(0,440px)_1fr] xl:items-start">
        <div>
          <div className="mb-6">
            <h1 className="text-2xl font-black tracking-tight text-zinc-900">
              <Trans tKey="page_deposit" fallback="Nạp tiền vào ví" />
            </h1>
            <p className="mt-1 text-[13px] font-medium text-zinc-500">
              {step === 'amount' && 'Chọn ngân hàng, số tiền và xem khuyến mãi'}
              {step === 'qr' && 'Quét mã QR để chuyển khoản'}
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
            {step === 'amount' && (
              <motion.div
                key="amount"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                className="space-y-4"
              >
                <BankSelectDropdown
                  gateways={gateways}
                  selectedId={selectedId}
                  onSelect={handleSelectBank}
                />

                {selected?.depositNote.trim() ? (
                  <div className="rounded-xl border border-sky-100 bg-sky-50/80 px-4 py-3 text-[12px] leading-relaxed text-sky-900">
                    {selected.depositNote}
                  </div>
                ) : null}

                {selected ? (
                  <>
                    <DepositPromotionPanel
                      enabled={promoEnabled}
                      tiers={promoTiers}
                      currency={currency}
                      amount={finalAmount}
                      campaignName={promoCampaignName}
                      endsAtLabel={promoEndsAtLabel}
                    />

                    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                      <p className="mb-3 text-sm font-bold text-zinc-900">Chọn số tiền</p>
                      <p className="mb-4 text-[12px] text-zinc-500">
                        Tối thiểu:{' '}
                        <strong className="text-brand-primary">
                          {formatMinDeposit(minAmount, currency)}
                        </strong>
                      </p>

                      <div className="mb-4 grid grid-cols-3 gap-2">
                        {amountPresets.map((preset) => (
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
                            {formatAmount(preset, currency)}
                          </button>
                        ))}
                      </div>

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
                        placeholder={currency === 'VND' ? 'VD: 100000' : 'VD: 50'}
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
                  </>
                ) : null}
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
                <BankSelectDropdown
                  gateways={gateways}
                  selectedId={selectedId}
                  onSelect={(id) => {
                    handleSelectBank(id);
                  }}
                />

                <motion.div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
                  <div className="mb-4 text-center">
                    <p className="text-[11px] font-bold uppercase text-zinc-400">Số tiền chuyển</p>
                    <p className="text-2xl font-black tabular-nums text-brand-primary">
                      {formatAmount(finalAmount, currency)}
                    </p>
                    {activePromo ? (
                      <p className="mt-1 text-[12px] font-bold text-violet-700">
                        Khuyến mãi +{activePromo.bonusPercent}% → nhận thêm{' '}
                        {formatMinDeposit(bonusAmount, currency)}
                      </p>
                    ) : null}
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

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setStep('amount')}
                      className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-zinc-200 py-2.5 text-[12px] font-bold text-zinc-600 hover:bg-zinc-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Sửa số tiền
                    </button>
                  </div>

                  <p className="mt-4 text-center text-[11px] text-zinc-400">
                    Chuyển đúng số tiền và nội dung. Hệ thống tự cộng tiền sau 1–15 phút.
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <DepositHistoryTable />
      </div>
    </motion.div>
  );
}

function StepIndicator({ step }: { step: DepositStep }) {
  const steps: { id: DepositStep; label: string }[] = [
    { id: 'amount', label: 'Nạp tiền' },
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

