import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import {
  ChevronLeft,
  User,
  Shield,
  KeyRound,
  Send,
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react';
import { motion } from 'motion/react';
import { loadCustomerSession, saveCustomerSession } from '../services/customerSession';
import {
  changeCustomerPassword,
  loadCustomerAccountProfile,
  maskApiToken,
  regenerateApiToken,
  saveCustomerAccountProfile,
  type CustomerAccountProfile,
} from '../services/customerAccountService';
import {
  generateTelegramLinkCode,
  getTelegramPrefsForUser,
  saveTelegramPrefsForUser,
  TELEGRAM_NOTIF_UPDATED,
} from '../services/telegramNotificationService';
import { useLocaleCurrency } from '../context/LocaleCurrencyContext';

type AccountTab = 'profile' | 'security' | 'password' | 'telegram' | 'token';

const TABS: { id: AccountTab; label: string; icon: typeof User }[] = [
  { id: 'profile', label: 'Thông tin cơ bản', icon: User },
  { id: 'security', label: 'Bảo mật', icon: Shield },
  { id: 'password', label: 'Đổi mật khẩu', icon: KeyRound },
  { id: 'telegram', label: 'Liên kết Telegram', icon: Send },
  { id: 'token', label: 'Mã API / Token', icon: Key },
];

const inputClass =
  'w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm font-medium text-zinc-800 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10';

interface CustomerAccountPageProps {
  onBack?: () => void;
}

export default function CustomerAccountPage({ onBack }: CustomerAccountPageProps) {
  const session = loadCustomerSession();
  const { formatMoney } = useLocaleCurrency();
  const [tab, setTab] = useState<AccountTab>('profile');
  const [profile, setProfile] = useState(() =>
    loadCustomerAccountProfile(session.userId, session.username),
  );
  const [tgPrefs, setTgPrefs] = useState(() => getTelegramPrefsForUser(session.userId));
  const [linkCode, setLinkCode] = useState<string | null>(tgPrefs.linkCode);
  const [chatIdInput, setChatIdInput] = useState(tgPrefs.chatId);

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const syncTg = () => {
    const p = getTelegramPrefsForUser(session.userId);
    setTgPrefs(p);
    setLinkCode(p.linkCode);
    setChatIdInput(p.chatId);
  };

  useEffect(() => {
    window.addEventListener(TELEGRAM_NOTIF_UPDATED, syncTg);
    return () => window.removeEventListener(TELEGRAM_NOTIF_UPDATED, syncTg);
  }, [session.userId]);

  const copyText = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      /* ignore */
    }
  };

  const saveProfile = () => {
    saveCustomerAccountProfile(profile);
    if (profile.displayName.trim()) {
      saveCustomerSession({ ...session, username: profile.displayName.trim() });
    }
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  const handlePasswordChange = () => {
    setPwError('');
    setPwSuccess('');
    if (newPw !== confirmPw) {
      setPwError('Mật khẩu xác nhận không khớp');
      return;
    }
    const res = changeCustomerPassword(
      session.userId,
      session.username,
      currentPw,
      newPw,
    );
    if (!res.ok) {
      setPwError(res.error);
      return;
    }
    setPwSuccess('Đã đổi mật khẩu thành công');
    setCurrentPw('');
    setNewPw('');
    setConfirmPw('');
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] pb-20">
      <div className="mx-auto max-w-[1000px] px-6 pt-10">
        <div className="mb-8 flex items-center gap-3">
          <button
            type="button"
            onClick={() => (onBack ? onBack() : window.history.back())}
            className="rounded-xl p-2 hover:bg-slate-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800">Tài khoản của tôi</h1>
            <p className="text-[13px] text-slate-500">
              ID {session.userId} · Số dư {formatMoney(session.balance)}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <nav className="flex shrink-0 flex-row gap-1 overflow-x-auto rounded-2xl border border-slate-100 bg-white p-1.5 shadow-sm lg:w-56 lg:flex-col">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-left text-[13px] font-bold transition-colors ${
                    active
                      ? 'bg-emerald-50 text-brand-primary ring-1 ring-emerald-100'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {t.label}
                </button>
              );
            })}
          </nav>

          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="min-w-0 flex-1 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
          >
            {tab === 'profile' ? (
              <ProfileSection
                profile={profile}
                setProfile={setProfile}
                userId={session.userId}
                balance={session.balance}
                formatMoney={formatMoney}
                onSave={saveProfile}
                saved={saved}
              />
            ) : null}
            {tab === 'security' ? (
              <SecuritySection
                profile={profile}
                setProfile={setProfile}
                onSave={saveProfile}
                saved={saved}
              />
            ) : null}
            {tab === 'password' ? (
              <PasswordSection
                currentPw={currentPw}
                setCurrentPw={setCurrentPw}
                newPw={newPw}
                setNewPw={setNewPw}
                confirmPw={confirmPw}
                setConfirmPw={setConfirmPw}
                error={pwError}
                success={pwSuccess}
                onSubmit={handlePasswordChange}
              />
            ) : null}
            {tab === 'telegram' ? (
              <TelegramSection
                tgPrefs={tgPrefs}
                chatIdInput={chatIdInput}
                setChatIdInput={setChatIdInput}
                linkCode={linkCode}
                userId={session.userId}
                onSaveChat={() => {
                  saveTelegramPrefsForUser({
                    ...tgPrefs,
                    chatId: chatIdInput.trim(),
                    linked: Boolean(chatIdInput.trim()),
                  });
                  syncTg();
                }}
                onGenCode={() => setLinkCode(generateTelegramLinkCode(session.userId))}
                onToggle={(key, v) => {
                  saveTelegramPrefsForUser({ ...tgPrefs, [key]: v });
                  syncTg();
                }}
              />
            ) : null}
            {tab === 'token' ? (
              <TokenSection
                token={profile.apiToken}
                show={showToken}
                setShow={setShowToken}
                copied={copied}
                onCopy={() => copyText(profile.apiToken, 'token')}
                onRegenerate={() => {
                  const t = regenerateApiToken(session.userId, session.username);
                  setProfile((p) => ({ ...p, apiToken: t }));
                }}
              />
            ) : null}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function ProfileSection({
  profile,
  setProfile,
  userId,
  balance,
  formatMoney,
  onSave,
  saved,
}: {
  profile: CustomerAccountProfile;
  setProfile: Dispatch<SetStateAction<CustomerAccountProfile>>;
  userId: string;
  balance: number;
  formatMoney: (n: number) => string;
  onSave: () => void;
  saved: boolean;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black text-slate-800">Thông tin cơ bản</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-[11px] font-bold uppercase text-zinc-400">Mã khách</span>
          <input value={userId} readOnly className={`${inputClass} mt-1 bg-zinc-50`} />
        </label>
        <label className="block">
          <span className="text-[11px] font-bold uppercase text-zinc-400">Số dư ví</span>
          <input
            value={formatMoney(balance)}
            readOnly
            className={`${inputClass} mt-1 bg-zinc-50 font-bold text-emerald-700`}
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-[11px] font-bold uppercase text-zinc-400">Tên hiển thị</span>
          <input
            value={profile.displayName}
            onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
            className={`${inputClass} mt-1`}
          />
        </label>
        <label className="block">
          <span className="text-[11px] font-bold uppercase text-zinc-400">Email</span>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            className={`${inputClass} mt-1`}
          />
        </label>
        <label className="block">
          <span className="text-[11px] font-bold uppercase text-zinc-400">Số điện thoại</span>
          <input
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            placeholder="09xxxxxxxx"
            className={`${inputClass} mt-1`}
          />
        </label>
      </div>
      <button
        type="button"
        onClick={onSave}
        className="rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-600"
      >
        {saved ? 'Đã lưu!' : 'Lưu thay đổi'}
      </button>
    </div>
  );
}

