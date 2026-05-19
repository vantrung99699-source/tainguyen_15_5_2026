import type { DepositSyntaxType, DepositUserProfile, PaymentGlobalSettings } from '../types/payment';

/** Mã BIN ngân hàng cho VietQR (demo) */
export const VIETQR_BANK_BIN: Record<string, string> = {
  vcb: '970436',
  tcb: '970407',
  mb: '970422',
  acb: '970416',
  vtb: '970415',
  bidv: '970418',
  vpb: '970432',
  tpb: '970423',
  shb: '970443',
  hdb: '970437',
  scb: '970429',
};

export const DEPOSIT_SYNTAX_OPTIONS: { value: DepositSyntaxType; label: string }[] = [
  { value: 'prefix_id', label: 'Prefix + ID' },
  { value: 'fullname_transfer', label: 'Họ và tên + chuyển tiền' },
];

function removeVietnameseTones(str: string) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

/** Tạo nội dung chuyển khoản theo cấu hình admin */
export function buildDepositTransferContent(
  settings: PaymentGlobalSettings,
  user: DepositUserProfile
): string {
  if (!settings.depositSyntaxEnabled) {
    return `NAP ${user.id}`;
  }

  if (settings.depositSyntaxType === 'fullname_transfer') {
    const name = removeVietnameseTones(user.fullName).toUpperCase().trim();
    return `${name} CHUYEN TIEN`;
  }

  const prefix = settings.depositPrefix.trim().toUpperCase() || 'NAPTIEN';
  return `${prefix} ${user.id}`;
}

/** URL ảnh QR VietQR (demo — cần STK & BIN hợp lệ) */
export function buildVietQrImageUrl(params: {
  gatewayId: string;
  accountNumber: string;
  accountHolder: string;
  amount: number;
  transferContent: string;
}): string | null {
  const bin = VIETQR_BANK_BIN[params.gatewayId];
  if (!bin || !params.accountNumber.trim()) return null;

  const q = new URLSearchParams({
    amount: String(Math.round(params.amount)),
    addInfo: params.transferContent,
    accountName: params.accountHolder,
  });

  return `https://img.vietqr.io/image/${bin}-${params.accountNumber.trim()}-compact2.png?${q.toString()}`;
}

/** Người dùng đang đăng nhập (mock — thay bằng API sau) */
export const MOCK_DEPOSIT_USER: DepositUserProfile = {
  id: '8821',
  username: 'minhnv',
  fullName: 'Nguyễn Văn Minh',
};
