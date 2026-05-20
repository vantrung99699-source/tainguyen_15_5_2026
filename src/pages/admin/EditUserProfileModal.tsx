import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { UserCog, KeyRound, Mail, Phone, Copy, Check, RefreshCw, X } from 'lucide-react';
import type { ManagedUser, UserRole, UserStatus } from '../../types/user';
import { USER_ROLE_LABELS, USER_STATUS_LABELS } from '../../types/user';
import { generateRandomPassword } from '../../services/userAdmin';

const inputClass =
  'w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10';

type ProfileEditTab = 'account' | 'password' | 'email' | 'phone';

const PROFILE_TABS: { id: ProfileEditTab; label: string; icon: typeof UserCog }[] = [
  { id: 'account', label: 'Tài khoản', icon: UserCog },
  { id: 'password', label: 'Mật khẩu', icon: KeyRound },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'phone', label: 'SĐT', icon: Phone },
];

interface EditUserProfileModalProps {
  user: ManagedUser;
  onClose: () => void;
  onSaveAccount: (updated: ManagedUser) => void;
  onConfirmPassword: (password: string) => void;
  onSaveEmail: (email: string) => void;
  onSavePhone: (phone: string) => void;
}

export function EditUserProfileModal({
  user,
  onClose,
  onSaveAccount,
  onConfirmPassword,
  onSaveEmail,
  onSavePhone,
}: EditUserProfileModalProps) {
  const [activeTab, setActiveTab] = useState<ProfileEditTab>('account');
  const [accountForm, setAccountForm] = useState(user);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [pwdMode, setPwdMode] = useState<'random' | 'custom'>('random');
  const [customPassword, setCustomPassword] = useState('');
  const [generated, setGenerated] = useState(() => generateRandomPassword());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setAccountForm(user);
    setEmail(user.email);
    setPhone(user.phone);
    setActiveTab('account');
    setPwdMode('random');
    setCustomPassword('');
    setGenerated(generateRandomPassword());
  }, [user]);

  const activePassword = pwdMode === 'random' ? generated : customPassword;

  const handleCopyPassword = async () => {
    if (!activePassword) return;
    await navigator.clipboard.writeText(activePassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h3 className="text-sm font-black text-slate-800">Chỉnh sửa tài khoản</h3>
            <p className="mt-0.5 text-[11px] text-slate-500">@{user.username}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4 flex flex-wrap gap-1 border-b border-slate-100">
            {PROFILE_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 rounded-t-lg px-3 py-2 text-[12px] font-bold transition-colors ${
                    isActive
                      ? 'border border-b-0 border-slate-200 bg-white text-brand-primary'
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === 'account' && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                onSaveAccount(accountForm);
              }}
            >
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">
                  Username
                </label>
                <input
                  value={accountForm.username}
                  onChange={(e) => setAccountForm({ ...accountForm, username: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">
                    Role
                  </label>
                  <select
                    value={accountForm.role}
                    onChange={(e) =>
                      setAccountForm({ ...accountForm, role: e.target.value as UserRole })
                    }
                    className={inputClass}
                  >
                    {Object.entries(USER_ROLE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">
                    Trạng thái
                  </label>
                  <select
                    value={accountForm.status}
                    onChange={(e) =>
                      setAccountForm({ ...accountForm, status: e.target.value as UserStatus })
                    }
                    className={inputClass}
                  >
                    {Object.entries(USER_STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-brand-primary py-3 text-sm font-black text-white hover:bg-emerald-600"
              >
                Lưu thông tin tài khoản
              </button>
            </form>
          )}

          {activeTab === 'password' && (
            <div>
              <div className="mb-4 flex gap-2 rounded-xl bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={() => setPwdMode('random')}
                  className={`flex-1 rounded-lg py-2 text-[12px] font-bold transition-colors ${
                    pwdMode === 'random'
                      ? 'bg-white text-brand-primary shadow-sm'
                      : 'text-slate-500'
                  }`}
                >
                  Mật khẩu ngẫu nhiên
                </button>
                <button
                  type="button"
                  onClick={() => setPwdMode('custom')}
                  className={`flex-1 rounded-lg py-2 text-[12px] font-bold transition-colors ${
                    pwdMode === 'custom'
                      ? 'bg-white text-brand-primary shadow-sm'
                      : 'text-slate-500'
                  }`}
                >
                  Mật khẩu khác
                </button>
              </div>
              {pwdMode === 'random' ? (
                <div className="mb-4">
                  <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">
                    Mật khẩu mới
                  </label>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={generated}
                      className={`${inputClass} flex-1 font-mono text-[12px]`}
                    />
                    <button
                      type="button"
                      onClick={() => setGenerated(generateRandomPassword())}
                      className="shrink-0 rounded-xl border border-slate-200 px-3 hover:bg-slate-50"
                      title="Tạo lại"
                    >
                      <RefreshCw className="h-4 w-4 text-slate-500" />
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyPassword}
                      className="shrink-0 rounded-xl border border-slate-200 px-3 hover:bg-slate-50"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Copy className="h-4 w-4 text-slate-500" />
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">
                    Nhập mật khẩu mới
                  </label>
                  <input
                    type="text"
                    value={customPassword}
                    onChange={(e) => setCustomPassword(e.target.value)}
                    placeholder="Tối thiểu 8 ký tự"
                    className={inputClass}
                  />
                </div>
              )}
              <button
                type="button"
                disabled={pwdMode === 'custom' && customPassword.length < 8}
                onClick={() => onConfirmPassword(activePassword)}
                className="w-full rounded-xl bg-brand-primary py-3 text-sm font-black text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Đặt mật khẩu mới
              </button>
            </div>
          )}

          {activeTab === 'email' && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                onSaveEmail(email.trim());
              }}
            >
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">
                  Email mới
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-brand-primary py-3 text-sm font-black text-white hover:bg-emerald-600"
              >
                Cập nhật email
              </button>
            </form>
          )}

          {activeTab === 'phone' && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                onSavePhone(phone.trim());
              }}
            >
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="VD: 0901234567"
                  className={inputClass}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-brand-primary py-3 text-sm font-black text-white hover:bg-emerald-600"
              >
                Cập nhật SĐT
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
