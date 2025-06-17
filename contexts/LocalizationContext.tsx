
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Language, Currency } from '../types';
import { locales } from '../data/locales';
import { DEFAULT_LANGUAGE, LANGUAGE_KEY, DEFAULT_CURRENCY, CURRENCY_KEY, EXCHANGE_RATES } from '../constants';

interface LocalizationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string,
    params?: Record<string, string | number>) => string;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatCurrency: (amount: number, targetCurrency?: Currency) => string;
}

export const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

interface LocalizationProviderProps {
  children: ReactNode;
}

export const LocalizationProvider: React.FC<LocalizationProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem(LANGUAGE_KEY) as Language | null) || DEFAULT_LANGUAGE;
  });
  const [currency, setCurrencyState] = useState<Currency>(() => {
    return (localStorage.getItem(CURRENCY_KEY) as Currency | null) || DEFAULT_CURRENCY;
  });

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem(CURRENCY_KEY, currency);
  }, [currency]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const setCurrency = (curr: Currency) => {
    setCurrencyState(curr);
  };

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    let translation = locales[language][key] || key;
    if (params) {
      Object.keys(params).forEach(paramKey => {
        translation = translation.replace(`{{${paramKey}}}`, String(params[paramKey]));
      });
    }
    return translation;
  }, [language]);

  const formatCurrency = useCallback((amount: number, sourceCurrency: Currency = 'VND'): string => {
    let displayAmount = amount;
    let displayCurrencySymbol = currency;

    if (sourceCurrency === 'VND' && currency === 'RUB') {
        displayAmount = amount * EXCHANGE_RATES.VND_TO_RUB;
    } else if (sourceCurrency === 'RUB' && currency === 'VND') {
        displayAmount = amount / EXCHANGE_RATES.VND_TO_RUB;
    }
    // If sourceCurrency and target currency (this.currency) are the same, or one is not VND/RUB
    // then no conversion, just format.

    const formatter = new Intl.NumberFormat(language === 'vi' ? 'vi-VN' : 'ru-RU', {
      style: 'currency',
      currency: displayCurrencySymbol,
      minimumFractionDigits: displayCurrencySymbol === 'VND' ? 0 : 2,
      maximumFractionDigits: displayCurrencySymbol === 'VND' ? 0 : 2,
    });
    return formatter.format(displayAmount);
  }, [currency, language]);


  return (
    <LocalizationContext.Provider value={{ language, setLanguage, t, currency, setCurrency, formatCurrency }}>
      {children}
    </LocalizationContext.Provider>
  );
};
