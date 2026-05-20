# Affiliate System — Database Schema

> Dự án demo lưu trữ qua **localStorage**; schema dưới đây map 1:1 sang các key và TypeScript types. Khi có backend thật, dùng cùng cấu trúc bảng/collection.

## 1. `affiliate_settings` (singleton)

| Field | Type | Mô tả |
|-------|------|--------|
| `enabled` | boolean | Bật/tắt affiliate toàn hệ thống |
| `defaultCommissionPercent` | number | % hoa hồng mặc định (vd: 10) |
| `minWithdrawalAmount` | number | Số tiền rút tối thiểu (VND) |
| `commissionMode` | enum | `first_order` \| `lifetime` |
| `autoApproveCommission` | boolean | Tự cộng số dư khi đơn hoàn thành |
| `cookieTtlDays` | number | Thời hạn cookie ref (mặc định 30) |
| `updatedAt` | ISO string | |

**localStorage:** `taphoammo_affiliate_settings`

---

## 2. `managed_users` (mở rộng)

| Field mới | Type | Mô tả |
|-----------|------|--------|
| `referralCode` | string | Mã ref (username hoặc custom) |
| `referredByUserId` | string \| null | User giới thiệu khi đăng ký |
| `affiliateBalance` | number | Số dư hoa hồng có thể rút |
| `affiliateTotalEarned` | number | Tổng hoa hồng đã nhận (lịch sử) |
| `affiliateRevenue` | number | Tổng doanh thu đơn cấp dưới mang lại |

**localStorage:** `taphoammo_managed_users` (đã có)

---

## 3. `affiliate_commissions`

| Field | Type | Mô tả |
|-------|------|--------|
| `id` | string | `AFF{timestamp}` |
| `referrerUserId` | string | Người nhận hoa hồng |
| `referrerUsername` | string | |
| `buyerUserId` | string | Khách cấp dưới |
| `buyerUsername` | string | |
| `orderId` | string | Đơn nguồn |
| `orderAmount` | number | Giá trị đơn (trước hoàn) |
| `commissionPercent` | number | % áp dụng |
| `commissionAmount` | number | Tiền hoa hồng |
| `status` | enum | `pending` \| `credited` \| `reversed` |
| `createdAt` | ISO string | |
| `creditedAt` | ISO string \| null | |
| `reversedAt` | ISO string \| null | |
| `note` | string | |

**localStorage:** `taphoammo_affiliate_commissions`

**Index logic:** `(orderId, referrerUserId)` unique khi `status != reversed`

---

## 4. `affiliate_withdrawals`

| Field | Type | Mô tả |
|-------|------|--------|
| `id` | string | `WD{timestamp}` |
| `userId` | string | |
| `username` | string | |
| `amount` | number | |
| `method` | enum | `bank` \| `momo` \| `crypto` \| `other` |
| `accountInfo` | string | STK / ví / địa chỉ |
| `accountName` | string | Tên chủ TK |
| `status` | enum | `pending` \| `approved` \| `rejected` |
| `rejectReason` | string \| null | |
| `createdAt` | ISO string | |
| `processedAt` | ISO string \| null | |

**localStorage:** `taphoammo_affiliate_withdrawals`

---

## 5. `affiliate_campaign_links`

| Field | Type | Mô tả |
|-------|------|--------|
| `id` | string | |
| `userId` | string | Chủ link |
| `label` | string | Tên chiến dịch |
| `targetPath` | string | `/` hoặc `/?category=...` |
| `shortCode` | string | Mã rút gọn |
| `createdAt` | ISO string | |

**localStorage:** `taphoammo_affiliate_campaign_links`

URL mẫu: `{origin}{targetPath}?ref={referralCode}&c={shortCode}`

---

## 6. `ref_attribution` (client session)

| Field | Type | Mô tả |
|-------|------|--------|
| `referralCode` | string | |
| `referrerUserId` | string | |
| `capturedAt` | number | epoch ms |
| `expiresAt` | number | |
| `visitorFingerprint` | string | UA hash (chống self-ref) |

**localStorage:** `taphoammo_ref_attribution`  
**Cookie:** `taphoammo_ref` (Max-Age = cookieTtlDays × 86400)

---

## 7. `customer_orders` (mở rộng)

| Field mới | Type | Mô tả |
|-----------|------|--------|
| `affiliateCommissionId` | string \| null | Liên kết bản ghi hoa hồng |
| `affiliateCommissionPaid` | boolean | Idempotency |

---

## Luồng nghiệp vụ

```
Click ?ref=CODE → lưu cookie 30 ngày
Register → gán referredByUserId (chặn self-ref)
Order completed → tính % → affiliate_commissions → +affiliateBalance
Order refund → reverse commission → -affiliateBalance
Withdraw request → trừ affiliateBalance (pending)
Admin approve → giữ trừ / reject → hoàn affiliateBalance
```
