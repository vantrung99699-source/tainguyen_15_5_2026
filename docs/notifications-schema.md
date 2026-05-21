# Notifications — Database Schema

## 1. Telegram (`taphoammo_telegram_config`)

```typescript
{
  botToken: string;
  adminChatId: string;
  enabled: boolean;
  events: {
    newOrder: boolean;
    withdrawalRequest: boolean;
    depositSuccess: boolean;
    lowStock: boolean;
  };
}
```

## 2. Telegram user prefs (`taphoammo_telegram_user_prefs`)

Per `userId`: `{ chatId, linked, notifyOrderComplete, notifyLoginAlert, notifyAffiliateCredit }`

## 3. Telegram log (`taphoammo_telegram_log`) — demo outbound messages

## 4. SMTP (`taphoammo_smtp_config`)

`host, port, encryption, username, password, fromEmail, fromName, enabled`

## 5. Email templates (`taphoammo_email_templates`)

`id, slug, name, subject, htmlBody, enabled`

## 6. Bulk campaigns (`taphoammo_email_campaigns`)

`id, subject, htmlBody, target: all | group, groupFilter, sentAt, recipientCount`

## 7. Email log (`taphoammo_email_log`)

## 8. In-app (`taphoammo_inapp_notifications`)

`id, type, title, shortContent, detailContent, targetUserId|null, createdAt, expiresAt?`

## 9. In-app reads (`taphoammo_inapp_reads`)

`userId, notificationId, readAt`
