export type ItemStockSource = 'warehouse' | 'external_api';

export type ItemApiAuthType = 'bearer' | 'api_key' | 'none';

/** Liên kết mặt hàng với nhà cung cấp — URL/key lấy từ cài đặt NCC */
export interface ItemApiFieldSync {
  name: boolean;
  price: boolean;
  minPurchase: boolean;
  maxPurchase: boolean;
  sold: boolean;
  shortDescription: boolean;
  detailDescription: boolean;
}

export const DEFAULT_ITEM_API_FIELD_SYNC: ItemApiFieldSync = {
  name: true,
  price: true,
  minPurchase: false,
  maxPurchase: false,
  sold: false,
  shortDescription: false,
  detailDescription: false,
};

export type ItemApiPriceMarkupType = 'percent' | 'fixed';

/** Chênh giá bán so với giá gốc nhà cung cấp */
export interface ItemApiPriceMarkup {
  type: ItemApiPriceMarkupType;
  /** % (vd: 35 = +35%) hoặc số tiền cố định (đ) */
  value: number;
}

export const DEFAULT_ITEM_API_PRICE_MARKUP: ItemApiPriceMarkup = {
  type: 'percent',
  value: 35,
};

export interface ItemExternalApiConfig {
  enabled: boolean;
  providerId: string;
  /** ID service / sản phẩm trên hệ thống nhà cung cấp */
  externalProductId: string;
  virtualStock: number;
  fieldSync: ItemApiFieldSync;
  priceMarkup: ItemApiPriceMarkup;
}

export const DEFAULT_ITEM_EXTERNAL_API: ItemExternalApiConfig = {
  enabled: false,
  providerId: '',
  externalProductId: '',
  virtualStock: 999,
  fieldSync: { ...DEFAULT_ITEM_API_FIELD_SYNC },
  priceMarkup: { ...DEFAULT_ITEM_API_PRICE_MARKUP },
};

/** Cấu hình đã gộp nhà cung cấp — dùng khi gọi API */
export interface EffectiveApiRuntimeConfig {
  enabled: boolean;
  providerId: string;
  providerName: string;
  baseUrl: string;
  apiKey: string;
  authType: ItemApiAuthType;
  orderPath: string;
  stockPath: string;
  externalProductId: string;
  quantityField: string;
  productIdField: string;
  responseContentField: string;
  virtualStock: number;
}