function SecuritySection({
  profile,
  setProfile,
  onSave,
  saved,
}: {
  profile: CustomerAccountProfile;
  setProfile: Dispatch<SetStateAction<CustomerAccountProfile>>;
  onSave: () => void;
  saved: boolean;
}) {
  const lastLogin = new Date(profile.lastLoginAt).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black text-slate-800">Bảo mật</h2>
      <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 px-4 py-3">
        <p className="text-[11px] font-bold uppercase text-zinc-400">Đăng nhập gần nhất</p>
        <p className="mt-1 text-sm font-bold text-zinc-800">{lastLogin}</p>
      </div>
      <label className="flex cursor-pointer items-center justify-between rounded-xl border border-zinc-100 px-4 py-3">
        <div>
          <p className="text-sm font-bold text-zinc-800">Xác thực 2 bước (2FA)</p>
          <p className="text-[12px] text-zinc-500">Bảo vệ tài khoản khi đăng nhập (demo)</p>
        </div>
        <input
          type="checkbox"
          checked={profile.twoFactorEnabled}
          onChange={(e) => setProfile({ ...profile, twoFactorEnabled: e.target.checked })}
          className="h-5 w-5 rounded border-zinc-300 text-brand-primary"
        />
      </label>
      <p className="text-[12px] text-zinc-500">
        Khuyến nghị bật cảnh báo đăng nhập lạ trong mục Liên kết Telegram.
      </p>
      <button
        type="button"
        onClick={onSave}
        className="rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-600"
      >
        {saved ? 'Đã lưu!' : 'Lưu cài đặt'}
      </button>
    </div>
  );
}

