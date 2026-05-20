import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  LogIn,
  LogOut,
  Info,
  UserCog,
  ShieldOff,
  ChevronDown,
  Percent,
  History,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
} from 'lucide-react';
import type { ManagedUser } from '../../types/user';
import { USER_ROLE_LABELS, USER_STATUS_LABELS, DEFAULT_REFERRAL_RATE } from '../../types/user';
import {
  loadManagedUsers,
  saveManagedUsers,
  formatUserMoney,
  formatUserDate,
  getReferralRate,
  generateApiKey,
} from '../../services/userAdmin';
import { initialManagedUsers } from './userData';
import { getBalanceHistory } from './userBalanceHistory';
import {
  SystemInfoModal,
  Remove2FAConfirmModal,
  EditReferralRateModal,
  BalanceHistoryModal,
} from './UsersModals';
import { EditUserProfileModal } from './EditUserProfileModal';

type UserAction =
  | 'edit-profile'
  | 'edit-referral-rate'
  | 'balance-history'
  | 'remove-2fa'
  | 'system-info';

type SortKey =
  | 'username'
  | 'balance'
  | 'totalDeposit'
  | 'role'
  | 'status'
  | 'createdAt'
  | 'discountPercent'
  | 'referralCount';

type SortDir = 'asc' | 'desc';

const ROLE_ORDER: Record<ManagedUser['role'], number> = {
  admin: 0,
  vip: 1,
  seller: 2,
  user: 3,
};

const STATUS_ORDER: Record<ManagedUser['status'], number> = {
  active: 0,
  pending: 1,
  blocked: 2,
};

function compareUsers(a: ManagedUser, b: ManagedUser, key: SortKey, dir: SortDir): number {
  let cmp = 0;
  switch (key) {
    case 'username':
      cmp = a.username.localeCompare(b.username, 'vi');
      break;
    case 'balance':
      cmp = a.balance - b.balance;
      break;
    case 'totalDeposit':
      cmp = a.totalDeposit - b.totalDeposit;
      break;
    case 'role':
      cmp = ROLE_ORDER[a.role] - ROLE_ORDER[b.role];
      break;
    case 'status':
      cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
      break;
    case 'createdAt':
      cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      break;
    case 'discountPercent':
      cmp = a.discountPercent - b.discountPercent;
      break;
    case 'referralCount':
      cmp = a.referralCount - b.referralCount;
      break;
  }
  return dir === 'asc' ? cmp : -cmp;
}

function SortableTh({
  label,
  sortKey,
  activeKey,
  dir,
  onSort,
  align = 'left',
  className = '',
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey | null;
  dir: SortDir;
  onSort: (key: SortKey) => void;
  align?: 'left' | 'right' | 'center';
  className?: string;
}) {
  const active = activeKey === sortKey;
  const alignClass =
    align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start';

  return (
    <th className={`border-r border-slate-200 px-3 py-3 ${className}`}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`flex w-full items-center gap-1 text-[11px] font-black uppercase tracking-wide transition-colors hover:text-brand-primary ${alignClass} ${
          active ? 'text-brand-primary' : 'text-slate-600'
        }`}
      >
        <span>{label}</span>
        {active ? (
          dir === 'asc' ? (
            <ArrowUp className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <ArrowDown className="h-3.5 w-3.5 shrink-0" />
          )
        ) : (
          <ArrowUpDown className="h-3.5 w-3.5 shrink-0 opacity-40" />
        )}
      </button>
    </th>
  );
}

