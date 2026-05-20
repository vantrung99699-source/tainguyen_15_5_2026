import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Currency } from '../types/currency';
import type { Language } from '../types/locale';
import {
  CURRENCY_UPDATED,
  formatBaseMoney,
  getCurrencyByCode,
  getEnabledCurrencies,
  loadCustomerCurrencyCode,
  loadCurrencies,
  saveCustomerCurrencyCode,
} from '../services/currencyService';
import {
  getDynamicText,
  getEnabledLanguages,
  loadCustomerLocaleCode,
  loadLanguages,
  LOCALE_UPDATED,
  saveCustomerLocaleCode,
  translate,
} from '../services/localeService';

interface LocaleCurrencyContextValue {
  currencyCode: string;
  currency: Currency;
  currencies: Currency[];
  setCurrencyCode: (code: string) => void;
  formatMoney: (amountVnd: number) => string;
  localeCode: string;
  language: Language;
  languages: Language[];
  setLocaleCode: (code: string) => void;
  t: (key: string, fallback?: string) => string;
  td: (
    entityType: string,
    entityId: string,
    field: string,
    fallback: string,
  ) => string;
}

const LocaleCurrencyContext = createContext<LocaleCurrencyContextValue | null>(null);

export function LocaleCurrencyProvider({ children }: { children: ReactNode }) {
  const [currencyCode, setCurrencyCodeState] = useState(loadCustomerCurrencyCode);
  const [localeCode, setLocaleCodeState] = useState(loadCustomerLocaleCode);
  const [currencies, setCurrencies] = useState(loadCurrencies);
  const [languages, setLanguages] = useState(loadLanguages);

  const sync = useCallback(() => {
    setCurrencies(loadCurrencies());
    setLanguages(loadLanguages());
    setCurrencyCodeState(loadCustomerCurrencyCode());
    setLocaleCodeState(loadCustomerLocaleCode());
  }, []);

  useEffect(() => {
    window.addEventListener(CURRENCY_UPDATED, sync);
    window.addEventListener(LOCALE_UPDATED, sync);
    return () => {
      window.removeEventListener(CURRENCY_UPDATED, sync);
      window.removeEventListener(LOCALE_UPDATED, sync);
    };
  }, [sync]);

  const currency = useMemo(
    () => getCurrencyByCode(currencyCode) ?? getEnabledCurrencies()[0],
    [currencyCode, currencies],
  );

  const language = useMemo(
    () => languages.find((l) => l.code === localeCode) ?? getEnabledLanguages()[0],
    [localeCode, languages],
  );

  const setCurrencyCode = useCallback((code: string) => {
    saveCustomerCurrencyCode(code);
    setCurrencyCodeState(code);
  }, []);

  const setLocaleCode = useCallback((code: string) => {
    saveCustomerLocaleCode(code);
    setLocaleCodeState(code);
    document.documentElement.lang = code;
    document.documentElement.dir = languages.find((l) => l.code === code)?.rtl ? 'rtl' : 'ltr';
  }, [languages]);

  useEffect(() => {
    document.documentElement.lang = localeCode;
    document.documentElement.dir = language?.rtl ? 'rtl' : 'ltr';
  }, [localeCode, language]);

  const formatMoney = useCallback(
    (amountVnd: number) => formatBaseMoney(amountVnd, currencyCode),
    [currencyCode],
  );

  const t = useCallback(
    (key: string, fallback?: string) => translate(key, localeCode, fallback),
    [localeCode],
  );

  const td = useCallback(
    (entityType: string, entityId: string, field: string, fallback: string) =>
      getDynamicText(entityType, entityId, field, localeCode, fallback),
    [localeCode],
  );

  const value = useMemo(
    (): LocaleCurrencyContextValue => ({
      currencyCode,
      currency,
      currencies: getEnabledCurrencies(),
      setCurrencyCode,
      formatMoney,
      localeCode,
      language,
      languages: getEnabledLanguages(),
      setLocaleCode,
      t,
      td,
    }),
    [currencyCode, currency, localeCode, language, setCurrencyCode, formatMoney, setLocaleCode, t, td],
  );

  return (
    <LocaleCurrencyContext.Provider value={value}>{children}</LocaleCurrencyContext.Provider>
  );
}

export function useLocaleCurrency() {
  const ctx = useContext(LocaleCurrencyContext);
  if (!ctx) {
    throw new Error('useLocaleCurrency must be used within LocaleCurrencyProvider');
  }
  return ctx;
}

/** Safe khi chưa bọc Provider (admin-only pages) */
export function useLocaleCurrencyOptional() {
  return useContext(LocaleCurrencyContext);
}
