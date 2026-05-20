import { motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import { Send, Mail, Bell } from 'lucide-react';

function SectionShell({
  title,
  subtitle,
  icon: Icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 ring-1 ring-emerald-100">
          <Icon className="h-5 w-5 text-brand-primary" />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-black tracking-tight text-zinc-900">{title}</h2>
          <p className="mt-0.5 text-[12px] font-medium text-zinc-500">{subtitle}</p>
        </div>
      </div>
      {children}
    </motion.div>
  );
}

function PlaceholderCard({ hint }: { hint: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-zinc-600">{hint}</p>
      <p className="mt-2 text-[12px] text-zinc-400">Khu vực cấu hình sẽ được bổ sung chi tiết trong bản cập nhật tiếp theo.</p>
    </div>
  );
}

export function TelegramNotificationSection() {
  return (
    <SectionShell
      title="Thông báo Telegram"
      subtitle="Bot Telegram, nhóm/kênh nhận thông báo hệ thống"
      icon={Send}
    >
      <PlaceholderCard hint="Bot token, Chat ID, mẫu tin nhắn đơn hàng/nạp tiền, bật/tắt từng loại sự kiện..." />
    </SectionShell>
  );
}

export function EmailNotificationSection() {
  return (
    <SectionShell
      title="Thông báo Email"
      subtitle="SMTP, mẫu email gửi cho admin và khách hàng"
      icon={Mail}
    >
      <PlaceholderCard hint="Cấu hình SMTP, email gửi đi, mẫu xác nhận đơn, quên mật khẩu, nạp tiền thành công..." />
    </SectionShell>
  );
}

export function UserNotificationSection() {
  return (
    <SectionShell
      title="Thông báo người dùng"
      subtitle="Thông báo trong app cho khách hàng"
      icon={Bell}
    >
      <PlaceholderCard hint="Thông báo đẩy trên web, lịch sử thông báo, đánh dấu đã đọc, gửi broadcast..." />
    </SectionShell>
  );
}
