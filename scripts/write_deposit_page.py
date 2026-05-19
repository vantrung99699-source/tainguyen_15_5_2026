from pathlib import Path

p = Path(__file__).resolve().parents[1] / "src/pages/DepositPage.tsx"
d = "motion.div"
dc = "</" + "div>"
mc = "</motion.div>"

content = f'''import {{ useMemo, useState }} from 'react';
import {{ motion }} from 'motion/react';
import {{ AlertCircle, Building2, CreditCard, ChevronRight }} from 'lucide-react';
import {{
  loadGateways,
  loadGlobalSettings,
  formatMinDeposit,
}} from '../services/paymentConfig';
import type {{ PaymentGateway }} from '../types/payment';
import {{ initialPaymentGateways }} from './admin/paymentData';

export default function DepositPage() {{
  const gateways = useMemo(
    () => loadGateways(initialPaymentGateways).filter((g) => g.enabled),
    []
  );
  const settings = useMemo(() => loadGlobalSettings(), []);
  const [selectedId, setSelectedId] = useState<string | null>(gateways[0]?.id ?? null);

  const selected = gateways.find((g) => g.id === selectedId) ?? null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-zinc-900">Nạp tiền vào ví</h1>
        <p className="mt-1 text-[13px] font-medium text-zinc-500">Chọn phương thức thanh toán và làm theo hướng dẫn</p>
      {dc}
      {{settings.globalDepositNote.trim() && (
        <div className="mb-6 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-amber-800">Lưu ý nạp tiền</p>
            <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-amber-900/90">
              {{settings.globalDepositNote}}
            </p>
          {dc}
        {dc}
      )}}
      <motion.div className="space-y-3">
        {{gateways.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-zinc-200 py-12 text-center text-sm text-zinc-500">
            Chưa có phương thức nạp tiền. Vui lòng liên hệ hỗ trợ.
          </p>
        ) : (
          gateways.map((gateway) => (
            <GatewayOption
              key={{gateway.id}}
              gateway={{gateway}}
              selected={{selectedId === gateway.id}}
              onSelect={{() => setSelectedId(gateway.id)}}
            />
          ))
        )}}
      {dc}
      {{selected && (
        <motion.div
          initial={{{{ opacity: 0, y: 8 }}}}
          animate={{{{ opacity: 1, y: 0 }}}}
          className="mt-6 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm"
        >
          <h2 className="text-sm font-bold text-zinc-900">Hướng dẫn — {{selected.shortName}}</h2>
          <p className="mt-2 text-[13px] text-zinc-600">
            Số tiền nạp tối thiểu:{{' '}}
            <strong className="text-brand-primary">
              {{formatMinDeposit(selected.minDepositAmount, selected.minDepositCurrency)}}
            </strong>
          </p>
          {{selected.depositNote.trim() ? (
            <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
              <p className="text-[11px] font-bold uppercase text-emerald-700">Lưu ý riêng cổng này</p>
              <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-zinc-700">{{selected.depositNote}}</p>
            {dc}
          ) : (
            <p className="mt-3 text-[12px] italic text-zinc-400">Không có lưu ý riêng cho cổng này.</p>
          )}}
          <button
            type="button"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary py-3 text-sm font-bold text-white hover:bg-emerald-600"
          >
            Tiếp tục nạp tiền
            <ChevronRight className="h-4 w-4" />
          </button>
        {mc}
      )}}
    {dc}
  );
}}

function GatewayOption({{
  gateway,
  selected,
  onSelect,
}}: {{
  gateway: PaymentGateway;
  selected: boolean;
  onSelect: () => void;
}}) {{
  const Icon = gateway.providerType === 'third_party' ? CreditCard : Building2;

  return (
    <button
      type="button"
      onClick={{onSelect}}
      className={{`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all ${{{
        selected
          ? 'border-brand-primary bg-emerald-50/60 ring-2 ring-brand-primary/20'
          : 'border-zinc-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/30'
      }}}`}}
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[10px] font-black text-white"
        style={{{{ backgroundColor: gateway.color }}}}
      >
        {{gateway.providerType === 'third_party' ? <Icon className="h-5 w-5" /> : gateway.bankCode}}
      {dc}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-bold text-zinc-900">{{gateway.shortName}}</p>
          {{gateway.providerType === 'third_party' && (
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">
              Nhà cung cấp thứ 3
            </span>
          )}}
        {dc}
        <p className="truncate text-[12px] text-zinc-500">{{gateway.bankName}}</p>
        <p className="mt-0.5 text-[11px] font-semibold text-brand-primary">
          Tối thiểu {{formatMinDeposit(gateway.minDepositAmount, gateway.minDepositCurrency)}}
        </p>
      {dc}
      <ChevronRight className={{`h-5 w-5 shrink-0 ${{selected ? 'text-brand-primary' : 'text-zinc-300'}}`}} />
    </button>
  );
}}
'''

# fix mistaken motion.div className on space-y-3
content = content.replace('<motion.div className="space-y-3">', '<div className="space-y-3">')

p.write_text(content, encoding='utf-8')
print('written')
