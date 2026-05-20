# Currency & Language — Database Schema

> Demo: localStorage. Backend: map sang bảng SQL tương ứng.

## `currencies`

| Field | Type | Mô tả |
|-------|------|--------|
| `id` | string | UUID |
| `code` | string | ISO: VND, USD, THB, EUR |
| `name` | string | Tên hiển thị |
| `symbol` | string | $, đ, ฿ |
| `symbolPosition` | enum | `prefix` \| `suffix` |
| `decimals` | number | 0 (VND), 2 (USD) |
| `basePerUnit` | number | 1 đơn vị = X VND (1 USD = 24000) |
| `rateMode` | enum | `manual` \| `auto` |
| `enabled` | boolean | |
| `isDefault` | boolean | Đồng mặc định hệ thống (base = VND) |
| `lastRateUpdate` | ISO \| null | |

**Key:** `taphoammo_currencies`

## `currency_settings` (singleton)

| Field | Type |
|-------|------|
| `baseCurrencyCode` | string (VND) |
| `autoRateApiEnabled` | boolean |

**Key:** `taphoammo_currency_settings`

## `languages`

| Field | Type |
|-------|------|
| `id` | string |
| `code` | string | vi, en, th |
| `name` | string |
| `nativeName` | string |
| `flag` | string | emoji hoặc mã |
| `enabled` | boolean |
| `isDefault` | boolean |
| `rtl` | boolean |

**Key:** `taphoammo_languages`

## `translations`

| Field | Type |
|-------|------|
| `key` | string | menu_home |
| `values` | JSON | `{ "vi": "Trang chủ", "en": "Home" }` |
| `group` | string | ui, menu, product, category |

**Key:** `taphoammo_translations`

## `dynamic_content_i18n` (nội dung động)

| Field | Type |
|-------|------|
| `entityType` | string | product, category, shop_item |
| `entityId` | string |
| `field` | string | name, description |
| `values` | JSON | đa ngôn ngữ |

**Key:** `taphoammo_dynamic_i18n`

## Client persistence

| Key | Mô tả |
|-----|--------|
| `taphoammo_customer_currency` | Mã tiền khách chọn |
| `taphoammo_customer_locale` | Mã ngôn ngữ khách chọn |
