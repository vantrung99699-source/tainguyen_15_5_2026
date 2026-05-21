import { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  Copy,
  Check,
  Link2,
  Wallet,
  Users,
  TrendingUp,
  History,
  Plus,
  Trash2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { loadCustomerSession } from '../services/customerSession';
import {
  AFFILIATE_UPDATED,
  buildCampaignUrl,
  buildRegisterAffiliateUrl,
  createCampaignLink,
  deleteCampaignLink,
  getAffiliateOverviewForUser,
  getCampaignsForUser,
  getCommissionsForReferrer,
  getPublicReferralCode,
  getWithdrawalsForUser,
  loadAffiliateSettings,
  requestWithdrawal,
} from '../services/affiliateService';
import {
  AFFILIATE_COMMISSION_STATUS_LABELS,
  AFFILIATE_WITHDRAWAL_METHOD_LABELS,
  AFFILIATE_WITHDRAWAL_STATUS_LABELS,
  type AffiliateWithdrawalMethod,
} from '../types/affiliate';

type AffiliateTab = 'overview' | 'campaigns' | 'commissions' | 'withdrawal';

interface AffiliatePageProps {
  onBack?: () => void;
}

export default function AffiliatePage({ onBack }: AffiliatePageProps) {
  const session = loadCustomerSession();
  const [tab, setTab] = useState<AffiliateTab>('overview');
  const [copied, setCopied] = useState<string | null>(null);
  const [overview, setOverview] = useState(() => getAffiliateOverviewForUser(session.userId));
  const [commissions, setCommissions] = useState(() => getCommissionsForReferrer(session.userId));
  const [withdrawals, setWithdrawals] = useState(() => getWithdrawalsForUser(session.userId));
  const [campaigns, setCampaigns] = useState(() => getCampaignsForUser(session.userId));
  const settings = loadAffiliateSettings();

  const [campaignLabel, setCampaignLabel] = useState('');
  const [campaignPath, setCampaignPath] = useState('/');

  const [wdAmount, setWdAmount] = useState('');
  const [wdMethod, setWdMethod] = useState<AffiliateWithdrawalMethod>('bank');
  const [wdAccount, setWdAccount] = useState('');
  const [wdName, setWdName] = useState('');
  const [wdError, setWdError] = useState('');
  const [wdSuccess, setWdSuccess] = useState('');

  const sync = () => {
    setOverview(getAffiliateOverviewForUser(session.userId));
    setCommissions(getCommissionsForReferrer(session.userId));
    setWithdrawals(getWithdrawalsForUser(session.userId));
    setCampaigns(getCampaignsForUser(session.userId));
  };

  useEffect(() => {
    window.addEventListener(AFFILIATE_UPDATED, sync);
    return () => window.removeEventListener(AFFILIATE_UPDATED, sync);
  }, [session.userId]);

  const mainLink = useMemo(
    () => buildRegisterAffiliateUrl(getPublicReferralCode(session.userId)),
    [session.userId],
  );

  const copyText = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      /* ignore */
    }
  };

  const handleWithdraw = () => {
    setWdError('');
    setWdSuccess('');
    const result = requestWithdrawal({
      userId: session.userId,
      username: session.username,
      amount: Number(wdAmount.replace(/\D/g, '')),
      method: wdMethod,
      accountInfo: wdAccount,
      accountName: wdName,
    });
    if (!result.ok) {
      setWdError(result.error);
      return;
    }
    setWdSuccess('Đã gửi yêu cầu rút tiền. Vui lòng chờ admin duyệt.');
    setWdAmount('');
    sync();
  };

  if (!settings.enabled) {
    return (
      <div className="min-h-screen bg-[#fcfcfd] px-6 py-16 text-center">
        <p className="text-lg font-bold text-slate-600">Chương trình Affiliate đang tạm tắt.</p>
        <button
          type="button"
          onClick={() => (onBack ? onBack() : window.history.back())}
          className="mt-4 text-sm font-bold text-brand-primary hover:underline"
        >
          Quay lại
        </button>
      </div>
    );
  }

  const tabs: { id: AffiliateTab; label: string }[] = [
    { id: 'overview', label: 'Tổng quan' },
    { id: 'campaigns', label: 'Chiến dịch' },
    { id: 'commissions', label: 'Lịch sử hoa hồng' },
    { id: 'withdrawal', label: 'Rút tiền' },
  ];

  return (
    <div className="min-h-screen bg-[#fcfcfd] pb-20">
      <div className="mx-auto max-w-[1200px] px-6 pt-10">
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
            <h1 className="text-2xl font-black text-slate-800">Kiếm tiền / Affiliate</h1>
            <p className="mt-0.5 text-[13px] font-medium text-slate-500">
              Chia sẻ link, nhận hoa hồng khi cấp dưới mua hàng
            </p>
          </motion.div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
                tab === t.id
                  ? 'bg-brand-primary text-white'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Users, label: 'User đăng ký qua link', value: overview.referralCount },
                {
                  icon: TrendingUp,
                  label: 'Doanh thu tạm tính',
                  value: `${overview.affiliateRevenue.toLocaleString('vi-VN')} đ`,
                },
                {
                  icon: Wallet,
                  label: 'Số dư có thể rút',
                  value: `${overview.affiliateBalance.toLocaleString('vi-VN')} đ`,
                },
                {
                  icon: History,
                  label: 'Tổng hoa hồng đã nhận',
                  value: `${overview.affiliateTotalEarned.toLocaleString('vi-VN')} đ`,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                >
                  <stat.icon className="mb-2 h-5 w-5 text-brand-primary" />
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-lg font-black text-slate-800">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
              <p className="mb-2 text-sm font-black text-slate-800">Link giới thiệu</p>
              <p className="mb-3 text-xs text-slate-500">
                Chia sẻ link đăng ký — cookie lưu {settings.cookieTtlDays} ngày, khách quay lại mua
                vẫn tính hoa hồng
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <code className="flex-1 break-all rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
                  {mainLink}
                </code>
                <button
                  type="button"
                  onClick={() => copyText(mainLink, 'main')}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-bold text-white"
                >
                  {copied === 'main' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  Copy link
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === 'campaigns' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <p className="mb-4 text-sm font-black text-slate-800">Tạo link chiến dịch</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={campaignLabel}
                  onChange={(e) => setCampaignLabel(e.target.value)}
                  placeholder="Tên chiến dịch (vd: TikTok Shop)"
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
                <input
                  value={campaignPath}
                  onChange={(e) => setCampaignPath(e.target.value)}
                  placeholder="Đường dẫn (vd: / hoặc /?category=tiktok)"
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  createCampaignLink({
                    userId: session.userId,
                    label: campaignLabel,
                    targetPath: campaignPath,
                  });
                  setCampaignLabel('');
                  setCampaignPath('/');
                  sync();
                }}
                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2 text-sm font-bold text-white"
              >
                <Plus className="h-4 w-4" /> Tạo link
              </button>
            </div>

            <div className="space-y-3">
              {campaigns.length === 0 ? (
                <p className="text-sm text-slate-500">Chưa có chiến dịch nào.</p>
              ) : (
                campaigns.map((c) => {
                  const url = buildCampaignUrl(
                    getPublicReferralCode(session.userId),
                    c.targetPath,
                    c.shortCode,
                  );
                  return (
                    <div
                      key={c.id}
                      className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-white p-4 sm:flex-row sm:items-center"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-800">{c.label}</p>
                        <code className="mt-1 block break-all text-xs text-slate-500">{url}</code>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => copyText(url, c.id)}
                          className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-brand-primary"
                        >
                          <Link2 className="inline h-3.5 w-3.5" />{' '}
                          {copied === c.id ? 'Đã copy' : 'Copy'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            deleteCampaignLink(c.id, session.userId);
                            sync();
                          }}
                          className="rounded-lg bg-red-50 p-2 text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {tab === 'commissions' && (
          <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase text-slate-500">
                  <th className="px-4 py-3">Thời gian</th>
                  <th className="px-4 py-3">Đơn hàng</th>
                  <th className="px-4 py-3">Giá trị đơn</th>
                  <th className="px-4 py-3">%</th>
                  <th className="px-4 py-3">Hoa hồng</th>
                  <th className="px-4 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {commissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      Chưa có hoa hồng.
                    </td>
                  </tr>
                ) : (
                  commissions.map((c) => (
                    <tr key={c.id} className="border-b border-slate-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        {new Date(c.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{c.orderId}</td>
                      <td className="px-4 py-3">{c.orderAmount.toLocaleString('vi-VN')} đ</td>
                      <td className="px-4 py-3">{c.commissionPercent}%</td>
                      <td className="px-4 py-3 font-bold text-emerald-700">
                        {c.commissionAmount.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-lg px-2 py-0.5 text-xs font-bold ${
                            c.status === 'credited'
                              ? 'bg-emerald-100 text-emerald-700'
                              : c.status === 'pending'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-600'
                          }`}
                        >
                          {AFFILIATE_COMMISSION_STATUS_LABELS[c.status]}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'withdrawal' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <p className="mb-1 text-sm font-black text-slate-800">Yêu cầu rút tiền</p>
              <p className="mb-4 text-xs text-slate-500">
                Tối thiểu {settings.minWithdrawalAmount.toLocaleString('vi-VN')} đ — Số dư:{' '}
                {overview.affiliateBalance.toLocaleString('vi-VN')} đ
              </p>
              {wdError ? <p className="mb-2 text-sm font-bold text-red-600">{wdError}</p> : null}
              {wdSuccess ? (
                <p className="mb-2 text-sm font-bold text-emerald-600">{wdSuccess}</p>
              ) : null}
              <div className="space-y-3">
                <select
                  value={wdMethod}
                  onChange={(e) => setWdMethod(e.target.value as AffiliateWithdrawalMethod)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  {Object.entries(AFFILIATE_WITHDRAWAL_METHOD_LABELS).map(([k, label]) => (
                    <option key={k} value={k}>
                      {label}
                    </option>
                  ))}
                </select>
                <input
                  value={wdAmount}
                  onChange={(e) => setWdAmount(e.target.value)}
                  placeholder="Số tiền cần rút"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
                <input
                  value={wdAccount}
                  onChange={(e) => setWdAccount(e.target.value)}
                  placeholder="STK / ví / địa chỉ ví"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
                <input
                  value={wdName}
                  onChange={(e) => setWdName(e.target.value)}
                  placeholder="Tên chủ tài khoản"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={handleWithdraw}
                  className="w-full rounded-xl bg-brand-primary py-2.5 text-sm font-bold text-white"
                >
                  Gửi yêu cầu rút
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase text-slate-500">
                    <th className="px-4 py-3">Ngày</th>
                    <th className="px-4 py-3">Số tiền</th>
                    <th className="px-4 py-3">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((w) => (
                    <tr key={w.id} className="border-b border-slate-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        {new Date(w.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="px-4 py-3 font-bold">{w.amount.toLocaleString('vi-VN')} đ</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold">
                          {AFFILIATE_WITHDRAWAL_STATUS_LABELS[w.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
