import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export const currencies: Currency[] = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal" },
  { code: "MAD", symbol: "د.م.", name: "Moroccan Dirham" },
];

// Static exchange rates relative to USD (base currency)
// Simple rates: 10 MAD = $1, 1 EUR = $1, etc.
const exchangeRates: Record<string, number> = {
  USD: 1,
  EUR: 1,
  GBP: 0.8,
  JPY: 150,
  CAD: 1.4,
  AUD: 1.5,
  SAR: 3.75,
  MAD: 10,
};

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
  selectedCurrency: Currency;
  convertPrice: (priceInUSD: number) => number;
  formatPrice: (priceInUSD: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<string>("USD");

  useEffect(() => {
    // Load currency from localStorage on mount
    const savedCurrency = localStorage.getItem('currency');
    if (savedCurrency && currencies.some(c => c.code === savedCurrency)) {
      setCurrencyState(savedCurrency);
    }
  }, []);

  const setCurrency = (newCurrency: string) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('currency', newCurrency);
  };

  const selectedCurrency = currencies.find((c) => c.code === currency) || currencies[0];

  const convertPrice = (priceInUSD: number): number => {
    const rate = exchangeRates[currency] || 1;
    return priceInUSD * rate;
  };

  const formatPrice = (priceInUSD: number): string => {
    const convertedPrice = convertPrice(priceInUSD);
    // Format without commas, with 2 decimal places
    const formatted = convertedPrice.toFixed(2);
    return `${selectedCurrency.symbol}${formatted}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        selectedCurrency,
        convertPrice,
        formatPrice,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
