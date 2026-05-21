import {
  createInAppNotification,
  loadAllInAppNotifications,
} from '../services/inAppNotificationService';

const KEY = 'taphoammo_inapp_demo_seeded';

export function ensureDemoInAppNotifications() {
  if (localStorage.getItem(KEY)) return;
  if (loadAllInAppNotifications().length > 0) {
    localStorage.setItem(KEY, '1');
    return;
  }

  createInAppNotification({
    type: 'promo',
    title: 'Khuyến mãi 20% tuần này',
    shortContent: 'Giảm 20% tài khoản TikTok — hạn đến Chủ nhật',
    detailContent:
      'Áp dụng cho đơn từ 100.000đ. Nhập mã TIKTOK20 khi thanh toán. Không áp dụng đồng thời ưu đãi khác.',
    delivery: 'both',
    popupStyle: 'promo',
    actionLabel: 'Xem ưu đãi',
    actionUrl: '/',
    targetUserId: null,
  });

  createInAppNotification({
    type: 'alert',
    title: 'TUYÊN BỐ MIỄN TRỪ TRÁCH NHIỆM (QUAN TRỌNG)',
    shortContent: 'Website chỉ cung cấp tài khoản phục vụ quảng cáo hợp pháp.',
    detailContent:
      'Website chỉ cung cấp tài khoản mạng xã hội phục vụ quảng cáo và kinh doanh hợp pháp. Chúng tôi không chịu trách nhiệm nếu khách hàng sử dụng tài khoản mục đích vi phạm pháp luật Việt Nam.',
    delivery: 'popup',
    popupStyle: 'warning',
    actionLabel: 'Đã hiểu',
    targetUserId: null,
  });

  createInAppNotification({
    type: 'system',
    title: 'Đơn hàng đã xử lý',
    shortContent: 'Đơn demo đã hoàn thành — kiểm tra lịch sử',
    detailContent: 'Kiểm tra mục Lịch sử đơn hàng để tải tài khoản.',
    delivery: 'bell',
    popupStyle: 'info',
    targetUserId: '8821',
  });

  localStorage.setItem(KEY, '1');
}
