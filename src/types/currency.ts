export type CurrencyRateMode = 'manual' | 'auto';

export type CurrencySymbolPosition = 'prefix' | 'suffix';

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  symbolPosition: CurrencySymbolPosition;
  decimals: number;
  /** 1 đơn vị tiền tệ này = bao nhiêu VND */
  basePerUnit: number;
  rateMode: CurrencyRateMode;
  enabled: boolean;
  isDefault: boolean;
  lastRateUpdate: string | null;
}

export interface CurrencySettings {
  baseCurrencyCode: string;
  autoRateApiEnabled: boolean;
}
