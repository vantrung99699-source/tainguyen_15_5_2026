import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  Bell,
  Plus,
  Trash2,
  Megaphone,
  LayoutPanelTop,
  Layers,
  Power,
  Pencil,
  Clock,
  CalendarClock,
  CalendarX2,
  Ban,
} from 'lucide-react';
import type {
  InAppNotification,
  InAppNotificationType,
  NotificationDelivery,
  PopupScheduleMode,
  PopupVisualStyle,
} from '../../types/notification';
import {
  DELIVERY_LABELS,
  INAPP_TYPE_LABELS,
  POPUP_SCHEDULE_HINTS,
  POPUP_SCHEDULE_LABELS,
  POPUP_STYLE_LABELS,
} from '../../types/notification';
import {
  createInAppNotification,
  deleteInAppNotification,
  loadAllInAppNotifications,
  updateInAppNotification,
  INAPP_NOTIF_UPDATED,
} from '../../services/inAppNotificationService';
import { NotificationPopupPreview } from '../../components/notifications/NotificationPopup';
import { RichTextEditor } from '../../components/admin/RichTextEditor';
import { stripHtml } from '../../utils/htmlContent';

const TYPE_STYLES: Record<InAppNotificationType, string> = {
  promo: 'bg-violet-100 text-violet-700',
  maintenance: 'bg-amber-100 text-amber-800',
  alert: 'bg-orange-100 text-orange-700',
  system: 'bg-emerald-100 text-emerald-700',
};

const emptyForm = () => ({
  title: '',
  shortContent: '',
  detailContent: '',
  type: 'promo' as InAppNotificationType,
  delivery: 'both' as NotificationDelivery,
  popupStyle: 'promo' as PopupVisualStyle,
  actionLabel: 'Đã hiểu',
  actionUrl: '',
  popupScheduleMode: 'until_dismiss' as PopupScheduleMode,
  popupReshowHours: 24,
  popupShowFrom: '',
  popupShowUntil: '',
});

const RESHOW_HOUR_OPTIONS = [
  { value: 1, label: '1 giờ' },
  { value: 6, label: '6 giờ' },
  { value: 24, label: '24 giờ' },
  { value: 72, label: '3 ngày' },
  { value: 168, label: '7 ngày' },
];

const SCHEDULE_OPTIONS: {
  id: PopupScheduleMode;
  icon: typeof Ban;
}[] = [
  { id: 'until_dismiss', icon: Ban },
  { id: 'after_interval', icon: Clock },
  { id: 'specific_date', icon: CalendarClock },
  { id: 'expire_at_date', icon: CalendarX2 },
];