function StatusBadge({ status }: { status: ManagedUser['status'] }) {
  const styles = {
    active: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    blocked: 'bg-red-50 text-red-600 ring-red-100',
    pending: 'bg-amber-50 text-amber-700 ring-amber-100',
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ring-1 ${styles[status]}`}>
      {USER_STATUS_LABELS[status]}
    </span>
  );
}

function ReferralCell({ user }: { user: ManagedUser }) {
  const rate = getReferralRate(user);
  const showRate = rate !== DEFAULT_REFERRAL_RATE;

  return (
    <div className="text-center">
      <p className="text-sm font-black tabular-nums text-zinc-800">{user.referralCount}</p>
      {showRate ? (
        <p className="mt-0.5 text-[11px] font-bold text-brand-primary">{rate}%</p>
      ) : null}
    </div>
  );
}

function RoleBadge({ role }: { role: ManagedUser['role'] }) {
  const styles = {
    admin: 'bg-violet-50 text-violet-700',
    user: 'bg-slate-100 text-slate-600',
    seller: 'bg-blue-50 text-blue-700',
    vip: 'bg-amber-50 text-amber-700',
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${styles[role]}`}>
      {USER_ROLE_LABELS[role]}
    </span>
  );
}

type MenuItem =
  | { type: 'action'; id: UserAction; label: string; icon: typeof UserCog; danger?: boolean }
  | { type: 'login'; label: string; icon: typeof LogIn };

const ACTION_MENU_WIDTH = 224;
const ACTION_MENU_MAX_HEIGHT = 340;

