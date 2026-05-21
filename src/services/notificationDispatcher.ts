import { loadCustomerSession } from './customerSession';
import { initialManagedUsers } from '../pages/admin/userData';
import { findUserById } from './userAdmin';
import { notifyAdminTelegram, notifyUserTelegram } from './telegramNotificationService';
import { sendTemplateEmail } from './emailNotificationService';
import { createInAppNotification } from './inAppNotificationService';

/** Đơn hàng mới / hoàn thành */
export async function dispatchOrderCompleted(params: {
  orderId: string;
  userId: string;
  username: string;
  productName: string;
  totalAmount: number;
}) {
  const adminMsg = `🛒 Đơn mới #${params.orderId}\n${params.username} — ${params.productName}\n${params.totalAmount.toLocaleString('vi-VN')} đ`;
  await notifyAdminTelegram('newOrder', adminMsg);

  await notifyUserTelegram(
    params.userId,
    `✅ Đơn #${params.orderId} đã hoàn thành.\n${params.productName}`,
    (p) => p.notifyOrderComplete,
  );

  const user = findUserById(params.userId, initialManagedUsers);
  if (user?.email) {
    await sendTemplateEmail('order_success', user.email, {
      site_name: 'TapHoaMMO',
      order_id: params.orderId,
      product_name: params.productName,
      amount: params.totalAmount.toLocaleString('vi-VN'),
    });
  }

  createInAppNotification({
    type: 'system',
    title: 'Đơn hàng hoàn thành',
    shortContent: `Đơn #${params.orderId} — ${params.productName}`,
    detailContent: `Đơn hàng của bạn đã được xử lý thành công. Tổng: ${params.totalAmount.toLocaleString('vi-VN')} đ.`,
    targetUserId: params.userId,
  });
}

/** Yêu cầu rút tiền affiliate */
export async function dispatchWithdrawalRequest(params: {
  withdrawalId: string;
  username: string;
  amount: number;
}) {
  await notifyAdminTelegram(
    'withdrawalRequest',
    `💸 Rút tiền affiliate #${params.withdrawalId}\n${params.username} — ${params.amount.toLocaleString('vi-VN')} đ`,
  );
}

/** Nạp tiền thành công (gọi khi có luồng nạp thật) */
export async function dispatchDepositSuccess(params: {
  userId: string;
  amount: number;
  balanceAfter: number;
}) {
  await notifyAdminTelegram(
    'depositSuccess',
    `💰 Nạp tiền +${params.amount.toLocaleString('vi-VN')} đ — user ${params.userId}`,
  );

  const user = findUserById(params.userId, initialManagedUsers);
  if (user?.email) {
    await sendTemplateEmail('deposit_invoice', user.email, {
      amount: params.amount.toLocaleString('vi-VN'),
      balance: params.balanceAfter.toLocaleString('vi-VN'),
    });
  }

  createInAppNotification({
    type: 'system',
    title: 'Nạp tiền thành công',
    shortContent: `+${params.amount.toLocaleString('vi-VN')} đ đã vào ví`,
    detailContent: `Số dư hiện tại: ${params.balanceAfter.toLocaleString('vi-VN')} đ.`,
    targetUserId: params.userId,
  });
}

/** Kho sắp hết */
export async function dispatchLowStock(params: {
  shopTitle: string;
  itemName: string;
  stock: number;
}) {
  if (params.stock > 5) return;
  await notifyAdminTelegram(
    'lowStock',
    `⚠️ Kho thấp: ${params.shopTitle} / ${params.itemName}\nCòn ${params.stock} sp`,
  );
}

/** Hoa hồng affiliate */
export async function dispatchAffiliateCredit(params: {
  userId: string;
  amount: number;
  orderId: string;
}) {
  await notifyUserTelegram(
    params.userId,
    `🎁 +${params.amount.toLocaleString('vi-VN')} đ hoa hồng từ đơn #${params.orderId}`,
    (p) => p.notifyAffiliateCredit,
  );

  createInAppNotification({
    type: 'promo',
    title: 'Hoa hồng affiliate',
    shortContent: `+${params.amount.toLocaleString('vi-VN')} đ từ đơn #${params.orderId}`,
    detailContent: 'Hoa hồng đã được ghi nhận vào ví affiliate của bạn.',
    targetUserId: params.userId,
  });
}

/** Đăng nhập lạ (demo) */
export function dispatchLoginAlert(userId: string) {
  notifyUserTelegram(
    userId,
    '🔐 Cảnh báo: Tài khoản vừa đăng nhập trên thiết bị mới.',
    (p) => p.notifyLoginAlert,
  );
  createInAppNotification({
    type: 'alert',
    title: 'Đăng nhập mới',
    shortContent: 'Phát hiện phiên đăng nhập mới',
    detailContent: 'Nếu không phải bạn, hãy đổi mật khẩu ngay.',
    targetUserId: userId,
  });
}