export function UserNotificationAdminSection() {
  const [list, setList] = useState(loadAllInAppNotifications);
  const [form, setForm] = useState(emptyForm);
  const [filterDelivery, setFilterDelivery] = useState<'all' | NotificationDelivery>('all');
  const [editingId, setEditingId] = useState<string | null>(null);

  const sync = () => {
    setList(loadAllInAppNotifications());
  };

  useEffect(() => {
    window.addEventListener(INAPP_NOTIF_UPDATED, sync);
    return () => window.removeEventListener(INAPP_NOTIF_UPDATED, sync);
  }, []);

  const filtered = useMemo(() => {
    if (filterDelivery === 'all') return list;
    return list.filter((n) => n.delivery === filterDelivery || n.delivery === 'both');
  }, [list, filterDelivery]);

  const resetForm = () => {
    setForm(emptyForm());
    setEditingId(null);
  };

  const handleSave = () => {
    if (!stripHtml(form.title).trim()) return;
    if (
      (form.delivery === 'popup' || form.delivery === 'both') &&
      form.popupScheduleMode === 'expire_at_date' &&
      !form.popupShowUntil.trim()
    ) {
      return;
    }
    if (editingId) {
      updateInAppNotification(editingId, {
        type: form.type,
        title: form.title,
        shortContent: form.shortContent,
        detailContent: form.detailContent || form.shortContent,
        targetUserId: null,
        delivery: form.delivery,
        popupStyle: form.popupStyle,
        popupScheduleMode: form.popupScheduleMode,
        popupReshowHours: form.popupReshowHours,
        popupShowFrom: form.popupShowFrom.trim() || null,
        popupShowUntil: form.popupShowUntil.trim() || null,
        actionLabel: form.actionLabel,
        actionUrl: form.actionUrl,
        expiresAt: null,
        active: true,
      });
    } else {
      createInAppNotification({
        type: form.type,
        title: form.title,
        shortContent: form.shortContent,
        detailContent: form.detailContent || form.shortContent,
        targetUserId: null,
        delivery: form.delivery,
        popupStyle: form.popupStyle,
        popupScheduleMode: form.popupScheduleMode,
        popupReshowHours: form.popupReshowHours,
        popupShowFrom: form.popupShowFrom.trim() || null,
        popupShowUntil: form.popupShowUntil.trim() || null,
        actionLabel: form.actionLabel,
        actionUrl: form.actionUrl,
        expiresAt: null,
      });
    }
    resetForm();
    sync();
  };

  const startEdit = (n: InAppNotification) => {
    setEditingId(n.id);
    setForm({
      title: n.title,
      shortContent: n.shortContent,
      detailContent: n.detailContent,
      type: n.type,
      delivery: n.delivery,
      popupStyle: n.popupStyle,
      actionLabel: n.actionLabel,
      actionUrl: n.actionUrl,
      popupScheduleMode: n.popupScheduleMode ?? 'until_dismiss',
      popupReshowHours: n.popupReshowHours ?? 24,
      popupShowFrom: n.popupShowFrom?.slice(0, 16) ?? '',
      popupShowUntil: n.popupShowUntil?.slice(0, 16) ?? '',
    });
  };

  const showPopupPreview = form.delivery === 'popup' || form.delivery === 'both';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-4 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-black text-zinc-900">
              {editingId ? 'Sửa thông báo' : 'Tạo thông báo mới'}
            </p>
            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs font-bold text-zinc-500 hover:text-zinc-800"
              >
                Hủy sửa
              </button>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {(
              [
                { id: 'bell', label: 'Chuông', desc: 'Icon header + dropdown', icon: Bell },
                { id: 'popup', label: 'Popup', desc: 'Modal khi vào web', icon: LayoutPanelTop },
                { id: 'both', label: 'Cả hai', desc: 'Chuông + Popup', icon: Layers },
              ] as const
            ).map((opt) => {
              const Icon = opt.icon;
              const active = form.delivery === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setForm({ ...form, delivery: opt.id })}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    active
                      ? 'border-brand-primary bg-emerald-50 ring-2 ring-brand-primary/20'
                      : 'border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <Icon className={`mb-2 h-5 w-5 ${active ? 'text-brand-primary' : 'text-zinc-400'}`} />
                  <p className="text-sm font-black text-zinc-800">{opt.label}</p>
                  <p className="text-[11px] text-zinc-500">{opt.desc}</p>
                </button>
              );
            })}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-[11px] font-bold uppercase text-zinc-400">Loại</span>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as InAppNotificationType })}
                className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              >
                {Object.entries(INAPP_TYPE_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            {showPopupPreview ? (
              <label className="block">
                <span className="text-[11px] font-bold uppercase text-zinc-400">Kiểu popup</span>
                <select
                  value={form.popupStyle}
                  onChange={(e) =>
                    setForm({ ...form, popupStyle: e.target.value as PopupVisualStyle })
                  }
                  className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
                >
                  {Object.entries(POPUP_STYLE_LABELS).map(([k, label]) => (
                    <option key={k} value={k}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>

          {showPopupPreview ? (
            <div className="space-y-3 rounded-xl border border-emerald-100 bg-emerald-50/20 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">
                Lịch hiển thị popup
              </p>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                {SCHEDULE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const active = form.popupScheduleMode === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setForm({ ...form, popupScheduleMode: opt.id })}
                      className={`rounded-xl border p-3 text-left transition-all ${
                        active
                          ? 'border-brand-primary bg-white ring-2 ring-brand-primary/20'
                          : 'border-zinc-200 bg-white hover:border-zinc-300'
                      }`}
                    >
                      <Icon
                        className={`mb-2 h-4 w-4 ${active ? 'text-brand-primary' : 'text-zinc-400'}`}
                      />
                      <p className="text-[12px] font-black leading-snug text-zinc-800">
                        {POPUP_SCHEDULE_LABELS[opt.id]}
                      </p>
                      <p className="mt-1 text-[10px] leading-relaxed text-zinc-500">
                        {POPUP_SCHEDULE_HINTS[opt.id]}
                      </p>
                    </button>
                  );
                })}
              </div>
              {form.popupScheduleMode === 'after_interval' ? (
                <label className="block">
                  <span className="text-[11px] font-bold uppercase text-zinc-400">
                    Hiện lại sau
                  </span>
                  <select
                    value={form.popupReshowHours}
                    onChange={(e) =>
                      setForm({ ...form, popupReshowHours: Number(e.target.value) })
                    }
                    className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm font-medium"
                  >
                    {RESHOW_HOUR_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              {form.popupScheduleMode === 'specific_date' ? (
                <label className="block">
                  <span className="text-[11px] font-bold uppercase text-zinc-400">
                    Bắt đầu hiện từ
                  </span>
                  <input
                    type="datetime-local"
                    value={form.popupShowFrom}
                    onChange={(e) => setForm({ ...form, popupShowFrom: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
                  />
                </label>
              ) : null}
              {form.popupScheduleMode === 'expire_at_date' ? (
                <label className="block">
                  <span className="text-[11px] font-bold uppercase text-zinc-400">
                    Hết hạn lúc
                  </span>
                  <input
                    type="datetime-local"
                    value={form.popupShowUntil}
                    onChange={(e) => setForm({ ...form, popupShowUntil: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
                    required
                  />
                  <p className="mt-1 text-[10px] text-zinc-500">
                    Sau thời điểm này popup sẽ không hiện nữa (chuông vẫn hoạt động nếu có).
                  </p>
                </label>
              ) : null}
            </div>
          ) : null}

          <div className="space-y-4 rounded-xl border border-zinc-100 bg-zinc-50/40 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">
              Nội dung thông báo
            </p>
            <RichTextEditor
              label="Tiêu đề"
              value={form.title}
              onChange={(title) => setForm({ ...form, title })}
              placeholder="Tiêu đề (VD: TUYÊN BỐ MIỄN TRỪ TRÁCH NHIỆM)"
              minHeight="80px"
            />
            <RichTextEditor
              label="Tóm tắt (chuông & popup)"
              value={form.shortContent}
              onChange={(shortContent) => setForm({ ...form, shortContent })}
              placeholder="Nội dung ngắn — hiện ở chuông / dòng tóm tắt popup"
              minHeight="100px"
            />
            <RichTextEditor
              label="Chi tiết (popup & trang thông báo)"
              value={form.detailContent}
              onChange={(detailContent) => setForm({ ...form, detailContent })}
              placeholder="Nội dung chi tiết — danh sách, in đậm, liên kết…"
              minHeight="220px"
            />
          </div>

          {showPopupPreview ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={form.actionLabel}
                onChange={(e) => setForm({ ...form, actionLabel: e.target.value })}
                placeholder="Nút chính (VD: Đã hiểu)"
                className="rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              />
              <input
                value={form.actionUrl}
                onChange={(e) => setForm({ ...form, actionUrl: e.target.value })}
                placeholder="Link nút phụ (tùy chọn)"
                className="rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary py-3 text-sm font-bold text-white shadow-md shadow-emerald-200/50 hover:bg-emerald-600 sm:w-auto sm:px-8"
          >
            <Plus className="h-4 w-4" />
            {editingId ? 'Cập nhật' : 'Gửi thông báo'}
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-zinc-400">
            Xem trước popup
          </p>
          {showPopupPreview ? (
            <NotificationPopupPreview
              title={form.title}
              shortContent={form.detailContent || form.shortContent}
              popupStyle={form.popupStyle}
            />
          ) : (
            <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-6 text-center text-sm text-zinc-400">
              Chọn &quot;Popup&quot; hoặc &quot;Cả hai&quot; để xem trước
            </div>
          )}
          <div className="rounded-xl border border-zinc-100 bg-zinc-50/80 p-4 text-[12px] leading-relaxed text-zinc-500">
            <Megaphone className="mb-2 h-4 w-4 text-brand-primary" />
            Popup hiển thị giữa màn hình. Chọn lịch: đóng là ẩn, hiện lại sau X giờ, hoặc chỉ
            bật từ ngày giờ cụ thể. Chuông vẫn nhận TB nếu chọn &quot;Cả hai&quot;.
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200/70 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 px-4 py-3">
          <p className="text-sm font-black text-zinc-800">Danh sách đã gửi</p>
          <div className="flex gap-2">
            {(['all', 'bell', 'popup', 'both'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilterDelivery(f)}
                className={`rounded-lg px-3 py-1 text-xs font-bold ${
                  filterDelivery === f
                    ? 'bg-brand-primary text-white'
                    : 'bg-zinc-100 text-zinc-600'
                }`}
              >
                {f === 'all' ? 'Tất cả' : DELIVERY_LABELS[f]}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead>
              <tr className="bg-zinc-50/80 text-[11px] font-bold uppercase text-zinc-500">
                <th className="px-4 py-3">Thông báo</th>
                <th className="px-4 py-3">Kênh</th>
                <th className="px-4 py-3">Lịch popup</th>
                <th className="px-4 py-3">Loại</th>
                <th className="px-4 py-3">Đối tượng</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-zinc-400">
                    Chưa có thông báo.
                  </td>
                </tr>
              ) : (
                filtered.map((n) => (
                  <tr key={n.id} className="border-t border-zinc-50 hover:bg-zinc-50/50">
                    <td className="px-4 py-3">
                      <p className="font-bold text-zinc-900">{n.title}</p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500">
                        {stripHtml(n.shortContent)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-lg bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800">
                        {DELIVERY_LABELS[n.delivery]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[10px] font-medium text-zinc-600">
                      {n.delivery === 'popup' || n.delivery === 'both' ? (
                        n.popupScheduleMode === 'after_interval' ? (
                          <>Sau {n.popupReshowHours}h</>
                        ) : n.popupScheduleMode === 'specific_date' ? (
                          <>
                            Từ{' '}
                            {n.popupShowFrom
                              ? new Date(n.popupShowFrom).toLocaleString('vi-VN')
                              : '—'}
                          </>
                        ) : n.popupScheduleMode === 'expire_at_date' ? (
                          <>
                            Đến{' '}
                            {n.popupShowUntil
                              ? new Date(n.popupShowUntil).toLocaleString('vi-VN')
                              : '—'}
                          </>
                        ) : (
                          POPUP_SCHEDULE_LABELS.until_dismiss
                        )
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${TYPE_STYLES[n.type]}`}
                      >
                        {INAPP_TYPE_LABELS[n.type]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-zinc-600">
                      {n.targetUserId ?? 'Tất cả'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-bold ${n.active ? 'text-emerald-600' : 'text-zinc-400'}`}
                      >
                        {n.active ? 'Đang bật' : 'Tắt'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            updateInAppNotification(n.id, { active: !n.active });
                            sync();
                          }}
                          className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100"
                          title={n.active ? 'Tắt' : 'Bật'}
                        >
                          <Power className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => startEdit(n)}
                          className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            deleteInAppNotification(n.id);
                            sync();
                          }}
                          className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