function PasswordSection({
  currentPw,
  setCurrentPw,
  newPw,
  setNewPw,
  confirmPw,
  setConfirmPw,
  error,
  success,
  onSubmit,
}: {
  currentPw: string;
  setCurrentPw: (v: string) => void;
  newPw: string;
  setNewPw: (v: string) => void;
  confirmPw: string;
  setConfirmPw: (v: string) => void;
  error: string;
  success: string;
  onSubmit: () => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black text-slate-800">Đổi mật khẩu</h2>
      <p className="text-[12px] text-zinc-500">Mật khẩu demo mặc định: 123456</p>
      <label className="block">
        <span className="text-[11px] font-bold uppercase text-zinc-400">Mật khẩu hiện tại</span>
        <input
          type="password"
          value={currentPw}
          onChange={(e) => setCurrentPw(e.target.value)}
          className={`${inputClass} mt-1`}
        />
      </label>
      <label className="block">
        <span className="text-[11px] font-bold uppercase text-zinc-400">Mật khẩu mới</span>
        <input
          type="password"
          value={newPw}
          onChange={(e) => setNewPw(e.target.value)}
          className={`${inputClass} mt-1`}
        />
      </label>
      <label className="block">
        <span className="text-[11px] font-bold uppercase text-zinc-400">Xác nhận mật khẩu mới</span>
        <input
          type="password"
          value={confirmPw}
          onChange={(e) => setConfirmPw(e.target.value)}
          className={`${inputClass} mt-1`}
        />
      </label>
      {error ? <p className="text-sm font-bold text-red-600">{error}</p> : null}
      {success ? <p className="text-sm font-bold text-emerald-600">{success}</p> : null}
      <button
        type="button"
        onClick={onSubmit}
        className="rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-600"
      >
        Cập nhật mật khẩu
      </button>
    </div>
  );
}

function TelegramSection({
  tgPrefs,
  chatIdInput,
  setChatIdInput,
  linkCode,
  userId,
  onSaveChat,
  onGenCode,
  onToggle,
}: {
  tgPrefs: ReturnType<typeof getTelegramPrefsForUser>;
  chatIdInput: string;
  setChatIdInput: (v: string) => void;
  linkCode: string | null;
  userId: string;
  onSaveChat: () => void;
  onGenCode: () => void;
  onToggle: (key: keyof Pick<
    typeof tgPrefs,
    'notifyOrderComplete' | 'notifyLoginAlert' | 'notifyAffiliateCredit'
  >, v: boolean) => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black text-slate-800">Liên kết Telegram</h2>
      {tgPrefs.linked ? (
        <p className="text-sm font-bold text-emerald-600">Đã liên kết · Chat ID: {tgPrefs.chatId}</p>
      ) : (
        <p className="text-sm text-zinc-600">Nhập Chat ID hoặc dùng mã kết nối với Bot.</p>
      )}
      <div className="flex flex-wrap gap-2">
        <input
          value={chatIdInput}
          onChange={(e) => setChatIdInput(e.target.value)}
          placeholder="Chat ID Telegram"
          className={`${inputClass} min-w-[200px] flex-1`}
        />
        <button
          type="button"
          onClick={onSaveChat}
          className="rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white"
        >
          Lưu Chat ID
        </button>
        <button
          type="button"
          onClick={onGenCode}
          className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-2.5 text-sm font-bold text-sky-800"
        >
          Lấy mã kết nối
        </button>
      </div>
      {linkCode ? (
        <p className="font-mono text-xs font-bold text-sky-800">
          Mã: {linkCode} — gửi /start {linkCode} cho Bot (user {userId})
        </p>
      ) : null}
      <div className="grid gap-2 sm:grid-cols-3">
        {(
          [
            ['notifyOrderComplete', 'Đơn hoàn tất'],
            ['notifyLoginAlert', 'Đăng nhập lạ'],
            ['notifyAffiliateCredit', 'Hoa hồng affiliate'],
          ] as const
        ).map(([key, label]) => (
          <label
            key={key}
            className="flex items-center gap-2 rounded-xl border border-zinc-100 px-3 py-2.5 text-sm font-medium"
          >
            <input
              type="checkbox"
              checked={tgPrefs[key]}
              onChange={(e) => onToggle(key, e.target.checked)}
              className="rounded text-brand-primary"
            />
            {label}
          </label>
        ))}
      </div>
    </div>
  );
}

function TokenSection({
  token,
  show,
  setShow,
  copied,
  onCopy,
  onRegenerate,
}: {
  token: string;
  show: boolean;
  setShow: (v: boolean) => void;
  copied: string | null;
  onCopy: () => void;
  onRegenerate: () => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black text-slate-800">Mã API / Token</h2>
      <p className="text-[12px] text-zinc-500">
        Dùng token để gọi API tích hợp (demo). Không chia sẻ token cho bên thứ ba.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <code className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 font-mono text-[12px] font-bold text-zinc-800">
          {show ? token : maskApiToken(token)}
        </code>
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="rounded-xl border border-zinc-200 p-2.5 text-zinc-600 hover:bg-zinc-50"
          aria-label={show ? 'Ẩn token' : 'Hiện token'}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-2.5 text-sm font-bold text-zinc-700 hover:bg-zinc-50"
        >
          {copied === 'token' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
          Sao chép
        </button>
      </div>
      <button
        type="button"
        onClick={onRegenerate}
        className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-bold text-amber-800 hover:bg-amber-100"
      >
        Tạo lại token
      </button>
    </div>
  );
}
