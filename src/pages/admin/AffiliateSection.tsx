import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Check, X, TrendingUp, Users, Settings, Wallet } from 'lucide-react';
import type { AffiliateSettings } from '../../types/affiliate';
import {
  AFFILIATE_UPDATED,
  approveWithdrawal,
  getAffiliateAdminStats,
  getAffiliateUsersForAdmin,
  getAllWithdrawals,
  loadAffiliateSettings,
  rejectWithdrawal,
  saveAffiliateSettings,
} from '../../services/affiliateService';
import { initialManagedUsers } from './userData';
import { loadManagedUsers, saveManagedUsers } from '../../services/userAdmin';
import { DEFAULT_REFERRAL_RATE, type ManagedUser } from '../../types/user';
import { Share2 } from 'lucide-react';

type AdminAffiliateTab = 'settings' | 'users' | 'payouts' | 'analytics';

export function AffiliateSection() {
  const [tab, setTab] = useState<AdminAffiliateTab>('settings');
  const [settings, setSettings] = useState<AffiliateSettings>(() => loadAffiliateSettings());
  const [users, setUsers] = useState<ManagedUser[]>(() => getAffiliateUsersForAdmin());
  const [withdrawals, setWithdrawals] = useState(() => getAllWithdrawals());
  const [stats, setStats] = useState(() => getAffiliateAdminStats());
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const sync = () => {
    setSettings(loadAffiliateSettings());
    setUsers(getAffiliateUsersForAdmin());
    setWithdrawals(getAllWithdrawals());
    setStats(getAffiliateAdminStats());
  };

  useEffect(() => {
    window.addEventListener(AFFILIATE_UPDATED, sync);
    return () => window.removeEventListener(AFFILIATE_UPDATED, sync);
  }, []);

  const saveSettings = () => {
    saveAffiliateSettings(settings);
    sync();
  };

  const updateUserRate = (userId: string, rate: number) => {
    const all = loadManagedUsers(initialManagedUsers);
    const next = all.map((u) =>
      u.id === userId ? { ...u, referralRatePercent: rate } : u,
    );
    saveManagedUsers(next);
    sync();
  };

  const tabs: { id: AdminAffiliateTab; label: string; icon: typeof Settings }[] = [
    { id: 'settings', label: 'Cấu hình', icon: Settings },
    { id: 'users', label: 'Thành viên', icon: Users },
    { id: 'payouts', label: 'Duyệt rút tiền', icon: Wallet },
    { id: 'analytics', label: 'Thống kê', icon: TrendingUp },
  ];

  const maxChart = Math.max(...stats.chartByDay.map((d) => d.amount), 1);

  return (
    <div className="space-y-6">
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 ring-1 ring-emerald-100">
          <Share2 className="h-5 w-5 text-brand-primary" />
        </div>
        <div>
          <h2 className="text-base font-black text-zinc-900">Affiliate</h2>
          <p className="text-[12px] text-zinc-500">
            Hoa hồng khi cấp dưới nạp tiền — thành viên, duyệt rút tiền và báo cáo
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold ${
              tab === t.id
                ? 'bg-brand-primary text-white'
                : 'bg-white text-zinc-600 ring-1 ring-zinc-200'
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'settings' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-xl space-y-4 rounded-2xl border border-zinc-200 bg-white p-6"
        >
          <label className="flex items-center justify-between gap-4">
            <span className="text-sm font-bold text-zinc-700">Bật Affiliate toàn hệ thống</span>
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
              className="h-5 w-5 rounded accent-emerald-600"
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-zinc-700">% Hoa hồng mặc định</span>
            <input
              type="number"
              min={0}
              max={100}
              value={settings.defaultCommissionPercent}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  defaultCommissionPercent: Number(e.target.value),
                })
              }
              className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-zinc-700">Rút tối thiểu (đ)</span>
            <input
              type="number"
              value={settings.minWithdrawalAmount}
              onChange={(e) =>
                setSettings({ ...settings, minWithdrawalAmount: Number(e.target.value) })
              }
              className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2"
            />
          </label>
          <p className="rounded-xl bg-emerald-50 px-3 py-2 text-[12px] font-medium text-emerald-900">
            Hoa hồng được cộng ngay lập tức vào ví affiliate khi người được giới thiệu nạp tiền thành
            công — không cần admin duyệt. Chỉ yêu cầu rút tiền affiliate mới cần duyệt.
          </p>
          <label className="block">
            <span className="text-sm font-bold text-zinc-700">Cookie ref (ngày)</span>
            <input
              type="number"
              min={1}
              max={90}
              value={settings.cookieTtlDays}
              onChange={(e) =>
                setSettings({ ...settings, cookieTtlDays: Number(e.target.value) })
              }
              className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2"
            />
          </label>
          <button
            type="button"
            onClick={saveSettings}
            className="rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-bold text-white"
          >
            Lưu cấu hình
          </button>
        </motion.div>
      )}

      {tab === 'users' && (
        <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 text-[11px] font-bold uppercase text-zinc-500">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Ref count</th>
                <th className="px-4 py-3">Tổng nạp ref</th>
                <th className="px-4 py-3">Số dư AFF</th>
                <th className="px-4 py-3">% Custom</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-zinc-50">
                  <td className="px-4 py-3 font-bold">{u.username}</td>
                  <td className="px-4 py-3">{u.referralCount}</td>
                  <td className="px-4 py-3">{u.affiliateRevenue.toLocaleString('vi-VN')} đ</td>
                  <td className="px-4 py-3">{u.affiliateBalance.toLocaleString('vi-VN')} đ</td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      defaultValue={u.referralRatePercent}
                      onBlur={(e) => updateUserRate(u.id, Number(e.target.value))}
                      className="w-20 rounded-lg border border-zinc-200 px-2 py-1 text-xs"
                    />
                    {u.referralRatePercent !== DEFAULT_REFERRAL_RATE && (
                      <span className="ml-1 text-[10px] text-emerald-600">custom</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'payouts' && (
        <div className="space-y-4">
          <p className="text-sm font-bold text-zinc-600">
            Chờ duyệt: {stats.pendingWithdrawalCount} —{' '}
            {stats.pendingWithdrawalAmount.toLocaleString('vi-VN')} đ
          </p>
          {withdrawals
            .filter((w) => w.status === 'pending')
            .map((w) => (
              <div
                key={w.id}
                className="rounded-2xl border border-amber-100 bg-amber-50/30 p-4"
              >
                <p className="font-black text-zinc-800">
                  {w.username} — {w.amount.toLocaleString('vi-VN')} đ
                </p>
                <p className="mt-1 text-xs text-zinc-600">
                  {w.method} · {w.accountName} · {w.accountInfo}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      approveWithdrawal(w.id);
                      sync();
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white"
                  >
                    <Check className="h-3.5 w-3.5" /> Duyệt
                  </button>
                  <button
                    type="button"
                    onClick={() => setRejectId(w.id)}
                    className="inline-flex items-center gap-1 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700"
                  >
                    <X className="h-3.5 w-3.5" /> Từ chối
                  </button>
                </div>
                {rejectId === w.id && (
                  <div className="mt-3 flex gap-2">
                    <input
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Lý do từ chối"
                      className="flex-1 rounded-lg border px-2 py-1 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        rejectWithdrawal(w.id, rejectReason);
                        setRejectId(null);
                        setRejectReason('');
                        sync();
                      }}
                      className="rounded-lg bg-red-600 px-3 py-1 text-xs font-bold text-white"
                    >
                      Xác nhận
                    </button>
                  </div>
                )}
              </div>
            ))}
          {withdrawals.filter((w) => w.status !== 'pending').length > 0 && (
            <div className="mt-6 overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-zinc-50 text-[11px] font-bold uppercase text-zinc-500">
                    <th className="px-4 py-2">ID</th>
                    <th className="px-4 py-2">User</th>
                    <th className="px-4 py-2">Số tiền</th>
                    <th className="px-4 py-2">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals
                    .filter((w) => w.status !== 'pending')
                    .slice(0, 20)
                    .map((w) => (
                      <tr key={w.id} className="border-t border-zinc-50">
                        <td className="px-4 py-2 font-mono text-xs">{w.id}</td>
                        <td className="px-4 py-2">{w.username}</td>
                        <td className="px-4 py-2">{w.amount.toLocaleString('vi-VN')} đ</td>
                        <td className="px-4 py-2">{w.status}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200 bg-white p-4">
              <p className="text-[11px] font-bold uppercase text-zinc-400">Thành viên AFF</p>
              <p className="text-2xl font-black">{stats.affiliateUsers}</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-4">
              <p className="text-[11px] font-bold uppercase text-zinc-400">Hoa hồng đã phát</p>
              <p className="text-2xl font-black text-emerald-700">
                {stats.totalCommissionPaid.toLocaleString('vi-VN')} đ
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-4">
              <p className="text-[11px] font-bold uppercase text-zinc-400">Doanh thu từ AFF</p>
              <p className="text-2xl font-black">
                {stats.affiliateRevenue.toLocaleString('vi-VN')} đ
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <p className="mb-4 text-sm font-black text-zinc-800">Hoa hồng theo ngày</p>
            <div className="flex h-40 items-end gap-2">
              {stats.chartByDay.length === 0 ? (
                <p className="text-sm text-zinc-500">Chưa có dữ liệu.</p>
              ) : (
                stats.chartByDay.map((d) => (
                  <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t bg-brand-primary/80"
                      style={{ height: `${(d.amount / maxChart) * 100}%`, minHeight: 4 }}
                      title={`${d.amount.toLocaleString('vi-VN')} đ`}
                    />
                    <span className="text-[9px] text-zinc-400">{d.date.slice(5)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