function ActionMenu({
  user,
  onAction,
  onLoginAs,
}: {
  user: ManagedUser;
  onAction: (action: UserAction) => void;
  onLoginAs: (user: ManagedUser) => void;
}) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, maxHeight: ACTION_MENU_MAX_HEIGHT });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const items: MenuItem[] = [
    { type: 'login', label: 'Đăng nhập', icon: LogIn },
    { type: 'action', id: 'edit-profile', label: 'Chỉnh sửa tài khoản', icon: UserCog },
    {
      type: 'action',
      id: 'edit-referral-rate',
      label: 'Chỉnh CK giới thiệu',
      icon: Percent,
    },
    { type: 'action', id: 'balance-history', label: 'Lịch sử nạp/trừ tiền', icon: History },
    { type: 'action', id: 'remove-2fa', label: 'Xóa mã 2FA', icon: ShieldOff, danger: user.has2FA },
    { type: 'action', id: 'system-info', label: 'Thông tin hệ thống', icon: Info },
  ];

  const updateMenuPosition = () => {
    const btn = buttonRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const gap = 6;
    const pad = 8;
    const itemHeight = 36;
    const estimatedHeight = Math.min(items.length * itemHeight + 8, ACTION_MENU_MAX_HEIGHT);

    let top = rect.bottom + gap;
    let left = rect.left;
    let maxHeight = ACTION_MENU_MAX_HEIGHT;

    const spaceBelow = window.innerHeight - rect.bottom - pad;
    const spaceAbove = rect.top - pad;

    if (spaceBelow < estimatedHeight && spaceAbove > spaceBelow) {
      maxHeight = Math.min(ACTION_MENU_MAX_HEIGHT, spaceAbove - gap);
      top = Math.max(pad, rect.top - maxHeight - gap);
    } else {
      maxHeight = Math.min(ACTION_MENU_MAX_HEIGHT, spaceBelow - gap);
    }

    if (left + ACTION_MENU_WIDTH > window.innerWidth - pad) {
      left = Math.max(pad, window.innerWidth - ACTION_MENU_WIDTH - pad);
    }
    if (left < pad) left = pad;

    setMenuPos({ top, left, maxHeight });
  };

  useLayoutEffect(() => {
    if (!open) return;
    updateMenuPosition();
    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);
    return () => {
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (buttonRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition-colors ${
          open
            ? 'border-brand-primary bg-emerald-50 text-brand-primary'
            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
        }`}
      >
        Thao tác
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open &&
        createPortal(
          <motion.div
            ref={menuRef}
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed',
              top: menuPos.top,
              left: menuPos.left,
              width: ACTION_MENU_WIDTH,
              maxHeight: menuPos.maxHeight,
              zIndex: 9999,
            }}
            className="overflow-y-auto overflow-x-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-2xl ring-1 ring-black/5"
          >
            {items.map((item) => {
              const Icon = item.icon;
              const key = item.type === 'login' ? 'login' : item.id;
              const disabled = item.type === 'action' && item.id === 'remove-2fa' && !user.has2FA;
              const isLogin = item.type === 'login';
              return (
                <button
                  key={key}
                  type="button"
                  role="menuitem"
                  disabled={disabled}
                  onClick={() => {
                    setOpen(false);
                    if (isLogin) onLoginAs(user);
                    else onAction(item.id);
                  }}
                  className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[12px] font-semibold transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 ${
                    item.type === 'action' && item.danger
                      ? 'text-red-600'
                      : isLogin
                        ? 'text-brand-primary'
                        : 'text-slate-700'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </motion.div>,
          document.body
        )}
    </>
  );
}

export default function UsersSection() {
  const [users, setUsers] = useState<ManagedUser[]>(() => loadManagedUsers(initialManagedUsers));
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeUser, setActiveUser] = useState<ManagedUser | null>(null);
  const [activeAction, setActiveAction] = useState<UserAction | null>(null);
  const [sortKey, setSortKey] = useState<SortKey | null>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  useEffect(() => {
    saveManagedUsers(users);
  }, [users]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = users;
    if (q) {
      list = users.filter(
        (u) =>
          u.username.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.fullName.toLowerCase().includes(q) ||
          u.phone.includes(q) ||
          u.id.includes(q)
      );
    }
    if (!sortKey) return list;
    return [...list].sort((a, b) => compareUsers(a, b, sortKey, sortDir));
  }, [users, search, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const selectedUsers = useMemo(
    () => users.filter((u) => selectedIds.has(u.id)),
    [users, selectedIds]
  );

  const logoutUsers = (ids: string[]) => {
    if (ids.length === 0) return;
    setUsers((prev) =>
      prev.map((u) => (ids.includes(u.id) ? { ...u, sessionActive: false } : u))
    );
    alert(`Đã đăng xuất ${ids.length} thành viên (huỷ phiên đang hoạt động).`);
  };

  const rotateApiKeys = (ids: string[]) => {
    if (ids.length === 0) return;
    setUsers((prev) =>
      prev.map((u) => (ids.includes(u.id) ? { ...u, apiKey: generateApiKey() } : u))
    );
    alert(`Đã đổi API Key cho ${ids.length} thành viên.`);
  };

  const handleLogoutSelected = () => {
    if (selectedIds.size === 0) {
      alert('Chọn ít nhất một thành viên.');
      return;
    }
    if (!window.confirm(`Đăng xuất ${selectedIds.size} thành viên đã chọn?`)) return;
    logoutUsers([...selectedIds]);
  };

  const handleLogoutAll = () => {
    if (!window.confirm(`Đăng xuất tất cả ${users.length} thành viên?`)) return;
    logoutUsers(users.map((u) => u.id));
  };

  const handleRotateKeySelected = () => {
    if (selectedIds.size === 0) {
      alert('Chọn ít nhất một thành viên.');
      return;
    }
    if (!window.confirm(`Đổi API Key cho ${selectedIds.size} thành viên đã chọn?`)) return;
    rotateApiKeys([...selectedIds]);
  };

  const handleRotateKeyAll = () => {
    if (!window.confirm(`Đổi API Key cho tất cả ${users.length} thành viên?`)) return;
    rotateApiKeys(users.map((u) => u.id));
  };

  const allSelected = filtered.length > 0 && filtered.every((u) => selectedIds.has(u.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((u) => u.id)));
    }
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const updateUser = (id: string, patch: Partial<ManagedUser>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  };

  const openAction = (user: ManagedUser, action: UserAction) => {
    setActiveUser(user);
    setActiveAction(action);
  };

  const closeModal = () => {
    setActiveUser(null);
    setActiveAction(null);
  };

  const handleLoginAs = (user: ManagedUser) => {
    updateUser(user.id, { sessionActive: true });
    alert(
      `Đăng nhập với tài khoản @${user.username}\n(Demo — kết nối API impersonation sau)`
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-black tracking-tight text-zinc-900">Quản lý người dùng</h2>
          <p className="mt-0.5 text-[13px] font-medium text-zinc-500">
            {users.length} tài khoản · {selectedIds.size} đã chọn
          </p>
        </div>
        <div className="relative max-w-xs flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm username, email, SĐT..."
            className="w-full rounded-xl border border-zinc-200 py-2.5 pl-10 pr-4 text-sm font-medium text-zinc-800 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-zinc-200/80 bg-white p-3 shadow-sm">
        <button
          type="button"
          onClick={handleLogoutSelected}
          disabled={selectedIds.size === 0}
          className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-800 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <LogOut className="h-3.5 w-3.5" />
          Đăng xuất đã chọn
        </button>
        <button
          type="button"
          onClick={handleLogoutAll}
          className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-white px-3 py-2 text-[11px] font-bold text-amber-800 hover:bg-amber-50"
        >
          <LogOut className="h-3.5 w-3.5" />
          Đăng xuất tất cả
        </button>
        <span className="mx-1 hidden h-8 w-px bg-zinc-200 sm:inline" aria-hidden />
        <button
          type="button"
          onClick={handleRotateKeySelected}
          disabled={selectedIds.size === 0}
          className="inline-flex items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-[11px] font-bold text-violet-800 hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Đổi API Key đã chọn
        </button>
        <button
          type="button"
          onClick={handleRotateKeyAll}
          className="inline-flex items-center gap-1.5 rounded-xl border border-violet-200 bg-white px-3 py-2 text-[11px] font-bold text-violet-800 hover:bg-violet-50"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Đổi API Key tất cả
        </button>
        {selectedUsers.length > 0 ? (
          <p className="ml-auto self-center text-[11px] font-medium text-zinc-500">
            {selectedUsers.filter((u) => u.sessionActive).length}/{selectedUsers.length} đang online
            (đã chọn)
          </p>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="w-10 border-r border-slate-200 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
                    aria-label="Chọn tất cả"
                  />
                </th>
                <th className="w-12 border-r border-slate-200 px-2 py-3 text-left text-[11px] font-black uppercase tracking-wide text-slate-600">
                  STT
                </th>
                <th className="w-36 border-r border-slate-200 px-3 py-3 text-left text-[11px] font-black uppercase tracking-wide text-slate-600">
                  Thao tác
                </th>
                <SortableTh
                  label="Tài khoản"
                  sortKey="username"
                  activeKey={sortKey}
                  dir={sortDir}
                  onSort={handleSort}
                  className="min-w-[160px]"
                />
                <SortableTh
                  label="Số dư"
                  sortKey="balance"
                  activeKey={sortKey}
                  dir={sortDir}
                  onSort={handleSort}
                  align="right"
                />
                <SortableTh
                  label="Tổng nạp"
                  sortKey="totalDeposit"
                  activeKey={sortKey}
                  dir={sortDir}
                  onSort={handleSort}
                  align="right"
                />
                <SortableTh
                  label="Role"
                  sortKey="role"
                  activeKey={sortKey}
                  dir={sortDir}
                  onSort={handleSort}
                />
                <SortableTh
                  label="Trạng thái"
                  sortKey="status"
                  activeKey={sortKey}
                  dir={sortDir}
                  onSort={handleSort}
                />
                <SortableTh
                  label="Thời gian tạo"
                  sortKey="createdAt"
                  activeKey={sortKey}
                  dir={sortDir}
                  onSort={handleSort}
                  className="whitespace-nowrap"
                />
                <SortableTh
                  label="Chiết khấu"
                  sortKey="discountPercent"
                  activeKey={sortKey}
                  dir={sortDir}
                  onSort={handleSort}
                  align="center"
                />
                <SortableTh
                  label="Giới thiệu"
                  sortKey="referralCount"
                  activeKey={sortKey}
                  dir={sortDir}
                  onSort={handleSort}
                  align="center"
                />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-6 py-16 text-center text-sm text-zinc-500">
                    Không tìm thấy người dùng.
                  </td>
                </tr>
              ) : (
                filtered.map((user, index) => (
                  <tr
                    key={user.id}
                    className={`border-b border-slate-100 transition-colors hover:bg-emerald-50/30 ${
                      selectedIds.has(user.id) ? 'bg-emerald-50/20' : ''
                    }`}
                  >
                    <td className="border-r border-slate-200 px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(user.id)}
                        onChange={() => toggleOne(user.id)}
                        className="h-4 w-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
                        aria-label={`Chọn ${user.username}`}
                      />
                    </td>
                    <td className="border-r border-slate-200 px-2 py-3 text-center text-[12px] font-bold tabular-nums text-zinc-500">
                      {index + 1}
                    </td>
                    <td className="border-r border-slate-200 px-3 py-3">
                      <ActionMenu
                        user={user}
                        onAction={(action) => openAction(user, action)}
                        onLoginAs={handleLoginAs}
                      />
                    </td>
                    <td className="border-r border-slate-200 px-3 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 shrink-0 rounded-full ${
                            user.sessionActive ? 'bg-emerald-500' : 'bg-zinc-300'
                          }`}
                          title={user.sessionActive ? 'Đang online' : 'Đã đăng xuất'}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-zinc-900">@{user.username}</p>
                          <p className="mt-0.5 truncate text-[12px] text-zinc-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap border-r border-slate-200 px-3 py-3 text-right text-sm font-bold tabular-nums text-red-600">
                      {formatUserMoney(user.balance)}
                    </td>
                    <td className="whitespace-nowrap border-r border-slate-200 px-3 py-3 text-right text-sm font-bold tabular-nums text-zinc-800">
                      {formatUserMoney(user.totalDeposit)}
                    </td>
                    <td className="border-r border-slate-200 px-3 py-3">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="border-r border-slate-200 px-3 py-3">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="whitespace-nowrap border-r border-slate-200 px-3 py-3 text-[12px] text-zinc-600">
                      {formatUserDate(user.createdAt)}
                    </td>
                    <td className="border-r border-slate-200 px-3 py-3 text-center text-sm font-bold tabular-nums text-violet-700">
                      {user.discountPercent > 0 ? `${user.discountPercent}%` : '—'}
                    </td>
                    <td className="border-r border-slate-200 px-3 py-3">
                      <ReferralCell user={user} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <p className="border-t border-slate-100 px-4 py-2.5 text-[11px] text-zinc-400">
          Bấm tiêu đề cột để sắp xếp. Chấm xanh = đang online. Cột giới thiệu chỉ hiện % khi khác mức mặc định (
          {DEFAULT_REFERRAL_RATE}%).
        </p>
      </div>

      <AnimatePresence>
        {activeUser && activeAction === 'edit-profile' && (
          <EditUserProfileModal
            user={activeUser}
            onClose={closeModal}
            onSaveAccount={(updated) => {
              updateUser(updated.id, updated);
              closeModal();
            }}
            onConfirmPassword={(password) => {
              alert(`Đã đặt mật khẩu mới cho @${activeUser.username}:\n${password}`);
              closeModal();
            }}
            onSaveEmail={(email) => {
              updateUser(activeUser.id, { email });
              closeModal();
            }}
            onSavePhone={(phone) => {
              updateUser(activeUser.id, { phone });
              closeModal();
            }}
          />
        )}
        {activeUser && activeAction === 'edit-referral-rate' && (
          <EditReferralRateModal
            user={activeUser}
            onClose={closeModal}
            onSave={(referralRatePercent) => {
              updateUser(activeUser.id, { referralRatePercent });
              closeModal();
            }}
          />
        )}
        {activeUser && activeAction === 'balance-history' && (
          <BalanceHistoryModal
            user={activeUser}
            transactions={getBalanceHistory(activeUser.id)}
            onClose={closeModal}
          />
        )}
        {activeUser && activeAction === 'system-info' && (
          <SystemInfoModal user={activeUser} onClose={closeModal} />
        )}
        {activeUser && activeAction === 'remove-2fa' && (
          <Remove2FAConfirmModal
            user={activeUser}
            onClose={closeModal}
            onConfirm={() => {
              updateUser(activeUser.id, { has2FA: false });
              closeModal();
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
